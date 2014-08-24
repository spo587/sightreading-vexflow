
// todo: find screen width??
// minor scales
// more rhythms (dotted half)


var canvas = document.getElementById('canvas-1');
var renderer = new Vex.Flow.Renderer(canvas,
Vex.Flow.Renderer.Backends.CANVAS);
//var ctx = new renderer(canvas, 400, 300)

var ctx = renderer.getContext();

var canvas2 = document.getElementById('canvas-2');
var renderer2 = new Vex.Flow.Renderer(canvas2, Vex.Flow.Renderer.Backends.CANVAS);
var ctx2 = renderer2.getContext();

function makeBars(numBars, height, width) {
    /// make a bunch of bar instances for vex flow
    var bars = [new Vex.Flow.Stave(25, height, width)];
    for (var i=0; i<numBars; i+=1) {
        var last_added_bar = bars[bars.length - 1];
        var newBar = new Vex.Flow.Stave(last_added_bar.width + last_added_bar.x, last_added_bar.y, width);
        newBar.setEndBarType(Vex.Flow.Barline.type.SINGLE);
        bars.push(newBar);
    }
    return bars;
}


function makeRhythms(numMeasures, beatsPer) {
    // 4/4 or 3/4 time only. quarter notes only on syncopated beats. returns 
    //a nested array with the rhythms in each measure as strings, readable as vexflow rhythms (ie, cryptic)
    if (beatsPer === undefined) {
        beatsPer = 4;
    }
    var rhythms = [];
    for (var i=0; i<numMeasures; i++) {
        rhythms.push([]);
    }
    var beat = 0;
    var measures = 0;
    while (measures < numMeasures-1) {
        if (beat > beatsPer-1) {
            beat = beat % beatsPer;
            measures += 1;
        }
        if (beat === 0 || beat == beatsPer/2) {
            randNum = Math.random();
            if (randNum < 0.5) {
                rhythms[measures].push('q');
                beat += 1;
            }
            else {
                rhythms[measures].push('h');
                beat += 2;
            }
        }
        else {
            rhythms[measures].push('q');
            beat += 1;
        }
    }
    rhythms.slice(-1)[0][0] = beatsPer == 4 ? '1' : 'hd';
    return rhythms;
}

function NextStepDegree(currentScaleDegree, pinkyDegree, level) {
    //for five finger position only. gives you the next scale degree, based on a current one. 
    // up a step, down a step, or repeat
    // pinkyDegree argument gives option of going outside tonic five-finger posish
    var current = Number(currentScaleDegree);
    if (pinkyDegree === undefined) {
        pinkyDegree = 4;
    }
    var thumbDegree = (pinkyDegree - 4);
    var randNum = Math.random();
    var randNum2 = Math.random();
    var increment;
    var nextDegree;
    if (level == 1 || level == undefined) {
        increment = 1;
    }
    else if (level == 2) {
        increment = randNum2 < 0.25 ? 2 : 1;
    }
    if (current === thumbDegree) {
        nextDegree = randNum < 0.2 ? current : current + increment;
    }
    else if (current === pinkyDegree) {
        nextDegree = randNum < 0.2 ? current : current-increment;
    }
    else {
        if (randNum <= 0.4) {nextDegree = current-increment;}
        else if (0.4<randNum<0.6) {nextDegree = current;}
        else {nextDegree = current + increment;}
    }
    if (thumbDegree <= nextDegree && nextDegree <= pinkyDegree) {
        return String(nextDegree);
    }
    else {
        return NextStepDegree(currentScaleDegree, pinkyDegree, level);
    }   
}

function makeSteps(rhythms_nested, pinkyDegree, level) {
    //combines the rhythms and generates a bunch of scale degrees to go along with.
    // returned in a nested array
    var numnotes = 0;
    for (var i=0; i<rhythms_nested.length; i++) {
        numnotes += rhythms_nested[i].length;    //find out how many total notes there are in rhythms array
    }
    var notes = ['0']; // this ensures melody will always end on tonic. necessary?
    for (var i=1; i<numnotes; i++) {
        notes.push(NextStepDegree(notes[i-1], pinkyDegree, level));  //build simple array of scale degrees
    }
    notes.reverse();
    var notes_with_meter = [];
    // put the steps in nested arrays, each inner array for a single measure
    var ind = 0;
    for (var i=0; i<rhythms_nested.length; i++) {
        notes_with_meter.push([]);
        for (var j=0; j<rhythms_nested[i].length; j++) {
            notes_with_meter[i].push(notes[j+ind]);
        }
        ind += rhythms_nested[i].length;
    }
    return notes_with_meter;
}

function makePianoStaffSingleLine(numBars, key, timeSig, width, height, context, major_or_minor) {
    //todo make the first bar bigger
    var bars_rh = makeBars(numBars, height, width);
    //var add_to_rh = makeBars(numBars - 1, height, width);
    var bars_lh = makeBars(numBars, height + 80, width);
    // var add_to_lh = makeBars(numBars - 1, height + 80, width);
    // for (var i=0; i<add_to_lh.length; i+= 1) {
    //     bars_rh.push(add_to_rh[i]);
    //     bars_lh.push(add_to_lh[i]);
    // }
    bars_rh[0].addClef('treble');
    bars_rh[0].addTimeSignature(timeSig);
    if (major_or_minor === 'm') {
        var keySig = key + 'm';
    }
    else {
        var keySig = key;
    }
    bars_rh[0].addKeySignature(keySig);
    
    bars_lh[0].addClef('bass');
    bars_lh[0].addTimeSignature(timeSig);
    bars_lh[0].addKeySignature(keySig);
    var connectors = [];
    bars_rh[0].setContext(context).draw();
    bars_lh[0].setContext(context).draw();
    var newConnector = new Vex.Flow.StaveConnector(bars_rh[0], bars_lh[0]);
    newConnector.setType(Vex.Flow.StaveConnector.type.BRACE).setContext(context).draw();
    for (var i=0; i<numBars; i+=1) {
        bars_rh[i].setContext(context).draw();
        bars_lh[i].setContext(context).draw();
        var newConnector1 = new Vex.Flow.StaveConnector(bars_rh[i], bars_lh[i]);
        var newConnector2 = new Vex.Flow.StaveConnector(bars_rh[i], bars_lh[i]);
        // connectors.push(newConnector);
        newConnector1.setType(Vex.Flow.StaveConnector.type.SINGLE_LEFT).setContext(context).draw();
        newConnector2.setType(Vex.Flow.StaveConnector.type.SINGLE_RIGHT).setContext(context).draw();
    }
    return {bars_rh: bars_rh, bars_lh: bars_lh};
}

function makePianoStaffMultipleLines(key, timeSig, barsPerLine, numLines, distance_from_top, context, major_or_minor) {
    if (key === undefined) {
        var key = 'C';
    }
    //var distance_from_top = 10;
    var lines = [];
    for (var i=0; i<numLines; i+=1) {
        var line = makePianoStaffSingleLine(barsPerLine, key, timeSig, 900/barsPerLine, distance_from_top, context, major_or_minor);
        if (i === numLines - 1) { // add double bar to end of the multiple lines
            var newConnector = new Vex.Flow.StaveConnector(line.bars_rh[barsPerLine], line.bars_lh[barsPerLine]);
            newConnector.setType(Vex.Flow.StaveConnector.type.END).setContext(context).draw();
        }
        distance_from_top += 200;
        lines.push(line);
    }
    return lines;
}

//makePianoStaffSingleLine(12,'Em','4/4',200,10);
//makePianoStaffSingleLine(6, 'Em', '4/4',200, 210)

//this shit doesn't work
function newAnnotation(text, hJustifcation, vJustifcation) {
    return (new Vex.Flow.Annotation(text)).setJustification(hJustifcation).setVerticalJustification(vJustifcation); 
}


function createSingleNote(chroma, octave, accidental, duration, clef, fingering) {
    // create a note instance for vex flow given the inputs
    if (accidental === null) {
        var accidental = '';
    }
    var note = new Vex.Flow.StaveNote({ keys:[chroma+accidental+'/'+octave], duration: duration, clef:clef, auto_stem: true});
    //if accidentals, need to chain
    if (accidental !== '') {
        note.addAccidental(0, new Vex.Flow.Accidental(accidental));
    }
    // dotted notes, need to chain
    if (duration[duration.length-1] === 'd') {
        note.addDotToAll();
    }
    function newStringNumber(num, pos) {
        return new Vex.Flow.StringNumber(num).setPosition(pos);
    }
    //fingering not working, below....not sure why
    if (fingering !== undefined) {
        //console.log('assigning fingering??');
        note.addModifier(0, newStringNumber('5', Vex.Flow.Modifier.Position.LEFT));
    }
    //tried adding fingering with text annotation, this shit is currently FUCKED
    var a = newAnnotation("Text", 1, 1);
    //console.log(note);
    var e = new Vex.Flow.StaveNote({ keys: ["c/3"], duration: "q"});
    e.addAnnotation(0, newAnnotation("Text", 1, 1));
    //note.addAnotation(0, newAnnotation("Text", 1, 1));
    //console.log(note);
    return note;
}



var b = createSingleNote('c','3','','q','treble');
b.addAnnotation(0, newAnnotation("Text", 1, 1));
// for (var prop in a) {
//     //  console.log(prop);
//     if (a.prop === e.prop) {
//         console.log('huzzah')
//     }
//     else {
//         console.log(a.prop);
//         console.log(e.prop)
//     };
// };

// a.addAnotation(0, newAnnotation("Text", 1, 1));




function createVoice(notes, numbeats, beat_value) {
    // take the notes and return a voice instance. only good for a single bar
  var voice = new Vex.Flow.Voice({
    num_beats: numbeats,
    beat_value: beat_value,
    resolution: Vex.Flow.RESOLUTION
  });
  voice.addTickables(notes);
  return voice;
}



function SharpMajorScale(halfStepsFromC) {
    //constructor with a steps property, with k,v pairs corresponding to scale degree : note name, and 
    // this.reverse_steps, which gives the reverse
    // also, a scalestepstohalfsteps property, which takes scale steps (eg, 1#) and tells you how many half steps 
    // above the tonic note
    //all indexed to 0
    var transpose_dict_sharp_from_c = {0: 'C', 1:'C#', 2:'D', 3:'D#', 4:'E', 5:'F', 6:'F#', 7:'G', 8:'G#', 9:'A', 10:'A#', 11:'B'};
    this.steps = {};
    this.steps = {'0':transpose_dict_sharp_from_c[halfStepsFromC]};
    var scaleHalfSteps = [0, 2, 4, 5, 7, 9, 11];
    for (var i=1; i<7; i+=1) {
        this.steps[i] = transpose_dict_sharp_from_c[(scaleHalfSteps[i] + halfStepsFromC) % 12];
    }
    this.steps_reverse = {};
    for (var prop in this.steps) {
        if (this.steps.hasOwnProperty(prop)) {
            this.steps[prop + '#'] = this.steps[prop] + '#';
            if (this.steps[prop + '#'].slice(1) === 'b#') {
                this.steps[prop + '#'] = this.steps[prop].slice(0,1);
            }
            this.steps[prop + 'b'] = this.steps[prop] + 'b';
            if (this.steps[prop + 'b'].slice(1) === '#b') {
                this.steps[prop + 'b'] = this.steps[prop].slice(0,1);
            }

        }
    }
    //create the reverse dict
    for (var prop in this.steps) {
        if (this.steps.hasOwnProperty(prop)) {
            this.steps_reverse[this.steps[prop]] = prop;
        }
    }
    this.halfStepsFromC = halfStepsFromC;
    this.scaleStepsToHalfSteps = {0:0, 1:2, 2:4, 3:5, 4:7, 5:9, 6:11};
    for (var prop in this.scaleStepsToHalfSteps) {
        if (this.scaleStepsToHalfSteps.hasOwnProperty(prop)) {
            this.scaleStepsToHalfSteps[prop + '#'] = this.scaleStepsToHalfSteps[prop] + 1;
            this.scaleStepsToHalfSteps[prop + 'b'] = this.scaleStepsToHalfSteps[prop] - 1;
        }
    }
    this.tonic = this.steps[0];
}


function SharpMinorScale(halfStepsFromC) {
    this.relativeMajor = new SharpMajorScale((halfStepsFromC + 3) % 12);
    this.steps = {};
    // move all of the relative major's properties down two steps
    for (var prop in this.relativeMajor.steps) {
        if (this.relativeMajor.steps.hasOwnProperty(prop) && Number(prop)) { //no sharps or flats
            this.steps[(Number(prop) + 2) % 7] = this.relativeMajor.steps[prop];
        }
        else if (this.relativeMajor.steps.hasOwnProperty(prop) && prop.length === 2) { //accidental
            this.steps[((Number(prop.slice(0,1)) + 2) % 7) + prop.slice(1)] = this.relativeMajor.steps[prop];
        }
    }
    this.steps[2] = this.relativeMajor.steps[0];  //not sure why the above didn't do this....okay for now
    //create the reverse mapping
    this.steps_reverse = {};
    for (var prop in this.steps) {
        if (this.steps.hasOwnProperty(prop)) {
            this.steps_reverse[this.steps[prop]] = prop;
        }
    }
    this.scaleStepsToHalfSteps = {0:0, 1:2, 2:3, 3:5, 4:7, 5:6, 6:10};
    this.halfStepsFromC = halfStepsFromC;
    this.tonic = this.steps[0];
}

function makeScale(halfStepsFromC, major_or_minor) {
    if (major_or_minor == 'm'){
        return new SharpMinorScale(halfStepsFromC);
    }
    else {
        return new SharpMajorScale(halfStepsFromC)
    }
}

function transposeVoice(voice, oldKey_steps_from_c, newKey_steps_from_c, major_or_minor) { //start here tomorrow!!
    //takes the notes of the voice, converts them to scale degrees, and spits back the scale degrees in the new voice, 
    // converted back to notes
    var oldScale = makeScale(oldKey_steps_from_c, major_or_minor);
    var newScale = makeScale(newKey_steps_from_c, major_or_minor);
    // if (major_or_minor = 'm') {
    //     var oldScale = new SharpMinorScale(oldKey_steps_from_c);
    //     var newScale = new SharpMinorScale(newKey_steps_from_c);
    // }
    // else {
    //      var oldScale = new SharpMajorScale(oldKey_steps_from_c);
    //      var newScale = new SharpMajorScale(newKey_steps_from_c);
    // }
    var notes = voice.tickables;
    for (var i=0; i<notes.length; i+=1) {
        var keyProps = notes[i].keyProps[0]
        var key = keyProps.key;
        //but it's complicated
        if (key.length > 1 && key[1] == 'B') {
            //for some reason it records the key in caps, but wants it back in lower-case
            key = key[0] + 'b';
        }
        // going to have to deal with accidental later
        // if there's no accidental in the untransposed version, then we're good
        // if there is an accidental, it may need to be changed
        //this old way i did it wasn't quite right

        //need to change accidental too!!!
        // var accidental = '';
        // if (newScale.steps[scaleDegree].length > 1) {
        //     accidental = newScale.steps[scaleDegree][1]
        // };
        var accidental;
        if (keyProps.accidental === null) {
            accidental = null;
        }
        // if there was an accidental, we need to figure out the new one
        // for this we'll need something in the Scale constructor that tells us which degrees in the key
        // signature ALREADY have accidentals, and detect whether this is one of those. do this!!!
        // else if (keyProps.accidental = '#')
        // var accidental = keyProps.accidental;

        var scaleDegree = oldScale.steps_reverse[key];
        var octave_old = keyProps.octave;
        
        // need to change the octave, if we 'crossed' a c
        // okay, say we're in a major. the fifth of the scale gets transposed from g to e
        // need to change octave because we've gone more than 12 half steps up
        if (newScale.scaleStepsToHalfSteps[scaleDegree] + newScale.halfStepsFromC >= 12) {
            octave = String(Number(octave_old) + 1);
        }
        else {
            octave = octave_old;   
        }

        //have to add back in the dot as well, since the duration property doesnt have it
        var duration = notes[i].duration;
        if (notes[i].dots !== 0) {
            duration += 'd';
        }
        
        //need to change ALL the properties of the note that matter??? next line doesn't do it
        //notes[i].keyProps[0].key = newScale.steps[scaleDegree]        
        //yup, have to actually create a whole new note instance. what a bummer. below does the trick
        // console.log(scaleDegree);
        // console.log(newScale.steps[scaleDegree]);
        notes[i] = createSingleNote(newScale.steps[scaleDegree].toLowerCase(), octave, accidental, duration, notes[i].clef);
    }
}

function makeLine(rhythms, scaleDegrees, key, melodyOctave, clef, major_or_minor) {
    /// makes a line for a single hand, multiple bars, and returns the notes to be rendered later
    // make sure arrays have same length
    // key input should be half steps from c
    var notes = [];
    var cScale = new SharpMajorScale(0);    
    var scale = makeScale(key, major_or_minor);
    for (var i=0; i<rhythms.length; i+=1) {
        //for melodies that dip below tonic, scale degree negative, make it positive again and change the octave
        if (scaleDegrees[i].slice(0,2) < 0) {
            var octave = melodyOctave - 1;
            var degree = String(Number(scaleDegrees[i].slice(0,2)) + 7) + scaleDegrees[i].slice(2)
        }
        else {
            var octave = melodyOctave;
            var degree = scaleDegrees[i];
        }
        var keyName = cScale.steps[(degree)].slice(0,1);
        var accidental = cScale.steps[(degree)].slice(1);
        var note = createSingleNote(keyName, octave, accidental, rhythms[i], clef, '5');
        notes.push(note);
    }
    return notes
}


function generateLine(rhythms_nested, steps_nested, key, octave, beatsPer, stave, hand, startMeasure, barsPerLine, major_or_minor) {
    //stave input is a multiple line piano staff
    // takes the inputs and renders the line to the appropriate staff
    var context = stave[0].bars_lh[0].getContext(); //will this work?
    var staveLine = 0;
    if (startMeasure > barsPerLine) {
        staveLine = 1;
        startMeasure = startMeasure - barsPerLine;
    }
    if (hand === 'r') {
        //var hand = stave[staveNum].bars_rh;
        var clef = 'treble';
    }
    else {
        //var hand = stave[staveNum].bars_lh;
        var clef = 'bass';
    }
    var measureCounter = startMeasure;
    //now proceed bar by bar and format the voice
    for (var i=0; i<rhythms_nested.length; i+=1) {
        if (measureCounter === barsPerLine) { //we've finished teh last bar in the line, move to next line
            staveLine += 1;
            // set the measurecounter to 0 so we start back at the beginning of the line)
            measureCounter = 0;
        }
    
        var a = makeLine(rhythms_nested[i],steps_nested[i], key, octave, clef, major_or_minor);
        
        var v = createVoice(a, beatsPer, 4);
        
        transposeVoice(v, 0, key);
        var beams = Vex.Flow.Beam.applyAndGetBeams(v);
        
        if (hand === 'r') {
            formatVoice(v, stave[staveLine].bars_rh[measureCounter], context);
        }
        else {
            formatVoice(v, stave[staveLine].bars_lh[measureCounter], context);
        };
        beams.forEach(function(beam){
            beam.setContext(context).draw();
        });
        measureCounter += 1
    }
}

function makeSightreading(numBars, beatsPer, key, level, hand, barsPerLine, distance_from_top, context, major_or_minor) {
    /// randomly generate a sightreading exercise, generating rhythms and scale steps in a line in each hand separately
    // then transposing to the given key
    //TODO add fingerings!!!
    var first_hand = hand;
    var second_hand = hand === 'r' ? 'l' : 'r';
    var first_octave = first_hand === 'r' ? 4 : 3;
    var second_octave = first_hand == 'r' ? 3 : 4; 
    var scale = new SharpMajorScale(key);
    var TwoSystems = makePianoStaffMultipleLines(scale.tonic,String(beatsPer) + '/' + '4', barsPerLine, 2, distance_from_top, context, major_or_minor);
    var rhythms_r = makeRhythms(numBars, beatsPer);
    var steps_r = makeSteps(rhythms_r, 4, level);
    // start in measure 0
    var start = 0;
    generateLine(rhythms_r, steps_r, key, first_octave, beatsPer, TwoSystems, first_hand, start, barsPerLine, major_or_minor);
    start += numBars;
    var rhythms_l = makeRhythms(numBars, beatsPer);
    var steps_l = makeSteps(rhythms_l, 4, level);
    generateLine(rhythms_l, steps_l, key, second_octave, beatsPer, TwoSystems, second_hand, start, barsPerLine, major_or_minor);

    // start += numBars;
    // var rhythms_r = makeRhythms(numBars, beatsPer);
    // var steps_r = makeSteps(rhythms_r, 4, level);
    // generateLine(rhythms_r, steps_r, key, first_octave, beatsPer, m, first_hand, start, barsPerLine);
    // start += numBars;
    // console.log(start)
    // var rhythms_l = makeRhythms(numBars, beatsPer);
    // var steps_l = makeSteps(rhythms_l, 4, level);
    // generateLine(rhythms_l, steps_l, key, second_octave, beatsPer, m, second_hand, start, barsPerLine);
}

function makeRandomSightReading(numBars, level, barsPerLine, distance_from_top, context) {
    // has to be 6 bar length lines for now. fix this!!
    // 8 bars total;
    var first_hand = ['r', 'l'];
    var hand = first_hand[Math.floor(Math.random() * first_hand.length)];
    var beats = [3, 4];
    var beatsPer = beats[Math.floor(Math.random() * beats.length)];
    if (level == 2) {
        var keys = [0, 2, 4, 5, 7, 9];
        major_or_minors = ['M', 'm'];
    }
    else {
        var keys = [0, 2, 7, 9];
        major_or_minors = ['M'];
    }
    var key = keys[Math.floor(Math.random() * keys.length)];
    var major_or_minor = major_or_minors[Math.floor(Math.random() * major_or_minors.length)];
    makeSightreading(numBars, beatsPer, key, level, hand, barsPerLine, distance_from_top, context, major_or_minor);

}


function formatVoice(voice, stave, context) {
    //render a voice to the stave
    var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    formatToStave([voice], stave);
    voice.draw(context,stave);
}


function formatNotes(notes,stave, context) {
    /// not using this function right now, but can render notes without a voice if you want
    Vex.Flow.Formatter.FormatAndDraw(context, stave, notes);
}


//create function for scrolling black shit across the screen

function scrollAcross(initial_x, initial_y, system_spacing){
    var W = canvas.width;
    var H = canvas.height;
    var x = initial_x; 
    var y = initial_y;
    var w = 10;
    var h = 120;

    //var vx = speed;
    var lineCounter = 1;
    this.drawer = function draw(speed, context) { 
        x += speed;
        context.fillRect(x, y, w, h);

        if (x > W - 360 && lineCounter < 2) { //lineCounter counts how many lines we've gone through!
            // we want the scroller to stop after two lines 
            //console.log(lineCounter);
            lineCounter += 1;
            y += system_spacing;
            x = initial_x;
            x += speed;
            context.fillRect(x,y,w,h);
            
        }
        
        else if (x > W - 360 && lineCounter == 2) {
            return null     
        }
        setTimeout(function drawHelper() {this.drawer(speed, context)}, 20);
    }


function isCanvasBlank(canvas) {
    var blank = document.createElement('canvas');
    blank.width = canvas.width;
    blank.height = canvas.height;

    return canvas.toDataURL() == blank.toDataURL();
}


    $('#button-1').click(function() {
        var speed = Number($('.slider-speed').val());
        if (speed === undefined || speed === 0) {
            speed = 2;
        }
        //check if there's music on the canvas before scrolling!
        //if (!isCanvasBlank(canvas)) {
        setTimeout(function (){this.drawer(speed, ctx)},2000);
        //}
        

    });
    $('#button-2').click(function() { 
        var speed = Number($('.slider-speed').val());
        if (speed === undefined || speed === 0) {
            speed = 2;
        }
        lineCounter = 1;
        //y += system_spacing;
        y = initial_y;
        x = initial_x;
        w= 10;
        h = 120; 
        // check if music has been put on the canvas already!
        //if (!isCanvasBlank(canvas2)) {
        setTimeout(function() {this.drawer(speed, ctx2)}, 2000);
        //}   
        
    });
}

// $('#button-1').click(function() {
//     var speed = Number($('.slider-speed').val());
//     if (speed === undefined || speed === 0) {
//         speed = 2;
//     }
//     scrollAcross(speed,110,50,200);

//     setTimeout(function (){draw(speed)},2000);
// });


//$('.reveal-piece').click(function(){
    
    //if you add keysig or timesig after already drawing the bars, have to re-draw, as below
    // m[0].bars_lh[1].addKeySignature('E')
    // m[0].bars_lh[1].setContext(ctx).draw()

    
scrollAcross(110,50,200);
   
function clearCanvas(context) {
    context.save();
    context.setTransform(1,0,0,1,0,0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.restore();

} 
    //function makeSightreading(numBars, beatsPer, key, level, hand) {
    //makeSightreading(8, 4, 4, 1, 'l');
$('#level-1').click(function(){
    // Store the current transformation matrix
    clearCanvas(ctx);
    clearCanvas(ctx2)
    makeRandomSightReading(4, 1, 4, 10, ctx);
//makeRandomSightReading(4, 1, 4, 410, ctx);
    makeRandomSightReading(4, 1, 4, 10, ctx2);
})

var levelTwo = $('#level-2').click(function(){
    clearCanvas(ctx);
    clearCanvas(ctx2);
    makeRandomSightReading(4, 2, 4, 10, ctx);
//makeRandomSightReading(4, 1, 4, 410, ctx);
    makeRandomSightReading(4, 2, 4, 10, ctx2);
})
    

    
