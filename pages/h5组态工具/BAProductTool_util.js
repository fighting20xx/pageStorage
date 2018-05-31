

var Graph = function Graph(options, fn) {
    if (!this instanceof Graph) {
        return new Graph(options, fn);
    }
    var opts = options || {};

    this.iId = opts.iId || -1;
    this.vXmbm = localStorage.getItem('vXmbm');

    this.vChartMc = opts.vChartMc || "";
    this.vChartValue = opts.vChartValue || "";
    this.vChartType = opts.vChartType || "";
    this.vChartStatus = opts.vChartType ||"on";


    this.timer;
    this.stack = [];
    this.action();
};
Graph.prototype.add = function (icons) {
    this.stack.push(icons);
};
Graph.prototype.delete = function (icons) {
    var stack = this.stack;
    stack.splice(stack.indexOf(icons),1);
};

Graph.prototype.clear = function (icons) {
    this.stack =[];
    MAP.clear();
};
Graph.prototype.action = function () {

};
Graph.prototype.stop = function () {
    this.vChartStatus = "off";
    this.timer && this.timer.clear();
};
function createGraph(text, id) {
    parent.layer.closeAll();
    result.closeMenu();

    Graphlist.forEach(function (value,index) {
        if(value.iId == id){
            MAP.clear();
            vm.Graph = newGraph = new Graph(value);
            GraphCurrentItem = value;
            GraphCurrentIndex = index;

            MAP.init();
            IconsTool.listAll(id);
        }
    });

    setTimeout(function () {
            MAP.clear();
            newGraph.stack.forEach(function (icon,index) {
                icon.draw();
                scene.add(icon.node);
            });

            // newGraph.clear();
            // IconsTool.toBeIcons(resultList1 ,resultList2);
            //
            parent.layer.msg('已经加载好 "'+text+'" 项目');

    },250)         // 为社么要重复执行，   因为 jtopt这个框架 有bug    在第一个 addNode的时候 大小位置设置不上，  所有再执行一次。
}

var Graphlist = [];
var GraphCurrentItem = {};
var GraphCurrentIndex = 0;

var newGraph ;
var graphTool =  {
        create:function () {


            if (confirm("确定要新建立一个组态图形码")==true){

                vm.Graph = newGraph = new Graph();
                MAP.init();
                // graphTool.save();
            };
        },
        save:function () {
            if (!newGraph) {
                parent.layer.msg('还没有创建图形，不能保存！');
            }else {
                var url = vm.Graph.iId == -1 ? "elink/baTchartD/save" : "elink/baTchartD/update";
                $.ajax({
                    type: "POST",
                    url: baseURL + url,
                    contentType: "application/json",
                    data: JSON.stringify(PropsFilter(vm.Graph)),
                    success: function(r){
                        if(r.code === 0){
                            alert('保存组态图成功', function(index){
                                vm.Graph.iId == -1
                                    ? vm.Graph.iId = newGraph.iId = r.id[0]
                                    :noop();

                                IconsTool.saveAll(vm.Graph.iId.iId);
                            });
                        }else{
                            alert("'保存组态图形的时候'  ",r.msg);
                        }
                    }
                });
            }
        },
        open:function () {
            $.ajax({
                type: "POST",
                url:  baseURL + 'elink/baTchartD/list?limit=1000&page=1',
                success: function(r){
                    if(r.code === 0){
                        var list = Graphlist =  r.page.list || [];
                        var str =  '<div ><div class="col-xs-9"><select  class="form-control" id="level1CodeSelect" >';
                        list.forEach(function (value,index) {
                            str +="<option  value='"+value.iId+"'>"+"id: "+value.iId+"&nbsp;&nbsp; &nbsp; &nbsp;    name:"+value.vChartMc +"</option>";
                        });
                       str += '</select>'+

                       '</div>'+
                       '<div class="col-xs-3">' +
                       '<a class="btn btn-default btn-sm" onclick="window.top.frames[0].createGraph($(\'#level1CodeSelect\').find(\'option:selected\').text(),$(\'#level1CodeSelect\').val())"><i class="fa fa-trash-o"></i>&nbsp;确定</a>'+
                       '</div>'+
                       '</div>';
                        parent.layer.open({
                            type: 1,
                            title: false,
                            closeBtn: 0,
                            area: '500px',
                            skin: 'layui-layer-nobg', //没有背景色
                            shadeClose: true,
                            content: str
                        });
                    }else{
                        alert(r.msg);
                    }
                }
            });

        },
        del:function () {
            if (!newGraph) {
                parent.layer.msg('还没有创建图形，不能删除！');
            }else {
                confirm('确定要删除此组态图形吗？', function(){
                    if (vm.Graph && vm.Graph.iId != -1) {
                        $.ajax({
                            type: "POST",
                            url: baseURL + "elink/baTchartD/delete",
                            contentType: "application/json",
                            data: JSON.stringify([vm.Graph.iId]),
                            success: function(r){
                                if(r.code == 0){
                                        MAP.clear();
                                        parent.layer.msg('从数据库中删除成功！');
                                        Graphlist.splice(Graphlist.indexOf(GraphCurrentItem),1);
                                        GraphCurrentIndex =0;
                                        GraphCurrentItem = Graphlist[0];
                                        createGraph(text, Graphlist[0].iId);
                                }else{
                                    alert(r.msg);
                                }
                            }
                        });
                    }else {
                        MAP.clear();
                        newGraph = undefined;
                        parent.layer.msg('从本地删除成功！');
                    }
                });
            }
        }
};



/*
 *   默认的 颜色 可以再html标签上设置自定义的 颜色，  如果没有那就是默认的颜色  data-colors="124,15,38|14,145,138"
 *   同样的默认的每个标签都有一个 color动画  ，    可以再html上加载更多的动画 data-animation="color|circle|flow"
 */
var animationColors = "0,255,0|255,255,0|255,0,0";
var animationTypes = "color";

var Icons = function Icons(options, fn) {
    if (!this instanceof Icons) {
        return new Icons(options, fn);
    }
    var opts = options || {};

    this.iId = opts.iId || -1;
    this.iChartid = opts.iChartid || newGraph.iId;
    this.vObjectbm = opts.vObjectbm;
    this.vObjectname = opts.vObjectname;
    this.vPropertyText = opts.vPropertyText;
    this.vPropertyWidth = opts.vPropertyWidth || 0 ;
    this.vPropertyHeight = opts.vPropertyHeight || 0 ;
    this.vPropertyX = opts.vPropertyX || 0 ;
    this.vPropertyY = opts.vPropertyY || 0 ;
    this.vPropertyAnimation = opts.vPropertyAnimation || animationTypes;
    this.vPropertyColor = opts.vPropertyColor || animationColors;             //填充颜色 用|分割 第一个填充颜色 node.fontColor  第二个过大告警颜色， 第三个过小告警颜色。
    this.vPropertySrc1 = opts.vPropertySrc1;
    this.vPropertySrc2 = opts.vPropertySrc2;
    this.vPropertySrc3 = opts.vPropertySrc3;
    this.vPropertySrc4 = opts.vPropertySrc4;
    this.vPropertySrc5 = opts.vPropertySrc5;
    this.vPropertyAdiotype =opts.vPropertyAdiotype || "";
    this.vPropertyDatatype =opts.vPropertyDatatype || "";
    this.vPropertyValue = opts.vPropertyValue || "";
    this.vPropertyMaxvalue = opts.vPropertyMaxvalue || "";
    this.vPropertyMinvalue =opts.vPropertyMinvalue || "";
    this.vPropertyUnit =opts.vPropertyUnit || "";

    this.vPropertyEx1 =opts.vPropertyEx1 ;                      //代表角度
    this.vPropertyEx2 =opts.vPropertyEx2 ;                   //填充颜色
    this.vPropertyEx3 =opts.vPropertyEx3 ;                   //  转动速度    亮灭，  流动不流动
    this.vPropertyEx4 =opts.vPropertyEx4 ;                  // 文本方向
    this.vPropertyEx5 =opts.vPropertyEx5 ;
    this.vPropertyEx6 =opts.vPropertyEx6 ;
    this.vPropertyEx7 =opts.vPropertyEx7 ;
    this.vPropertyEx8 =opts.vPropertyEx8 ;

    this.graph = newGraph;
};

Icons.prototype.draw = function () {
    var self = this;
    self.imageSrc = null;
    self.showText = null;
    var src = null;

    switch (self.vPropertyEx3) {                                       //先判断本地属性，   如果没有本地属性了，那就再查看 关联属性。
        case "0": src = self.vPropertySrc1; break;
        case "1": src = self.vPropertySrc2; break;
        case "2": src = self.vPropertySrc3; break;
        case "3": src = self.vPropertySrc4; break;
        default : findSrc();
    }

    function findSrc() {
        // var animations = self.vPropertyAnimation.split("|");
        if(self.pointList){                   // （换图标， 不换图标，  有对应点，没有对应点）共4种状态，  ---------   可以换图标 并且有对应点 才进入 图标变化。
            // animations.forEach(function (type) {
            //     actionHandle[type] && actionHandle[type]( self);
            // });
            actionHandle["image"](self);
            src =  self.imageSrc;
        } else {                                                          //没有多种图标变换的 ，那就默认第一个图标了
            src =  self.vPropertySrc1;
        }
    }

    var text = self.showText ?self.showText: this.vPropertyText ;
    var node  = MAP.addNode(text, src, parseFloat(this.vPropertyX), parseFloat(this.vPropertyY), parseFloat(this.vPropertyWidth), parseFloat(this.vPropertyHeight), parseFloat(this.vPropertyEx1),this);
    this.node = node;
    return this;
};

Icons.prototype.action = function (flag) {
    var self = this;
    var node = self.node;

    var Colors = this.vPropertyColor.split("|");
    var animate = actionHandle["animate"];
    var alarm = actionHandle["alarm"];

    var pointList = this.pointList || [];
    for( var i=0,len = pointList.length;i<len;i++){

        // console.log(pointList);
        var point = pointList[i];
        if (point.vBapointmaxvalue !="" && point.vBapointminvalue !="" && point.vBapointvalue !="") {
            var maxVal = parseFloat(point.vBapointmaxvalue );
            var minVal = parseFloat(point.vBapointminvalue );
            var Val = parseFloat(point.vBapointvalue );

            if (Val > maxVal ) {
                animate(node,{alpha: 0.3},800,true);
                alarm(node,"","0,255,0");
                break;
            }else if (Val < minVal) {
                animate(node,{alpha: 0.3},800,true);
                alarm(node,"","255,0,0");
                break;
            }
        }
    };

    if (this.vPropertyEx2 && this.vPropertyEx2 != "") {
        node.fillColor = this.vPropertyEx2;
    }
    return this;
};



var resultList1 = [];
var resultList2 = [];


var IconsTool =  {
    createIcons:function (target ,event) {
        if (!middleImage) {
            return;
        }
        var options = {};
        options.vObjectbm = Date.parse(new Date());
        options.vObjectname = target.name;
        options.vPropertyText = target.alt;
        options.vPropertySrc1 =  target.src.slice(rootUrl.length);

        var img = new Image();                                      //获取图的实际大小
        img.src = target.src;
        // console.log('width:'+img.width+',height:'+img.height);
        options.vPropertyWidth =  img.width || target.offsetWidth ;
        options.vPropertyHeight =  img.height || target.offsetHeight;

        options.vPropertyX =  event.offsetX;
        options.vPropertyY =  event.offsetY;

        var tmpIcon  = new Icons();
        Object.keys(target.dataset).forEach(function (prop,index) {
            Object.keys(tmpIcon).forEach(function (prop2,index2) {
                if (prop2.toLowerCase()  == prop.toLowerCase()){
                    options[prop2] = target.dataset[prop];
                }
            })
        });
        var icon  = new Icons(options ,noop);
        newGraph.add(icon);
        return icon;
    },
    cloneIcons:function(icons,event){
        var options = {};
        Object.keys(icons).forEach(function (prop,index) {
            options[prop] = icons[prop];
        });
        options.iId = -1;
        options.vObjectbm = Date.parse(new Date());
        options.vPropertyX =  event.offsetX;
        options.vPropertyY =  event.offsetY;
        var icon  = new Icons(options ,noop);
        icon.draw();
        icon.action();

        newGraph.add(icon);
        return icon;
    },
    toBeIcons:function (li,li2) {
        var list = li.slice(0);
        var list2 = li2.slice(0);

        list.forEach(function (item,index) {
            var icon  = new Icons(item ,noop);

            var len = list2.length;
            if (len) {
                for (var i = 0;i<len;i++) {
                    var point = list2[i];
                    if (point.vDatalinkbm == item.vObjectbm) {

                        icon.pointList
                            ? icon.pointList.push(point)
                            : icon.pointList = [point];
                        list2.splice(i,1);
                        len--;
                        i--;
                    }
                }
            }
            icon.draw();
            icon.action();
            newGraph.add(icon);
        });

        if(list.length){
            flag_shouldBeCenter && stage.centerAndZoom();
        }
    },
    del:function (icons) {
        confirm('确定要删除此图标吗？', function(){
            if (icons && icons.iId != -1) {
                $.ajax({
                    type: "POST",
                    url: baseURL + "elink/baTobjectmodualD/delete",
                    contentType: "application/json",
                    data: JSON.stringify([icons.iId]),
                    success: function(r){
                        if(r.code == 0){
                                parent.layer.msg('删除图标成功');
                                scene.remove(icons.node);
                                newGraph.delete(icons);

                        }else{
                            alert("'删除此图标的时候' "+r.msg);
                        }
                    }
                });
            }else {
                scene.remove(icons.node);
                newGraph.delete(icons);
                parent.layer.msg('删除本地图标成功');
            }
        });

    },
    listAll:function () {
        $.ajax({
            type: "POST",
            url: baseURL + "elink/baTobjectmodualD/listall?iId="+ newGraph.iId,
            contentType: "application/json",
            data: JSON.stringify({iId:newGraph.iId}),
            success: function(r){
                if(r.code == 0){
                     resultList1 = r.listAll || [];
                     resultList2 =  r.baTobjectmodualD || [];
                    IconsTool.toBeIcons(resultList1 ,resultList2);
                    parent.layer.msg('已经加载好所有图标');
                }else{
                    alert("'加载所有图标的时候' "+ r.msg);
                }
            }
        });
    },
    saveAll:function () {
        if (newGraph.stack.length == 0 ) return;

        // console.log(newGraph.stack);
        // console.log(PropsFilter(newGraph.stack));
        $.ajax({
            type: "POST",
            url: baseURL + "elink/baTobjectmodualD/saveall",
            contentType: "application/json",
            data: JSON.stringify(PropsFilter(newGraph.stack)),
            success: function(r){
                if(r.code == 0){
                    alert('保存所有图标成功', function(index){
                        // console.log(r);
                        newGraph.clear();
                        IconsTool.listAll();
                    });
                }else{
                    alert(r.msg);
                }
            }
        });
    }
};






function noop() {}

function coverProps(target, obj) {
    if (!target || !obj) return;

    Object.keys(target).forEach(function (prop,index) {
        if (target[prop] && obj[prop] ) {
            target[prop] = obj[prop]
        }
    });
    return target;
}

function copyProps(target, obj) {
    if (!target || !obj) return;

    Object.keys(target).forEach(function (prop,index) {
        if (obj[prop] || obj[prop] == 0) {
            target[prop] = obj[prop]
        }
    });
    return target;
}

function copyNodeProps(icons, node) {
// console.log(node);
    icons.vPropertyX= node.x;
    icons.vPropertyY= node.y;
    icons.vPropertyWidth= node.width;
    icons.vPropertyHeight= node.height;
    icons.vPropertyEx1= node.rotate;

    return icons;
}


var runPrefixMethod = function(element, method) {
    var usablePrefixMethod;
    ["webkit", "moz", "ms", "o", ""].forEach(function(prefix) {
            if (usablePrefixMethod) return;
            if (prefix === "") {
                // 无前缀，方法首字母小写
                method = method.slice(0,1).toLowerCase() + method.slice(1);
            }
            var typePrefixMethod = typeof element[prefix + method];
            if (typePrefixMethod + "" !== "undefined") {
                if (typePrefixMethod === "function") {
                    usablePrefixMethod = element[prefix + method]();
                } else {
                    usablePrefixMethod = element[prefix + method];
                }
            }
        }
    );

    return usablePrefixMethod;
};

var objToString = Object.prototype.toString;
function PropsFilter(obj) {
    var result ;


    if (objToString.call(obj) === '[object Array]') {
        result = [];
        obj.forEach(function (item,index) {
            result[index] = PropsFilter(item)
        });
    }else {
        result = {};
        Object.keys(obj).forEach(function (prop,index) {
            if (typeof obj[prop] == "string" || typeof obj[prop] == "number") {
                result[prop] = obj[prop]
            }
        });
        if (result.iId == -1 )  delete result.iId ;
    }
    return result;
}



