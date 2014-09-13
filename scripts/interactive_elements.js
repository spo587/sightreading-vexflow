//below are the functions for the extra fun shit the page does, ie the black scroller and the beat thing.
// here's where the organization is a mess. 
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

$('#level-1').click(function(){

    clearCanvas(ctx);
    clearCanvas(ctx2)
    var example1 = makeRandomSightReading(4, 1, 4, 10, ctx);
    var beatsPerExample1 = example1.beatsPer;
    var example2 = makeRandomSightReading(4, 1, 4, 10, ctx2)
    var beatsPerExample2 = example2.beatsPer;
    scrollAcross(100, 50, 200, beatsPerExample1, beatsPerExample2, 20);
    var ret = [example1, example2];
    STOREEXAMPLE = STOREEXAMPLE.concat(ret);
    console.log(STOREEXAMPLE);
    return ret;
    
});


$('#level-2').click(function(){
    clearCanvas(ctx);
    clearCanvas(ctx2)
    var example1 = makeRandomSightReading(4, 2, 4, 10, ctx);
    var beatsPerExample1 = example1.beatsPer;
    var notes1 = example1.notes
    //console.log(beatsPerExample1);
//makeRandomSightReading(4, 1, 4, 410, ctx);
    var example2 = makeRandomSightReading(4, 2, 4, 10, ctx2)
    var beatsPerExample2 = example2.beatsPer;
    var score2 = example2.notes
    var hi = scrollAcross(100, 50, 200, beatsPerExample1, beatsPerExample2, 20);
    
    //console.log(example1);
    var ret = [example1, example2];
    STOREEXAMPLE = STOREEXAMPLE.concat(ret);
    return ret;
});

$('#clearAndReplace').click(function(){  //{
    clearCanvas(ctx);
    var len = STOREEXAMPLE.length
    //console.log(STOREEXAMPLE);
    var score = STOREEXAMPLE[len - 2]; //retrieve the next to last example, in case more than two have been created
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
    renderBarsMultipleLines(twoLines, ctx);
    putLineOnStaff(line1, twoLines[0], firsthand, major_or_minor, ctx);
    putLineOnStaff(line2, twoLines[1], secondhand, major_or_minor, ctx);

});

//can't replace with a single function that gets called twice. wtf?
$('#replace-example-2').click(function(){
    clearCanvas(ctx2);
    var len = STOREEXAMPLE.length;
    //console.log(STOREEXAMPLE);
    var score = STOREEXAMPLE[len - 1];
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
    renderBarsMultipleLines(twoLines, ctx2);
    putLineOnStaff(line1, twoLines[0], firsthand, major_or_minor, ctx2);
    putLineOnStaff(line2, twoLines[1], secondhand, major_or_minor, ctx2);

});

//WHAT??
// i tried this in a few places, replacing the anonymous functions from the click handlers
// since they get called a few times with the same basic code. doesn't work. functions get called
// when the page loads instead. wtf???

//does not work
// function clearAndReplace(context){
//     var example = context === ctx ? STOREEXAMPLE : STOREEXAMPLE2
//     clearCanvas(context);
//     console.log(example);
//     var notes = example[0].notes;
//     var keySig = example[0].keySig;
//     console.log(keySig);
//     var beatsPer = example[0].beatsPer;
//     console.log(beatsPer);
//     var firsthand = example[0].firsthand;
//     putNotesBackOnSystems(notes, firsthand, keySig, beatsPer, context);

// }



function scrollAcross(initial_x, initial_y, system_spacing, beatsPerFirst, beatsPerSecond, callInterval){
    var W = 1300;
    var H = 400;
    var x = initial_x; 
    var y = initial_y;
    var w = 10;
    var h = 120;

    var lineCounter = 1;
    this.drawer = function draw(speed, context) {
       
        var drawHelper = function() {this.drawer(speed, context)}; // will use this variable in settimeout
        var speedConverter =  beatsPerFirst * 53 / 4; //don't worry about this, just converts to beats per second
        x += speed / speedConverter;
        context.fillRect(x, y, w, h);

        if (x > W - 300 && lineCounter < 2) { //lineCounter counts how many lines we've gone through, only two lines per example
            // we want the scroller to stop after two lines 
            lineCounter += 1;
            y += system_spacing; //move to next line
            x = initial_x; //x back to its orig
            x += speed / speedConverter;
            context.fillRect(x,y,w,h);
            
        }
        
        else if (x > W - 300 && lineCounter === 2) { //we've gone through the whole example
            return undefined;  //exit the inner function. would love to exit the outer function here too
        }
        var timeoutID = window.setTimeout(drawHelper, callInterval); //call this shit over and over to scroll across
    }


    $('#button-1').click(function(){
        x = initial_x; 
        y = initial_y;
        w = 10;
        h = 120;
        lineCounter = 1;
        var speed = Number($('.slider-speed').val());
        if (speed === undefined || speed === 0) {
            speed = 80;
        }
        var timeout = setTimeout(function (){this.drawer(speed, ctx)}, 3*60/speed*1000 + 500); //scrolls at the right speed
        var count = 3 //3 beats
        $('#timer').text('countdown:  3');
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
               $('#timer').text('start!');
               return;
            }

            $('#timer').text('countdown:  ' + String(count));
        }
        sound(); //to go at the first click
                
        //}
        

    });
    $('#button-2').click(function() {
        var speed = Number($('#slider-speed-2').val());
        if (speed === undefined || speed === 0) {
            speed = 80;
        }
        lineCounter = 1;
        //y += system_spacing;
        y = initial_y;
        x = initial_x;
        w= 10;
        h = 120; 
        // check if music has been put on the canvas already!
        //if (!isCanvasBlank(canvas2)) {
        var timeout2 = setTimeout(function() {this.drawer(speed, ctx2)}, 3*60/speed*1000);   
        
    });
}



// //tried it a diff way, not working
// var scrollAcross = {
//     setup : function(initial_x, initial_y, system_spacing, beatsPerFirst, beatsPerSecond, callInterval) {
//         return {x: initial_x, y: initial_y, W: canvas.width, H: canvas.height, w : 10, h: 120, lineCounter: 1};
//     },
//     draw : function drawer(speed, context, initial_x, initial_y, system_spacing, beatsPerFirst, beatsPerSecond, callInterval) {
//         //var drawHelper = this.draw(speed, context, initial_x, initial_y, system_spacing, beatsPerFirst, beatsPerSecond, callInterval);
//         var x = initial_x;
//         var y = initial_y;
//         var W = canvas.width;
//         var H = canvas.height;
//         var w = 10;
//         var h = 120;
//         var lineCounter = 1;
//         var speedConverter = beatsPerFirst * 53 / 4;
//         x +=  speed / speedConverter;
//         context.fillRect(x, y, w, h);
//         if (x > W - 300 && lineCounter < 2) { //lineCounter counts how many lines we've gone through!
//             // we want the scroller to stop after two lines 
//             //console.log(lineCounter);
//             lineCounter += 1;
//             y += system_spacing;
//             x = initial_x;
//             x += speed / speedConverter;
//             context.fillRect(x,y,w,h);
//         }
//         else if (x > W - 300 && lineCounter === 2) {
//             console.log('timeout cleared');
//             return undefined;  
//         }
//         var timeoutID = window.setTimeout(function(){scrollAcross.draw(speed, context, initial_x, initial_y, system_spacing, beatsPerFirst, beatsPerSecond, callInterval)}, callInterval);
//     }
// }

// $('#button-1').click(function() {
//     var beatsPerExample1 = getBeats[0];
//     var beatsPerExample2 = getBeats[1];
//     var x = 100; 
//     var y = 50;
//     var w = 10;
//     var h = 120;
//     //lineCounter = 1;
//     var speed = Number($('.slider-speed').val());
//     if (speed === undefined || speed === 0) {
//         speed = 80;
//     }
//     //check if there's music on the canvas before scrolling!
//     //if (!isCanvasBlank(canvas)) {
//     var timeout = setTimeout(function (){scrollAcross.draw(speed, ctx, x, y, 200, beatsPerExample1, beatsPerExample2, 20)}, 2000);
    
//     //}
    

// });

// function start(context) { //why does this function get called when clicking the level 1 button??
//     console.log('function called');
//     x = initial_x; 
//     y = initial_y;
//     w = 10;
//     h = 120;
//     lineCounter = 1;
//     var speed = Number($('.slider-speed').val());
//     if (speed === undefined || speed === 0) {
//         speed = 80;
//     }
//     //check if there's music on the canvas before scrolling!
//     //if (!isCanvasBlank(canvas)) {
//     var timeout = setTimeout(function (){this.drawer(speed, context)}, 3*60/speed*1000 + 400);
//     var count = 3 //3 beats
//     $('#timer').text('countdown:  3');
//     var counter = setInterval(timer, 55*1000/speed);
//     var clicker = setInterval(sound, 55*1000/speed);
//     function sound() {
//         document.getElementById('click').play(); //no jquery??
//     }
    
//     function timer() {
//         count = count - 1;
//         if (count <= 0) {
//            clearInterval(counter);
//            clearInterval(clicker);
//            $('#timer').text('start!');
//            return;
//         }

//         $('#timer').text('countdown:  ' + String(count)); // watch for spelling
//     }
//     sound();
            
//     //}
    

// }