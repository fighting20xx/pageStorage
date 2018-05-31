/*@flow*/

function foo(x:number, y:number):number {
    return x + y;
}
console.log(foo(22,42));


class Bar {
    x:string;
    y:string;

    constructor(x,y){
        this.x=x;
        this.y=y;
    }
}
var bar1:Bar = new Bar("hello","1");


var obj:{a:string,b:number,c:Array<string>,d:Bar}={
    a:"hello",
    b:42,
    c:["hello","world"],
    d:new Bar("hello",2)
}













