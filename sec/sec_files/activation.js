

;
(function ($) {

SAE = {};

   $(document).ready(function(){   
        var $C = $SAETOOLS.getController();
       $(".activation").click(function() { 
           
           $C.popup('actest','激活邀请码' );
       });
  
    //申请公测资格
  
    //$C.registerCmd('APPLICATION', function(e){
    $(".appcack").click(function(){
        $C.ajax("/sec/beta/top_apply ",null,function(data){
            if( data.code == 0 ){
                $C.alert(data.message);
                $("body").delegate(".close-btn,close","click",function(){
                    window.location.reload();
                });
            
             }
             else{
                 $C.alert(data.message);
               /**  $("body").delegate(".close-btn,close","click",function(){
                    window.location.reload();
                }); */
                 return false;
             
              }   
         },{ type:"POST" });

     });
     
    //激活邀请码
    $("body").delegate("#newPrimary","click",function(){
        var recipient  = $("#recipient-name").val();
        var regcode    = /^[a-z0-9A-Z]{6}$/;
        var $C = $SAETOOLS.getController();
        if(recipient == "" ){
           $(".ero-msg").html("请输入邀请码");
                return false;
            }else if(!regcode.test(recipient)){
                $(".ero-msg").html("请输入6位邀请码");
                return false;
            }else{
    
               $(".ero-msg").html("");
            }
            $C.ajax("/sec/beta/top_act",{code:recipient},function(data){
               if( data.code== 0 ){
                    alert(data.message);
                    window.location.reload();
               }else{

                   $(".ero-msg").html("  "+data.message);
                   return false;
              }  
            },{type:"POST"});        
        });
//end
  });

})(jQuery);   







