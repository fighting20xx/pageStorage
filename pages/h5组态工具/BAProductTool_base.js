var middleImage = undefined;
var currentDiagram = undefined;




var imageDragHandle ={
    drag:function (event) {
        // console.log("拖动图片",event);
        middleImage = event.target;
    },
    ondropImage:function (event) {
        console.log("拖动图片",event);
        console.log("sss",middleImage);
        var icon = IconsTool.createIcons(middleImage ,event);
        console.log("icon",icon);
        middleImage = undefined;
        if (icon){
            icon.draw();
            icon.action();
        }
    },
    onDropOver:function () {
        event.preventDefault();
    }
};


var mapEventHandle = {
    mouseover:function (event) {
        // console.log("鼠标进入",event);
    },
    mousedrag:function (event) {
        // console.log("拖拽",event);
    },
    mouseup:function (event) {
       if(event.button == 0){
           rightClickHandle.closeMenu();   // console.log( '松开左键');
           hoverHandle.closeMenu();   // console.log( '松开左键');
           MAP.clearText();   // 清除container
        }
    },
    mousedown:function (event) {
        // if(event.button == 2){
        //     console.log('按下右键');
        // }else if(event.button == 1){
        //     console.log('按下中键');
        // }else if(event.button == 0){
        //     console.log( '按下左键');
        // }
    },
    mousemove:function (event) {
        // console.log("移动",event);
    }
};




var dragNode = null;
var nodeHandle = {
    mouseup:function (event) {
        var node = event.target;

        if(event.button == 2){                                 // console.log('node松开右键',event); 打开右键菜单
            rightClickHandle.openMenu(event);

        }else if(event.button == 0){                              //  console.log( 'node松开左键',node);
                if (dragNode) {
                     IconsTool.cloneIcons(node.icons,event);
                    dragNode = null;
                }  else {
                    copyNodeProps(node.icons, node);
                    vm.icons =  node.icons  ;

                }

        }else {
            node.setImage(node.icons.src , true);
        }

    },
    mousedrag:function (event) {
        var node = event.target;

        if(event.ctrlKey) {
            dragNode = node

        }else {
            copyNodeProps(node.icons, node);
            vm.icons =  node.icons ;

        }
    },
    dbclick:function (event) {
        MAP.showClickText(event.target,event);
    },
    mouseover:function (event) {
        var node = event.target;
        var icons = node.icons;
        if (icons.AO || icons.DO){
            hoverHandle.openMenu(icons,event);
        }
    },
};







var mapTool = {
    beCenter:function () {
        stage.centerAndZoom(); //缩放并居中显示
    },
    zoomOut:function () {
        stage.zoomOut();

    },
    zoomIn:function () {
        stage.zoomIn();
        stage.zoomIn(1);
    },
    backColor:function () {
        $('#colorpicker').colpick({
            colorScheme:'light',
            layout:'rgbhex',
            color:'ff8800',
            onChange:function(hsb,hex,rgb,el) {
                scene.backgroundColor = rgb.r + ","+ rgb.g + "," + rgb.b;
            },
            onSubmit:function(hsb,hex,rgb,el) {
                scene.backgroundColor = rgb.r + ","+ rgb.g + "," + rgb.b;
            }
        });
    },
    editIcon:function (mode) {
        console.log(mode);
        stage.mode = mode;
        // stage.mode = "edit";
        // stage.mode = "select";
        // stage.mode = "normal";
    },
    fullScreen:function () {
        runPrefixMethod(stage.canvas, "RequestFullScreen")
    }
};

var rightClickHandle = function(){

    var rightClickEvent ;
    var currentNode ;

    return result = {
        restore:function () {
            currentNode.restore();
        },
        circleToright:function () {
            currentNode.rotate += (3.1415/ 180)*5;
            copyNodeProps(currentNode.icons, currentNode);
        },
        circleToleft:function () {
            currentNode.rotate -= (3.1415/ 180)*5 ;
            copyNodeProps(currentNode.icons, currentNode);
        },
        changeColor:function () {
            currentNode.fillColor = JTopo.util.randomColor();
        },
        zoomOut:function () {
            currentNode.width += 5;
            currentNode.height += 5;
            copyNodeProps(currentNode.icons, currentNode);
        },
        zoomIn:function () {
            currentNode.width -= 5;
            currentNode.height -= 5;
            copyNodeProps(currentNode.icons, currentNode);
        },
        addLine:function () {

        },
        deleteSelf:function () {
            result.closeMenu();
            IconsTool.del(currentNode.icons);
        },
        openMenu:function (event) {

            rightClickEvent = event;
            currentNode  = rightClickEvent.target;

            $("#rightContextMenu").css({
                top: rightClickEvent.pageY,
                left: rightClickEvent.pageX
            }).show();
        },
        closeMenu:function () {
            $("#rightContextMenu").hide();
        }
    }
}();



var hoverHandle = function(){

    var hoverEvent ;
    var currentNode ;
    var currentIcons ;

    return result = {
        sendDirective:function (val) {
            var point;
            var sendValue ;
            switch (val){
                case 1:
                    point = currentIcons.DO;
                    sendValue =1
                    break;
                case 2:
                    point = currentIcons.DO;
                    sendValue =0
                    break;
                case 3:
                    point = currentIcons.AO;
                    sendValue = $("#hoverContextMenuVal").val();
                    break;
            }

            var obj = {
                vComaddr:point.vComaddr,
                vComport:point.vComport,
                vBapointvalue:sendValue+"",
            };
            result.closeMenu();
            $.ajax({
                type: "POST",
                url: baseURL + "elink/baTzcbapointD/controlMessage",
                contentType: "application/json",
                data: JSON.stringify(obj),
                success: function(r){
                    if(r.code === 0){
                        alert('发送信息成功');
                    }else{
                        alert("'发送信息的时候'  "+r.msg);
                    }
                }
            });
        },
        deleteSelf:function () {
            result.closeMenu();
            IconsTool.del(currentNode.icons);
        },
        openMenu:function (icons,event) {
            hoverEvent = event;
            currentIcons = icons;

            var htmlStr = "";
            if(icons.AO){
                htmlStr += '<span ><input type="text" id="hoverContextMenuVal" class="form-control"></span> ';
                htmlStr += '<span onclick="hoverHandle.sendDirective(3)"><a >发送数据</a></span> ';
            }
            if(icons.DO){
                if(icons.DO.vBapointvalue == "1"){
                    htmlStr += '<span onclick="hoverHandle.sendDirective(2)"><a >关闭</a></span> ';

                }else {
                    htmlStr += '<span onclick="hoverHandle.sendDirective(1)"><a >打开</a></span> ';
                }
            }

            $("#hoverContextMenu").html(htmlStr).css({
                top: hoverEvent.pageY,
                left: hoverEvent.pageX
            }).show();
        },
        closeMenu:function () {
            $("#hoverContextMenu").hide();
        }
    }
}();




var MAP  =function () {
    function init() {
        // showJTopoToobar(stage);
        // stage.mode = "edit";     //编辑状态
        // stage.wheelZoom = 1.2;   //鼠标缩放比例  null 不允许缩放
        scene.alpha = 1;
        scene.borderRadius = 0; // 圆角
        // scene.zoomOut(1);     // 边框距离
        scene.visible=true;   //设置节点是否可见
        scene.mode = "select"; //不移动
        // scene.background = '/elink-admin/statics/img/topologyMap/bg1.jpg';
        scene.backgroundColor= "48,49,60"; // "#30313C";
        // scene.doLayout(JTopo.layout.TreeLayout('down', 30, 107));


        // stage.addEventListener("mouseover", mapEventHandle.mouseover);
        // stage.addEventListener("mousedrag", mapEventHandle.mousedrag);
        // stage.addEventListener("mousedown", mapEventHandle.mousedown);
        // stage.addEventListener("mousemove", mapEventHandle.mousemove);
        stage.addEventListener("mouseup", mapEventHandle.mouseup);
    }
    function addNode(text, img,  X, Y, width, height, rotate, icons){
        // console.log(text, img,  X, Y, width, height, rotate);
        var node = new JTopo.Node();
        var width = width || 20 ;
        var height = height || 20 ;
        var X = X || 0;
        var Y = Y || 0 ;
        node.setImage(img , true);
        // node.setImage('/elink-admin/statics/img/topologyMap/'+ img +'.png', true);
        // node.fontColor = '0,0,0';
        node.color='0,0,0';
        node.text=  text ;
        node.rotate = rotate || 0;
        node.textPosition = icons.vPropertyEx4 || 'Bottom_Center';// 文字居中    ['Top_Left', 'Top_Center', 'Top_Right', 'Middle_Left', 'Middle_Center', 'Middle_Right', 'Bottom_Left', 'Bottom_Center', 'Bottom_Right'];
        // node.textOffsetY = (height/2 || 10); // 文字向下偏移8个像素
        // node.textOffsetX = 0; // 文字向右偏移8个像素
        // node.setLocation(X, Y); // 位置
        // node.setSize(width , height );  // 尺寸  opaticy
        icons.opaticy ? node.alpha = icons.opaticy :noop();
        node.setBound(X, Y, width, height);
        node.setSize(width , height );

        node.icons = icons;
        node.mouseup(nodeHandle.mouseup);
        node.mouseover(nodeHandle.mouseover);
        node.mousedrag(nodeHandle.mousedrag);
        node.dbclick(nodeHandle.dbclick);
        scene.add(node);

        return node;
    }
    function removeNode(node){
        scene.remove(node);
        return node;
    }
    function addLink(nodeA, nodeZ,Len){
        var link = new JTopo.FlexionalLink( nodeZ,nodeA);
        link.direction = 'horizontal';
        link.arrowsRadius = 8;
        link.offsetGap = Len || 20;
        // link.bundleGap = 15; // 线条之间的间隔
        // link.textOffsetY = 10; // 文本偏移量（向下15个像素）
        link.strokeColor = '204,204,204';
        link.lineWidth = 0.2;
        scene.add(link);
        return link;

    }


    function addPoint(nodeCode,text, color , width, height, H, L){
        var width = width || 0 ;
        var height = height || 0 ;
        var H = H || 100;
        var L = L || 60 ;
        var circleNode = new JTopo.CircleNode(text);
        circleNode.radius = 8; // 半径
        circleNode.textOffsetY = -8; // 文字向右偏移8个像素
        circleNode.alpha = 1;
        circleNode.fillColor = color; // 填充颜色
        circleNode.setLocation(width, height);
        circleNode.textPosition = 'Middle_Right'; // 文本位置
        circleNode.click(function(event){
            showClickText(nodeCode);
        });
        scene.add(circleNode);
        return circleNode;
    }
    function addStatusPoint(nodeCode,text, color , width, height, H, L){
        var width = width || 0 ;
        var height = height || 0 ;
        var H = H || 100;
        var L = L || 60 ;
        var circleNode = new JTopo.CircleNode(text);
        circleNode.radius = 5; // 半径
        circleNode.textOffsetY = -8; // 文字向右偏移8个像素
        circleNode.alpha = 1;
        circleNode.fillColor = color; // 填充颜色
        circleNode.setLocation(width, height);
        circleNode.textPosition = 'Middle_Right'; // 文本位置
        circleNode.click(function(event){
            showClickText(nodeCode);
        });
        scene.add(circleNode);
        return circleNode;
    }

    var container;
    function showClickText(nodeCode,event) {
        clearText();
        container = new JTopo.Container('');
        container.textPosition = 'Middle_Center';
        container.fontColor = '100,255,0';
        container.alpha = 5;
        container.font = '18pt 微软雅黑';
        container.borderColor = '255,0,0';
        container.borderRadius = 4; // 圆角
        scene.add(container);


        var icons = nodeCode.icons;
        var textObject = [];
        textObject.push({name:"项目编码",value:localStorage.getItem("vXmbm")});
        textObject.push({name:"显示名称",value:icons.vPropertyText});
        textObject.push({name:"宽度",value:icons.vPropertyWidth});
        textObject.push({name:"高度",value:icons.vPropertyHeight});

        var pointList = icons.pointList || [];
        pointList.forEach(function (point,index) {
            textObject.push({name:point.vBapointmc ,value:point.vBapointvalue});
        });


        var location_X =event.offsetX ;// canvasWidth-180;
        var location_Y = event.offsetY;  //canvasHeight - 20;
        var upOrdown =  (textObject.length*20 +location_Y > canvasHeight) ? true : false;
        textObject.forEach(function (value,index) {
            var textNode = new JTopo.TextNode(value.name+": "+ value.value);
            textNode.type_text = "textNode";
            textNode.font = ' 14px 微软雅黑';
            textNode.fillColor = '48,49,60';
            textNode.setLocation(location_X,  upOrdown ? (location_Y -= 20):(location_Y += 20) );
            textNode.textPosition = "Middle_Center";
            scene.add(textNode);
            container.add(textNode);
        });

        var textNode1 = new JTopo.TextNode(".");
        textNode1.setLocation(location_X+150, location_Y+=10);
        scene.add(textNode1);

        container.add(textNode1);
    }
    function clearText() {
        if (container){
            container.childs.forEach(function (value,index) {
                scene.remove(value);
            });
            scene.remove(container);
        }
    }
    function clear() {
        scene.clear()
        // scene.childs.forEach(function (value,index) {
        //     // if(value.elementType == "TextNode"){
        //         scene.remove(value);
        //     // }
        // })
    }
    function whichColor(node) {
        if(node.vComyxzt && node.vComyxzt === "1"){
            return '50,205,50'
        }else if(node.vComyxzt  && node.vComyxzt  === "0"){
            return '255,0,0'
        }else  {
            return '169,169,169';
        }
    }
    function backImage(path) {
        scene.background = path;
        // scene.background = '/elink-admin/statics/img/topologyMap/bg1.jpg';
    }


    return {
        init:init,
        addNode:addNode,
        removeNode:removeNode,
        addLink:addLink,
        addPoint:addPoint,
        clear:clear,
        addStatusPoint:addStatusPoint,
        whichColor:whichColor,
        backImage:backImage,
        showClickText:showClickText,
        clearText:clearText,
    }
}();


var actionHandle = {
    image:function ( icons) {
        icons.pointList.forEach(function (point,index) {
            switch (point.vPropertybm) {
                case "AI":
                    if (["greenbutton","redbutton","chuxian"].indexOf(icons.vObjectname) > -1){               // 只有红绿按钮显示  亮度 0--100
                        icons.opaticy = parseFloat(point.vBapointvalue)/100+0.01;
                    }else {
                        icons.showText = icons.vPropertyText+ "\n\r"+ point.vBapointmc +" : "+ point.vBapointvalue
                    }
                    break;

                case "DI":
                    switch (point.vBapointvalue) {
                        case "0": icons.imageSrc = icons.vPropertySrc1; break;
                        case "1": icons.imageSrc = icons.vPropertySrc2; break;
                        case "2": icons.imageSrc = icons.vPropertySrc3; break;
                        case "3": icons.imageSrc = icons.vPropertySrc4; break;
                    }
                    if (["greenbutton","redbutton"].indexOf(icons.vObjectname) > -1){               // 红绿按钮例外
                        switch (point.vBapointvalue) {
                            case "1": icons.imageSrc = icons.vPropertySrc1; break;
                            case "0": icons.imageSrc = icons.vPropertySrc2; break;
                        }
                    }
                    break;

                case "AO":
                    icons["AO"]  = point ;
                    break;

                case "DO":
                     icons["DO"] = point ;
                    break;
            }

        });
        icons.imageSrc == null ? icons.imageSrc = icons.vPropertySrc1: noop();

    },
    // circle:function ( icons ) {
    //     icons.pointList.forEach(function (point,index) {
    //         switch (point.vBapointvalue) {
    //             case "0": icons.imageSrc = icons.vPropertySrc1; break;
    //             case "1": icons.imageSrc = icons.vPropertySrc2; break;
    //             case "2": icons.imageSrc = icons.vPropertySrc3; break;
    //             case "3": icons.imageSrc = icons.vPropertySrc4; break;
    //         }
    //     });
    //     icons.imageSrc == null ? icons.imageSrc = icons.vPropertySrc1: noop();
    // },
    // bright:function ( icons) {
    //     icons.pointList.forEach(function (point,index) {
    //         switch (point.vBapointvalue) {
    //             case "1": icons.imageSrc = icons.vPropertySrc1; break;
    //             case "0": icons.imageSrc = icons.vPropertySrc2; break;
    //         }
    //     });
    //     icons.imageSrc == null ? icons.imageSrc = icons.vPropertySrc1: noop();
    // },
    // opaticy:function (icons) {
    //     icons.pointList.forEach(function (point,index) {
    //         icons.opaticy = parseFloat(point.vBapointvalue)/100;
    //     });
    //     icons.imageSrc == null ? icons.imageSrc = icons.vPropertySrc1: noop();
    // },
    alarm:function (node, text, color) {
        node.alarm = text;
        node.alarmColor = color ||  '255,0,0';
    },
    animate:function (node, options, time, flag) {
        var opts = options || {};
        var times = time || 3000;
       if (flag === "undefiend" || flag == true){
           JTopo.Animate.stepByStep(node, opts, times, true).start();
       }else {
           JTopo.Animate.stepByStep(node, opts, times, true).stop();
       }
        // var animates = [
        //     {rotate: 2*Math.PI},
        //     {scaleX: 2},
        //     {height:130, y: 180},
        //     {alpha: 0.1},
        //     {alpha: 0.2, y: 90},
        //     {rotate: -4*Math.PI, scaleX: 2.5, scaleY: 2.5},
        //     {x: 300, y: 400, width: 10, height: 10, rotate: 2*Math.PI}
        // ];
    }
};



