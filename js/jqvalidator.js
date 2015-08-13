/**
* author : ahuing
* date   : 2015-04-10
* name   : jqValidator v1.0
* modify : 2015-04-10
 */

!function ($) {
    // 参数选项设置
    var defaults = {
        effect       : 1
        , expr       : '[type="submit"]' // 点击验证的按钮
        , oneByOne   : 0 // 逐个验证
        , validate   : null // 表单提交前的动作（可作自定义验证）
        , showInit   : 0
        , ajcallback :　null
    }
    // 验证规则
    , regTips = {
        w : {
            "*"       : "不能为空！"
            , "*6-16" : "请填写6到16位任意字符！"
            , "n"     : "请填写数字！"
            , "n6-16" : "请填写6到16位数字！"
            , "s"     : "不能输入特殊字符！"
            , "s6-18" : "请填写6到18位字符！"
            , "p"     : "请填写邮政编码！"
            , "m"     : "请填写手机号码！"
            , "e"     : "邮箱地址格式不对！"
            , "url"   : "请填写网址！"
        } 
        // 以下类型将会是默认提示
        , 'ajax'            : '正在验证...'
        , 'checkbox'        : '请至少选择$1项！'
        , 'date'            : '请输入日期'
        , 'error'           : '请填写此字段'
        , 'pass'            : '通过信息验证！'
        , 'password'        : '请填写密码'
        , 'recheck'         : '两次填写密码不一致'
        , 'radio'           : '请选择一项'
        , 'select-multiple' : '按ctrl键进行多选'
        , 'select-one'      : '请选择列表中的一项'
        , 'monitorTip'      : ['还能输入', '已经超出', '个字']
    }
    , regType = {
        "*"       : /[\w\W]+/ // 任意字符
        , "*6-16" : /^[\w\W]{6,16}$/
        , "n"     : /^\d+$/ // 数字
        , "n6-16" : /^\d{6,16}$/
        , "s"     : /^[\u4E00-\u9FA5\uf900-\ufa2d\w\.\s]+$/ // 字符串
        , "s6-18" : /^[\u4E00-\u9FA5\uf900-\ufa2d\w\.\s]{6,18}$/
        , "p"     : /^[0-9]{6}$/ // 邮编
        , "m"     : /^13[0-9]{9}$|14[0-9]{9}|15[0-9]{9}$|18[0-9]{9}$/ // 手机
        , "e"     : /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/ // email
        , "url"   : /^(\w+:\/\/)?\w+(\.\w+)+.*$/ // 网址
    };

    $.fn.jqValidator = function(opt) {
        var o      = $.extend({},defaults, opt || {})
        , _self    = this
        , $form    = $(this).attr('novalidate', 'novalidate')
        , $fmItems = $form.find('[data-type]');

        // 获取tip
        _self.getTip = function ($ele, before) {
            var oft = $ele.data().offset
            , $before = oft && $ele.nextAll().eq(oft - 1) || $ele;

            return before && $before || $before.next();
        }

        // 初始定义tip
        _self.initTip = function ($ele) {
            var $tipBefore = _self.getTip($ele, 1)
            , oEleData     = $ele.data()
            , initClass    = o.showInit && !oEleData.ignore && 'tip init' || 'tip'
            // data定义||根据对象类型找||根据验证规则找||显示默认(比如验证规则是一个函数)
            , info         = oEleData.init || regTips[$ele[0].type] || regTips.w[oEleData.type] || regTips['error'];
            
            info = info.replace('$1', oEleData.type);

            return !info && $tipBefore.next() || $('<div class="'+ initClass +'">' + info + '</div>').insertAfter($tipBefore);
        }

        // 设置tip
        _self.setTip = function ($ele, cls, i) {
            cls = cls || 'pass';

            var oEleData = $ele.data()
            // 元素上自定义 || 手动传进来的 || 按类型找 || 显示默认的
            , info = oEleData[cls] || i || regTips[$ele[0].type] || regTips[cls];

            info = info.replace('$1', oEleData.type);

            _self.getTip($ele).html(info).add($ele).removeClass('error pass ajax').addClass(cls);

            return cls == 'pass';
        }

        // 处理type表达式
        _self.setRegExp = function (sType) {
            var regex = /^(.+?)(\d+)-(\d+)$/
            , aCustomReg = sType.match(regex);
            
            // type 不在默认规则中&&字符串转化的数组
            !(sType in regType) && aCustomReg && $.each(regType, function (i, n) {
                var defReg = i.match(regex);
                if (defReg && defReg[1] == aCustomReg[1]) {
                    var sReg = regType[i].toString()
                        , param = sReg.match(/\/[mgi]*/g)[1].replace("\/","")
                        , regxp = new RegExp("\\{" + defReg[2] + "," + defReg[3] + "\\}","g");

                    sReg = sReg.replace(/\/[mgi]*/g,"\/")
                            .replace(regxp,"{" + aCustomReg[2] + "," + aCustomReg[3] + "}")
                            .replace(/^\//,"")
                            .replace(/\/$/,"");

                    regType[sType] = new RegExp(sReg,param);
                    regTips.w[sType] = regTips.w[i].replace(/(.*?)\d+(.+?)\d+(.*)/,"$1" + aCustomReg[2] + "$2" + aCustomReg[3] + "$3");
                };
            })
        }
        // reset表单
        _self.resetForm = function ($ele) {
            if ($ele) _self.getTip($ele).add($ele).removeClass('error pass ajax');
            else {
                $fmItems.each(function(i, n) {
                    var thisData = $(n).data();
                    $(thisData.monitor == 1 && _self.getTip($(n)) || thisData.monitor).html(thisData.tip);
                });

                $form.find('.tip').add($fmItems)
                .removeClass('error pass ajax')
                .eq(0).focus()
                .context.reset();
            };
            return true;
        }

        // 验证
        _self.validate = function(ele, isSubmit) {
            var $ele = $(ele)
            , oEleData = $ele.data()
            , eleDType = oEleData.type;

            // 为空
            if (!ele.value) {
                if (oEleData.ignore) return _self.resetForm($ele);
                return _self.setTip($ele, 'error', regTips[ele.type] || regTips.w[eleDType]);
            }
            // type是数字 checkbox radio
            if (!isNaN(eleDType)) {
                var sCls = $form.find('input[name="'+ ele.name +'"]:checked').length < eleDType && 'error';
                return _self.setTip($ele, sCls);
            }

            // type是函数
            if ($.type(window[eleDType]) == 'function') return window[eleDType].call($ele, _self);
            // type字符串or正则
            else if ($.type(eleDType) == 'string' || $.type(eleDType) == 'regexp') {
                var eleRegex = $.type(eleDType) == 'regexp' && eleDType || regType[eleDType];
                // 未通过
                if (!eleRegex.test(ele.value)) return _self.setTip($ele, 'error', regTips.w[eleDType]);
                // 通过后进行两次密码验证
                else if (oEleData.recheck) return ele.value === $form[0][oEleData.recheck].value && _self.setTip($ele) || _self.setTip($ele, 'error', regTips.recheck);
                // 通过后进行ajax验证 isSubmit提交表单时不验证
                else if (oEleData.url) {
                    // 值没变化时，直接返回
                    if (ele.value === oEleData.value) return;

                    _self.setTip($ele, 'ajax');

                    var param = {};
                    oEleData.value = param[ele.name] = ele.value;
                    // 13423045270
                    setTimeout(function () {
                        $.ajax({
                            url: oEleData.url,
                            type: 'GET',
                            dataType: 'json',
                            data: param,
                            error: function() {
                                return _self.setTip($ele, 'error', '服务器请求失败');
                            },
                            success: function(res) {
                                return _self.setTip($ele, res.result, res.info);
                            }
                        })
                    }, 300)
                    return;
                }
            }

           return _self.setTip($ele);
        }

        // 初始化
        !function($eles) {
            $eles.each(function() {
                var ele    = this 
                , $ele     = $(ele)
                , oEleData = $ele.data();

                // 处理type
                $.type(oEleData.type) == 'string' && _self.setRegExp(oEleData.type);

                // 设置tip
                var $tip = _self.initTip($ele);

                if (oEleData.monitor) {
                    var aType = oEleData.type.match(/^(.+?)(\d+)-(\d+)$/);

                    if (!aType) return; // 没规则,没法提示，就返回

                    var sMonitor = oEleData.monitor
                    , maxNumber = aType[3]
                    , moniTipInfo = regTips.monitorTip[0] + '<b class="fco">' + maxNumber + "</b>" + regTips.monitorTip[2];

                    var $monitorTip = $(sMonitor == 1 && $tip || sMonitor).html(moniTipInfo).addClass('monitor')

                    /*String.prototype.Tlength = function(){
                        var arr = this.match(/[^\x00-\xff]/ig);
                        return this.length + (arr == null ? 0 : arr.length);
                    }*/

                    $ele.on('keyup change', function() {
                        var val = ele.value.length - maxNumber;

                        $monitorTip
                        .html(regTips.monitorTip[val <= 0 ? 0 : 1] + '<b class="fco">' + (val <= 0 ? -1 : 1) * val + '</b>' + regTips.monitorTip[2])
                        .add(this).removeClass('error pass ajax');
                    })
                };
            });
        }($fmItems)

        var validateFm = function () {
            var validateValue = true;

            $fmItems.each(function(a, b) {
                var $b = $(b), curValVlue;

                // 正在提交时或者验证失败
                if ($b.hasClass('ajax') || $b.hasClass('error')) {
                    curValVlue = false;
                }
                else if ($b.hasClass('pass')) {
                    curValVlue = true;
                }
                else {
                    curValVlue = _self.validate(b);
                }

                // 批量验证第一个验证错误项聚焦
                if (!curValVlue && validateValue) {
                    validateValue = false;
                    $b.trigger('focus');
                };
                // 逐个验证
                if (o.oneByOne) return curValVlue;
            })

            // 外部验证
            if (o.validate && !o.validate.call(this)) validateValue = false;
            //  验证通过的操作，一般作ajax提交
            if (validateValue && o.ajcallback && $.type(window[o.ajcallback]) == 'function') {
                window[o.ajcallback].call($form);
                return false;
            };
            return validateValue;
        }

        $form
        .on('click', o.expr, validateFm)
        .on('blur','[data-type]', function() {
            if (this.type == 'checkbox' || this.type == 'radio') return false;
            _self.validate(this);
        })
        // 重置表单
        .on('click', '[type="reset"]', function() {
            _self.resetForm()
            return false;
        })
        .on('keypress', 'input[type="text"]', function(e){
            e.keyCode==13 && !$form.find('[type="submit"]').length && validateFm() && $form.submit();
        })

        $fmItems.filter('input[type="checkbox"], input[type="radio"]').each(function(i, n) {
            $form.on('click', 'input[name="' + n.name + '"]', function () {
                _self.validate(n);
            })
        });
        
        return _self;
    }
}(jQuery);

$(function () {
    $('.jqvalidator').length&&$('.jqvalidator').each(function() {
        var $this = $(this);
        var aa = $this.jqValidator($this.data());
    });
})