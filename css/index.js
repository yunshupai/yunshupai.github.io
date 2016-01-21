;
(function ($){
    $(document).ready(function () {

        //banner 
        var initBanner = function(){
            var box = $('.banner'),
                bgBox = box.find('.banner-bg'),
                imgBox = bgBox.find('.banner-img'),
                ul = box.find('.banner-ul'),
                lis = ul.find('.banner-li'),
                imgs = imgBox.find('img'),
                tid = null,
                k = 0,l = lis.length,
                delay = 200,/*淡入淡出延迟*/
                autoDelay = 4000;/*图片切换间隔*/
            /*指定起始图片*/
            lis.each(function(i){
                var $this = $(this);
                $this.data('ind',i);
                //console.log($this.data('ind'));
                if($(this).hasClass('banner-li-active')){k = i;return}
            });

            /*切换图片*/
            function changeImg(u){
                bgBox.animate({'opacity':0},{
                    duration:delay,
                    queue:false,
                    complete:function(){
                        this.style.background = imgs.eq(u).data('bg');
                        imgs.hide();
                        imgs.eq(u).show();
                        lis.removeClass('banner-li-active').eq(u).addClass('banner-li-active');
                        $(this).animate({'opacity':1},{
                            duration:delay,
                            queue:false,
                            complete:function(){
                                switch(true){
                                    case u+1<l:k=++u;break;
                                    case u+1>=l:k=0;break;
                                }
                            }
                        });
                    }
                });
            }

            /*选取图片*/
            lis.on('click',function(){
                var $this = $(this);
                if(!$this.hasClass('banner-li-acitve')){
                    changeImg($this.data('ind'));
                }
            });

            /*自动播放*/
            function autoPlay(){
                if(tid){clearInterval(tid)}
                tid = setInterval(function(){changeImg(k)},autoDelay);
            }

            /*取消自动播放*/
            function cancelAuto(){
                clearInterval(tid);
            }

            /*mousehover监控自动播放*/
            box.on({
                'mouseenter':function(){
                    cancelAuto();
                },
                'mouseleave':function(){
                    autoPlay();
                }
            });

            changeImg(k);
            autoPlay();
        }

        //banner只有一张图片
        var num =$('.banner .banner-li').length;
        if(num > 1){
            $('.banner .banner-img img').css('display','none');
            initBanner(); 
        }
       

        //video
        $('.video-btn').on('click',function(){
            //$('.v-content').addClass('hide');
            //$('#sc-video').removeClass('hide');
            $('.mask').removeClass('hide');
            $('#sc-video').get(0).play();
        });
        $('.close-video').on('click',function(){
            $('.mask').addClass('hide');
             $('#sc-video').get(0).pause();
        });
        if(!document.createElement('video').canPlayType){
            $('.v-support').removeClass('hide');
            $('.video-btn').off('click');
        }


    });
 })(jQuery)
