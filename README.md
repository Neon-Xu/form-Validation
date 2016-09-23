# form-Validation
简单好用的表单验证插件,支持：
* 必填校验 required
* 最大/小字符数 minLength maxLength minChecked maxChecked minSelected maxSelected
* 邮箱类型 email
* 数字类型 number
* 正则表达式校验 regExp[regName]
* 自定义提示消息 data-valid-message-[validator]
* 自定义提示位置 data-valid-position

## HTML
```html
<input type="text" name="phone" placeholder="请输入电话" data-valid="regExp[checkUserCell]" >
<input type="text" name="addr" placeholder="请输入住址" data-valid="required, minLength[5], maxLength[10]" data-valid-position="bottom">
```
## Javascript
```javascript
var config = {
  showErrorMessages: true,  // 是否显示提示信息
  errorClass: 'validate-error',  // 自定义错误提示样式
  position: 'right',  // 错误提示默认显示在表单控件下方，通过这个设置显示在控件右方
  bottomGap: 3 , // 调节默认显示时的距离 
  regExp:{
		checkUserCell: {
			pattern: /^138/,
			errorMessage: "必须以138开头"
		}
	},
  onValid: function() {},  // 通过校验的回调
  onError: function() {}   // 没通过的回调
}

$('#form').validate(config);
```
