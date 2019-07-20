/**

 * @author chen rui 2019/7/8
 * @param {query: the video row's object }
 * @param {that: this global object ,and include query}
 */


(function(global, factory){
    "use strict";

    if(typeof module === "object" && typeof module.exports === "object"){
        module.exports =  factory(global);
    }else{
        factory(global);
    }

}(typeof window !== "undefined" ? window : this,

function(window){
    var Video = function(video){
        this.video = video; 
        this.isWaiting = true; // this video can play or not
        this.isFull = false; // this video has full or not
    };

    Video.prototype = {
        init: function () {
            var that = this;
            var oldVideoParentEle = that.video.parentNode;
            var videoContainer = document.createElement('div');
            videoContainer.className = 'weplayer-container';
            videoContainer.innerHTML = that.addHtml('all',that.video);
            oldVideoParentEle.replaceChild(videoContainer,that.video);
            videoContainer.insertBefore(that.video,videoContainer.firstChild);
            this.query = videoContainer;
            this.query.$ = this.query.querySelector;
            this.query.$All = this.query.querySelectorAll;
            this.query.video = this.query.$('video');
            this.query.video.className = 'weplayer-video-class';
            [
                this.playListener,
                this.weplayerFootEvent,
                this.settingListener,
                this.setSwiper,
                this.setSwiperVoice,
                this.cancelBubble,
                this.fullListener,
                this.full,
                this.loadingShow,
                this.loadingHide
            ].forEach(function (item) {
                item(that.query,that);
            });

            for(var key in this.videoCycle){
                that.videoCycle[key](that.query,that)
            }
        },

        pause: function(query,that){
            query.$("#weplayer-foot-play").innerHTML='<img src="img/play.png" v-id="play" class="weplayer-mask-Img play"/>';
            query.$("#weplayer-center-logo").innerHTML='<img src="img/play.png"  v-id="play" class="weplayer-mask-Img play"  />';
            if(!that.isWaiting){
                query.$("#weplayer-center-logo").style.opacity = '1';
                query.$("#weplayer-mask").style.opacity = '1';
                query.$("#weplayer-center-logo").style.display = 'block';
                query.$("#weplayer-mask").style.display = 'block';
            }
            that.playListener(query,that);
            query.video.pause();
        },

        play: function(query,that){
            window.event? window.event.cancelBubble = true : e.stopPropagation();
            query.$("#weplayer-center-logo").innerHTML='<img src="img/pause.png" class="weplayer-mask-Img pause"/>';
            query.$("#weplayer-foot-play").innerHTML='<img src="img/pause.png" v-id="pause" class="weplayer-mask-Img pause"/>';
            if(!that.isWaiting){
                that.fadeOut(query.$("#weplayer-center-logo"),800);
                that.fadeOut(query.$("#weplayer-mask"),400);
            }
            that.pauseListener(query,that);
            query.video.play();
            return false
        },

        full: function(query,that){
            query.$('img[v-id=isFull]').addEventListener('click',function () {
                if(that.isFull){
                    document.webkitCancelFullScreen();
                }else {
                    query.webkitRequestFullscreen();
                }
            });
        },

        pauseListener: function(query,that) {
            query.$All('img[v-id=pause]').forEach(function (item) {
                item.addEventListener('click',function (e) {
                    that.pause(query,that)
                })
            })
        },

        playListener: function(query,that) {
            query.$All('img[v-id=play]').forEach(function (item) {
                item.addEventListener('click',function (e) {
                    that.play(query,that)
                })
            })
        },

        fullListener: function(query,that){
            query.addEventListener('webkitfullscreenchange',function(e){
                that.isFull = !that.isFull;
                console.log('当前是否全屏',that.isFull);
                query.$('.weplayer-foot').innerHTML =  that.addHtml('foot');
                query.$(".video-time").innerHTML = that.formatSeconds(query.video.duration);
                if(that.isFull){
                    query.$(".weplayer-full-barBox").innerHTML='<img src="img/small.png" v-id="isFull" v-id="isFull"/>'
                }else {
                    query.$(".weplayer-full-barBox").innerHTML='<img src="img/big.png" v-id="isFull" v-id="isFull"/>'
                }
                console.log('当前是否播放',query.video.paused);
                if(!query.video.paused){
                    query.$("#weplayer-foot-play").innerHTML='<img src="img/pause.png" v-id="pause" class="weplayer-mask-Img pause"/>';
                    query.$("#weplayer-foot-play").addEventListener('click',function (e) {
                        that.pause(query,that)
                    })
                }else{
                    query.$("#weplayer-foot-play").innerHTML='<img src="img/play.png" v-id="play" class="weplayer-mask-Img play"/>';
                    query.$("#weplayer-foot-play").addEventListener('click',function (e) {
                        that.play(query,that)
                    })
                }
                setTimeout(function () {
                    [
                        that.settingListener,
                        that.setSwiper,
                        that.setSwiperVoice,
                        that.cancelBubble,
                        that.full,
                    ].forEach(function (item) {
                        item(that.query,that);
                    });
                },100)
            })
        },

        weplayerFootEvent : function(query,that){
            var timer;
            query.addEventListener('mousemove',function () {
                query.$('.weplayer-foot').style.bottom = '0';
                clearTimeout(timer);
                timer = setTimeout(function(){
                    query.$('.weplayer-foot').style.bottom = '-20%';
                    query.$('.weplayer-foot-selectbox').style.top = "100%"
                },5000);
                return false
            });

            query.addEventListener('mouseleave',function () {
                query.$('.weplayer-foot').style.bottom = '-20%';
                query.$('.weplayer-foot-selectbox').style.top = "100%";
                return false
            });

            query.addEventListener('click',function () {
                that.pause(query,that);
                return false
            })
        },

        setSwiper: function(query,that){
            var barBox = query.$("#barBox");
            var barColor = barBox.getElementsByClassName("barColor")[0]; // 色块
            var barBlock = barBox.getElementsByClassName("barBlock")[0]; // 小方块
            var barColor_startWidth  = 0; // 色块初始的宽度
            var startX ; // 鼠标开始按下的位置
            var barBoxWidth = barBox.offsetWidth;

            //初始化视频进度
            var initNum = (query.video.currentTime / query.video.duration)* barBoxWidth;
            barColor.style.width = initNum + "px";//更新色块位置
            barBlock.style.left = initNum + "px";//更新小方块位置
            barColor_startWidth = initNum;//更新色块初始的宽度

            function vtime(){
                var val = (barBoxWidth / query.video.duration) * query.video.currentTime;
                barColor.style.width = val + "px";
                barBlock.style.left = val + "px";
                query.$(".video-currentTime").innerHTML = that.formatSeconds(query.video.currentTime)
            }

            function vblockShow() {
                query.$(".barBlock").style.opacity = '1'
            }

            function vblockHide() {
                query.$(".barBlock").style.opacity = '0'
            }

            query.video.addEventListener("timeupdate",vtime);
            barBox.addEventListener('mousemove',vblockShow);
            barBox.addEventListener('mouseleave',vblockHide);

            var mMove = function(event){
                var  mouseX = event.clientX;  // 鼠标的在窗口的位置
                var  dis = mouseX - startX ;  // 计算鼠标在窗口的移动距离
                var  disWidth = barColor_startWidth + dis ; // 色块跟随鼠标走的宽度:当前宽度+移动距离
                // 如果色块的宽度大于了最大值
                if( disWidth > barBoxWidth) disWidth = barBoxWidth;
                // 色块的宽度不能为负数
                if(disWidth<0) disWidth = 0;

                barColor.style.width = disWidth + "px";
                barBlock.style.left = disWidth + "px";
                query.video.currentTime = (disWidth / barBoxWidth) * query.video.duration;
            };

            barBox.addEventListener("mousedown",function(event){
                startX = event.clientX ; // 记录鼠标点下的开始x坐标（相对于窗口）
                // 鼠标滑动，写在页面上的。
                var mx = event.offsetX;//
                barColor.style.width = mx + "px";//更新色块位置
                barBlock.style.left = mx + "px";//更新小方块位置
                barColor_startWidth = mx;//更新色块初始的宽度
                query.video.currentTime = (mx / barBoxWidth) * query.video.duration;
                document.addEventListener("mousemove", mMove);
                barBox.removeEventListener('mouseleave',vblockHide)
            });

            document.addEventListener("mouseup",function(){
                barBox.addEventListener('mouseleave',vblockHide);
                barColor_startWidth =  barColor.offsetWidth; //  松开鼠标后，记录当前色块的宽度。
                document.removeEventListener("mousemove", mMove);
            });
        },

        setSwiperVoice: function (query,that){
            var barBox = query.$('#voice-barBox');
            var barColor = barBox.getElementsByClassName("voice-barColor")[0]; // 色块
            var barBlock = barBox.getElementsByClassName("voice-barBlock")[0]; // 小方块
            var startY ; // 鼠标开始按下的位置
            var barBoxHeight = barBox.offsetHeight;
            var barColor_startHeight = barBoxHeight; // 色块初始的高度

            //初始化音量
            var initNum = query.video.volume * barBoxHeight;
            barColor.style.height = initNum + "px";
            barColor.style.marginTop =  barBoxHeight - initNum + "px";
            barBlock.style.top =  barBoxHeight - initNum + "px";
            barColor_startHeight =  barBoxHeight - initNum;

            var mxMove = function(event){
                var  mouseY = event.clientY;  // 鼠标的在窗口的位置
                var  dis = mouseY - startY ;  // 计算鼠标在窗口的移动距离
                var  disHeight = barColor_startHeight  + dis ;

                if( disHeight > barBoxHeight ) disHeight = barBoxHeight;
                if(disHeight<0) disHeight = 0;

                barColor.style.height = barBoxHeight - disHeight + "px";//更新色块位置
                barColor.style.marginTop = disHeight + "px";//更新色块位置
                barBlock.style.top = disHeight + "px";//更新小方块位置
                query.video.volume = (barBoxHeight - disHeight) / barBoxHeight
            };

            barBox.addEventListener("mousedown",function(event){

                startY = event.clientY ; // 记录鼠标点下的开始x坐标（相对于窗口）
                // 鼠标滑动，写在页面上的。
                var mx = event.layerY;//

                barColor.style.height = barBoxHeight - mx + "px";//更新色块位置
                barColor.style.marginTop = mx + "px";//更新色块位置
                barBlock.style.top = mx + "px";//更新小方块位置
                barColor_startHeight = mx;//更新色块初始的宽度

                query.video.volume = (barBoxHeight - mx) / barBoxHeight;
                document.addEventListener("mousemove", mxMove);
            });
            document.addEventListener("mouseup",function(){
                barColor_startHeight =  barColor.offsetHeight; //  松开鼠标后，记录当前色块的高度度。
                document.removeEventListener("mousemove", mxMove);
            });

        },

        loadingShow: function(query,that){
            query.$('.weplayer-load-center').style.display = "block"
        },

        loadingHide: function(query,that){
            query.$('.weplayer-load-center').style.display = "none";
        },

        loadingText: function(query,text){
            query.$('.weplayer-loadText').innerHTML = text;
        },

        settingListener: function(query,that){
            query.$('img[v-id=voiceSet]').addEventListener('mousemove',function(e){
                var box = query.$('.weplayer-foot-selectbox');
                box.style.top = '-200%';
                box.style.opacity = '1'
            });
            query.$('.weplayer-voice-barBox').addEventListener('mouseleave',function(e){
                var box = query.$('.weplayer-foot-selectbox');
                box.style.top = '100%';
                box.style.opacity ='0'
            });
        },

        cancelBubble: function(query){
            query.$(".weplayer-foot").addEventListener('click',function(e){
                e.preventDefault();
                window.event? window.event.cancelBubble = true : e.stopPropagation();
            });
                
            query.$(".weplayer-load-center").addEventListener('click',function(e){
                e.preventDefault();
                window.event? window.event.cancelBubble = true : e.stopPropagation();
            });
        },

        videoCycle : {
            onLoadStart: function(query,that){
                query.video.onloadstart = (function(){
                    that.loadingShow(query,that);
                    that.isWaiting = true;
                    that.loadingText(query,'开始获取视频...');
                    that.loadingText(query,'正在获取时长...');
                })()
            },

            onDurationChange: function(query,that){
                query.video.addEventListener("durationchange", function(){
                    that.loadingText(query,'时长获取完毕！');
                    that.loadingText(query,'开始获取视频元数据...');
                 });  
            },

            onLoadedMetaData: function(query,that){
                query.video.addEventListener("loadedmetadata", function(){
                    that.loadingText(query,'视频元数据获取完毕！');
                    that.loadingText(query,'正在获取视频帧数据...')
                 });
            },

            onLoadedData: function(query,that){
                query.video.addEventListener("loadeddata", function(){
                    that.loadingText(query,'视频帧数据获取完毕！');
                    that.loadingText(query,'正在缓冲视频...')
                 });
            },

            onWaiting: function(query,that,d){
                query.video.addEventListener("waiting", function(e){
                    that.loadingText(query,'正在缓冲视频...');
                    that.isWaiting = true;
                    that.loadingShow(query,that)
                 });
            },

            onCanPlay: function (query,that) {
                query.video.oncanplay = function(){
                    that.loadingText(query,'视频已缓冲！');
                    that.isWaiting = false;
                    if(query.video.paused){
                        that.pause(query,that)
                    }
                    that.loadingHide(query,that)
                    query.$(".video-time").innerHTML = that.formatSeconds(query.video.duration);
                };
            },

            ended: function (query,that) {
                query.video.addEventListener("ended", function(){
                    that.pause(query,that);
                    query.video.currentTime = 0;
                });
            },
        },

        addHtml: function(place,video){
            var foot = ' <div class="weplayer-foot-play" id="weplayer-foot-play">\n' +
                '            <img src="img/play.png" class="play" v-id="play"/>\n' +
                '        </div>\n' +
                '            <div class="barBox" id="barBox">\n' +
                '                <div class="barColor" id="barColor"></div>\n' +
                '                <div class="barBlock" id="barBlock"></div>\n' +
                '            </div>\n' +
                '        <div class="weplayer-foot-swiper">\n' +
                '            <div class="weplayer-foot-time">'+
                '               <span class="video-currentTime">00:00</span>'+
                '               <span style="margin:0 5px"> / </span>'+
                '               <span class="video-time">00:00</span>'+
                '            </div>\n' +
                '        </div>\n' +
                '        <div class="weplayer-foot-setting-row">\n' +
                '            <div class="weplayer-foot-setting-box weplayer-voice-barBox" >\n' +
                '                <img src="img/voice.png" v-id="voiceSet"/>\n' +
                '                <div class="weplayer-foot-selectbox">\n' +
                '                    <div class="voice-barBox" id="voice-barBox">\n' +
                '                        <div class="voice-barColor"></div>\n' +
                '                        <div class="voice-barBlock"></div>\n' +
                '                    </div>\n' +
                '                </div>\n' +
                '            </div>\n' +
                '            <div class="weplayer-foot-setting-box weplayer-full-barBox">\n' +
                '                <img src="img/big.png" v-id="isFull"/>\n' +
                '            </div>\n' +
                '        </div>\n';

            var container =
                '    <div class="weplayer-mask" id="weplayer-mask">\n' +
                '    </div>\n' +
                '    <div class="weplayer-load-center">'+
                '    <p class="weplayer-loadText"><p>'+
                '    <div class="weplayer-load">\n' +
                '    <span></span>\n' +
                '    <span></span>\n' +
                '    <span></span>\n' +
                '    <span></span>\n' +
                '    <span></span>\n' +
                '    </div>'+
                '    </div>\n' +
                '    <div class="weplayer-center-logo" id="weplayer-center-logo">\n' +
                '        <img src="img/play.png" class="play" v-id="play"/>\n' +
                '    </div>\n' +
                '    <div class="weplayer-foot">\n' +
                foot +
                '    </div>\n';

            switch (place){
                case 'foot': return foot;
                default: return container
            }
        },

        formatSeconds: function(value){
            var secondTime = parseInt(value);// 秒
            var minuteTime = 0;// 分
            var hourTime = 0;// 小时
            if(secondTime > 60) {//如果秒数大于60，将秒数转换成整数
                //获取分钟，除以60取整数，得到整数分钟
                minuteTime = parseInt(secondTime / 60);
                //获取秒数，秒数取佘，得到整数秒数
                secondTime = parseInt(secondTime % 60);
                //如果分钟大于60，将分钟转换成小时
                if(minuteTime > 60) {
                    //获取小时，获取分钟除以60，得到整数小时
                    hourTime = parseInt(minuteTime / 60);
                    //获取小时后取佘的分，获取分钟除以60取佘的分
                    minuteTime = parseInt(minuteTime % 60);
                }
            }
            var result = parseInt(secondTime) > 9 ? parseInt(secondTime) : '0' + parseInt(secondTime);

            if(minuteTime > 0) {
                result = parseInt(minuteTime) > 9? parseInt(minuteTime) : '0' + parseInt(minuteTime)+ ":" + result;
            }else{
                result = '00:' + result
            }
            if(hourTime > 0) {
                result = parseInt(hourTime) + ":" + result;
            }
            return result;
        },

        fadeOut: function(ele, speed){
            var STATIC_SPEED = 50 ;//Animation change speed
            var ACTION_SPEED = speed || 500;

            if (ele) {
                var v = ele.style.filter.replace("alpha(opacity=", "").replace(")", "") || ele.style.opacity || 100;
                v <= 1 && (v = v * 100);
                var count = Math.ceil(ACTION_SPEED / STATIC_SPEED);
                var avg = 100 / count;
                var timer = null;
                timer = setInterval(function() {
                    if (v > 0) {
                        v = v - avg;
                        setOpacity(ele, v);
                    } else {
                        clearInterval(timer);
                        ele.style.display = 'none'
                    }
                },STATIC_SPEED);
            }

            function setOpacity(ele, opacity) {
                if (document.all) {
                    ///兼容ie
                    ele.style.filter = "alpha(opacity=" + opacity + ")";
                }
                else {
                    ///兼容FF和GG
                    ele.style.opacity = opacity / 100;
                }
            }
        }
    };

    (function () {
        var videoList = document.querySelectorAll('video[isWePlayer=true]');
        videoList.forEach(function (item) {
            var video = new Video(item);
            video.init();
        })
    })()
}));