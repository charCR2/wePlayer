function setSwiper(id){
    var barBox = document.getElementById(id);
    var barColor = barBox.getElementsByClassName("barColor")[0]; // 色块
    var barBlock = barBox.getElementsByClassName("barBlock")[0]; // 小方块
    var barColor_startWidth  = 0; // 色块初始的宽度
    var startX ; // 鼠标开始按下的位置
    var barBoxWidth = barBox.offsetWidth

    console.log(barBox.offsetWidth)
    var mMove = function(event){
        event.preventDefault(); // 阻止默认事件
        var  mouseX = event.clientX;  // 鼠标的在窗口的位置
        var  dis = mouseX - startX ;  // 计算鼠标在窗口的移动距离
        var  disWidth = barColor_startWidth + dis ; // 色块跟随鼠标走的宽度:当前宽度+移动距离
        if( disWidth > barBoxWidth ){  // 如果色块的宽度大于了最大值 200
            disWidth = barBoxWidth;
        }
        // 色块的宽度不能为负数
        if(disWidth<0){
            disWidth = 0;
        }
        barColor.style.width = disWidth + "px";
        barBlock.style.left = disWidth + "px";

        // 控制音量之类的，可以用 disWidth的值参与运算。此处略

        console.info( "dis:"+ dis );
        console.info( "barColor.offsetWdith:"+ barColor.offsetWidth );
    };

    barBox.addEventListener("mousedown",function(event){
        event.preventDefault(); // 阻止默认事件
        startX = event.clientX ; // 记录鼠标点下的开始x坐标（相对于窗口）
        // 鼠标滑动，写在页面上的。
        var mx = event.offsetX;//
        barColor.style.width = mx + "px";//更新色块位置
        barBlock.style.left = mx + "px";//更新小方块位置
        barColor_startWidth = mx;//更新色块初始的宽度

        document.addEventListener("mousemove", mMove);

    });
    document.addEventListener("mouseup",function(event){
        barColor_startWidth =  barColor.offsetWidth; //  松开鼠标后，记录当前色块的宽度。
        document.removeEventListener("mousemove", mMove);
    });

}

setSwiper("barBox");
