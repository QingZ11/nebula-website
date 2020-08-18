(function(){
    const Search={
        init:function(){
            this.attachEvent();
            this.render();
        },
        attachEvent(){
            $('#search-btn').click(function(){
                $('#bdcs-frame-box').css("display","block"); 
            });
            $('#close-icon').click(function(){
                $('#bdcs-frame-box').css("display","none");
            })
        },
        renderGoogleSearch(){
            var googleHtml="<div class='gcse-search'></div><script src='https://cse.google.com/cse.js?cx=008473639027829005971:tevo895mqp8'>";
            $('#google-search').append(googleHtml);
            $('#baidu-search').css('display','none');
        },
        renderBaiduSearch(){
            $('#baidu-search').css('display','block');
            $('#bdcsFrame').attr("scrolling","yes");
        },
        checkGoogleSearchUsable(){
            return new Promise((resolve, reject) =>{
                var image = new Image();
                image.onload  = resolve;
                setTimeout(_=>{
                    reject();
                },4000)
                image.onerror = reject;
                image.src = "http://google.com/favicon.ico?" + Math.random();
            });
        },
        render:function() {
            this.checkGoogleSearchUsable().then(res=>{
                this.renderGoogleSearch();
            }).catch(err=>{
                this.renderBaiduSearch();
            })
        },
    }
    Search.init();
})()