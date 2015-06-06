function makeContext(elementId) {
    var canvas = document.getElementById(elementId);
    var renderer = new Vex.Flow.Renderer(canvas, Vex.Flow.Renderer.Backends.CANVAS);
    var ctx = renderer.getContext();
    return ctx
}

var ctx = makeContext('canvas-1');
var ctx2 = makeContext('canvas-2');

