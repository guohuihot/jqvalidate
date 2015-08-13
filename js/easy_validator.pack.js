/*
	Copyright (C) 2009 - 2012
	WebSite:	Http://wangking717.javaeye.com/
	Author:		wangking
*/
$(function(){
	var xOffset = -20; // x distance from mouse
    var yOffset = 20; // y distance from mouse  
	
	
	//input action
	//鼠标滑过
	$("[reg],[url]:not([reg]),[tip]").hover(
		//鼠标滑过
		function(e) {
			if($(this).attr('tip') != undefined){
				var top = (e.pageY + yOffset);
				var left = (e.pageX + xOffset);
				$('body').append( '<p id="vtip"><img id="vtipArrow" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAALCAYAAACQy8Z9AAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAACgSURBVHjaYlx28hEDEYANiEOAeBm6RKSZLIZiJiIN3CgvzLUUSNcR4wIWYgxUl+D10JLkZWBjZmq8/eoLSLyJXENBBq4DGWgkJwAW0JHmA1EEDWYiYKA3zEAQ4GBlBhusKsbTiC8omIg1kBSDmUgxEJvBy089rsNnKFEGEmMwE5KBq4k1kJDBTEgG+pFiILLBJgqCKAYz/gcCBioDgAADAErmMqR0X1/QAAAAAElFTkSuQmCC"/>' + $(this).attr('tip') + '</p>' );
				$('p#vtip').css("top", top+"px").css("left", left+"px");
				// $('p#vtip').bgiframe();
			}
		},
		function() {
			if($(this).attr('tip') != undefined){
				$("p#vtip").remove();
			}
		}
	).mousemove(
		function(e) {
			if($(this).attr('tip') != undefined){
				var top = (e.pageY + yOffset);
				var left = (e.pageX + xOffset);
				$("p#vtip").css("top", top+"px").css("left", left+"px");
			}
		}
	).blur(function(){
		//失去焦点
		if($(this).attr("url") != undefined){
			ajax_validate($(this));
		}else if($(this).attr("reg") != undefined){
			validate($(this));
		}
	}).focus(function(){
		//获得焦点
		var spanNum = $(this).parent().find('span').length;
		if (spanNum == 0) {
				$(this).parent().append('<span></span>');
			}
		}
	);
	
	$("form").submit(function(){
		var isSubmit = true;
		$(this).find("[reg],[url]:not([reg])").each(function(){
			if($(this).attr("reg") == undefined){
				if(!ajax_validate($(this))){
					isSubmit = false;
				}
			}else{
				if(!validate($(this))){
					isSubmit = false;
				}
			}
		});
		if(typeof(isExtendsValidate) != "undefined"){
   			if(isSubmit && isExtendsValidate){
				return extendsValidate();
			}
   		}
		return isSubmit;
	});
	
});


//验证正则表达式
function validate(obj){
	//取得正则表达式
	var reg = new RegExp(obj.attr("reg"));
	//取得输入值
	var objValue = obj.attr("value");
	
	//判断是否匹配
	if(!reg.test(objValue)){
		//不匹配操作
		// alert("不匹配操作");
		change_error_style(obj,"add");
		change_tip(obj,null,"remove");
		return false;
	}else{
		//匹配操作
		if(obj.attr("url") == undefined){
			//操作正则表达式
			change_error_style(obj,"remove");
			change_tip(obj,null,"remove");
			return true;
		}else{
			return ajax_validate(obj);
		}
	}
}
//验证URL
function ajax_validate(obj){
	
	var url_str = obj.attr("url");
	if(url_str.indexOf("?") != -1){
		url_str = url_str+"&"+obj.attr("name")+"="+obj.attr("value");
	}else{
		url_str = url_str+"?"+obj.attr("name")+"="+obj.attr("value");
	}
	var feed_back = $.ajax({url: url_str,cache: false,async: false}).responseText;
	feed_back = feed_back.replace(/(^\s*)|(\s*$)/g, "");
	if(feed_back == 'success'){
		change_error_style(obj,"remove");
		change_tip(obj,null,"remove");
		return true;
	}else{
		change_error_style(obj,"add");
		change_tip(obj,feed_back,"add");
		return false;
	}
}
//改变样式
function change_tip(obj,msg,action_type){
	
	if(obj.attr("tip") == undefined){//初始化判断TIP是否为空
		obj.attr("is_tip_null","yes");
	}
	if(action_type == "add"){
		if(obj.attr("is_tip_null") == "yes"){
			obj.attr("tip",msg);
		}else{
			if(msg != null){
				if(obj.attr("tip_bak") == undefined){
					obj.attr("tip_bak",obj.attr("tip"));
				}
				obj.attr("tip",msg);
			}
		}
	}else{
		if(obj.attr("is_tip_null") == "yes"){
			obj.removeAttr("tip");
			obj.removeAttr("tip_bak");
		}else{
			obj.attr("tip",obj.attr("tip_bak"));
			obj.removeAttr("tip_bak");
		}
	}
}
//出现错误时，添加错误的样式
function change_error_style(obj,action_type){
	if(action_type == "add"){
		obj.addClass("input_validation-failed");
		obj.next().removeClass("corect");
		obj.next().addClass("error");
	}else{
		obj.removeClass("input_validation-failed");
		obj.next().removeClass("error");
		obj.next().addClass("corect");
	}
}

$.fn.validate_callback = function(msg,action_type,options){
	this.each(function(){
		if(action_type == "failed"){
			change_error_style($(this),"add");
			change_tip($(this),msg,"add");
		}else{
			change_error_style($(this),"remove");
			change_tip($(this),null,"remove");
		}
	});
};
