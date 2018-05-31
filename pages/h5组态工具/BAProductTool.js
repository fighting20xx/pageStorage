var vm = window.vm =  new Vue({
    el:'#top',
    data:{
        icons:{},
        Graph: {},
        activeName:"1",
        dictCodeArray:[]
    },
    computed:{
        haveFlow:function () {
            var animates = (this.icons.vPropertyAnimation || "").split("|");
            return animates.indexOf("flow") > 0
        },
        haveCircle:function () {
            var animates = (this.icons.vPropertyAnimation || "").split("|");
            return animates.indexOf("circle") > 0
        },
        haveBright:function () {
            var animates = (this.icons.vPropertyAnimation || "").split("|");
            return animates.indexOf("bright") > 0
        },
    },
    methods: {
        getDictCode:function () {
            $.get(baseURL + "elink/bzbmTdictD/list?page=1&limit=10000", function (r) {
                vm.dictCodeArray = r.page.list;
                // console.log("标准编码字典",r.page);
            });
        },
        pickColor:function () {
            console.log("sdf");
            $('#pickColor').colpick({
                colorScheme:'light',
                layout:'rgbhex',
                color:'ff8800',
                onChange:function(hsb,hex,rgb,el) {
                    vm.icons.vPropertyEx2 = rgb.r + ","+ rgb.g + "," + rgb.b;
                },
                onSubmit:function(hsb,hex,rgb,el) {
                    vm.icons.vPropertyEx2 = rgb.r + ","+ rgb.g + "," + rgb.b;
                }
            });
        }
    },
    beforeMount:function () {
        // this.getDictCode();
    },
});

var rootUrl = ""
var baseURL = ""
var content = document.getElementById('content_main');
var canvas = document.getElementById('canvas');
var canvasWidth = canvas.width = content.offsetWidth;
var canvasHeight = canvas.height = content.offsetHeight;

var stage = new JTopo.Stage(canvas);
var scene = new JTopo.Scene(stage);
scene.backgroundColor= "48,49,60";

