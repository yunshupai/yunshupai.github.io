$(function(){
    var $C = $SAETOOLS.getController();

    //popover
    $('span.show-more').popover({title: '服务说明', trigger: 'hover'});
    $('[data-content]').each(function(){
        $(this).popover('destroy').popover({title: '服务说明', placement: 'top', trigger: 'hover'});
    });
    
    //显示当前等级 
    var sae_ths = $('#sae-table thead th'),
        sae_trs = $('#sae-table tbody tr'),
        quota_ths = $('#quota-table thead th'),
        quota_trs = $('#quota-table tbody tr');
    
    curTable(sae_ths,sae_trs);
    curTable(quota_ths,quota_trs);
    function curTable(ths,trs){
        var cur = 0;
        ths.each(function(i,v){
            if(this.className == 'current'){
                cur = i;
                $(this).append('<div class="cur-tab">当前配额</div>');
            }
        });
        if(cur){
            trs.each(function(i,v){
                if(i==trs.length){return}
                $(this).find('td').eq(cur).addClass('cur-td');
            });
        }
    }

    //查看分钟配额详情
    $C.registerCmd('QUOTA', function(e){
        this.ScrollTo("#quote-info");
        $('a[href$=CHECK-QUOTA]').trigger('click');
    }); 


    //SCH费用参数
   /*var sch_item = new Array(),
        sch_item[0] = [1,1024,20,0.2],
        sch_item[1] = [2,2048,40,0.4],
        sch_item[2] = [4,4096,80,0.6],
        sch_item[3] = [8,8192,160,1.6];*/


    var initSwitchTab = function(){
        var btns = $('.tab-li');
        var contents = $('div.service-item');
        var className = 'active'; 
        btns.bind('click',function(e){
            var target = $(this);
            var index = target.index();
            btns.removeClass(className);
            target.addClass(className);
            contents.addClass('hide').eq(index).removeClass('hide');
            e.stopPropagation();
        });
    }
    initSwitchTab();

    // 检查URI是否有描点，如果有打开相关的tab页面
    var checkHashExist = function() {
        var hash = window.location.hash;
        var li_text = '';
        if ("" == hash) {
            return false;
        }
        if (hash == '#level') {
            li_text = '账户等级';
        } else {
            return false;
        }
        //$("li[class='tab-li'] a:contains('"+li_text+"')").parent('li').trigger('click');
        $("li.tab-li a:contains('"+li_text+"')").parent('li').trigger('click');
    }
    checkHashExist();
    /*$C.registerCmd('ESTIMATE-SAE', function(e){
        $('#estimate-sae').removeClass('hide');
        $('.modal-backdrop').removeClass('hide');
    });

    $C.registerCmd('ESTIMATE-SCS', function(e){
        $('#estimate-scs').removeClass('hide');
        $('.modal-backdrop').removeClass('hide');
    });

    $C.registerCmd('ESTIMATE-SCH', function(e){
        $('#estimate-sch').removeClass('hide');
        $('.modal-backdrop').removeClass('hide');
    });

    $C.registerCmd('CLOSE-MODAL', function(e){
        $('.price-modal').addClass('hide');
        $('.modal-backdrop').addClass('hide');
    });

    var _index = 0;
    var autoSaeCalc = function (e) {
        if(e){
            var target = $(e.target);
            target.val(target.val().replace(/\D|^0/g, ''));
            $('body').data('recent',target.val()?parseFloat(target.val()):0);
            autoSaeCalc();
        }

        if($('#sae-number').val().length){
            var tmp = $('#sae-number').val();
            var reg = /^0{1,}([\d^0]\d*)/g;
            //001=>1
            if(tmp.match(reg)){
                tmp = reg.exec(tmp)[1];
            }
            //.1=>0.1
            reg = /^(\.\d)/g;
            if(tmp.match(reg)){
                tmp = '0'+tmp;
            }
            $('#sae-number').val(tmp);
        }

        var type = $('body').data('calc-type')?parseInt($('body').data('calc-type')):0;
        var calcCost = function (type) {
            type = parseInt(type);
            var costPreGB = 1.5;
            var costPre = 1;
            var costList = [.8, .8, .01, .0006, .0001, .0001, .000024, .0001]
            switch (type) {
                case 0:
                    //视频
                    return costPreGB * 30 / costList[0];
                    break;
                case 1:
                    //下载
                    return costPreGB * 30 / costList[1];
                    break;
                case 2:
                    //页游
                    return costPre * 30 * costList[2];
                    break;
                case 3:
                    //cms
                    return costPre * 30 * costList[3];
                    break;
                case 4:
                    //图床
                    return costPre * 30 * costList[4];
                    break;
                case 5:
                    //电商
                    return costPre * 30 * costList[5];
                    break;
                case 6:
                    //SNS
                    return costPre * 30 * costList[6];
                    break;
                case 7:
                    //OA
                    return costPre * 30 * costList[7];
                    break;
            }
        }
        var lastFix = '';
        var unitTips = '';
        if (0 == type || 1 == type) {
            lastFix = 'GB/天';
            unitTips = '请输入您网站每天的流量（可以输入小数）';
        }
        else if (2 == type) {
            lastFix = 'DAU';
            unitTips = '请输入您网站的DAU';
        }
        else {
            lastFix = 'PV/天';
            unitTips = '请输入您网站每天的PV';
        }

        var theMoney = $('#sae-number').val() * calcCost(type);
        if (theMoney - 1 > 0) {
            theMoney = ' ≈ ' + parseInt(theMoney);
        } else if (theMoney == 0) {
            theMoney = 0;
        } else if (theMoney - 1 < 0) {
            theMoney = '小于1';
        }
        $('div.sae-user-form p.form-title').html(unitTips);
        $('div.sae-user-form span.unit').html(lastFix);
        $('div.sae-user-form span.sae-cost').html(theMoney + '元/月');
    }

    var autoScsCalc = function(e){
        if(e){
            var target = $(e.target);
            target.val(target.val().replace(/\D|^0/g, ''));
            $('body').data('recent',target.val()?parseFloat(target.val()):0);
            autoSaeCalc();
        }

        if($('#scs-flow-number').val().length){
            var tmp = $('#scs-flow-number').val();
            var reg = /^0{1,}([\d^0]\d*)/g;
            //001=>1
            if(tmp.match(reg)){
                tmp = reg.exec(tmp)[1];
            }
            //.1=>0.1
            reg = /^(\.\d)/g;
            if(tmp.match(reg)){
                tmp = '0'+tmp;
            }
            $('#scs-flow-number').val(tmp);
        }
        if($('#scs-stro-number').val().length){
            var tmp = $('#scs-stro-number').val();
            var reg = /^0{1,}([\d^0]\d*)/g;
            //001=>1
            if(tmp.match(reg)){
                tmp = reg.exec(tmp)[1];
            }
            //.1=>0.1
            reg = /^(\.\d)/g;
            if(tmp.match(reg)){
                tmp = '0'+tmp;
            }
            $('#scs-stro-number').val(tmp);
        }
        
        var cost_flow,cost_stro,total;
            flow = $('#scs-flow-number').val(),
            stro = $('#scs-stro-number').val(),
            tb = 1024,
            pb = 1024*1024;

        if( flow<=1 && flow>=0 ){
            cost_flow = 0;
        }else if(flow>1 && flow<=50*tb){
            cost_flow = 0.0063;
        }else if(flow>50*tb && flow<=500*tb){
            cost_flow = 0.0062;
        }else if(flow>500*tb && flow<=500*pb){
            cost_flow = 0.0061;
        }else if(flow > 500*pb){
            cost_flow = 0.006;
        }

        if( stro<=0.3 & stro>= 0){
            cost_stro = 0;
        }else if(stro>0.3 && stro<=2*tb){
            cost_stro = 0.6;
        }else if(2*tb<stro && stro<=100*tb){
            cost_stro = 0.55;
        }else if(stro>100*tb){
            cost_stro = 0.5;
        }
      
        console.log(flow);
        console.log(stro); 
        console.log(cost_flow);
        console.log(cost_stro);
        total= cost_flow + cost_stro;
        $('div.scs-user-form span.scs-cost').html(total); 
    }
    var autoSchCalc = function(type){
        var td_item = $('.td-item'),
            price = $('div.sch-user-form .sch-cost'),theMoney;
        $.each(td_item,function(key,value){
            $(value).text(sch_item[type-1][key]);
            theMoney = ' ≈ ' + parseInt(sch_item[type-1][3]*24*30);
            price.text(theMoney);
        });
    }
    
    var cmdBox = $('.app-list');
    var cmdBtns = $('.app-list li.btn');// 兼容IE7,8
    cmdBox.on('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        cmdBtns.removeClass('active').find('.active').removeClass('active');
        var target = $(e.target).closest('li.btn');
        target.addClass('active').find('.radio').addClass('active');
        var index = -1;
        cmdBtns.each(function (k, v) {
            if ($(v).hasClass('active')) {
                index = k;
            }
        });
        if(-1==index){
            return false;
        }
        $('body').data('calc-type',index);
        if(!$('#sae-number').val()){
            $('#sae-number').val(0);
        }
        autoSaeCalc();
    });


    var input = $('.use-input');
    input.on('keydown',function(e){
        var target = $(e.target);
        var value = target.val();
        var isOK = false;
        var key = window.event ? e.keyCode : e.which;
        if ((key > 95 && key < 106) || //小键盘上的0到9
            (key > 47 && key < 60) || //大键盘上的0到9
            (key == 110 && value.indexOf(".") < 0) || //小键盘上的.而且以前没有输入.
            (key == 190 && value.indexOf(".") < 0) || //大键盘上的.而且以前没有输入.
            key == 8 || key == 9 || key == 37 || key == 39 //不影响正常编辑键的使用(8:BackSpace;9:Tab;46:Delete;37:Left;39:Right)
            ) {
            isOK = true;
        } else {
            e.preventDefault();
        }
        return isOK;
    });

    input.on('click',function(e){
       var target = $(e.target);
        if(target.val()==0){
           target.val('');
       }
    });

    //var a = trim($('#scs-flow-number').val()) == '' ||  trim($('#scs-flow-number').val()) == '0' ;


    if ($.browser.msie) {
        $('input#sae-number').on('keyup',function(e){
            autoSaeCalc();
        }).on('focus',function(e){
            autoSaeCalc();
        }).on('blur',function(e){
            autoSaeCalc();
        });

        $('input#scs-flow-number').on('keyup',function(e){
            autoScsCalc();
        }).on('focus',function(e){
            autoScsCalc();
        }).on('blur',function(e){
            autoScsCalc();
        });
        $('input#scs-stro-number').on('keyup',function(e){
            autoScsCalc();
        }).on('focus',function(e){
            autoScsCalc();
        }).on('blur',function(e){
            autoScsCalc();
        });

    }else if ($.browser.mozilla || $.browser.chrome) {
        $('input#sae-number').on('input',function(e){
            autoSaeCalc();
        });

        $('input#scs-flow-number').on('input',function(e){
            autoScsCalc();
        });
        $('input#scs-stro-number').on('input',function(e){
            autoScsCalc();
        });
        $('#select-type').change(function(){
            var type = $('#select-type').val();
            autoSchCalc(type);    

        });
    }

    $('input#sae-number').css("ime-mode", "disabled");*/
});
