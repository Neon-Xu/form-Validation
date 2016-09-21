(function(window){
	
    var messages = {
            required: '必填项',
            email: '邮箱格式错误',
            number: '请填入数字',
            maxLength: '最多输入{count}个字符',
            minLength: '最少输入{count}个字符',
            maxChecked: '最多选择{count}个选项',
            minChecked: '最少选择{count}个选项',
            maxSelected: '最多选择{count}个选项',
            minSelected: '最少选择{count}个选项'
        },

        rules =  new RegExp(/^\s*(required|email|number|minChecked|maxChecked|minSelected|maxSelected|minLength|maxLength|regExp)(\[(\w{1,15})\])?/i),

        methods = {
            required: function(fieldData) {
                var placeholder = fieldData.el.getAttribute("placeholder"),
                    val = $.trim(fieldData.val);
                if( !val || val == placeholder )
                    return fieldData.customMsg || messages['required'];
            },
            email : function(fieldData) {
                var R = RMAIL = new RegExp(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/);
                if(!R.test(fieldData.val))
                    return fieldData.customMsg || messages['email'];
            },
            number : function(fieldData) {
                var R = new RegExp(/^[\-\+]?(\d+|\d+\.?\d+)$/);
                if(!R.test(fieldData.val))
                    return fieldData.customMsg || messages['number'];
            },
            maxLength: function(fieldData) {
                var len = fieldData.val.length,
                    count = fieldData.method[3];

                if(len > count)
                    return fieldData.customMsg || messages['maxLength'].replace('{count}', count);
            },
            minLength: function(fieldData) {
                var len = fieldData.val.length,
                    count = fieldData.method[3];

                if(len < count)
                    return fieldData.customMsg || messages['minLength'].replace('{count}', count);
            },
            maxChecked: function(fieldData) {
                var len = fieldData.val.length,
                    count = fieldData.method[3];

                if(len > count)
                    return fieldData.customMsg || messages['maxChecked'].replace('{count}', count);
            },
            minChecked: function(fieldData) {
                var len = fieldData.val.length,
                    count = fieldData.method[3];

                if(len < count)
                    return fieldData.customMsg || messages['minChecked'].replace('{count}', count);
            },
            maxSelected: function(fieldData) {
                var len = fieldData.val.length,
                    count = fieldData.method[3];

                if(len > count)
                    return fieldData.customMsg || messages['maxSelected'].replace('{count}', count);
            },
            minSelected: function(fieldData) {
                var len = fieldData.val.length,
                    count = fieldData.method[3];

                if(len < count)
                    return fieldData.customMsg || messages['minSelected'].replace('{count}', count);
            },
            regExp: function(fieldData) {
                var R = fieldData.regExp,
                    val = fieldData.val;
                if(!R.pattern.test(val))
                    return R.errorMessage;
            }
        },

        defaults = {
            showErrorMessages: true, 
            errorClass: 'validate-error', 
            position: 'right', 
            bottomGap: 3 ,
            realTime: false, 
            onValid: function() {}, 
            onError: function() {}
        };


    var Validation = function(form,options) {
        this.state = true;
        this.form = form;
        this.$form = $(form);
        this.fields = this.form.querySelectorAll('[data-valid]');
        this.options = $.extend({},defaults,options);
        this.events();
    }

    Validation.prototype = {
        events: function() {
            var self = this;
            this.$form.on("submit",function(e) {
                e.preventDefault();
                self.init();
            })
            if(this.options.realTime) {

            }
            this.$form.on('reset', function() {
                self.initError()
            })
        },
        init: function() {
            this.form.style.position = "relative";
            this.initError();
            this.checkFields();
            if(this.state)
                this.options.onValid.call(this);
            else
                this.options.onError.call(this);
        },
        checkFields: function() {
            var fields = this.fields;
            for (var i=0,len=fields.length;i<len;i++) {

                var field = fields[i],
                    val = this.getValue(field),
                    elMethods = field.getAttribute('data-valid').split(','),
                    errors = [];

                var fieldData = {
                    el: field,
                    val: val,
                    method: []
                };
                // check某个表单项
                for (var j=0,methodsLength=elMethods.length; j<methodsLength; j++) {
                    
                    var elMethod = elMethods[j].match(rules),
                        elMName = elMethod[1],
                        elMCount = elMethod[3];

                    fieldData.method = elMethod;

                    // 自定义错误信息
                    if(field.getAttribute('data-valid-message-'+elMName))
                        fieldData.customMsg = field.getAttribute('data-valid-message-'+elMName);

                    // 校验规则
                    if(methods[elMName]) {
                        if(elMName == "regExp") // 正则规则
                            fieldData['regExp'] = this.options.regExp[elMCount];
                        var _error = methods[elMName](fieldData);
                        _error ? (errors.push(_error)) : '';
                    }

                } 

                if(errors.length) {
                    this.showError(field,errors);
                    this.state = false;
                }

            }
        },
        getValue: function(el) {
            var _value,
                _name = el.name;
            if(el.type == "radio") {
                _value = $("input[name='"+_name+"']:checked").val();
            }else if(el.type == "checkbox") {
                _value = [];
                $("input[name='"+_name+"']:checked").each(function(i,c){
                    _value.push($(c).val())
                })
            }else {
                _value = $(el).val();
            }
            return _value || "";
        },
        showError: function(el,errors) {
            if(!this.options.showErrorMessages) return;
            var errEl = $("<div>");
            errEl.addClass(this.options.errorClass);
            errEl.html(errors.join(","));
            
            if(el.getAttribute("data-valid-position") == "bottom") {
                var elPos = this.getElPosition(el);
                errEl.css({
                    position:'absolute',
                    left: elPos[0],
                    top: elPos[1] + this.options.bottomGap,
                })
            }

            if(el.type == "radio" || el.type == "checkbox") {
                var els = this.getCollection(el);
                el = els[els.length-1];
            }
            $(el.parentNode).append(errEl);
        },
        getCollection: function(el) {
            var _name = el.name,
                _colls = [];
            if(el.type == "radio" || el.type == "checkbox") {
                _colls = this.form.querySelectorAll('[name="'+_name+'"]');
            }
            return _colls;
        },
        initError: function () {
            this.state = true;
            var self = this;
            var allE = this.form.querySelectorAll("." + this.options.errorClass);
            for(var i=0,len=allE.length;i<len;i++) {
                this.clearError(allE[i]) ;
            }
        },
        clearError: function(el) {
            el.parentNode.removeChild(el);
        },
        getElPosition: function(el) {
            var boot = this.form,
                left = el.offsetLeft,
                top = el.offsetTop + el.offsetHeight;
            while(el.offsetParent && el.offsetParent != boot) {
                el = el.offsetParent;
                left +=  el.offsetLeft;
                top += el.offsetTop;
            }
            return [left,top];
        }
    }

    $.fn.validate = function(options) {
        return this.each(function(){
            if (!$(this).data('form.validate')) {
                $(this).data('form.validate', new Validation(this, options));
            }
        })
    };
            
})(this)