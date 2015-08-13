/**
* author : ahuing
* date   : 2015-04-10
* name   : jqValidate v1.0
* modify : 2015-04-10
 */

!function ($) {
    // 整个验证的config
    var defaults = {
        submit    : '[type="submit"]' // 点击验证的按钮
        , vadmode : 0 // 验证方式：0=失焦验证 1=逐个验证 2=实时验证
        , tipmode : 0 // 提示方式：0=不显示 1=直接显示 2=聚焦显示 expr=逐个验证+提示在单个提示框（长度>1）
        , tipTpl  : '$1' // 提示框的模板，$1:样式名,$2:提示信息
    }
    /*
    events 方法
        validatePass $('form').on('validatePass', function () { 验证通过后的动作 })

        mode forms 单个表单项的config 
        vadmode : 0 // 验证方式：0=失焦验证 1=逐个验证 2=实时验证
        tipmode : 0 // 提示方式：0=不显示 1=直接显示 2=聚焦显示 expr=逐个验证+提示在单个提示框（长度>1）
        url ajax 验证地址
        ignore 忽略初始验证
        recheck 重复验证，值对应的要验证的表单
        monitor 监控提示，实时提示 1:提示框显示提示内容 expr:对应的标签里面显示提示内容
        offset 提示框偏移位置
        init 初始提示
        pass 通过时的提示
        error 失败时提示
        type 
            string: "*" , "*6-16" , "n" , "n6-16" , "s" , "s6-18" , "p" , "m" , "e" , "url"
            number: 只对多选择有用
            regexp: 直接用表达式验证
            function: 用函数验证  
    */

    // 验证规则
    , regTips = {
        w : {
            "*"       : "请填写此字段"
            // , "*6-16" : "请填写6到16位任意字符！2-16个字符：英文、数字或中文"
            , "*6-16" : "6-16个字符：英文、数字或中文"
            , "n"     : "请填写数字！"
            // , "n6-16" : "请填写6到16位数字！"
            , "n6-16" : "6-16个数字！"
            , "s"     : "不能输入特殊字符！"
            , "s6-18" : "请填写6到18位字符！"
            , "p"     : "邮政编码格式不对！"
            , "m"     : "手机号码格式不对！"
            , "e"     : "邮箱地址格式不对！"
            , "url"   : "请填写网址！"
        } 
        // text根据data-type初始化提示
        , "e" : "请填写邮箱地址"
        , "m" : "请填写手机号码"
        , "s" : "请填写字符和数字"
        , "p" : "请填写邮政编码！"
        // 非text根据type初始化提示及错误提示
        , 'password'       : '请填写密码'
        , 'ajax'            : '正在验证...'
        , 'checkbox'        : '请至少选择$1项！'
        , 'date'            : '请输入日期'
        , 'error'           : '填写内容不正确'
        , 'init'            : '请填写此字段'
        , 'monitorTip'      : ['还能输入', '已经超出', '个字']
        , 'pass'            : '&nbsp;'
        , 'radio'           : '请选择一项'
        , 'recheck'         : '两次填写密码不一致'
        , 'select-multiple' : '按ctrl键进行多选'
        , 'select-one'      : '请选择列表中的一项'
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

    $('head').append('<link rel="stylesheet" href="' + (typeof(tplurl) != 'undefined' && tplurl || '') + 'css/jqvalidate.css">');

    $.fn.jqValidate = function(opt) {

        var o      = $.extend({},defaults, opt || {})
        , _self    = this.attr('novalidate', 'novalidate')
        , $fmItems = _self.find('[data-type]');

        // 获取tip
        function getTip($ele, before) {
            var oft = $ele.data().offset
            , $before = oft && $ele.nextAll().length > 0 && ($ele.nextAll().eq(oft - 1)) || $ele;

            return before && $before || $before.next();
        }

        // 处理type表达式
        function setRegExp(sType) {
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

        $.fn.hasEvent = function(e) {
            var fmEvents = $.data(this[0],'events') || $._data(this[0],'events');
            return fmEvents && fmEvents[e] || false;
        }

        // 设置tip
        _self.setTip = function ($ele, cls, i) {
            cls = cls || 'pass';
            var eleData = $ele.data()
            // 元素上自定义 || 手动传进来的 || 默认
            , info = eleData[cls] || i || regTips[cls]
            , $eleGroup = eleData.group && _self.find('.' + eleData.group);

            var $tip = o.tipmode.length > 1 && _self.find(o.tipmode) || $eleGroup || getTip($ele);
            $tip.html(o.tipTpl.replace('$1', info)).add($ele).removeClass('error pass ajax').addClass(cls);

            return cls == 'pass';
        }

        // reset表单
        _self.resetForm = function ($e) {
            ($e || $fmItems).each(function() {
                var ele   = this 
                , $ele    = $(ele)
                , $eleEx  = $ele
                , eleData = $ele.data();

                if (eleData.group) {
                    $eleEx = _self.find('[data-group="' + eleData.group + '"]').removeClass('error pass ajax').eq(-1);
                };

                $eleEx.removeClass('error pass ajax');
                if (o.tipmode.length > 1) {
                    $(o.tipmode).removeClass('error');
                    return;
                }
                // 初始化tip
                var $tip = getTip($eleEx).removeClass('error init monitor pass ajax')
                    .addClass(o.tipmode == 1 && !eleData.ignore && 'init' || '')
                    .html(o.tipTpl.replace('$1', eleData.init));
                var sMonitor = eleData.monitor;
                sMonitor && $(sMonitor == 1 && $tip || sMonitor).html(eleData.tip);//.addClass('monitor');
            })

            if (!$e) _self[0].reset();
            return true;
        }

        // 验证
        _self.validate = function(ele) {
            var $ele    = $(ele)
            , eleData   = $ele.data()
            , eleDType  = eleData.type
            , eleDTypeT = $.type(eleDType);

            // 为空
            if (!ele.value) {
                if (eleData.ignore) return _self.resetForm($ele);
                return _self.setTip($ele, 'error', eleData['init']);
            }
            else if (ele.type == 'select-one') return _self.setTip($ele);

            // type是数字 checkbox radio
            if (!isNaN(eleDType)) {
                var checkNum = _self.find('input[name="'+ ele.name +'"]:checked').length
                , rr = checkNum < eleDType;

                if (eleData.ignore && checkNum == 0) return _self.resetForm($ele);
                if (eleDType < 0) rr = checkNum > -eleDType || checkNum == 0; 
                return _self.setTip($ele, rr && 'error', rr && eleData['init']);
            }
            // type是函数
            if (eleDType == 'f') {
                if ($ele.hasEvent('validateFun')) {
                    $ele.trigger('validateFun', [function (r, i) {
                        _self.setTip($ele, r, i);
                    }]);
                    return $ele.hasClass('pass');
                }
                else return _self.setTip($ele, 'error', '请为元素绑定validateFun事件');
            }
            // type字符串
            else if (eleDTypeT == 'string') {
                var eleRegex = regType[eleDType];
                // 正则
                if (/\/.+\//.test(eleDType)) eleRegex = eval(eleDType);
                // 未通过
                if (!eleRegex.test(ele.value)) return _self.setTip($ele, 'error', regTips.w[eleDType]);
                // 通过后进行两次密码验证
                else if (eleData.recheck) return ele.value === _self[0][eleData.recheck].value && _self.setTip($ele) || _self.setTip($ele, 'error', regTips.recheck);
                // 通过后进行ajax验证 isSubmit提交表单时不验证
                else if (eleData.url) {
                    var param = {};
                    param[ele.name] = ele.value;
console.log(1);
                    // 13423045270
                    if (!$ele.hasClass('ajax')) {
                        _self.setTip($ele, 'ajax');
                        $.ajax({
                            url: eleData.url,
                            type: 'GET',
                            dataType: 'json',
                            data: param
                        }).done(function (res) {
                            var doneFun = function (r, i) {
                                if (_self.setTip($ele, r, i) && _self.hasClass('submited')) {
                                    _self.removeClass('submited');
                                    validateFm();
                                } 
                            }

                            if ($ele.hasEvent('ajaxDone')) {
                                $ele.trigger('ajaxDone',[res, doneFun]);
                            } else doneFun(res.result, res.info);

                        }).fail(function (res) {
                            _self.setTip($ele, 'error', '服务器请求失败');
                        })
                    }
                        
                    return;
                }
            }
           return _self.setTip($ele);
        }

        // 初始化
        !function($eles) {
            if (o.tipmode.length > 1) _self.find(o.tipmode).addClass('tip single');
            $eles.each(function() {

                var ele    = this 
                , $ele     = $(ele)
                , $eleEx   = $ele
                , eleData  = $ele.data()
                , eleDType = eleData.type
                , tipCls   = 'tip '
                , isItem   = $.inArray(ele.type, ['text','password','select-one','textarea']) >= 0;


                $ele.on('resetForm', function () {
                    _self.resetForm($ele);
                })
                // 处理type
                $.type(eleDType) == 'string' && setRegExp(eleDType);

                if (!isNaN(eleDType)) {
                    // 至多选项
                    eleData['init'] = (regTips[ele.type]).replace('$1', Math.abs(eleDType));
                    if (eleDType < 0) eleData['init'] = eleData['init'].replace('少','多');
                };

                var tipInfo = eleData['init'] = eleData['init'] || regTips[ele.type] || regTips[eleDType] || regTips.w[eleDType] || regTips['init'];

                // 相同的设置优先使用表单项的设置
                eleData.tipmode == null && isItem && ($ele.attr('data-tipmode', o.tipmode));
                eleData.vadmode == null && isItem && ($ele.attr('data-vadmode', o.vadmode));

                if (eleData.group) {
                    if (_self.find('.' + eleData.group).length) return;
                    $eleEx = _self.find('[data-group="' + eleData.group + '"]').eq(-1).addClass('group-last');
                    tipCls += eleData.group
                };

                if (o.tipmode.length > 1) return;
                // 初始化tip
                if(o.tipmode == 1 && !eleData.ignore) tipCls += ' init';

                var $tip = $('<div class="' + tipCls + '">' + o.tipTpl.replace('$1', tipInfo) + '</div>').insertAfter(getTip($eleEx, 1));

                if (eleData.monitor) {
                    var aType = eleDType.match(/^(.+?)(\d+)-(\d+)$/);

                    if (!aType) return; // 没规则,没法提示,返回

                    var sMonitor  = eleData.monitor
                    , maxNumber   = aType[3]
                    , monitorTip2 = regTips.monitorTip[2]
                    , moniTipInfo = regTips.monitorTip[0] + '<b class="fco">' + maxNumber + "</b>" + monitorTip2;

                    $tip = sMonitor == 1 && $tip || $(sMonitor).html(moniTipInfo).addClass('monitor');

                    eleData.tip = moniTipInfo;
                    /*String.prototype.Tlength = function(){
                        var arr = this.match(/[^\x00-\xff]/ig);
                        return this.length + (arr == null ? 0 : arr.length);
                    }*/

                    $ele.on('keyup change', function() {
                        var val = ele.value.length - maxNumber;

                        $tip.html(regTips.monitorTip[val <= 0 ? 0 : 1] + '<b class="fco">' + (val <= 0 ? -1 : 1) * val + '</b>' + monitorTip2)
                        .add(this).removeClass('error pass ajax');
                    })
                };
            })
        }($fmItems)

        var validateFm = function () {
            var validateValue = true;
            _self.addClass('submited');

            $fmItems.each(function(a, b) {
                var $b = $(b), curValVlue;

                if ($b.hasClass('ajax')) {
                    validateValue = false;
                }
                else if ($b.data('url') && $b.hasClass('pass'))
                    curValVlue = true;
                else {
                    curValVlue = _self.validate(b);
                }

                if ($b.hasClass('group-last')) {
                    var oError = _self.find('[data-group="' + $b.data('group') + '"]').filter('.error')[0];
                    oError && (curValVlue = _self.validate(oError));
                }

                // 批量验证第一个验证错误项聚焦
                if (!curValVlue && validateValue) {
                    validateValue = false;
                    setTimeout(function () {
                        $b.trigger('focus');
                    },0)
                };
                // 逐个验证 || 提示方式是一个提示框时也逐个验证
                if (o.vadmode == 1 || o.tipmode.length > 1) return curValVlue;

            })
            // 验证通过的操作，一般作ajax提交
            if (validateValue && _self.hasEvent('validatePass')) {
                _self.trigger('validatePass');
                return false;
            };
            validateValue && console.log('ok');
            // validateValue && _self.submit();
            return false;
        }

        _self
        // 提交表单
        .on('click', o.submit, validateFm)
        // 重置表单
        .on('click', '[type="reset"]', function() {
            _self.resetForm()
            return false;
        })
        // 回车提交
        .on('keypress', 'input[type="text"]', function(e){
            e.keyCode==13 && validateFm();
        })
        // 下拉列表
        .on('change', 'select[data-type], [data-url]', function () {
            _self.validate(this);
        })
        // 单选、多选
        .on('click', 'input[type="checkbox"], input[type="radio"]', function () {
            _self.validate(_self.find('input[name=' + this.name + ']').get(-1));
        })
        // 发送短信的按钮
        .on('click', '[data-btn]', function () {
            var $this = $(this), $input = $($this.data('btn'));
            _self.validate($input[0]) && $this.trigger('itemValPass') || $input.trigger('focus');
        })
        // 聚焦显示初始提示
        .on('focus', '[data-tipmode=2]', function() {
            var thisData = $(this).data();
            if (thisData.ignore) return;
            _self.setTip($(this), 'init');
        })
        // 实时验证
        .on('keyup change','[data-vadmode=2]', function() {
            _self.validate(this);
        })
        // 失焦验证
        .on('blur','[data-vadmode=0], [data-vadmode=1]', function() {
            if ($(this).data('url') && this.value) return;
            _self.validate(this);
        }).on('resetForm', function () {
            _self.resetForm();
        })
        .find(o.submit).prop('disabled', '');
        
        return _self;
    }
}(jQuery);

$(function () {
    $('.jqvalidate').length&&$('.jqvalidate').each(function() {
        var $this = $(this);
        $this.jqValidate($this.data());
    });
})