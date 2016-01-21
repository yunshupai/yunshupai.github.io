;
(function ($){
    $(document).ready(function () {
       var initSwitchTab = function () {
            var btns = $('div.service-tab ul.nav-tabs li.item');
            var contents = $('div.service-inner div.inner-item');
            var className = 'active';

            btns.bind('click', function (e) {
                var target = $(this);
                var index = target.index();
                btns.removeClass(className);
                target.addClass(className);
                contents.hide().eq(index).show();
                //contents.css('display', 'none').eq(index).css('display', 'block');
                e.stopPropagation();
            })
        }
        initSwitchTab();
        
        var modPosArr=[],
            mod = $('.tab-content'),
            top_tab = $('.top-tab');
        console.log(mod);
        mod.each(function(){
            var top=parseInt($(this).offset().top)-parseInt($('.top-tab').height());
            modPosArr.push({id:$(this).attr('mod'),y:top});
        });
        $(window).scroll(function(e){
            var posTop = $(this).scrollTop();
            var y = modPosArr[0]['y'];
            if(posTop>y){
                top_tab.removeClass('hide').addClass('tab-fixed');
            }else{
                top_tab.addClass('hide').removeClass('tab-fixed');
            }           
            for(var i=0;i<modPosArr.length;i++){
                console.log(posTop);
                console.log(modPosArr[i]['y']);
                if(modPosArr[i]['y']<=posTop){
                    var mod = modPosArr[i]['id'];
                    top_tab.find('li.active').removeClass('active');
                    top_tab.find('li[mod='+mod+']').addClass('active');
                }else{
                    break;
                }
            }
        });

    })
 
})(jQuery);
