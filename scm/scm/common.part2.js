/*!
 * CONSOLE FIX
 */
if (!window.console) {
    window.console = {
        log: function (r) {
            return r;
        },
        error: function (r) {
            return r;
        },
        debug: function (r) {
            return r;
        }
    };
}


function pop_relogin_frame(opt) 
{
    var $C = $SAETOOLS.getController();
    $C.ajax('/home/ucenter/setAlert', null, function(data){
        if(this.code == 200)
        {
            (typeof opt.callback == 'function') && (opt.callback.call(this, data));
        }
        else
        {
            this.c.popup(data); 
        }
    });
}
$SAE = {};
(function ($) {
    $(document).ready(function () {
        window.$C = $SAETOOLS.getController();
        //底部二维码展示
        $('.weixin').on('click',function(){
            var img = $('<img src="/static/common/image/weixin.png" class="qr-code" />');
            $(this).append(img);
            img.on('click',function(event){
                event.stopPropagation();
                $(this).remove();
            });
        });

        //调用登录=>NOTICE.
        $SAETOOLS.SCSSO();
        //绑定滚动到页面顶部
        $SAETOOLS.scrolltop('bind');
        $SAETOOLS.AddRecruitment();
        //去掉URL中的HASH锚点，防止提交表单出错
        //$SAETOOLS.RemoveURLHash();
        //BROSWER NOTICE
        $SAETOOLS.BrowserNotice(true);
        //input onlyNum
        $SAETOOLS.numInput();

        //扩展jquery功能
        $.fn.extend({
            controller : $SAETOOLS.getController(),
            //ajax提交当前表单数据(不绑定表单提交事件)
            //param callback function|object 提交表单成功后回调函数|配置信息
            //param options object 配置信息，submitCallback:提交表单成功后回调函数,submitBefore:提交表单之前回调函数，submitAfter:提交表单之后回调函数
            ajax : function(callback, options) {
                var form = this.is('form') ? this : this.closest('form');
                if(!form.length) return;

                options = (typeof callback === 'object' && callback) || options || {};
                options.submitCallback = (typeof callback === 'function' && callback) || options.submitCallback || null; 
                ajaxSubmitData.call(this.controller, form, null, options);
            },

            //绑定表单提交事件，改用ajax提交数据
            //param callback function|object 表单提交并返回结果后回调函数|配置项
            //param options object 配置项，比如：submitBefore, submitCallback, submitAfter(表单提交后回调函数)
            ajaxForm : function(callback, options) {
                this.each(function(){
                    var target = $(this);
                    var form = target.is('form') ? target : target.closest('form');
                    if(!form.length) return;
                    target.controller.ajaxForm(form, callback, options);
                });
                return this;
            },

            //获取验证器
            getValidator : function() {
                var form = this.is('form') ? this : this.closest('form');
                return ((form.length && form) || this).data('validator');
            },

            //验证器
            //param submit string|function|object 使用何种方式提交表单：none,default,ajax|提交表单回调函数|配置信息
            //param options object 配置信息。submit:提交表单回调函数，submitBefore:提交表单之前回调函数，callback:提交表单返回结果后回调函数,showError:显示错误信息，hideError:隐藏信息
            validation : function(submit, options) {
                var options = (typeof submit === 'object' && submit) || options || {}
                var eles = this;
                options.noForm && (eles = [eles]);
                $.each(eles, function(){
                    var target = $(this);
                    if(!target.getValidator())
                    {
                        options.submit = (typeof submit !== 'object' && submit) || options.submit || 'default';
                        var validator = target.controller.validation(target, null, options);
                        var obj = (target.is('form') && target) || target.closest('form');
                        ((obj.length && obj) || target).data('validator', validator);
                    }
                });
                return this;
            },

            //验证表单项有效性
            checkValidity : function() {
                var validator = this.getValidator();

                if(!validator) return false;

                return validator.checkValidity(this);
            },

            //输出分页信息
            //param options object 配置信息，主要有：showPage当前页左右各显示多少个页码;page当前页码;total总页数;pageField表单页码字段名称;
            pagination : function(options) {
                this.controller.pagination(this, options);
                return this;    
            },
            //将本元素的html()作为弹出窗口输出
            popup : function(options) {
                options = options || {};
                options.tpl = options.tpl || this.attr('id');
                this.controller.popup(this.html(), options.data, options, options.callback, options);
            },
            //注册元素init事件
            created : function(callback){
                if(this.length == 0)
                {
                    var target = this.controller.getId(this.selector);
                    return typeof callback === 'function' ? this.controller.on(target, 'created', callback) : this.controller.trigger(target, 'created', arguments);
                }
                else
                {
                    return typeof callback === 'function' ? this.on('created', callback) : this.trigger('created', arguments);
                }
            },
            //文件上传
            uploader : function(options){
                var option = options || {};
                this.each(function(){
                    var options = $SAETOOLS.extend({}, option);
                    var self = $(this);
                    var tag = self.data('tag') || 'invoice';
                    //上传按钮工具函数
                    var btnTools = {
                        upload: function(input){
                            var uploadButtonText = input.nextAll('div.app-upload').find('.qq-upload-button span.upload-btn-text');
                            !uploadButtonText.data('text') && uploadButtonText.data('text', uploadButtonText.text()).text('正在上传...');
                        },
                        reset: function(input){
                            var uploadButtonText = input.nextAll('div.app-upload').find('.qq-upload-button span.upload-btn-text');
                            uploadButtonText.data('text') && uploadButtonText.text(uploadButtonText.data('text')) && uploadButtonText.data('text', null);
                        }
                    }
                    var qqOptions = {
                        validation:{},
                        request:{endpoint:'/?m=upload&tag='+tag, inputName:'attachement', uuidName:'id', params:{uploader:'qq'}},
                        deleteFile:{enabled:true, endpoint:'/?m=upload&a=delete', method:'POST', params:{}},
                        debug:true,
                        text: {
                            uploadButton:'<span class="upload-btn-text">上传附件</span>',
                            dragZoneText:'拖动到此处以上传文件'
                        },
                        callbacks:{
                            onSubmit:function(){
                                btnTools.upload(self);
                            },
                            onError:function(e, id, filename, msg, request){
                                var errorMsg = (request.status != 200) ? request.statusText : msg;
                                self.controller.alert(errorMsg, {closeToParent:true, target:self});
                            },
                            onComplete:function(e, id, filename, data){
                                btnTools.reset(self);
                                if(data && data.success && data.newUuid) 
                                {
                                    var list = !self.val() ? [] : self.val().split(',');
                                    list.push(data.newUuid);
                                    var targetInput = self.data('input');
                                    $('input[name='+targetInput+']').val(list.join(','));
                                    if(options.preview){//为了加一个链接预览
                                        $('input[name='+targetInput+']').parentsUntil("div.control-group").find('.qq-upload-success:last-child').append('<a style="color:#fff;font-size:12px;" target="_blank" href="'+options.preview_baseurl+data.newUuid+'">预览</a>');;
                                    }
                                    self.val(list.join(','));
                                }
                            },
                            onDeleteComplete:function(e, id, request){
                                var data = $.parseJSON(request.response); 
                                if(data && data.success)
                                {
                                    var list = !self.val() ? [] : self.val().split(',');
                                    delete list[list.indexOf(data.id)];
                                    var targetInput = self.data('input');
                                    $('input[name='+targetInput+']').val(list.join(','));
                                    self.val(list.filter(function(elem){return typeof elem !== 'undefined';}).join(','));
                                }
                            }
                        }
                    };

                    //配置项转换
                    if(options.pic_id){
                        var pic_id = self.data("input");
                        options.uploadUrl = options.uploadUrl+"&pic_id="+pic_id;
                    }

                    options.oneRequest && (qqOptions.oneRequest = options.oneRequest);
                    options.inputNames && (qqOptions.inputNames = options.inputNames);
                    options.validation && (qqOptions.validation = options.validation);
                    (typeof options.multiple === 'boolean') && (qqOptions.multiple = options.multiple);
                    options.uploadUrl && (qqOptions.request.endpoint = options.uploadUrl);
                    options.inputName && (qqOptions.request.inputName = options.inputName);
                    (typeof options.deleteEnabled !== 'undefined') && (qqOptions.deleteFile.enabled = options.deleteEnabled);
                    options.deleteUrl && (qqOptions.deleteFile.endpoint = options.deleteUrl);
                    options.idName && (qqOptions.request.uuidName = options.idName);
                    if(options.hasOwnProperty('buttonText')) qqOptions.text.uploadButton = options.buttonText;

                    //包装检测回调函数（上传前每个文件触发一次）
                    if(typeof options.validate === 'function'){
                        qqOptions.callbacks.onValidate = function(e, data){
                            if(options.validate.call(self, e, data)){
                                return true
                            }
                            return false
                        }
                    }

                    //包装检测回调函数（上传前多个文件触发一次）
                    if(typeof options.validateBatch === 'function'){
                        qqOptions.callbacks.onValidateBatch = function(e, arr){
                            if(options.validateBatch.call(self, e, arr)){
                                return true
                            }
                            return false
                        }
                    }
                    //包装上传回调函数（上传前）
                    if(typeof options.upload === 'function'){
                        qqOptions.callbacks.onUpload = function(id, name){
                            if(options.upload.call(self, id, name)){
                                return true
                            }
                            return false
                        }
                    }

                    //包装上传回调函数
                    if(typeof options.uploadCallback === 'function')
                    {
                        qqOptions.callbacks.onComplete = function(e, id, filename, data, request){
                            data = data || {};
                            data.id = id;
                            data.filename = filename;
                            btnTools.reset(self);
                            options.uploadCallback.call(self, e, data); 
                        }  
                    }

                    //包装删除回调函数
                    if(typeof options.deleteCallback === 'function')
                    {
                        qqOptions.callbacks.onDeleteComplete = function(e, id, request){
                            var data = $.parseJSON(request.response) || {}; 
                            data.id = id;
                            options.deleteCallback.call(self, e, data);
                        } 
                    }

                    //上传文件模板
                    var templates = arguments.callee.templates = arguments.callee.templates || {
                        'default' : '<div class="qq-uploader span12">' +
                          '<pre class="qq-upload-drop-area"><span>{dragZoneText}</span></pre>' +
                          '<div class="qq-upload-button btn">{uploadButtonText}</div>' +
                          '<span class="qq-drop-processing"><span>{dropProcessingText}</span><span class="qq-drop-processing-spinner"></span></span>' +
                          '<ul class="qq-upload-list" style="margin-top: 10px; text-align: center;"></ul>' +
                        '</div>',
                        'mobile': '<div class="qq-uploader">' +
                          '<pre class="qq-upload-drop-area"><span>{dragZoneText}</span></pre>' +
                          '<div class="qq-upload-button upload-button background-button">{uploadButtonText}</div>' +
                          '<span class="qq-drop-processing"><span>{dropProcessingText}</span><span class="qq-drop-processing-spinner"></span></span>' +
                          '<ul class="qq-upload-list" style="margin-top: 10px; text-align: center;"></ul>' +
                        '</div>'
                    };

                    //选择模板
                    options.template = options.template || 'default';
                    if(options.template)
                    {
                        if(templates.hasOwnProperty(options.template))
                        {
                            qqOptions.template = templates[options.template];
                        }
                        else
                        {
                            qqOptions.template = templates['default']; 
                        }
                        //选定模板需要做一些特殊处理
                        switch(options.template) 
                        {
                            case 'mobile':
                                //设置属性
                                qqOptions.deleteFile.enabled = false;
                                options.hideList = true;
                                qqOptions.text.uploadButton = '';
                                if(self.val())
                                {
                                    options.initCallback = options.initCallback || function(){
                                        self.nextAll('div.app-upload').find('.qq-upload-button').removeClass('background-button').prepend('<img class="img-polaroid" src="'+self.data('src')+'" />');  
                                    }
                                }
                                //上传完成回调函数
                                qqOptions.callbacks.onComplete = function(e, id, filename, data, request){
                                    btnTools.reset(self);
                                    data = data || {};
                                    data.id = id;
                                    data.filename = filename;
                                    if(data.success)
                                    {
                                        self.val(data.newUuid);
                                        var uploadButton = self.nextAll('div.app-upload').find('.qq-upload-button');
                                        uploadButton.removeClass('background-button');
                                        uploadButton.find('img').remove();
                                        uploadButton.prepend('<img class="img-polaroid" src="'+data.url+'" />');
                                    }
                                    typeof options.uploadCallback === 'function' && options.uploadCallback.call(self, e, data); 
                                }  
                                break;
                            case 'image':
                                //设置属性
                                qqOptions.deleteFile.enabled = false;
                                options.hideList = true;
                                var width = options.width || '160px',
                                    height = options.height || '80px';
                                //上传完成回调函数
                                qqOptions.callbacks.onComplete = function(e, id, filename, data, request){
                                    btnTools.reset(self);
                                    data = data || {};
                                    data.id = id;
                                    data.filename = filename;
                                    if(data.success)
                                    {
                                        self.val(data.newUuid);
                                        self.siblings('img.result').remove();
                                        self.after('<img class="img-polaroid result" src="'+data.url+'" width="'+width+'" height="'+height+'"/>');
                                    }
                                    typeof options.uploadCallback === 'function' && options.uploadCallback.call(self, e, data); 
                                }  
                                break;
                            case 'file':
                                //设置属性
                                qqOptions.deleteFile.enabled = false;
                                options.hideList = true;
                                //上传完成回调函数
                                qqOptions.callbacks.onComplete = function(e, id, filename, data, request){
                                    btnTools.reset(self);
                                    data = data || {};
                                    data.id = id;
                                    data.filename = filename;
                                    if(data.success)
                                    {
                                        self.val(data.newUuid);
                                        self.siblings('span.result').remove();
                                        self.after('<span class="result">'+data.filename+'</span>');
                                    }
                                    typeof options.uploadCallback === 'function' && options.uploadCallback.call(self, e, data); 
                                }  
                                break;
                        }
                    }
                    self.parent().find('.app-upload').remove();
                    var container = $('<div class="app-upload"></div>').insertAfter(self);
                    container.fineUploader(qqOptions);    
                    for(var name in qqOptions.callbacks)
                    {
                        container.on(name.substring(2, 3).toLowerCase() + name.substring(3), qqOptions.callbacks[name]); 
                    }
                    container.data('input', self);
                    //隐藏进度列表
                    if(options.hideList) container.find('ul.qq-upload-list').hide();
                    if(options.initCallback) options.initCallback();
                });
            },
            //包装button函数，解决reset回错误值的bug
            btn : function(action) {
                this.each(function(){
                    var self = $(this);
                    switch(action)
                    {
                        case 'loading':
                            self.data('__last_text', self.val() || self.text() || '');
                            self.button('loading');
                            break;
                        case 'reset':
                            var last = self.data('__last_text');
                            if(last || last == '')
                            {
                                if(self.is('a'))
                                {
                                    var current = self.text();
                                    self.button('reset');
                                    self.text(current.match(/loading/) ? last : current);  
                                }
                                else
                                {
                                    var current = self.val();
                                    self.button('reset');
                                    self.val(current.match(/loading/) ? last : current);
                                }
                                self.data('__last_text', null);
                            }
                            break;
                    }
                });
            },
            //初始化daterangepicker
            initDaterangepicker: function(starttime, endtime, callback, options){
                options = $SAETOOLS.extend({format: 'YYYY-MM-DD', startDate: starttime, endDate: endtime, showDropdowns:true, locale: { cancelLabel:'关闭', applyLabel:'确认', daysOfWeek:["日", "一", "二", "三", "四", "五", "六"], monthNames:['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'], fromLabel:'', toLabel:'', customRangeLabel:'自定义'}}, options);
                return this.daterangepicker(options, callback);
            },
            print: function(){
                var Iframe = function(){
                        var frameId = 'print-iframe';
                        var iframeStyle = '';
                        var iframe;

                        try
                        {
                            iframe = document.createElement('iframe');
                            document.body.appendChild(iframe);
                            $(iframe).attr({ style: iframeStyle, id: frameId, src: "" });
                            iframe.doc = null;
                            iframe.doc = iframe.contentDocument ? iframe.contentDocument : ( iframe.contentWindow ? iframe.contentWindow.document : iframe.document);
                        }
                        catch( e ) { throw e + ". iframes may not be supported in this browser."; }

                        if ( iframe.doc == null ) throw "Cannot find document.";

                        return iframe;
                    },
                    docType = function(){
                        return '<!DOCTYPE html>';
                    },
                    getHead = function(){
                        var extraHead = "";
                        var links = "";

                        $(document).find("link")
                            .filter(function(){ // Requirement: <link> element MUST have rel="stylesheet" to be considered in print document
                                    var relAttr = $(this).attr("rel");
                                    return ($.type(relAttr) === 'undefined') == false && relAttr.toLowerCase() == 'stylesheet';
                                })
                            .filter(function(){ // Include if media is undefined, empty, print or all
                                    var mediaAttr = $(this).attr("media");
                                    return $.type(mediaAttr) === 'undefined' || mediaAttr == "" || mediaAttr.toLowerCase() == 'print' || mediaAttr.toLowerCase() == 'all'
                                })
                            .each(function(){
                                    links += '<link type="text/css" rel="stylesheet" href="' + $(this).attr("href") + '" >';
                                });

                        return "<head><title></title>" + extraHead + links + "</head>";

                    },
                    iframe = new Iframe(),
                    writeDoc = iframe.doc;

                printWindow = iframe.contentWindow || iframe;
                writeDoc.open();
                writeDoc.write( docType() + "<html>" + getHead() + '<body>' + $(this).clone().wrap('<p>').parent().html() + "</body></html>" );
                writeDoc.close();
                $(writeDoc).ready(function(){
                    printWindow.focus();
                    printWindow.print();
                    $(iframe).remove();
                });
            },
            /*拖动条
             *param object
             *   options = {
             *       disabled:false,                //禁用,默认false
             *       animate:false,                 //是否启用动画效果,默认false
             *       orientation:'horizontal',      //水平or垂直,默认'horizontal'
             *       range:false,                   //true表示范围拖动,默认false
             *       min:0,                         //起点表示的数值,默认0
             *       max:100,                       //终点表示的数值,默认100
             *       step:20,                       //间隔值,默认1
             *       value:0,                       //单点拖动时的初始值,默认0
             *       values:[0,100],                //范围拖动时的初始值,默认[0,100]
             *       start:function(drag,value,range){},  //拖动开始回调,回调函数自带2~3个参数:'drag'-当前拖动的button,'value'-当前拖动button的value值,'range'-拖动条当前范围值
             *       stop:function(drag,value,range){},   //拖动结束回调
             *       sliding:function(drag,value,range){},//拖动值变化回调
             *       change:function(drag,range){}, //结束拖动后的值与开始拖动前的值不一致时回调
             *       duration:400
             *   }
             */
            sae_dragBar:function(options){
                if(this.length == 0){return this}
                options.range = (options.range == 'true' || options.range == true)? true : false;
                $.extend(this,{
                    'disabled':false,
                    'animate':false,
                    'orientation':'horizontal',
                    'range':false,
                    'min':0,
                    'max':100,
                    'step':1,
                    'value':0,
                    'values':[0,100],
                    'start':function(drag,value,range){},
                    'stop':function(drag,value,range){},
                    'sliding':function(drag,value,range){},
                    'change':function(drag,value,range){},
                    'create':function(drag,range){},
                    'duration':400
                },options);

                /*sort values_arr*/
                function sortNumber(a,b){
                    return a - b
                }
                this.values.sort(sortNumber);
                
                if(!this.range){this._cValue1 = this.value>this.max?this.max:this.value<this.min?this.min:this.value; this._cValue2 = this.min;}
                else{this._cValue1 = this.values[0]<this.min?this.min:this.values[0];this._cValue2 = this.values[1]>this.max?this.max:this.values[1];}
                this.per = Number.prototype.toFixed.call(this.step/(this.max-this.min)*100,2);
                this.len = Number.prototype.toFixed.call((this.max-this.min)/this.step,2)-1;
                
                /*public API*/
                this.getRange = function(){
                    if(this.range){
                        return [this._cValue1,this._cValue2]
                    }else{
                        return [this._cValue2,this._cValue1]
                    }
                }
                this.disable = function(){
                    $('body').off('mouseup.slide').off('mousemove.slide');
                    $(this).off('mousedown.slide');
                    return this
                }
                this.enable = function(){
                    $('body').off('mouseup.slide').off('mousemove.slide');
                    $(this).off('mousedown.slide');
                    this.sae_dragBar_fn._addListen.call(this,this._modal);
                    return this
                }

                /*init*/
                this.sae_dragBar_fn.init.call(this);
                return this
            },
            sae_dragBar_fn:{
                init:function(){
                    this._modal = this.sae_dragBar_fn._createDrag.call(this);
                    if(!this.disabled){this.sae_dragBar_fn._addListen.call(this,this._modal);}
                },
                _createDrag:function(){
                    var _this = this,slide_modal = '',_tmp,l0,l1,_bar,_drag;
                    if(this.orientation == 'horizontal'){
                        this.addClass('slide-horizontal');
                    }else if(this.orientation == 'vertical'){
                        this.addClass('slide-vertical');
                    }
                    this.addClass('slide-cont');
                    if(!this.range){
                        slide_modal = $('<div class="slide-bar"></div><a class="slide-drag"><span class="slide-drag-info"></span></a>');
                        _bar = slide_modal.filter('.slide-bar');
                        _drag = slide_modal.filter('.slide-drag');
                        l0 = this.sae_dragBar_fn._getA(this.per,(this._cValue1-this.min)/(this.max-this.min)*100)*this.per;
                        if(this.orientation == 'horizontal'){
                            _drag.css('left',l0 + '%');
                            _bar.css('width',l0 + '%');
                        }else if(this.orientation == 'vertical'){
                            _drag.css('top',l0 + '%');
                            _bar.css('height',l0 + '%');
                        }
                    }else{
                        slide_modal = $('<a class="slide-drag"><span class="slide-drag-info"></span></a><div class="slide-bar"></div><a class="slide-drag"><span class="slide-drag-info"></span></a>');
                        _drag = slide_modal.filter('.slide-drag');
                        _bar = slide_modal.filter('.slide-bar');
                        l0 = this.sae_dragBar_fn._getA(this.per,(this._cValue1-this.min)/(this.max-this.min)*100)*this.per;
                        l1 = this.sae_dragBar_fn._getA(this.per,(this._cValue2-this.min)/(this.max-this.min)*100)*this.per;
                        if(this.orientation == 'horizontal'){
                            _drag.eq(0).css('left',l0 + '%');
                            _drag.eq(1).css('left',l1 + '%');
                            _bar.css({
                                'width': (l1 - l0) +'%',
                                'left' : l0 + '%'
                            });
                        }else if(this.orientation == 'vertical'){
                            _drag.eq(0).css('top',l0 + '%');
                            _drag.eq(1).css('top',l1 + '%');
                            _bar.css({
                                'height': (l1 - l0) +'%',
                                'top' : l0 + '%'
                            });
                        }
                    }
                    
                    this.append(slide_modal);
                    _drag.each(function(i){
                        var $this = $(this),info = $this.find('.slide-drag-info');
                        $this.data('_index',i+1);
                        $this._value = _this['_cValue'+(i+1)];
                        info.text($this._value).css('left',($this.innerWidth()-info.innerWidth())/2);
                    });
                    
                    /*create drag callback*/
                    this.create(_drag,this.getRange());
                    return slide_modal
                },
                _addListen:function(modal){
                    var body = $('body'),
                        cont = this,
                        per = this.per,
                        len = this.len,
                        _value1,_value2;

                    /*save old value*/
                    _value1 = this._cValue1;
                    _value2 = this._cValue2;

                    /*drag*/
                    cont.off('mousedown.slide').on('mousedown.slide',function(event){
                        event.stopPropagation();
                        var _drag = $(this),c_left,c_top,nearest_drag = {item:null},
                            cX = event.clientX,cY = event.clientY,
                            drag = cont.find('.slide-drag'),
                            bar = cont.find('.slide-bar');

                        /*release*/
                        body.off('mouseup.slide').on('mouseup.slide',function(){
                            body.off('mousemove.slide');
                            drag.css('cursor','default');
                            /*stop drag callback*/
                            cont.stop(_drag,_drag.value,cont.getRange());
                            /*change value callback*/
                            if(_value1 != cont._cValue1 || _value2 != cont._cValue2){
                                _value1 = _value1 != cont._cValue1 ? cont._cValue1 : _value1;
                                _value2 = _value2 != cont._cValue2 ? cont._cValue2 : _value2;
                                cont.change(_drag,_drag.value,cont.getRange());
                            }
                            body.off('mouseup.slide');
                        });

                        body.off('mousemove.slide').on('mousemove.slide',moving);
                        function moving(event,type){
                            event.preventDefault();
                            /*get mouse position*/
                            cX = event.clientX ? event.clientX : cX;
                            cY = event.clientY ? event.clientY : cY;
                            var ted,_left_,_top_,_tmp,
                                i = _drag.data('_index'),
                                info = _drag.find('.slide-drag-info'),
                                dw = _drag.innerWidth(),
                                _left = (cX - cont.offset().left-parseInt(_drag.css('width'))/2)/parseInt(cont.css('width'))*100,
                                _top = (document.body.scrollTop + cY - cont.offset().top - parseInt(_drag.css('height'))/2)/parseInt(cont.css('height'))*100;

                            /*horizontal*/
                            if(cont.orientation == 'horizontal' && _left >= 0 && _left <= 100){
                                /*get nearest equants*/
                                ted = cont.sae_dragBar_fn._getA(per,_left);
                                _left = ted*per;
                                /*save old value*/
                                _tmp = cont['_cValue'+i];
                                
                                if(cont.range){
                                    /*current_drag can not cross the other one*/
                                    var d1 = drag.eq(0).position(),d2 = drag.eq(1).position(),cw = cont.width();
                                    switch(i){
                                        case 1 :
                                            _left_ = d2.left/cw*100;
                                            if(_left > _left_){_left = _left_;}else{cont['_cValue'+i] = _drag.value = cont.min+ted*cont.step;}
                                            /*change bar width and left*/
                                            if(type && cont.animate){
                                                bar.animate({
                                                    'width':(d2.left-_left*cw/100)/cw*100+'%',
                                                    'left' : _left+'%'
                                                },{duration:cont.duration,queue:false});
                                            }else{
                                                bar.css({
                                                    'width':(d2.left-_left*cw/100)/cw*100+'%',
                                                    'left' : _left+'%'
                                                });
                                            }
                                            break;
                                        case 2 : 
                                            _left_ = d1.left/cw*100;
                                            if(_left < _left_){_left = _left_;}else{cont['_cValue'+i] = _drag.value = cont.min+ted*cont.step;}
                                            if(type && cont.animate){
                                                bar.animate({
                                                    'width':(_left*cw/100-d1.left)/cw*100+'%',
                                                    'left' : d1.left/cw*100+'%'
                                                },{duration:cont.duration,queue:false});
                                            }else{
                                                bar.css({
                                                    'width':(_left*cw/100-d1.left)/cw*100+'%',
                                                    'left' : d1.left/cw*100+'%'
                                                });
                                            }
                                            break;
                                    }
                                }else{
                                    if(type && cont.animate){
                                        bar.animate({'width':_left + '%'},{duration:cont.duration,queue:false});
                                    }else{
                                        bar.css('width',_left + '%');
                                    }
                                    _drag.value = cont._cValue1 = cont.min+ted*cont.step;
                                }
                                if(type && cont.animate){
                                    _drag.animate({'left' : _left + '%'},{duration:cont.duration,queue:false});
                                }else{
                                    _drag.css('left' , _left + '%');
                                }
                                /*draging callback*/
                                if(_tmp != cont['_cValue'+i]){
                                    cont.sliding(_drag,_drag.value,cont.getRange());
                                    info.css('left',(dw-info.innerWidth())/2);
                                }
                            /*vertical*/
                            }else if(cont.orientation == 'vertical' && _top >= 0 && _top <= 100){
                                ted = cont.sae_dragBar_fn._getA(per,_top);
                                _top = ted*per;
                                /*memory old value*/
                                _tmp = cont['_cValue'+i];
                                if(cont.range){
                                    //cont['_cValue'+i] = (cont.min+ted*cont.step);

                                    var d1 = drag.eq(0).position(),d2 = drag.eq(1).position(),ch = cont.height();
                                    switch(i){
                                        case 1 : 
                                            _top_ = d2.top/ch*100;
                                            if(_top > _top_){_top = _top_;}else{cont['_cValue'+i] = _drag.value = cont.min+ted*cont.step;}
                                            if(type && cont.animate){
                                                bar.animate({
                                                    'height':(d2.top-_top*ch/100)/ch*100+'%',
                                                    'top' : _top + '%'
                                                },{duration:cont.duration,queue:false});
                                            }else{
                                                bar.css({
                                                    'height':(d2.top-_top*ch/100)/ch*100+'%',
                                                    'top' : _top + '%'
                                                });
                                            }
                                            break;
                                        case 2 : 
                                            _top_ = d1.top/ch*100;
                                            if(_top < _top_){_top = _top_;}else{cont['_cValue'+i] = _drag.value = cont.min+ted*cont.step;}
                                            if(type && cont.animate){
                                                bar.animate({
                                                    'height':(_top*ch/100-d1.top)/ch*100+'%',
                                                    'top' : d1.top/ch*100+'%'
                                                },{duration:cont.duration,queue:false});
                                            }else{
                                                bar.css({
                                                    'height':(_top*ch/100-d1.top)/ch*100+'%',
                                                    'top' : d1.top/ch*100+'%'
                                                });
                                            }
                                            break;
                                    }
                                }else{
                                    if(type && cont.animate){
                                        bar.animate({'height':_top + '%'},{duration:cont.duration,queue:false});
                                    }else{
                                        bar.css('height',_top + '%');
                                    }
                                    _drag.value = cont._cValue1 = cont.min+ted*cont.step;
                                }
                                if(type && cont.animate){
                                    _drag.animate({'top' : _top + '%'},{duration:cont.duration,queue:false});
                                }else{
                                    _drag.css('top' ,_top + '%');
                                }
                                if(_tmp != cont['_cValue'+i]){
                                    cont.sliding(_drag,_drag.value,cont.getRange());
                                    info.css('left',(dw-info.innerWidth())/2);
                                }
                            }

                        }
                        
                        /*judge nearest drag*/
                        c_left = event.clientX - cont.offset().left,
                        c_top = document.body.scrollTop + event.clientY - cont.offset().top;
                        if(cont.orientation == 'horizontal'){
                            nearest_drag.l=cont.width();
                            drag.each(function(){
                                var le = Math.abs($(this).position().left - c_left);
                                le <= nearest_drag.l && (nearest_drag.item = this,nearest_drag.l = le)
                            });
                            _drag = $(nearest_drag.item);
                        }else if(cont.orientation == 'vertical'){
                            nearest_drag.l=cont.height();
                            drag.each(function(){
                                var tp = Math.abs($(this).position().top - c_top);
                                tp <= nearest_drag.l && (nearest_drag.item = this,nearest_drag.l = tp)
                            });
                            _drag = $(nearest_drag.item);
                        }
                        /*init value*/
                        _drag.value = cont['_cValue'+_drag.data('_index')];
                        
                        /*start drag callback*/
                        cont.start(_drag,_drag.value,cont.getRange());
                        /*trigger*/
                        moving(event,'click');
                        
                        _drag.css('cursor','move');
                    });
                },
                /*获取最近间隔点*/
                _getA:function(per,c){
                    var _max,min,i=0;
                    do{
                        _min = i*per;
                        _max = (++i)*per;
                    }while(_min > c || _max <c)
                    return (_max - c) >= (c - _min) ? i-1 : i
                }
            }
        }); 
        //汉化时间控件数据
        if($SAETOOLS.i18N_ID == 1 && $.fn.datetimepicker)
        {
            $.fn.datetimepicker.dates.en = {
                days: ["星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期天"],
                daysShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六", "周日"],
                daysMin: ["日", "一", "二", "三", "四", "五", "六", "日"],
                months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
                monthsShort: ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"]
            };
        }
        //判断浏览器
        $.browser = {
            mozilla : /firefox/.test(navigator.userAgent.toLowerCase()),
            webkit : /webkit/.test(navigator.userAgent.toLowerCase()),
            opera : /opera/.test(navigator.userAgent.toLowerCase()),
            msie : /msie/.test(navigator.userAgent.toLowerCase()),
            chrome : /chrome/.test(navigator.userAgent.toLowerCase())
        };

        //解决firefox的一些兼容性问题
        if($.browser.mozilla)
        {
            __defineGetter__("event", function(){var c = arguments.callee.caller; while(c.caller) c = c.caller; return c.arguments[0]});
        }

        //自动为form添加验证和ajax提交
        $('form[validation-form=true]').validation();
        $('form[ajax-form=true]').ajaxForm();
        
        //自动设置默认值
        $('[dvalue]').on('blur', function(e){
            var target = $(this);
            if(target.val() == '') target.val(target.attr('dvalue'));
        }).on('focus', function(e){
            var target = $(this);
            if(target.val() == target.attr('dvalue')) target.val('');
        }).trigger('blur');
    });

// 工具函数:语言设置
$SAETOOLS.i18N = function (params) {
    var config = {
        'zh_CN': 1,
        'en_US': 2
    }
    // 待完成根据服务器设置返回默认语言,或者IP地址选择
    var init = function () {
        // 读取COOKIES设置
        var curLang = $.cookie('hl');
        if (curLang) {
            $.i18n.init({
                lng: curLang,
                fallbackNS: $SAE['modeName']
            });
            return config[curLang];
        } else {
            // 读取推荐设置
            var jsDefault = $SAETOOLS.i18N_CONFIG;
            if (jsDefault) {
                $.i18n.init({lng: jsDefault, ns:$SAE['modeName'], resGetPath:'/?m=ajax&a=get_resources&language=__lng__&namespace=__ns__', dynamicLoad:true});
                return config[jsDefault];
            } else {
                // 读取服务器推荐设置 待完成
            }
        }
    }
    if (params) {
        if (params.lang) {
            $.i18n.init({
                lng: params.lang,
                fallbackNS: $SAE['modeName']
            });
            return config[params.lang];
        } else {
            return init();
        }

    } else {
        return init();
    }
}
// 工具函数:获取文本【默认中文肯定会存在】
$SAETOOLS.i18NT = function (id, arr, prev) {
    if(arguments.length==1){
        //当仅仅传递一个ID的时候，获取文本内容
        //索引从1开始
        return $SAETOOLS.i18NT(arguments[0]-1, $SAETOOLS['TEXT_TEMPLATE']);
    }else if(arguments.length==3){
        //当传递参数为三个的时候
        var curLang = $SAETOOLS.i18N();
        curLang = curLang ? curLang - 1 : 0;
        if (arguments[2]) {
            curLang -= 1;
        }
    }
    var curLang = curLang || $SAETOOLS.i18N();
    curLang = curLang ? curLang - 1 : 0;

    var id = arguments[0];
    var arr = arguments[1];

    if (arr[curLang]) {
        if (arr[curLang][id]) {
            return arr[curLang][id];
        } else {
            return $SAETOOLS.i18NT(id, arr, true);
        }
    } else {
        return 'LANGUAGE SETTING ERROR.';
    }
}
// 工具函数:输出模版文本 ,仅匹配 %ｓ%，如需模糊匹配，请修改正则内容 .*? 即可．
$SAETOOLS.i18NS = function () {
    var tpl = arguments[0];
    var match = tpl.match(/%s%/gim);
    if(arguments.length-1 != match.length){
        return 'I18N:STRING ERROR.';
    }
    for(var i= 0,j=match.length; i<j;i++){
        tpl = tpl.replace(match[i], arguments[i+1]);
    }
    return tpl;
}

// 工具函数:模版操作，传递一个参数get，传递两个参数set，不传递则get all
$SAETOOLS.TPL = function(name,tpl){
    $SAE['TPL'] = $SAE['TPL'] || [];
    if(name && tpl){
        $SAE['TPL'][name] = tpl;
    }else if(name){
        return $SAE['TPL'][name];
    }else{
        return $SAE['TPL'];
    }
}
//工具函数:生成字符串
$SAETOOLS.RandomChars = function (strlen, opt, cut) {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
    if (opt) {
        switch (opt) {
            case 'NUMBER':
                chars = "1234567890";
                break;
            case 'UCASE':
                chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                break;
            case 'LCASE':
                chars = "abcdefghijklmnopqrstuvwxyz";
                break;
        }
    }
    if (cut) {
        for (var i = cut.length - 1; i >= 0; i--) {
            chars = chars.replace(cut[i], '');
        }
    }

    var len = chars.length;
    var result = "";
    if (!strlen) {
        strlen = Math.random(len);
    }
    var d = Date.parse(new Date());
    for (var i = 0; i < strlen; i++) {
        result += chars.charAt(Math.ceil(Math.random() * d) % len);
    }
    return  result;
}
//配合模版函数，将某元素的转义后的文本替换为标准HTML代码
$SAETOOLS.ParseHTML = function(target){
    return $($.parseHTML($(target).html())).text();
}

//工具函数:登录转向
//@2013.2.1无参数也默认转向到
$SAETOOLS.loginRedirect = function (url) {
    var target = '';
    var current = window.location.href;
    if(current.indexOf('m=front')!==-1){
        target = current.substr(0, current.lastIndexOf('/'))+'/?m=dashboard';
    }else{
        target = current;
        if (url && !url.curpage) {
            target = target.substr(0, target.lastIndexOf('/')) + url.redirect;
        }
    }
    if(!target.match(/^https?:/i)) target = location.protocol + "//" + location.host + target;
    scsso.logincallbackurl = target;
    scsso.login();
    return false;
}

//工具函数:注销登录
$SAETOOLS.logout = function () {
    var url = encodeURIComponent('http://' + $SAE['SAE_SERVER_NAME'] + '/?m=user&a=logout_redirect');
    scsso.logout(url);
    return false;
}

//用户登录&登出
$SAETOOLS.SCSSO = function () {
    if(typeof scsso === 'undefined') return;
    //工具函数获取URL参数
    var getparam = function (paras) {
        var url = location.href;
        var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
        var paraObj = {}
        for (i = 0; j = paraString[i]; i++) {
            paraObj[j.substring(0, j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=") + 1, j.length);
        }
        var returnValue = paraObj[paras.toLowerCase()];
        if (typeof(returnValue) == "undefined") {
            return "";
        } else {
            return returnValue;
        }
    }
    
    scsso.init({
        'crossdomainproxy': document.location.protocol + '//' + document.location.host + '/home/sso/loginProxy',
        /*监听登录成功后回调*/
        'logincallback' : function(){
          //console.log( !$SC['uid'] );
            if (!$SC['uid']) {
                $.ajax({
                    type:'post',
                    url:'/Home/Public/ticketInfo',
                    data:{'uid':scsso.uid,'ticket':scsso.ticket},
                    success:function(ret){
                        //console.log(ret);
                        ret.code || window.location.reload();
                    }
                });
            }
        },
        /*监听登出成功后回调*/
        'logoutcallback' : function(){
            if ($SC['uid']) {
                $.ajax({
                    url:'/Home/Public/logout',
                    success:function(ret){
                        ret.code || window.location.reload();
                    }
                });
            }
        },
    });
}

//通过ajax方式进行请求的入口，带有权限判断。
//update 2013/7/4
$SAETOOLS.SAE = function (params) {
    // 如果在验证过程，就不再次请求，
    // 每次执行完毕，都还原互斥锁
    if (!$SAETOOLS.mutex) {return;}
    //加锁
    $SAETOOLS.mutex = false;
    var url = params.url;
    if (!url) {return;}
    //TODO:LOADING 展示，防止加载过慢用户焦躁。
    $.ajax({
        url: params.url,
        type: params.type || 'POST',
        dataType: params.dataType || 'json',
        async : (typeof params.async === 'undefined' ? true : !!params.async),
        data : params.formData || params.data || {},
        cache : params.cache || false,
        beforeSend : params.beforeSend,
        complete : params.complete,
        success: function (resp) {
            //解锁
            $SAETOOLS.mutex = true;
            params.formData = params.data;
            params._data = params.data;
            params.data = resp;
            //AJAX请求结束，获取返回数据，进行登录判断。
            var needLogin = false;
            switch(resp.code){
                case 403:needLogin = true;break;
                case 302:window.location = resp.location;break;
            }
            if (needLogin) {
                //骚年你木有登录啊，我带你去重新登录函数。
                //$SAETOOLS.loginRedirect({curpage:true});
                
                $SAETOOLS.securityLogin(params)
            } else {
                if (typeof params.callback == 'function') {
                    //调用自定义的CALLBACK。
                    params.callback(params);
                }else if (!params.callback){
                    //调用通用的CALLBACK。
                    params = $SAETOOLS.box(params);
                }
            }
            return params;
        }
    });
}

$SAETOOLS.box = function(options) {
    var params = options || {};
    //初始化默认数据,并依次使用服务端返回数据,用户指定数据填充
    var msgBox = {
        option:{
            'tpl':'default',
            'closeBtn':true,
            'closeCB':function(){}
        },
        data:{},
        extra:{},
        modal:{
            'text': "这里是默认的文本信息。",
            'title': "系统消息"
        }
    }

    //复制数据
    params.data && (msgBox = this.extend(true, msgBox, params.data));
    params.msgbox && (msgBox = this.extend(true, msgBox, params.msgbox));
    msgBox.modal.id = msgBox.modal.id || ($SAETOOLS.RandomChars(4, 'LCASE') + (+new Date()));

    //组织模板
    var tpl = (msgBox.option && msgBox.option.tpl) || 'default';
    var content = '<div id="'+msgBox.modal.id+'" class="common-modal modal fade '+tpl+'" tabindex="-1" role="dialog" aria-labelledby="modal-label" aria-hidden="true">\n<div class="modal-dialog" style="position: relative;">\n<div class="modal-content">\n<div class="modal-header">\n';
    msgBox.option.closeBtn && (content += '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>\n');
    content += '<h3 class="modal-title">'+msgBox.modal.title+'</h3>\n</div>';

    switch(tpl)
    {
        case 'default':
            content += '<div class="modal-body"><div class="alert alert-info">\n'+msgBox.modal.text+'</div>\n</div>\n';
            content += '<div class="modal-footer">\n<button type="button" class="btn close-btn" data-dismiss="modal" aria-hidden="true">关闭</button>\n</div>\n';
            break; 
        case 'text':
            content += '<div class="modal-body"><div class="modal-text">\n'+msgBox.modal.text+'</div>\n</div>\n';
            content += '<div class="modal-footer">\n<button type="button" class="btn close-btn" data-dismiss="modal" aria-hidden="true">关闭</button>\n</div>\n';
            break;
        default:
            //自定义模板
            msgBox.modal.text = $SAETOOLS.TPL(tpl) || msgBox.modal.text;     
            content += msgBox.modal.text;
            break;
    }

    content +='</div>\n</div>\n</div>\n';
    $(content).appendTo('body');

    //创建弹出窗口
    var targetModal = $('#'+msgBox.modal.id).modal({backdrop: 'static', keyboard: false}).modal('show');

    //设定关闭按钮点击时触发窗口关闭事件
    targetModal.find('.close, button.close-btn').on('click.close', function(e){
        targetModal.trigger('close'); 
    });
    //注意由于这里的close事件比较多，close事件的执行顺序与其注册时间的先后顺序对应
    //注册窗口关闭时间默认执行操作
    targetModal.on('close.default', function(e){
        //清理modal上所有定时器
        $SAETOOLS.setTimer(null, null, targetModal.prop('id'));
        //隐藏并移除窗口
        targetModal.modal('hide');
    });
    targetModal.on('hidden.bs.modal',function(){
        targetModal.remove();
    });
    //注册窗口关闭回调事件
    msgBox.option.closeCB && targetModal.on('close.callback', msgBox.option.closeCB);
    //设置关闭窗口后开启父窗口
    if(msgBox.option.closeToParent && msgBox.modal.parentModalId)
    {
        targetModal.on('close.closeToParent', function(e){
            $('#'+msgBox.modal.parentModalId).modal('show');
        });
    }
    //注册窗口关闭刷新事件
    if(msgBox.option.refresh)
    {
        targetModal.on('close.refresh', function(e){
            document.location.reload();
        }); 
    }
    //自动关闭窗口
    if((+msgBox.option.closeTimeout) > 0)
    {
        var timer = setTimeout(function(){
            //触发窗口关闭事件
            targetModal.trigger('close');
        }, (+msgBox.option.closeTimeout) * 1000);
        $SAETOOLS.setTimer('auto_close_modal', timer, targetModal.prop('id'));
    }
    //处理自动跳转事件
    if(typeof msgBox.option.redirect === 'string' && msgBox.option.redirect.length)
    {
        targetModal.data('redirect', setTimeout(function(){
            $SAETOOLS.redirect(msgBox.option.redirect, msgBox.option.openTarget);
        }, 1000 * (+msgBox.option.redirectTimeout))); 
    }
    //弹出窗口创建完毕回调函数
    if(msgBox.modal.callback){
        var callback = msgBox.modal.callback;
        if(typeof callback == 'function'){
            callback.call(msgBox, msgBox, targetModal); 
        } else {
            for(var i= 0,j=msgBox.modal.callback.length;i<j;i++){
                targetModal.find(msgBox.modal.callback[i]['el']).on(msgBox.modal.callback[i]['ev'],msgBox.modal.callback[i]['fn']);
            }
        }
    }
    //执行模板的ready事件
    msgBox.option.tpl && $('#'+msgBox.option.tpl).created(targetModal, msgBox.data);
    //显示并刷新弹出窗口验证码
    if(msgBox.extra.vcode)
    {
        $('img.vcode_img').off('click').on('click', function(e){
            var vcodeName = $(e.target).data('vcode-name');
            e.target.src = "/vc.php?r=" + $SAETOOLS.RandomChars(10, 'NUMBER') + (vcodeName ? '&k=' + vcodeName : '');
        }).trigger('click'); 
    }

    params.box = msgBox;

    return params;
}

//设置弹窗确定事件
$SAETOOLS.confirm = function(confirm_text, callback) {
    var id = $SAETOOLS.RandomChars(4, 'LCASE') + (+new Date());
    var tpl = '';
    tpl += '<script script id="'+id+'" type="text/html">';
    tpl += '<div class="modal-body"><div class="modal-text"><%=content%></div></div>';
    tpl += '<div class="modal-footer">';
    tpl += '<button type="button" class="btn no-btn" data-dismiss="modal" aria-hidden="true">取消</button>';
    tpl += '<button type="button" class="btn yes-btn" data-dismiss="modal" aria-hidden="true">确认</button></div>'
    tpl += '</script>';
    $(tpl).appendTo('body');
    $SAETOOLS.popup(id, {content: confirm_text}, null);
    $('.yes-btn').on('click', function(e) {
        callback.call({}, true);
    });
    $('.no-btn').on('click', function(e){
        callback.call({}, false);
    });
    $('.close').on('click', function(e){
        callback.call({}, false);
    });
}

// param for get user input
$SAETOOLS.userInput = function(input_html, user_id, callback) {
    var id = $SAETOOLS.RandomChars(4, 'LCASE') + (+new Date());
    var tpl = '';
    tpl += '<script script id="'+id+'" type="text/html">';
    // 输入不转义
    tpl += '<div class="modal-body"><div class="modal-text"><%==content%></div></div>';
    tpl += '<div class="modal-footer">';
    tpl += '<button type="button" class="btn no-btn" data-dismiss="modal" aria-hidden="true">取消</button>';
    tpl += '<button type="button" class="btn yes-btn" data-dismiss="modal" aria-hidden="true">确认</button></div>'
    tpl += '</script>';
    $(tpl).appendTo('body');
    $SAETOOLS.popup(id, {content: input_html}, null);
    $('.yes-btn').on('click', function(e) {
        var user_input = $('#'+user_id).val();
        callback.call({}, user_input);
    });
    $('.no-btn').on('click', function(e){
        callback.call({}, false);
    });
    $('.close').on('click', function(e){
        callback.call({}, false);
    });
}


//安全登录
$SAETOOLS.securityLogin = function (params) {
    if(!params) return;
    var parentParams = params;
    var box = params.data;
    var options = {'title':(box.title?box.title:'安全登录'), 'tpl':'security-login-tpl', 'id':'comonModal'};
   
    var tpl = '<div class="modal-body">\n';
    if (box.message) {
        tpl+='<div class="alert alert-info">\n'+box.message+'</div>\n';
    }
    //if (box.data.form) {
    tpl+='<form id="auth-form" class="form-horizontal">\n<div class="form-group safecode-box">\n<label class="col-sm-4 control-label" for="sae-safecode">安全认证</label>\n<div class="col-sm-6">\n<input type="password" class="form-control" id="sae-safecode" placeholder="请输入安全密码...">\n</div>\n</div>\n';

    if(box.data.login_failds){
        tpl+='<div class="form-group vcode-box">\n<label class="col-sm-4 control-label" for="sae-vcode">验证码</label>\n<div class="col-sm-6">\n<input type="text" class="form-control" id="sae-vcode" placeholder="请输入验证码" maxlength="4">\n<img src="/home/Public/verify" id="vcode_img" alt="点击重新获取验证码" style="position: absolute; right: 18px;top: 2px;height: 28px; margin-top: 1px; border-left: 1px solid #CCC; width: 80px;cursor: pointer;" onclick="javascript:(function(img,o){var r = $SAETOOLS.RandomChars(10, \'NUMBER\');img.src = \'/home/Public/verify?r=\'+r;})(this)">\n</div>\n</div>\n';
    }

    tpl+='<div class="form-group">\n<div class="col-sm-offset-4 col-sm-8">\n<span id="getpass-action" class="help-block" style="cursor:pointer;width:60px;color:#039DC2">\n找回密码</span>\n<span>'+'</span>\n</div>\n</div>\n</form>\n';
    //}
    tpl += '</div>\n';
    tpl+='<div class="modal-footer">\n<button type="button" class="btn" data-dismiss="modal" aria-hidden="true">关闭</button>\n';
    //if (box.extra.desc != 'success') {
        tpl+='<button type="button" id="sumbit-action" data-callback="callback" data-index="2" data-loading-text="安全验证ing..." class="btn btn-primary">\n安全验证</button>\n';
    //}
    tpl+='</div>\n';

    this.popup(tpl, null, options, function(){
        var transTips = $('#comonModal .help-block');
        $(transTips).html($SAETOOLS.ParseHTML(transTips));
        $('#auth-form').on("keydown.soulteary", function (e) {
            if (e.keyCode == 13) {
                e.preventDefault();
                $('#sumbit-action').trigger('click');
            }
        });
        var vCode = function () {
            var r = $SAETOOLS.RandomChars(10, 'NUMBER');
            $('img#vcode_img').attr('src', '/home/Public/verify?r=' + r);
        }
        var createPopover = function (data) {
            if (data.modal.title && data.modal.text &&(data.extra.needAuth||data.extra.vcode)) {
                
                $('#comonModal').find('div.popover').remove();
                var tpl = '<!-- popover -->\n<div class="popover right" style="display: block; position: absolute; left: 424px; top: 120px;">\n<div class="arrow" style="border-right-color: #999 !important;">\n</div>\n<h3 class="popover-title">{{modal.title}}</h3>\n<button type="button" class="close" style="position: absolute;right: 7px;top: 6px;" onclick="$(\'#comonModal div.popover\').hide();">&times;</button>\n<div class="popover-content">\n<p>{{modal.text}}</p>\n</div>\n</div>\n<!-- popover -->\n';
                var template = Hogan.compile(tpl).render(data);
                $(template).appendTo('div.modal-content');
                
                var popover = $('#comonModal').find('div.popover');
                var alertInput = $('div.control-group', $('#comonModal'));
                alertInput.removeClass('warning info');
                var poptop = 0;
                if (data.extra.relogin) {
                    //重新登录SAE
                    //$SAETOOLS.loginRedirect({curpage:true});
                } else {
                    if(data.extra.code){
                        switch(data.extra.code){
                            case 400: poptop = $('.modal-header').outerHeight()+ $('.alert-info').outerHeight() + $('.safecode-box').outerHeight() + 20;break;
                            case 401: poptop = $('.modal-header').outerHeight()+ $('.alert-info').outerHeight();break;
                            default: popover.hide();
                        }
                        popover.animate({'top':poptop+'px'},500);
                    }
                    $('#comonModal').find('div.popover').show();
                }
            }
        }
        //重新执行安全认证之前的ajax请求 
        var lastAjax = function(){
            //安全认证成功执行上次请求
            var result = $('#comonModal').data('auth-result');
            if(result) {
                parentParams.data = parentParams._data;
                $SAETOOLS.SAE(parentParams);
            }
        }
        //找回密码
        $('#getpass-action').on('click', function(e){
            //$('#getpass-action').button('loading');
            //document.location.href = '/?m=dashboard&a=getpwd'
        });
        //提交
        $('#sumbit-action').on('click', function(e){
            var safecodeInput = $('input#sae-safecode');
            if (safecodeInput.length && safecodeInput.val() == '') {
                var popData = {
                    extra: {
                        code:401,
                        needAuth:true
                    },
                    modal: {
                        title: '系统提示',
                        text: '您忘记填写安全密码了。'
                    }
                }
                createPopover(popData);
                safecodeInput.closest('div.control-group').removeClass('info error').addClass('warning');
                return;
            }
            ;

            var vcodeInput = $('input#sae-vcode')
            if (vcodeInput.length && vcodeInput.val() == '') {
                var popData = {
                    extra: {
                        code:400,
                        vcode:true
                    },
                    modal: {
                        title: '系统提示',
                        text: '您忘记填写验证码了。'
                    }
                }
                createPopover(popData);
                vcodeInput.closest('div.control-group').removeClass('info error').addClass('warning');
                return;
            }
            ;

            $('#sumbit-action').button('loading');

            var poData = {
                vcode: $('input#sae-vcode').val(),
                password: $('input#sae-safecode').val()
            }

            if(!box.data.login_failds){
                delete poData.vcode;
            }

            /*验证安全密码*/
            $.ajax({
                url: '/home/ucenter/checkPassword',
                type: 'POST',
                data: poData,
                success: function (resp) {
                    $('#sumbit-action').button('reset');
                    box.data = resp.data;
                    if (resp.code == 0) {
                        $('#comonModal').find('div.popover').remove();
                        // 登录成功,即完全木有错误
                        var target = $('#comonModal');
                        target.find('div.modal-header h3').html(resp.title);
                        target.find('div.modal-body div.alert').removeClass('alert-info').addClass('alert-block alert-success fade in').html('<strong>' + '安全认证' + '</strong>\n' + '验证成功' +'<p><span id="timer">3</span>秒后执行验证前操作。</p>');
                        target.find('form').remove();
                        target.find('button#getpass-action').remove();
                        target.find('button#sumbit-action').remove();
                        target.data('auth-result', true);

                        (function (i, params) {
                            var timer;
                            var clock = function () {
                                --i;
                                $('span#timer').html(i);
                                if (i >= 1) {
                                    timer = setTimeout(arguments.callee, 1000);
                                } else {
                                    if (params.url && !params.callback) {
                                        document.location.href = params.url;
                                    } else {
                                        var clear = function () {
                                            clearTimeout(timer);
                                        }
                                        if (params.callback) {
                                            parentParams.action = function () {
                                                clearTimeout(timer);
                                            };
                                            clear();
                                            delete parentParams.data;
                                            params.callback.call(parentParams, parentParams);
                                        } else {
                                            clear();
                                        }
                                        $SAETOOLS.closePopup($('div#comonModal'));
                                    }
                                }
                            }
                            clock();
                        })(3, {callback: lastAjax})


                    } else if(resp.code == 403){
                        if (!resp.data.check_password) {
                            var vCodeBox = $('div.vcode-box');
                            if (!vCodeBox.length) {
                                var target = $('div#comonModal div.safecode-box');
                                var tpl = '<div class="form-group vcode-box">\n<label class="col-sm-4 control-label" for="sae-vcode">验证码</label>\n<div class="col-sm-6">\n<input type="text" id="sae-vcode" class="form-control" placeholder="请输入验证码" maxlength="5">\n<img src="/home/Public/verify" id="vcode_img" alt="点击重新获取验证码" style="position: absolute; right: 18px;top:2px; height: 28px; margin-top: 1px; border-left: 1px solid #CCC; width: 80px;cursor: pointer;" onclick="javascript:(function(img,o){var r = $SAETOOLS.RandomChars(10, \'NUMBER\');img.src = \'/home/Public/verify?r=\'+r;})(this)">\n</div>\n</div>\n';
                                var template = Hogan.compile(tpl).render(resp);
                                target.after(template);
                            } else {
                                vCode();
                            }
                        }
                        var popData = {
                            extra: {
                                code:!resp.data.check_vcode?400:401,
                                vcode:true
                            },
                            modal: {
                                title: resp.title,
                                text: resp.message
                            }
                        }
                        createPopover(popData);
                    }
                }
            });
        });
        $('#comonModal').on('close.lastAjax', lastAjax);
    });

    return params;
}

//设置定时器
$SAETOOLS.setTimer = function(name, handle, modalId) {
    var elem = $('#' + modalId).length ? $('#' + modalId) : $(document);
    var list = elem.data('timer') || {};
    var timer = name ? list[name] : list;
    //清理已存在同名的timer，如果未传递name，则清理所有
    if(timer)
    {
        if(typeof timer === 'number')
        {
            timer = {}; 
            timer[name] = timer;
        }
        for(var name in timer)
        {
            clearTimeout(timer[name]); 
            clearInterval(timer[name]);
        }
    }
    //设定新的定时器句柄
    if(handle)
    {
        list[name] = handle;
    }
    elem.data('timer', list);
}
//获取定时器
$SAETOOLS.getTimer = function(name, modalId){
    var elem = $('#' + modalId).length ? $('#' + modalId) : $(document);
    var list = elem.data('timer') || {};
    return name ? list[name] : list;
}

//滚动到页面顶部
$SAETOOLS.scrolltop = function (action) {

    if(action && action == 'bind'){
        var win = $(window);
        var wrap = $('#page-go-top');
        var btn = $('#page-go-top .page-let-go-to-top');
        var t;

        if (!$('#main').length) {
            var adjust = {
                target: $('#front-page').length?$('#front-page'):$('#common-service')
            }
        } else {
            var adjust = {
                target: $('#main')
            }
        }

        win.on('resize', function () {
            if (adjust.target.length) {
                adjust.left = adjust.target.offset().left + adjust.target.width() + 50;
                wrap.css({bottom: "100px", left: adjust.left + "px"});
            }
        }).trigger('resize');

        win.on('scroll', function () {
            $(this).scrollTop() > 0 ? btn.fadeIn("slow") :  btn.fadeOut("fast");
        });
        btn.on('click',function (e) {
            e.stopPropagation();
            e.preventDefault();
            $("html,body").animate({scrollTop: 0}, 400);
            /*wrap.attr('class', 'hide-text').addClass('going').animate({bottom: win.height()}, 800, "easeInQuint", function () {
                setTimeout(function () {
                    wrap.stop().hide().css({bottom: "100px"}).removeClass("going")
                }, 200)
            }).fadeOut("slow")*/
        });
    }else{
        $("html,body").animate({scrollTop: 0}, 400);
    }

}

//CHECK FLASH IS INSTALL
$SAETOOLS.checkFlash = function(){
    var hasFlash=0;
    var flashVersion=0;
    var isIE=/*@cc_on!@*/0;
    if(isIE)
    {
        var swf = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
        if(swf) {
            hasFlash=1;
            VSwf=swf.GetVariable("$version");
            flashVersion=parseInt(VSwf.split(" ")[1].split(",")[0]);
        }
    }else{
        if (navigator.plugins && navigator.plugins.length > 0){
            var swf=navigator.plugins["Shockwave Flash"];
            if (swf)
            {
                hasFlash=1;
                var words = swf.description.split(" ");
                for (var i = 0; i < words.length; ++i)
                {
                    if (isNaN(parseInt(words[i]))) continue;
                    flashVersion = parseInt(words[i]);
                }
            }
        }
    }
    return {f:hasFlash,v:flashVersion};
}

//滚动到某处
$SAETOOLS.ScrollTo = function(where,which,delay){
    if(!where){return;}
    if(!which){which = "html,body";}
    if(!delay){delay = 1000;}
    else{
        delay*=1000;
    }
    $(which).animate({scrollTop:$(where).offset().top},delay);
}

$SAETOOLS.AddRecruitment = function(){
    var protocol = (("https:" == document.location.protocol) ? "https://" : "http://");
    var msg = '从计算、存储、CDN到安全与大数据服务，如何为各行业客户提供更加全面的支持？\n';
    msg += '如何让企业更快的互联网化？\n';
    msg += '如何不断降低企业的IT成本？\n';
    msg += '无论是IaaS、PaaS还是SaaS，云，已经成为企业高速发展的核心推动力！\n';
    msg += '加入新浪云，投身最朝阳的云计算产业，和我们一起浪迹云端！\n';
    console.log(msg);
    console.log("招聘信息："+protocol+"www.sinacloud.com/doc/about.html#id21");
    console.log("简历飞往：%csaeadmin@sina.cn（邮件标题：姓名-应聘-XX职位-来自console）", "color:red");
}

//去掉URL中的锚点
$SAETOOLS.RemoveURLHash = function(){
    if(location.href.lastIndexOf('#') != -1 || location.hash){
        $SAE.PAGE_HASH = location.href.substr(location.href.lastIndexOf('#')+1);
        location.hash = '';
        /*根据锚点定位*/
        var anch = $('#'+$SAE.PAGE_HASH),win = $(window);
        win.on('load',function(){
            if(anch.length!=0){
                win.scrollTop(anch.offset().top);
            }
        });
        location.href = location.href.substr(0,location.href.lastIndexOf('#'));
    }
}
//获取CMD按钮的ACTION
$SAETOOLS.CMD = function(target, mode) {
    if(!target || !target.length) return null;

    var cmd = null;
    var elem = target;
    //由于IE6/7的href属性会带上url，所以href匹配的时候改为用*=匹配
    switch (mode) {
        case 'parent':
            var elem = target.find('a[href*="#CMD:"]');
            if(elem.length)
            {
                cmd = elem.attr('href'); 
            }
            else
            {
                elem = target.find('[data-cmd]');
                cmd = elem.data('cmd');
            }
            break;
        case 'closest':
            var elem = target.closest('a[href*="#CMD:"]')
            if(elem.length)
            {
                cmd = elem.attr('href'); 
            }
            else
            {
                elem = target.closest('[data-cmd]'); 
                cmd = elem.data('cmd');
            }
            break;
        default:
            if(target.is('a'))
                cmd = target.attr('href');
            else
                cmd = target.data('cmd');
            break;
    }
    elem.is('a') && cmd && (cmd = cmd.split('#CMD:')[1]);
    return cmd;
}

//clone属性，与jQuery.extend完全一致
$SAETOOLS.extend = function(){
    return ($ && $.extend && typeof $.extend == 'function') && $.extend.apply($, arguments);
}

//获取默认控制器实例
$SAETOOLS.getController = function(name){
    $SAE['__controller__'] = $SAE['__controller__'] || {};
    if(!name)
    {
        name = 'default';
        !$SAE['__controller__'][name] && ($SAE['__controller__'][name] = this.createController(name)); 
    }
    return $SAE['__controller__'][name];
}

//判断一个对象是否是空对象，即没有任何属性
$SAETOOLS.isEmpty = function(obj){
    if(typeof obj !== 'object') return false;

    if(typeof obj.length !== 'undefined')
    {
        return !obj.length; 
    }
    else
    {
        var len = false;
        for(var name in obj)
        {
            if(typeof obj[name] !== 'function') 
            {
                len = true;
                break;
            }
        }
        return !len;
    }
}

//事件处理流程
//param name string|function 控制器名称|callback
//param callback function 控制器回调函数
$SAETOOLS.createController = function(name, callback) {
    if(typeof name === 'function')
    {
        callback = name; 
        name = this.RandomChars(6);
    }
    else
    {
        //默认委托处理流程
        callback = callback || function(){
            var self = this;
            var fn = function(e) {
                var target = $(e.target);
                //对委托事件进行过滤，防止同时触发多个事件导致CMD执行多次。
                switch(e.type)
                {
                    case "click": 
                        if(target.is("select, :radio, :checkbox")) return;
                        break;
                    case "change":
                        if(!target.is("select, :radio, :checkbox")) return;
                        break;
                }
                var cmd = self.CMD(target, 'closest');
                self.execute(cmd, e);
            }
            $('body').on('click.controller'+name, fn);
            $('body').on('change.controller'+name, fn);
        };
        name = name || this.RandomChars(6); 
    }

    //controller构造器
    var constructor = function(){
        //继承$sae属性
        $SAETOOLS.extend(this, $SAE);
        //控制器名称
        this.name = name;
        //上下文环境,用于临时附加到controller对象上一些数据，在使用完后清除。注意push和pop一定要成对调用，否则会出现数据混乱。
        this.context = (function(target){
            var contexts = [];
            return new function(){
                //添加临时数据
                this.push = function(data){
                    contexts.push(data);         
                    this.apply();
                } 
                //清除临时数据
                this.pop = function(){
                    var data = contexts.pop();
                    if(data)
                    {
                        //清除数据
                        for(var name in data) 
                        {
                            if(data['__data__'] && data['__data__'][name])
                                target[name] = data['__data__'][name];
                            else
                                delete target[name];
                        }
                        this.apply();
                    }
                }
                //设置当前上下文数据
                this.apply = function(){
                    var data = this.getData(); 
                    if(data)
                    {
                        //记录上一个上下文被覆盖的数据，需要的时候，从这里恢复
                        if(!data['__data__']) data['__data__'] = {};
                        for(var name in data) 
                        {
                            if(typeof target[name] !== 'undefined') data['__data__'][name] = target[name];
                            target[name] = data[name];
                        }
                    }
                }
                //获取当前上下文数据
                this.getData = function(name){
                    var data = null;
                    if(contexts.length) 
                    {
                        data = contexts[contexts.length - 1]; 
                        name && (data = data[name]);
                    }
                    return data;
                }
            };
        })(this);
        //执行用户自定义初始化函数
        callback.call(this); 
    }

    //controller原型
    window.__controller = window.__controller || $SAETOOLS.extend({}, $SAETOOLS, {
        //执行事件
        execute : function(cmd, e, npd){
            //未传递cmd命令，不做任何处理
            if(!cmd) return;
            var func = this.lookup(cmd);             
            if(typeof func == 'function')
            {
                this.context.push({'event':e, 'target':(e && $(e.target)), 'cmd':cmd}); 
                try {
                    var args = ([this.event]).concat(Array.prototype.slice.call(arguments, 3));
                    func.apply(this, args) && (npd = true);
                } finally {
                    this.context.pop();
                }
            }
            else
            {
                console.log('没有注册' + cmd + '函数'); 
            }
            //根据需要决定是否阻止默认事件，请注意默认情况下阻止默认事件
            !npd && e && (e.preventDefault() || e.stopPropagation());
        },
        //搜索事件执行函数
        lookup : function(cmd){
            if(!cmd) return null;
            var propName = this.encodePropName(cmd); 
            return this[propName]; 
        },
        //注册事件
        registerCmd : function(cmd, callback){
            var cmds = cmd.split('|');
            var self = this;
            $.each(cmds, function(index, cmd){
                if(cmd)
                {
                    var propName = self.encodePropName(cmd);
                    self[propName]  = callback;
                }
            });
        },
        //encode属性名称
        encodePropName : function(name){
            var names = name.toLowerCase().split('-'); 
            if(names.length > 0)
            {
                for(var i = 1; (i < names.length && names[i].length > 0); i++)
                {
                     names[i] = names[i].substring(0, 1).toUpperCase() + names[i].substring(1); 
                }
                return names.join('');
            }
            else
            {
                return null;
            }
        },
        //添加额外处理流程
        addAction : function(func){
            if(!func || typeof func !== 'function') return;

            func.apply(this, arguments);
        },
        //销毁控制器
        destroy : function(){
            $('body').off('click.controller'+name);
            $('body').off('change.controller'+name);
        },
        //设置当前事件(这是临时解决办法，不推荐使用)
        setEvent : function(e){
            this.event = e;
            this.target = $(e.target);
        }
    }); 

    //继承control
    constructor.prototype = window.__controller;

    //使用自定义的构造函数创建新controller
    return new constructor();
};

//注册模板
$SAETOOLS.registerTpl = function(tplName, tplText){
    $SAETOOLS.TPL(tplName, tplText); 
};
//根据模板名称查询tpl内容
$SAETOOLS.getTplContent = function(tpl) {
    var content = $SAETOOLS.TPL(tpl);
    return content == 'default' ? null : content;
};
//渲染模板 
$SAETOOLS.render = function(tpl, data) {
    if(!tpl) return '';
    if(template && typeof template == 'function')
    {
        var render = template.compile(tpl);
        var html = render(data);
        return html;
    }
    else
    {
        return Hogan.compile(tpl).render(data); 
    }
};

//关闭当前按钮所在的弹出窗口
//param target element 弹出窗口上任意一元素
//param hide boolean 是否隐藏窗口，默认是直接关闭窗口。隐藏窗口目前主要为关闭子窗口显示父窗口服务。
$SAETOOLS.closePopup = function(target, hide){
    //默认使用当前触发事件的元素
    target = target || this.target;
    //查找元素所在的弹出窗口
    var modal = $(target).closest('div.common-modal');
    var modalId = modal.prop('id');
    //未指定就关闭所有弹出窗口,不返回窗口ID
    if(!modal || modal.length == 0) 
    {
        $('div.common-modal')
            .on('hidden.bs.modal',function(){
                
            })
            .modal('hide');
    }
    else
    {
        hide ? modal.modal('hide') : modal.trigger('close');
    }
    return modalId;
}

//ajax提交表单数据函数
var ajaxSubmitData = function(target, e, options) {
    target = $(target);
    if(!target.is('form') || typeof options !== 'object' || !options) return;

    //如果form表单绑定了验证器，则进行表单验证
    if(!options.notValidate)
    {
        var validator = target.data('validator');
        if(validator)
        {
            if(!validator.checkValidity()) return;
        }
    }

    //执行表单提交前回调函数，如果回调函数强行返回false，就终止流程
    if(options.submitBefore)
    {
        var result = options.submitBefore.call(target, e); 
        if(result === false) return;
    }

    //提交表单
    var self = this.ajax ? this : $SAETOOLS;
    e && self.setEvent(e);
    self.ajax(target.attr('action'), target.serialize(), options.submitCallback || null);

    //表单提交后回调函数
    options.submitAfter && (typeof options.submitAfter === 'function') && options.submitAfter.call(target, e);
}

//ajax提交form，注如需要提交表单需要额外调用trigger('submit');
//param target elem|selector form表单
//param callback function|object 表单提交并返回结果后回调函数|配置项
//param options object 配置项，比如：submitBefore, submitCallback, submitAfter(表单提交后回调函数)
$SAETOOLS.ajaxForm = function(target, callback, options) {
    target = $(target);
    if(!target.is('form')) return;

    var options = this.extend({}, (typeof callback == 'object' && callback) || options || {});
    options.submitCallback = (typeof callback == 'function' && callback) || options.submitCallback || null;

    //绑定表单提交事件
    var eventName = 'submit.s';
    target.off(eventName); 
    var self = this;
    target.on(eventName, function(e){
        e.preventDefault();
        ajaxSubmitData.call(self, target, e, options);
    });

    //去除validation表单提交事件
    var validator = target.data('validator');
    if(validator)
    {
        validator.setOptions({'submit':'none'});
    }

    return target;
}

//表单验证类
// param target element 表单任意元素，推荐使用form元素
// param submit string|function 提交表单事件，''|'default'走默认表单提交事件，'ajax'走默认ajax表单提交事件，function走自定义表单提交事件
// param options object 配置项，主要用于自定义显示和隐藏错误信息
//使用方法：$C.validation($('#form-id'));初始化验证器。然后在元素上使用属性配置验证规则。具体搜索一下addFn函数。
$SAETOOLS.validation = function(target, submit, options) {
    var caller = this;
    target = $(target);
    var options = this.extend({}, options || {});
    options.submit = submit || options.submit;
    //获取表单所有输入项
    var form = options.noForm ? $() : (target.is('form') ? target : target.closest('form')); 
    var inputs = form.length ? $(form.eq(0).find('[name]')).not('button, :button, :image, :reset, :submit,input[type=number]') : target;

    //验证器
    function validator(target, options)
    {
        var self = this;
        this.fns = [];
        
        //绑定事件
        var bindEvent = function(eles){
            unbindEvent(eles);
            if(!eles)
            {
                eles = inputs;
                //绑定form事件
                form.on('submit.v', function(e){
                    (typeof options.submit === 'function') && options.submit.call(form, e);
                    e.target = form;
                    e.type = 'submit';
                });
            }

            //绑定表单项事件
            eles.on('change.v', function(e){
                self.checkValidity($(this));
            }); 
        } 

        //解除事件
        var unbindEvent = function(eles){
            if(!eles)
            {
                eles = inputs;
                //取消form事件
                form.off('submit.v');
            }
            eles.off('change.v');
        }

        //验证表单项是否验证成功
        this.checkValidity = function(eles){
            //待验证项是空或者form就验证form下所有元素
            eles = eles ? (eles.is('form') ? inputs : eles) : inputs;
            //排除不可见的和不可用的元素
            eles = eles.not(':disabled, :hidden'); 
            if(eles.length == 0) return true;

            var errors = [];

            var error_index=0;
            for(var index = 0; index < eles.length; index++)
            {
                var ele = eles[index];
                var error = self.getError(ele); 
                if(error)
                {
                    error_index++;
                    if(error_index==1){//焦点到第一个元素
                        var first = $(ele);
                    }
                    errors.push(error); 
                }
                else
                {
                    self.onsuccess(ele); 
                }
            }

            if(errors.length)
            {
                this.invalidate(errors); 
                first.focus();
                return false;
            }

            return true;
        }

        //添加验证函数
        // param selector 选择器
        // param data 错误信息，string|object({title:'非必填', content:'必填'})
        // param fn 验证函数，返回ture 和 false|错误消息(该错误消息必须是数组，依次替换错误信息里面的占位符)
        this.addFn = function(selector, data, fn){
            (typeof data == 'string') && (data = {content:data});
            this.fns.push({selector:selector, data:data, fn:fn});
        }

        //依次调用验证函数验证元素，并返回错误信息
        this.getError = function(ele){
            ele = $(ele);
            var error = null;
            $.each(this.fns, function(index, fn){
                if(ele.is(fn.selector) && (ret = fn.fn.call(self, ele, ele.val())) != true)
                {
                    error = {};
                    $SAETOOLS.extend(error, fn.data); 
                    !error.title && ele.data('error-title') && (error.title = ele.data('error-title'));
                    !error.content && ele.data('error-content') && (error.content = ele.data('error-content'));
                    !error.content && ele.attr('placeholder') && (error.content = ele.attr('placeholder'));
                    //替换格式化输出
                    var matches = error.content.match(/\$\d/g);
                    if (matches) {
                        var ret = $.isArray(ret) ? ret : [ret];
                        $.each(matches, function(i) {
                            error.content = error.content.replace(this, typeof ret[i] == 'undefined' ? '' : ret[i]);
                        });
                    }  
                    error.content = error.content || '请输入正确的值';
                    return false;
                }
            }); 
            error && (error.element = ele);
            return error;
        }

        //调用验证失败逻辑逻辑
        this.invalidate = function(errors){
            this.showError(errors);
        }

        //调用验证成功逻辑
        this.onsuccess = function(ele){
            this.hideError(ele); 
        }

        //显示错误提示
        this.showError = function(errors){
            var callback = options.showError || function(errors){
                var showErrors = {};
                $.each(errors, function(index, error){
                    var name = error.element.attr('name');
                    //元素名称相同的错误只显示其中一个
                    if(name && showErrors[name]) return true;
                    //判断是否执行用户自定义的输出错误函数
                    if(typeof error.showError === 'function')
                    {
                        error.showError.call(self, error); 
                        //隐藏错误需要在元素上定义hideError事件
                        if(typeof error.hideError === 'function')
                        {
                            error.element.on('hideError', function(e){
                                error.hideError.call(self, error);
                            }); 
                        }
                    }
                    else
                    {
                        var options = {'trigger':'manual'};
                        error.title && (options.title = error.title);
                        error.content && (options.content = error.content);
                        error.element.popover('destroy');
                        error.element.popover(options).popover('show');
                        error.element.siblings('.popover').on('click',function(){
                            error.element.popover('destroy');
                        });
                        error.element.closest('div.form-group').addClass('error');
                    }
                    showErrors[name] = error;
                    
                }); 
            } 
            callback.call(self, errors);
        }

        //销毁错误提示
        this.hideError = function(eles){
            eles = $(eles);
            var callback = options.hideError || function(eles){
                eles.each(function(index, ele){
                    ele = $(ele);
                    ele.closest('div.form-group').removeClass('error');        
                    ele.popover('destroy');
                    //触发定义由用户自定义的隐藏错误事件。
                    ele.trigger('hideError').off('hideError');
                }); 
            } 
            callback.call(self, eles);
        }

        //设置options
        this.setOptions = function(ops){
            $SAETOOLS.extend(options, ops);
        }

        //验证器初始化流程 开始
        //阻止HTML5表单验证逻辑
        form.attr('novalidate', true);

        //注册验证函数
        this.addFn('[required]', '请填写必填项', function(ele, val){
            if(ele.is(':radio, :checkbox'))
            {
                var name = ele.attr('name');
                if(!name) return "多选组件必须有name属性";
                var sname = name.lastIndexOf('[') > 0 ? name.substring(0, name.lastIndexOf('[')) : name;
                var checked = false;
                form.find('[name^='+sname+']').each(function(index, el){
                    el = $(el);
                    if(el.attr('name') != name) return true;
                    if(el.is(':checked')) 
                    {
                        checked = true; 
                        return false;
                    }
                });
                return checked; 
            }
            return !!$.trim(val);
        });
        this.addFn('[vtype=email]', '请输入正确邮箱', function(ele, val){
            return !val || /^([a-z0-9_\.\-\+]+)@([\da-z\.\-]+)\.([a-z\.]{2,6})$/i.test(val); 
        });
        this.addFn('[vtype=url]', '请输入正确URL地址', function(ele, val){
            return !val || /^(https?:\/\/)?[\da-z\.\-]+\.[a-z\.]{2,6}[#&+_\?\/\w \.\-=]*$/i.test(val);
        });
        this.addFn('[vtype=phone]', '请输入正确电话号码', function(ele, val){
            return !val || /^[0-9\s-]{1,20}$/.test(val);
        });
        this.addFn('[vtype=mobile]', '请输入正确手机号', function(ele, val){
            return !val || /^(\+86)?1\d{10}$/.test(val);
        });
        this.addFn('[vtype=appname]', '请输入正确应用名称', function(ele, val){
            return !val || /^[0-9a-z]{4,18}$/i.test(val);
        });
        this.addFn('[vtype=number]', '请输入正确数字', function(ele, val){
            return /^[-+]?[0-9]*(\.[0-9]+)?$/.test(val);         
        });
        this.addFn('[vtype=integer]', '请输入整数', function(ele, val){
            return /^[-+]?([1-9]\d*|0)$/.test(val);
        });
        this.addFn('[vtype=ID_no]', '请输入正确的身份证号', function(ele, val){
                var city={11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江 ",31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北 ",43:"湖南",44:"广东",45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏 ",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外"};
                //var tip = "";
                var pass= true;
                if(!val || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(val)){
                    //tip = "身份证号格式错误";
                    pass = false;
                }
                else if(!city[val.substr(0,2)]){
                    //tip = "地址编码错误";
                    pass = false;
                }
                else{
                    //18位身份证需要验证最后一位校验位
                    if(val.length == 18){
                        val = val.split('');
                        //加权因子
                        var factor = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ];
                        //校验位
                        var parity = [ 1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2 ];
                        var sum = 0;
                        var ai = 0;
                        var wi = 0;
                        for (var i = 0; i < 17; i++){
                            ai = val[i];
                            wi = factor[i];
                            sum += ai * wi;
                        }
                        var last = parity[sum % 11];
                        if(parity[sum % 11] != val[17]){
                            //tip = "校验位错误";
                            pass =false;
                        }
                    }
                }
                //if(!pass) alert(tip);
                return pass;
         });
        this.addFn('[max]', '数字不能大于$1', function(ele, val){
            if(val === '') return true;
            var max = ele.attr('max');
            return parseFloat(val) <= parseFloat(max) ? true : [max];
        });
        this.addFn('[min]', '数字不能小于$1', function(ele, val){
            if(val === '') return true; 
            var min = ele.attr('min');
            return parseFloat(val) >= parseFloat(min) ? true : '[' + min + ']';
        });
        this.addFn('[pattern]', '', function(ele, val){
            return val === '' || new RegExp("^" + ele.attr("pattern") + "$").test(val);
        });
        this.addFn('[ajax]', '$1', function(ele, val){
            var url = ele.attr('ajax');
            var params = {};
            params[ele.attr('name')] = ele.val();
            //默认ajax验证结果为false
            var result = false;
            caller.ajax(url, params, function(data){
                ele.data('ajax-data', this.text);
                result = (this.code != 200) ? [this.text] : true;
            }, {async:false});
            return result;
        });
        this.addFn('[maxlength]', '长度不能超过$1', function(ele, val){
            if(val === '') return true;
            var maxlength = ele.attr('maxlength');
            return val.length > maxlength ? maxlength : true;
        });
        this.addFn('[minlength]', '长度不能小于$1', function(ele, val){
            if(val === '') return true;
            var minlength = ele.attr('minlength');
            return val.length < minlength ? minlength : true;
        });
        //只是针对qqfile上传文件方式
        this.addFn(':file', '请上传图片', function(ele, val){
            var div = ele.closest('div.app-upload');
            var input = div.data('input');
            if(input && input.is('[required]') && !input.val()) 
                return false;
            else
                return true;
        });

        //表单默认提交事件，可根据情况添加更多默认提交事件
        if(typeof options.submit != 'function')
        {
            options.submit = options.submit || 'default'; 
            switch(options.submit)
            {
                case 'ajax':
                    options.submit = function(e){
                        var form = $(this);                       
                        if(self.checkValidity())
                        {
                            if(options.submitBefore && typeof options.submitBefore == 'function')
                            {
                                var result = options.submitBefore.call(form, e); 
                                if(result === false) return false;
                            }
                            caller.ajax(form.attr('action'), form.serialize(), options.callback || null);
                            (typeof options.submitAfter === 'function') && options.submitAfter.call(form, e);
                        }
                        e.preventDefault();
                    } 
                    break;
                case 'none':
                    break;
                default:
                    options.submit = function(e){
                        !self.checkValidity() && e.preventDefault();
                    }
                    break;
            }
        }

        /*
        //如果需要兼容低级浏览器可以使用下列代码
        //初始化占位符
        form.find('input[placeholder]').on('focus.placeholder', function(e){
            var target = $(this);
            (target.val() == target.prop('placeholder')) && target.val('');
        }).on('blur.placeholder', function(e){
            var target = $(this);
            (target.val() == '') && target.val(target.prop('placeholder'));    
        });
        */

        //绑定事件
        bindEvent();
        //验证器初始化流程 结束 
    }

    return new validator(target, options);
}

//发起ajax请求,调用SAETOOLS.SAE
//param url 请求地址
//param data string|object表单参数
//param callback 请求处理完成回调函数
//param options 额外配置，比如：{type:'GET|POST', 'dataType':'json|string|xml', 'async':ture|false}
$SAETOOLS.ajax = function(url, data, callback, options){
    var self = this;
    options = options || {};
    options.url = url;
    data && (options.data = data);

    //设置当前事件和事件目标元素
    if(!self.target || !self.event || !self.cmd)
    {
        (self.event = self.getEvent()) && (self.target = $(self.event.target));
    }

    //由于使用异步ajax，临时中转下列属性
    var tempData = {target:self.target, event:self.event, cmd:self.cmd};

    //默认回调函数
    callback = callback || function(data){
        var isSuccess = true;
        if(typeof this.success === 'function')
        {
            isSuccess = this.success(data); 
        }
        else if(typeof this.success !== 'undefined')
        {
            isSuccess = this.success == this.code; 
        }
        self.popup(null, null, null, null, {closeToParent:!isSuccess});
    }
    //包装回调函数
    options.callback = function(data){
        //重定向不显示弹出窗口
        /*if (data.data.option.redirect && data.data.option.redirectTimeout == 0)
        {
            self.redirect(data.data.option.redirect, data.data.option.openTarget);
            return;
        }*/
        //暂时缓存原始callback数据。
        self.context.push({'saeData':data});
        self.context.push(tempData);
        try {
            //包装原始数据
            var extra = {};
            extra.code = data.data.code;
            extra.location = data.data.location;
            extra.title = data.data.title;
            extra.message = data.data.message;
            extra.data = data.data.data;
            extra.c = self;
            callback.call(extra, data.data); 
        } finally {
            //释放缓存的数据
            self.context.pop();
            self.context.pop();
        }
    } 
    //默认请求发送前回调函数
    var fn = options.beforeSend, target = self.target || (options.target && $(options.target));
    options.beforeSend = function(){
        //设定默认行为
        target && target.is('input.btn, input.button, button') && !target.hasClass('not-loading') && target.btn('loading');
        (typeof fn === 'function') && fn.call(self);
        
    }
    //默认的请求完成回调函数
    fn = options.complete;
    options.complete = function(response, status){
        //设定默认行为 
        target && target.btn('reset');
        (typeof fn  === 'function') && fn.call(self, response.responseJSON || response.responseText, status);
    }
    //自动解锁
    $SAETOOLS.mutex = true;
    $SAETOOLS.SAE(options);
}

//弹出窗口
// param data object|string 模板数据|html
// param tpl string|object 模板名称|html模板数据
// param tplText string|object 模板内容|弹出窗口配置项
// param callback function 弹出窗口创建完成后回调函数
// param option object 设置弹出窗口配置信息:closeToParent
$SAETOOLS.popup = function(data, tpl, tplText, callback, option){
    var self = this;
    var options = {option:{}, data:{}, modal:{}, extra:{}};

    //继承ajax返回的属性
    this.saeData && (options = this.extend(options, this.saeData.data));
    option && (options.option = this.extend(options.option, option));

    //兼容旧模板
    if(!data || typeof data == 'object')
    {
        options.data = data || options.data;
        options.option.tpl = tpl || (options.option && options.option.jsTpl);

        //自动render自定义模板
        if(options.option.tpl && options.option.tpl != 'default')
        {
            //模板搜索策略：传递的模板-》注册的模板-》模板script-》modal.text
            var content = tplText || this.getTplContent(options.option.tpl) || $('script#' + options.option.tpl).html() || options.modal.text;               
            options.modal.text = this.render(content, options.data);
        }
        else
        {
            //默认模板
            (tplText) && (options.option.tpl == 'default') && (options.modal.text = tplText);
        }
    }
    else if(typeof data == 'string')
    {
        //新模板和纯html
        var html = data,
            popupOptions = (typeof tplText === 'object' && tplText) || {},
            htmlData = (typeof tpl === 'object' && tpl) || {};

        //使用新模板
        if(html.length < 20 && document.getElementById(html))
        {
            html =  this.render($('#'+html).html(), htmlData || {});
            popupOptions.tpl = popupOptions.tpl || data;
        }

        options.data = htmlData;
        options.modal.title = (typeof tpl === 'string' && tpl) || popupOptions.title || '系统提示';
        options.option.tpl = popupOptions.tpl || 'text';
        options.modal.text = this.render(html, options.data);
        options.modal.id = popupOptions.id;
    }

    //包装回调函数
    if(callback)
    {
        if(typeof callback == 'function') 
        {
            options.modal.callback = function(data,target){
                //暂时缓存原始callback数据
                //包装原始数据
                var extra = {};
                extra.tpl = data.option.tpl;
                extra.title = data.modal.title;
                extra.text = data.modal.text;
                extra.id = data.modal.id;
                extra.code = data.extra.code || 0;
                extra.c = self;
                callback.call(extra, data.data, target); 
            } 
        }
        else
        {
            options.modal.callback = callback;
        }
    }else{
        options.modal.callback = callback;
    }

    //自动解锁
    $SAETOOLS.mutex = true;
    //自动关闭父窗口
    var parentModalId = this.closePopup(options.option.target || this.target, options.option.closeToParent);
    //传递父窗口ID给子窗口
    (parentModalId) && (options.modal.parentModalId = parentModalId);
    //输出弹出窗口
    var ret = $SAETOOLS.box({'msgbox':options});
    //返回窗口ID
    return ret && ret.box && ret.box.modal.id;
}

//输出分页信息
//param target element 分页信息容器
//param options object 配置信息，主要有：showPage当前页左右各显示多少个页码;page当前页码;total总页数;pageField表单页码字段名称;
$SAETOOLS.pagination = function(target, options){
    if(!target.length) return;
    options = this.extend({
        showPage: 5,
        page:1,
        total:0,
        pageField:'page',
        firstPage:1
    }, options);

    //数据有效性检查
    options.showPage = +options.showPage;
    options.page = +options.page;
    options.total = +options.total;
    if(options.total <= 0) return;
    (options.showPage <= 0) && (options.showPages = 5);
    (options.page < 1) && (options.page = 1);
    (options.page > options.total) && (options.page = options.total);

    //显示的页码数
    var showPages = options.showPage * 2 + 1;
    var template = options.template || '';
    if(template == '')
    {
        template += '<ul>'
        template += '<% if(first) { %>'
        template +=      '<li><a href="#CMD:LoadPage-<%=first%>;">首页</a></li>'
        template += '<% } %>'
        template += '<% if(prev) { %>'
        template +=      '<li><a href="#CMD:LoadPage-<%=prev%>;">上一页</a></li>'
        template += '<% } %>'
        template += '<% for(var i = start; i <= end; i++) { %>'
        template +=  '<% if(i == current) { %>'
        template +=      '<li class="active"><a><%=i%></a></li>'
        template +=  '<% } else {%>'
        template +=      '<li><a href="#CMD:LoadPage-<%=i%>;"><%=i%></a></li>'
        template +=  '<% } %>'
        template += '<% } %>'
        template += '<% if(next) { %>'
        template +=      '<li><a href="#CMD:LoadPage-<%=next%>;">下一页</a></li>'
        template += '<% } %>'
        template += '<% if(last) { %>'
        template +=      '<li><a href="#CMD:LoadPage-<%=last%>;">尾页</a></li>'
        template += '<% } %>'
        template += '</ul>';
    }
    var data = {};

    //首页
    (options.page > 1) && (data.first = 1);
    //上一页
    (options.page > 1) && (data.prev = (+options.page - 1));
    //当前页
    data.current = options.page;
    //页码
    if(options.total <= showPages)
    {
        data.start = 1;
        data.end = options.total;
    }
    else
    {
       if(options.page <= (options.showPage + 1)) 
       {
            data.start = 1;
            data.end = showPages;
       }
       else if(options.page >= (options.total - options.showPage))
       {
            data.start = (options.total - showPages + 1); 
            data.end = options.total;
       }
       else
       {
            data.start = options.page - options.showPage;
            data.end = options.page + options.showPage;
       }
    }
    //下一页
    (options.page < options.total) && (data.next = (+options.page + 1));
    //尾页
    (options.page < options.total) && (data.last = options.total);

    var html = this.render(template, data);
    target.html(html);

    //注册页码按钮事件
    var self = this;
    target.off('click.p');
    target.on('click.p', options.callback || function(e){
        e.preventDefault();
        e.stopPropagation();
        var cmd = self.CMD($(e.target), 'closest');
        if(!cmd) return;
        var rs = cmd.match(/LoadPage-(\d+)/);
        if(rs)
        {
            var page = +rs[1];
            $('input[name='+options.pageField+']').val(page - 1 + options.firstPage).closest('form').trigger('submit');
        }
    });
}

//阻止默认事件和事件冒泡
$SAETOOLS.stopEvent = function(e){
    !e && e.preventDefault() || e.stopPropagation();
}

//字符串trim
$SAETOOLS.trim = function(str){
    return $.trim(str);
}

//简单提示框
$SAETOOLS.alert = function(msg, option){
    this.popup(msg, null, {tpl:'default'}, null, option);
}

//注册回调函数
$SAETOOLS.on = function(key, name, callback){
    if(typeof key !== 'object') 
    {
        var obj = [key];
        this.callbackHandles = this.callbackHandles || {};
        this.callbackHandles[key] = obj;
        key = obj; 
    }
    jQuery.event.add(key, name, callback);
    return key;
}

//执行回调函数
$SAETOOLS.trigger = function(key, name, data){
    if(typeof key !== 'object') 
    {
        this.callbackHandles = this.callbackHandles || {};
        if(this.callbackHandles.hasOwnProperty(key))
            key = this.callbackHandles[key];
        else
            return false;
    }
    jQuery.event.trigger(name, data, key); 
    return true;
}

//获取jquery选择器中的ID
$SAETOOLS.getId = function(selector){
    if(typeof selector !== 'string') return null;
    var id = null;
    (id = selector.match(/^#([^#]+)/)) && (id = id[1]);
    return id;
}

//验证安全登录
$SAETOOLS.checkRelogin = function()
{
    var self = this;
    this.ajax('/home/ucenter/setAlert', null, function(data){
        //console.log(data)
        if(this.code == 200){
            //document.location.reload();
        }else{
            //self.popup();
        }
    }); 
}

//IE debug
$SAETOOLS.iedebug = function(msg){
    if(/msie [67]/.test(navigator.userAgent.toLowerCase())) 
    {
        var text = msg;
        if(typeof msg === 'object')
        {
            text = []; 
            for(var name in msg)
            {
                (typeof msg[name] !== 'function') && text.push(name + ':' + msg[name]); 
            }
            text = text.join("\n");
        }
        alert(text); 
    }
}

$SAETOOLS.BrowserNotice = function(switcher){

    if(!switcher) return false;
    if(switcher == 'ignore'){
        $.cookie("ie-notice-ignore", true);
        $('#ie-notice').fadeOut().remove();
        return;
    }
    if($.cookie("ie-notice-ignore")) return false;
    var isIE = function(ver){
        if(ver == 6){
            var userAgent = /msie 6/i.test(navigator.userAgent);
            var ability = !!window.ActiveXObject&&!window.XMLHttpRequest;
            return userAgent && ability;
        }else if(ver == 8){
            var userAgent = /msie 8/i.test(navigator.userAgent);
        }else{
            var userAgent = /msie [6|7|8|9]/i.test(navigator.userAgent);
        }
        return userAgent;
    }
    if(isIE('any')){
        var msg = '', tpl = '';
        if(isIE(6)){
            tpl = '<div class="alert alert-danger clear-margin" style="text-align: center;" id="ie-notice">';
            msg = '<p>机智的开发者你好，当你看到这条提示的时候，是时候做点神马更加符合您的开发者身份的事情了，比如，抛弃当前正在使用的中古浏览器IE6</p><p>为了能正常的使用SAE在线管理平台，请选择<a href="http://www.browserforthebetter.com/download.html"><code>升级IE浏览器</code></a>，或者<a href="http://chrome.google.com"><code>安装chrome</code></a>。</p>';
        }else{
            tpl = '<div class="alert alert-info clear-margin" style="text-align: center;" id="ie-notice">';
            if(isIE(8)){
                msg = '<p class="clear-margin">开发者你好，为了获得最佳的使用体验，不妨使用<a href="http://chrome.google.com"><code>Chrome</code></a>浏览器访问本站。';
            }else{
                msg = '<p class="clear-margin">开发者你好，为了更好的使用体验，请选择<a href="http://www.browserforthebetter.com/download.html"><code>升级IE浏览器</code></a>，或者<a href="http://chrome.google.com"><code>安装chrome</code></a>。';
            }
            msg+='<a class="btn btn-mini" href="javascript:$SAETOOLS.BrowserNotice(\'ignore\')">不再提示</a></p>';
        }
        tpl += msg;
        tpl += '</div>'
        $('body').prepend(tpl);
        $('#ie-notice').fadeIn('slow');
        if(isIE(6)){
            $SAETOOLS.popup('<div class="alert alert-danger clear-margin">'+msg+'</div>','浏览器感觉不适','IE6');
        }
    }
}

//获取当前事件
$SAETOOLS.getEvent = function(event){
    event = event || window.event;
    return event && $.event.fix(event);
}

//解析URL地址
$SAETOOLS.parseUrl = function(href)
{
    var a = document.createElement('a');
    a.href = href;
    return a;
}

//ajax重定向
$SAETOOLS.redirect = function(href, target){
    if(!href) return;
    target = target || '_self';

    var link = this.parseUrl(href),
        origin = link.origin || '';

    if (!origin && link.hostname)
    {
        origin = '//' + link.hostname + ((!link.port || link.port == 80) ? '' : (':' + link.port));
    }

    href = origin + link.pathname + (link.search ? (link.search + (link.search.match(/\?\w+/) ? '&' : '')) : '?') + '__r=' + this.RandomChars(6) + link.hash;

    if(target != '' || target != '_self')
    {
        window.open(href, target); 
    }
    else
    {
        location.href = href;
    }
}

//表单输入框默认提示信息（兼容IE）
//param target elem|selector input框 or textarea
//提示信息写在html元素placeholde属性内
$SAETOOLS.placeholde = function(target){
    var target = $(target),ele=target[0],ndiv=null;
    (ele.tagName.toLowerCase()=='input' && target.attr('placeholde')) && (
        ndiv=$('<div style="position:absolute;color:#afafaf;"></div>'),
        ndiv.html(target.attr('placeholde')),
        $('body').append(ndiv),
        ndiv.css({'left':target.offset().left+parseInt(target.css('padding-left'))+'px','top':target.offset().top+(target[0].offsetHeight-ndiv.height())/2+'px'})
    );
    (ele.tagName.toLowerCase()=='textarea' && target.attr('placeholde')) && (
        ndiv=$('<div style="position:absolute;color:#afafaf;"></div>'),
        ndiv.html(target.attr('placeholde')),
        $('body').append(ndiv),
        ndiv.css({'left':target.offset().left+parseInt(target.css('padding-left'))+'px','top':target.offset().top+parseInt(target.css('padding-top'))+'px'})
    );
    (target.attr('placeholde'))&&(
        ndiv.on('click',function(){ndiv.hide();target.focus()}),
        target.on('focus',function(){ndiv.hide();}),
        target.on('blur',function(){(ele.value=='') && (ndiv.show())})
    );
}

/*日期选择(需要加载Pikaday)
 *parma  object  object参数内容参见https://github.com/dbushell/Pikaday
*/
$SAETOOLS.pikaday = function(object){
    var re = null,ndate = new Date(),
        options = $.extend({
            firstDay: 1,
            format: 'YYYY-MM-DD',
            i18n: {months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],weekdays: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],weekdaysShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六']}},object);
        try{
            re = new Pikaday(options);
        }catch(err){}
    return re
}

/*获取当前url后面的参数-addBy chenqiang1*/
$SAETOOLS.getQueryString = function(name){
     var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
     var r = window.location.search.substr(1).match(reg);
     if (r != null) return unescape(r[2]); return '';
}

/***预加载图片**/
$SAETOOLS.preload = function(url){
    if(typeof url == 'string'){
        var img = document.createElement('img');
        img.src = url;
    }else if($.isArray(url)){
        for(var i=0,l=url.length;i<l;i++){
            var img = document.createElement('img');
            img.src = url[i];
        }
    }
}

/* 限制input数字 */
$SAETOOLS.numInput = function(){
    $('body').on('keyup','input[onlyNum="true"]',function(){
        this.value.match(/\D/) && (this.value = this.value.replace(/\D+/g,''))
    });
}

/***拖拽***
 *
 * target       param   selector|dom    被拖拽元素
 * drag         param   selector|dom    可拖动区域(默认整个被拖动元素)
 * overBody     param   boolean         是否可拖动至浏览器可视区域外(默认false)
 * dex          param   number          初始位置x坐标
 * dey          param   number          初始位置y坐标
 *
 * reposition   method  function        返回方法：重置到初始位置
 * ******/
$SAETOOLS.sae_dragBar = function(options){
    var op = $.extend({
            'target':'',
            'drag':'',
            'dex':0,
            'dxy':0,
            'overBody':false
        },options),
        body = $(document),
        over = op.overBody,
        tar = $(op.target),
        bar = $(op.drag).length==0?tar:tar.find(op.drag),
        offset = {};
    if(tar.length!=0){
        bar.css('cursor','move');
        /*设置初始位置*/
        reposition();
        bar.on('mousedown',function(event){
            offset = dragble.call(tar);   
            body.on('mousemove',drag);
        });
        body.on('mouseup',function(){
            body.off('mousemove',drag);
        });
    }
    return {
        'reposition':reposition
    }
    /*初始位置*/
    function reposition(){
        tar.css({
            'left':op.dex,
            'top':op.dey
        });
    }
    /*记录拖动点坐标*/
    function dragble(){
        var $this = this,
            eX = event.clientX,
            eY = event.clientY,
            l = $this.offset().left,
            t = $this.offset().top;
        return {diffX:eX-l,diffY:eY-t}
    }
    /*拖动*/
    function drag(event){
        event.preventDefault();
        var $this = tar,
            $window = $(window),
            dx = offset.diffX,
            dy = offset.diffY,
            x = event.clientX,
            y = event.clientY,
            ww = $window.width(),
            wh = $window.height(),
            w = $this.width(),
            h = $this.height(),
            po = $this.css('position')==='absolute'?true:false,
            l = x-dx-(po?0:$window.scrollLeft()),
            t = y-dy-(po?0:$window.scrollTop()),
            val_l = 0,
            val_t = 0;
        if(!over){
            val_l = l < 0 ? 0 : (l+w) > ww ? (ww-w) : l;
            val_t = t < 0 ? 0 : (t+h) > wh ? (wh-h) : t;
        }else{
            val_l = l;
            val_t = t;
        }
        $this.css({
            'left':val_l,
            'top':val_t
        });
    }

}
})(jQuery);


/*function uaMatch(ua)
{
        ua = ua.toLowerCase();

        var match = rwebkit.exec(ua)
                    || ropera.exec(ua)
                    || rmsie.exec(ua)
                    || ua.indexOf("compatible") < 0 && rmozilla.exec(ua)
                    || [];
        console.log(match);
        return {
            browser : match[1] || "",
            version : match[2] || "0"
        };
}

jQuery.extend({
    browser: function() 
    {
        var rwebkit = /(webkit)\/([\w.]+)/,
        ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
        rmsie = /(msie) ([\w.]+)/,
        rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,    
        browser = {},
        ua = window.navigator.userAgent,
        browserMatch = uaMatch(ua);
        console.log(browserMatch);

        if (browserMatch.browser) {
            browser[browserMatch.browser] = true;
            browser.version = browserMatch.version;
        }
        return { browser: browser };
    },
});*/

