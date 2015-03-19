//now the functions that make vexflow objects

//todo: try to make it so that it adjusts the number of bars in a line depending on how 
//wide the screen is?

//makeBars returns vexflow Stave objects
function makeBars(numBars, height, width) {
    /// make a bunch of bar instances for vex flow
    var bars = [new Vex.Flow.Stave(25, height, width + 50)];
    for (var i=1; i < numBars; i += 1) {
        var last_added_bar = bars[bars.length - 1];
        var newBar = new Vex.Flow.Stave(last_added_bar.width + last_added_bar.x, last_added_bar.y, width);
        //newBar.setEndBarType(Vex.Flow.Barline.type.SINGLE);
        bars.push(newBar);
    }
    return bars;
}


function makePianoStaffMultipleBars(lines, numBarsRemaining, width, initialDistanceFromTop, clefs){
    //could this be recursive? 
    if (numBarsRemaining <= 0){
        return lines;
    }
    var barsPerLine = findBarsPerLine(width, ctx);
    
    //console.log(barsPerLine);
    //rewrite makepianostaff so the width and height parameters come first
    lines.push(makePianoStaffSingleLine(barsPerLine, width, initialDistanceFromTop, clefs)); //add numbarsremaining argument for not going over the number of bars
    initialDistanceFromTop += 200;
    return makePianoStaffMultipleBars(lines, numBarsRemaining - barsPerLine, width, initialDistanceFromTop, clefs)
}

function findBarsPerLine(barWidth, context){
    var windowWidth = context.canvas.width;
    //var windowWidth =  $(window).width();
    var numbars = 0;
    windowWidth = windowWidth - barWidth - 75;
    while (windowWidth > 0){
        windowWidth = windowWidth - barWidth;
        numbars += 1;
    }
    return numbars;
}

    
//     return makePianoStaffMultipleBars(bars, lines, currentBarNumber, numBarsRemaining - 1);
//     //make staff objects that know how wide the screen is and adjust number of bars in each line accordingly
//     var barsPerLine = Math.floor(($(window).width()) / 250);
//     var numLines = Math.floor(numBars / barsPerLine);
//     var lines = [];
//     for (var i=0; i<numLines; i+=1){
//         lines.push(makePianoStaffSingleLine())

//     }



// }

// makes a piano grand staff and renders it to the page
//was thinking perhaps to separate out the rendering and the creation of the object. later
function makePianoStaffSingleLine(numBars, width, height, clefs) {
    // if (clefs === undefined){
    //     var clefs = ['treble', 'bass'];
    // }
    //todo make the first bar bigger
    var bars_rh = makeBars(numBars, height, width);
    //var add_to_rh = makeBars(numBars - 1, height, width);
    var bars_lh = makeBars(numBars, height + 80, width);

    bars_rh[0].addClef(clefs[0]);
    bars_lh[0].addClef(clefs[1]);
    return {bars_rh: bars_rh, bars_lh: bars_lh};
}

function addTimeSignature(singleLine, timeSig){
    //key is halfsteps from c
    singleLine.bars_rh[0].addTimeSignature(timeSig);
    singleLine.bars_lh[0].addTimeSignature(timeSig);
    singleLine['timeSig'] = timeSig;
    //bars_lh[1].x += numSharps * 25; //  make first bar wider for sharps
    return singleLine;
}

function addKeySignature(singleLine, key){
    var keySig = new SharpMajorScale(key).tonic;
    console.log(keySig);
    singleLine.bars_rh[0].addKeySignature(keySig);
    singleLine.bars_lh[0].addKeySignature(keySig);
    return singleLine;
}

function addKeyAndTimeSignature(multipleLines, timeSig, key){
    console.log(key);
    multipleLines.forEach(function(line){
        addKeySignature(line, key)
    });
    addTimeSignature(multipleLines[0], timeSig);
}




//uses the above function to make multiple lines of piano staff
function makePianoStaffMultipleLines(key, timeSig, barsPerLine, numLines, distance_from_top){
    if (key === undefined) {
        var key = 0;
    }
    //var distance_from_top = 10;
    var lines = [];
    for (var i=0; i<numLines; i+=1) {
        var line = makePianoStaffSingleLine(barsPerLine, 900/barsPerLine, distance_from_top)
        addKeySignature(line, key);
        if (i === 0){
            addTimeSignature(line, timeSig);
        }
        distance_from_top += 200;
        lines.push(line);
    }
    return lines;
}


//this shit doesn't work. what the fuck this is not making sense
function newAnnotation(text, hJustifcation, vJustifcation) {
    return (new Vex.Flow.Annotation(text)).setJustification(hJustifcation).setVerticalJustification(vJustifcation); 
}


//now to make some notes. below creates a single note object
function createSingleNote(chroma, octave, accidental, duration, clef, fingering) {
    // create a note instance for vex flow given the inputs
    if (accidental === null) {
        var accidental = '';
    }
    var durationLength = duration.length;
    if (duration[durationLength - 1] === 'r') { //the note is a rest. set its position in center of staff
        var chroma = clef === 'treble' ? 'b' : 'd';
        var octave = clef === 'treble' ? '4' : '3';
    }
    //console.log(octave);
    var note = new Vex.Flow.StaveNote({ keys:[chroma+accidental+'/'+ octave], duration: duration, clef: clef, auto_stem: true});
    //if accidentals, need to chain
    if (accidental !== '') {
        note.addAccidental(0, new Vex.Flow.Accidental(accidental));
    }
    // dotted notes, need to chain
    if (duration[duration.length - 1] === 'd') {
        note.addDotToAll();
    }

    if (fingering !== undefined && fingering !== '') {
        note.addModifier(0, newStringNumber(fingering, Vex.Flow.Modifier.Position.ABOVE));
    }
    return note;
}

function newStringNumber(num, pos) {
        return new Vex.Flow.StringNumber(num).setPosition(pos);
    }

function addFingering(note, fingering){
    note.addModifier(0, newStringNumber(fingering, Vex.Flow.Modifier.Position.ABOVE))
}



// the notes in a measure are organized into voices. this function adds the notes to a single measure voice object
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

function createTransposedVoice(notes, numbeats, beat_value, key, major_or_minor){
    var scale = major_or_minor === 'M' ? new SharpMajorScale(key) : new SharpMinorScale(key);
    console.log(key);
    return transposeVoice(createVoice(notes, numbeats, beat_value), 0, key, 'M', major_or_minor);
}


function getNoteProps(note){
    //for storing and then adding stuff to the note (like a fingering)
    // need keyname, octave, accidental, rhythm and clef
    var chroma = note.keys[0][0];
    var octave = note.keyProps[0].octave;
    var accidental = note.keyProps[0].accidental;
    var rhythm = note.duration;
    if (note.dots > 0) {
        rhythm += 'd';
    }
    //octaves are dicey here. fix this
    if (octave > 3){
        var clef = 'treble';
    }
    else {
        var clef = 'bass';
    }
    return {chroma: chroma, octave: octave, accidental: accidental, rhythm: rhythm, clef: clef};
}

function makeLine(rhythms, scaleDegrees, melodyOctave, clef) {
    /// generates a SINGLE BAR of notes for a single hand, and returns the notes to be rendered later
    // make sure arrays have same length
    // key input should be half steps from c
    var notes = [];
    var cScale = new SharpMajorScale(0);    
    
    var notesAlmost = scaleDegrees.map(function(scaleDegree){
        return getNoteProperties(scaleDegree, melodyOctave, clef)
    });
    function getNoteProperties(scaleDegree, melodyOctave, clef){
        if (scaleDegree.slice(0, 2) < 0){
            var octave = melodyOctave - 1;
            var degree = String(Number(scaleDegree.slice(0,2)) + 7) + scaleDegree.slice(2)
        }
        else {
            var octave = melodyOctave;
            var degree = scaleDegree;
        }
        var keyName = cScale.steps[(degree)].slice(0,1);
        var accidental = cScale.steps[(degree)].slice(1);        
        return {keyName: keyName, octave: octave, accidental: accidental, clef: clef};
    }
    //must be a better way to do this!!!
    var index = -1
    var notes = notesAlmost.map(function(note){
        index += 1
        //console.log(note.octave + 1)
        //console.log(note.clef);
        return createSingleNote(note.keyName, note.octave, note.accidental, rhythms[index], note.clef)
    });
    return notes;
}


function removeFingering(note) {
    note.modifiers = note.modifiers.slice(0, note.modifiers.length - 1);
}


function generateLine(rhythms_nested, steps_nested, octave, clef) {
    ///returns multiple bars. still in c major
   
    var rhythms_steps = combineNestedArrays(rhythms_nested, steps_nested);
    var notes;
    notes = rhythms_steps.map(function(elem){  
        return makeLine(elem[0], elem[1], octave, clef);   
    });

    addFingeringFirstNoteOfLine(notes, steps_nested, clef);
    return {notes: notes, steps: steps_nested};
}

function convert(scaleDegree, highestScaleDegree){
    ///this function is for converting fingerings. see function below. there's definitely a better way to deal with this.
    var difference = scaleDegree - highestScaleDegree;
    if (difference > 0){
        difference = difference - 6;
    }
    var ret = {'0': 'highest', '-1': 'secondHighest', '-2': 'thirdLowest', '-3': 'secondLowest', '-4': 'lowest'}
    return ret[difference];
}

function addFingeringFirstNoteOfLine(lineMultipleBars, steps_nested, hand, highestScaleDegree){
    var note1 = lineMultipleBars[0][0];
    var step1 = steps_nested[0][0];
    addFingering(note1, decideFingering(step1, hand, highestScaleDegree));
    return lineMultipleBars;
}

// function addFingeringFirstNoteOfLine(lineMultipleBars, steps_nested, hand, highestScaleDegree){
//     var fingerConverter_rh = {lowest: '1', secondLowest: '2', thirdLowest: '3', secondHighest: '4', highest:'5'};
//     var fingerConverter_lh = {lowest: '5', secondLowest:'4', thirdLowest: '3', secondHighest:'2', highest:'1'};
//     var note1 = lineMultipleBars[0][0];
//     var note2 = lineMultipleBars[0][1];
//     var step1 = steps_nested[0][0];
//     var step2 = steps_nested[0][1];
//     if (hand === 'r'){
//         var fingering = fingerConverter_rh[convert(step1, highestScaleDegree)];
//     }
//     else {
//         var fingering = fingerConverter_lh[convert(step1, highestScaleDegree)];
//     }
//     addFingering(note1, fingering);
//     return lineMultipleBars;
// }


function decideFingering(step, hand, highestScaleDegree){
    var fingerConverter_rh = {lowest: '1', secondLowest: '2', thirdLowest: '3', secondHighest: '4', highest:'5'};
    var fingerConverter_lh = {lowest: '5', secondLowest:'4', thirdLowest: '3', secondHighest:'2', highest:'1'};
    if (hand === 'r'){
        var fingering = fingerConverter_rh[convert(step, highestScaleDegree)];
    }
    else {
        var fingering = fingerConverter_lh[convert(step, highestScaleDegree)];
    }
    console.log(fingering);
    return fingering;
}
