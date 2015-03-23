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


function makeExample(context, level, numPhrases, beatsPerMeasure, beatValue, key, major_or_minor, standardFiveFingerOrNot, octaves) {
    clearCanvas(context);
    //clearCanvas(context2)
    var example = makeRandomSightreading(level, numPhrases, standardFiveFingerOrNot, context, key, major_or_minor, beatsPerMeasure, beatValue, octaves)
    //var example1 = makeRandomSightreading(level, standardFiveFingerOrNot, context);
    var beatsPerExample1 = example.beatsPerMeasure;
    //var example2 = makeRandomSightReading(4, level, 4, 10, context2, standardFiveFingerOrNot);
    //var beatsPerExample2 = example2.beatsPer;
    scrollHandler(beatsPerExample1, example.numLines, example.barsPerLine * 230 + 50, context);
    //scrollHandler2(100, 50, beatsPerExample2, 200, 20, context2);
    var ret = [example] //, example2];
    STOREEXAMPLE = STOREEXAMPLE.concat(ret);
    console.log(STOREEXAMPLE);
    return ret;

} 

$('#submit').click(function(){
    var level = Number($('input[name=level]:checked', '#first').val());
    var numPhrases = Number($('#num-phrases').val());
    var beatsPerMeasure = Number($('input[name=time-sig]:checked', '#time').val());
    beatsPerMeasure = beatsPerMeasure !== 0 ? beatsPerMeasure : undefined;
    var key = $('#key-sig').val() === 'random' ? undefined : Number($('#key-sig').val());
    var major_or_minor = $('#major_or_minor').val() === 'random' ? undefined : $('#major-or-minor').val();
    var standardFiveFingerOrNot = Boolean($('input[name=five-finger]:checked', '#five-finger-position').val());
    var beatValue = 4;
    var octaves = Boolean($('input[name=octave]:checked', '#octave-range').val());
    makeExample(ctx, level, numPhrases, beatsPerMeasure, beatValue, key, major_or_minor, standardFiveFingerOrNot, octaves)
    // makeSightReading(4, numPhrases, beatsPerMeasure, 4, 0, level, 'M', 4, 4, ctx);
    // var params = setParameters(params);
    // clearCanvas(ctx);
    // makeSightReading(params);
})

$('#level-1').click(function(){makeExample(ctx, 1, true)});

$('#level-1-non-standard-position').click(function(){makeExample(ctx, 1, false)})

$('#level-2-non-standard-position').click(function(){makeExample(ctx, 2, false)})

$('#level-3-non-standard-position').click(function(){makeExample(ctx, 3, false)})

$('#level-2').click(function(){makeExample(ctx, 2, true)});

$('#level-3').click(function(){makeExample(ctx, 3, true)});
    
function clearAndReplace(context) {
    clearCanvas(context);
    var len = STOREEXAMPLE.length
    //console.log(STOREEXAMPLE);
    if (context.canvas.id === 'canvas-1') {
        var score = STOREEXAMPLE[len - 1]; //retrieve the next to last example, in case more than two have been created
    }
    // else if (context.canvas.id === 'canvas-2'){
    //     var score = STOREEXAMPLE[len - 1];
    // }
    var length = score.numBarsPerHand * score.numPhrases;
    var emptyBarLines = makePianoStaffMultipleBars([], length, 230, 10, score.clefs);
    addKeyAndTimeSignature(emptyBarLines, score.timeSig, score.key);
    renderBarsMultipleLines(emptyBarLines, ctx);
    var measureCounter = 0;
    score.phrases.forEach(function(phrase, index){
        putLineOnStaff(phrase.notes, emptyBarLines, score.handOrder[index].hand, measureCounter, score.key, score.timeSig, score.major_or_minor, context);
        measureCounter += score.numBarsPerHand;
    });


}

$('#clearAndReplace').click(function(){clearAndReplace(ctx)}); 

//$('#replace-example-2').click(function(){clearAndReplace(ctx2)});



var scrollHandler = function(beatsPer, numLines, width, context){
    $('#button-1').click(function(){scroller(beatsPer, numLines, width, context)}
    )}

// var scrollHandler2 = function(initial_x, initial_y, beatsPer, system_spacing, callInterval, context){
//     $('#button-2').click(function(){scroller(initial_x,
//         initial_y, beatsPer, system_spacing, callInterval, context)})
// }
    
function countdown(speed, beatsPer){

}

function fillIn(speed, width, numLines){
    var exitFunction = 0;
    var lineCounter = 1;
    var initial = - speed * 50 / 20;
    var distFromTop = 40;
    //ctx.fillStyle = 'white';
    f = function(){
        //console.log('f going');
        ctx.fillRect(75, distFromTop, initial, 150);
        //console.log(initial);
    }
    move = function(){
        //console.log('move going');
        initial += speed / 20;
        if (initial > width && lineCounter < numLines) {
            distFromTop += 200;
            lineCounter += 1;
            initial = 0;
        }
        else if (initial > width && lineCounter === numLines){
            clearInterval(id);
            clearTimeout(id2);
        }

    }
    var id2;
    fMove = function(){
        //console.log('fmove going');
        id2 = setTimeout(f, 1000);
        move()
    }
    var id = setInterval(fMove, 20);
    $('#stop-start-over-1').click(function(){
        //console.log('click ending');
        exitFunction = 1;
        clearInterval(id);
        clearTimeout(id2);
        var clear = function(){
            clearAndReplace(ctx);
        }
        var done = setTimeout(clear, 1000);
        
    });

}





function scroller(beatsPer, numLines, width, context){
    // scroll across the screen at the specified speed.
    // activate the countdown
    //pause button
    // exit button and replace with the previous example
    var speed = Number($('#slider-speed-1').val());
    //countdown(speed, beatsPer);
    fillIn(speed, width, numLines);

}
   