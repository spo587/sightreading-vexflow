//specifically there's one bug i don't quite understand:
// if you click for new examples by clicking the level 1 or level 2 button again, new examples print out on the screen
//so far so good. but then the scroller goes twice as fast, evne if you put in the same speed. if you click again to get new ones,
// it goes three times as fast. i understand why (sort of), but can't figure out a way to organize better so it doeesn't happen

function clearCanvas(context) {
    context.save();
    context.setTransform(1,0,0,1,0,0);
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.restore();

} 



var STOREEXAMPLE = []; //oh dear a global variable, not good i know
var TIMESCALLED = 0;


function makeTwoExamples(context1, context2, level) {
    clearCanvas(context1);
    clearCanvas(context2)
    var example1 = makeRandomSightReading(4, level, 4, 10, context1);
    var beatsPerExample1 = example1.beatsPer;
    var example2 = makeRandomSightReading(4, level, 4, 10, context2)
    var beatsPerExample2 = example2.beatsPer;
    scrollHandler(100, 50, beatsPerExample1, 200, 20, context1);
    scrollHandler2(100, 50, beatsPerExample2, 200, 20, context2);
    var ret = [example1, example2];
    STOREEXAMPLE = STOREEXAMPLE.concat(ret);
    console.log(STOREEXAMPLE);
    return ret;

} 

$('#level-1').click(function(){makeTwoExamples(ctx, ctx2, 1)});

$('#level-2').click(function(){makeTwoExamples(ctx, ctx2, 2)});

$('#level-3').click(function(){makeTwoExamples(ctx, ctx2, 3)});
    
function clearAndReplace(context) {
    clearCanvas(context);
    var len = STOREEXAMPLE.length
    //console.log(STOREEXAMPLE);
    if (context.canvas.id === 'canvas-1') {
        var score = STOREEXAMPLE[len - 2]; //retrieve the next to last example, in case more than two have been created
    }
    else if (context.canvas.id === 'canvas-2'){
        var score = STOREEXAMPLE[len - 1];
    }
    var line1 = score.line1
    var line2 = score.line2
    var keySig = score.keySig;
    //console.log(keySig);
    var beatsPer = score.beatsPer;
    //console.log(beatsPer);
    var firsthand = score.firsthand;
    var secondhand = firsthand === 'r' ? 'l' : 'r';
    var major_or_minor = score.major_or_minor;
    var twoLines = makePianoStaffMultipleLines(keySig, String(beatsPer) + '/' + '4', 4, 2, 10);
    renderBarsMultipleLines(twoLines, context);
    putLineOnStaff(line1, twoLines[0], firsthand, major_or_minor, context);
    putLineOnStaff(line2, twoLines[1], secondhand, major_or_minor, context);
    $('.timer').text('Countdown:   ');
}

$('#clearAndReplace').click(function(){clearAndReplace(ctx)}); 

$('#replace-example-2').click(function(){clearAndReplace(ctx2)});


var scrollHandler = function(initial_x, initial_y, beatsPer, system_spacing, callInterval, context){
    $('#button-1').click(function(){scroller(initial_x, 
        initial_y, beatsPer, system_spacing, callInterval, context)}
    )}

var scrollHandler2 = function(initial_x, initial_y, beatsPer, system_spacing, callInterval, context){
    $('#button-2').click(function(){scroller(initial_x,
        initial_y, beatsPer, system_spacing, callInterval, context)})
}
    

function scroller(initial_x, initial_y, beatsPer, system_spacing, callInterval, context){
    var exitFunction;
    $('#stop-start-over-1').click(function(){
        clearAndReplace(ctx);
        exitFunction = 1;
    })
    $('#stop-start-over-2').click(function(){
        clearAndReplace(ctx2);
        exitFunction = 1;
    })
    if (context.canvas.id === 'canvas-1') {
        var speed = Number($('#slider-speed-1').val());
    }
    else if (context.canvas.id === 'canvas-2') {
        var speed = Number($('#slider-speed-2').val());
    }
    if (speed === undefined || speed === 0) {
        speed = 80;
    }
    //console.log(context);    
    x = initial_x; 
    y = initial_y;
    function inner(x, y) {
        var W = 1300;
        var H = 400;

        w = 10;
        h = 120;
        lineCounter = 1;
        var speedConverter =  beatsPer * 53 / 4;
        if (x > W - 300 && lineCounter < 2) { //lineCounter counts how many lines we've gone through, only two lines per example
                    // we want the scroller to stop after two lines 
                    lineCounter += 1;
                    y += system_spacing; //move to next line
                    x = initial_x; //x back to its orig
                    x += speed / speedConverter;
                    context.fillRect(x,y,w,h);
                    
                }
                
        else if (x > W - 300 && lineCounter === 2) { //we've gone through the whole example
            //clearInterval(interval);
            //clearTimeout(timeOut);
            return 'testing';  //exit the inner function. would love to exit the outer function here too
        }
        else if (exitFunction > 0){
            return 'testing';
        }
        x += speed / speedConverter;
        context.fillRect(x,y,w,h);
        var timeoutId2 = setTimeout(function(){inner(x, y)}, callInterval);
    }
    var count = beatsPer //3 beats
    $('.timer').text('countdown:  ' + String(count));
    var counter = setInterval(timer, 55*1000/speed); //countdown
    var clicker = setInterval(sound, 55*1000/speed); //beat clicks for the countdown
    function sound() {
        document.getElementById('click').play(); //jquery not working here
    }
    function timer() {
        count = count - 1;
        if (count <= 0) {
           clearInterval(counter);
           clearInterval(clicker);
           $('.timer').text('start!');
           return;
        }

        $('.timer').text('countdown:  ' + String(count));
    }
    sound();
    timeoutId = setTimeout(function(){inner(x, y)}, beatsPer*60/speed*1000 + 500);
}