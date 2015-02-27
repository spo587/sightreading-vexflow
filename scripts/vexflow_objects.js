//now the functions that make vexflow objects

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


// makes a piano grand staff and renders it to the page
//was thinking perhaps to separate out the rendering and the creation of the object. later
function makePianoStaffSingleLine(numBars, key, timeSig, width, height) {
    //todo make the first bar bigger
    var bars_rh = makeBars(numBars, height, width);
    //var add_to_rh = makeBars(numBars - 1, height, width);
    var bars_lh = makeBars(numBars, height + 80, width);

    bars_rh[0].addClef('treble');
    
    var keySig = new SharpMajorScale(key).tonic;

    bars_rh[0].addKeySignature(keySig);
    bars_rh[0].addTimeSignature(timeSig);
    bars_lh[0].addClef('bass');
    bars_lh[0].addKeySignature(keySig);
    bars_lh[0].addTimeSignature(timeSig);
    //bars_lh[1].x += numSharps * 25; //  make first bar wider for sharps
    return {bars_rh: bars_rh, bars_lh: bars_lh, timeSig: timeSig};
}


//uses the above function to make multiple lines of piano staff
function makePianoStaffMultipleLines(key, timeSig, barsPerLine, numLines, distance_from_top){
    if (key === undefined) {
        var key = 0;
    }
    //var distance_from_top = 10;
    var lines = [];
    for (var i=0; i<numLines; i+=1) {
        var line = makePianoStaffSingleLine(barsPerLine, key, timeSig, 900/barsPerLine, distance_from_top);
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
        chroma = clef === 'treble' ? 'b' : 'd';
        octave = clef === 'treble' ? '4' : '3';
    }
    var note = new Vex.Flow.StaveNote({ keys:[chroma+accidental+'/'+octave], duration: duration, clef:clef, auto_stem: true});
    //if accidentals, need to chain
    if (accidental !== '') {
        note.addAccidental(0, new Vex.Flow.Accidental(accidental));
    }
    // dotted notes, need to chain
    if (duration[duration.length - 1] === 'd') {
        note.addDotToAll();
    }

    if (fingering !== undefined && fingering !== '') {
        console.log('assigning fingering??');
        console.log(fingering);
        //debugger;
        note.addModifier(0, newStringNumber(fingering, Vex.Flow.Modifier.Position.ABOVE));
    }
    return note;
}

function newStringNumber(num, pos) {
        return new Vex.Flow.StringNumber(num).setPosition(pos);
    }

function addFingering(note, fingering){
    console.log('addfingering function being executed');
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


function getNoteProps(note){
    //for storing and then adding stuff to the note (like a fingering)
    // need keyname, octave, accidental, rhythm and clef
    var keyName = note.keys[0][0];
    var octave = note.keyProps[0].octave;
    var accidental = note.keyProps[0].accidental;
    var rhythm = note.duration;
    if (note.dots > 0) {
        rhythm += 'd';
    }
    if (octave > 3){
        var clef = 'treble';
    }
    else {
        var clef = 'bass';
    }
    return {keyName: keyName, octave: octave, accidental: accidental, rhythm: rhythm, clef: clef};
}

function makeLine(rhythms, scaleDegrees, key, melodyOctave, clef, major_or_minor) {
    /// generates a SINGLE BAR of notes for a single hand, and returns the notes to be rendered later
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
        var note = createSingleNote(keyName, octave, accidental, rhythms[i], clef);
        //debugger;
        //console.log(note);
        notes.push(note);
    }
    return notes
}

function removeFingering(note) {
    note.modifiers = note.modifiers.slice(0, note.modifiers.length - 1);
}

function generateLine(rhythms_nested, steps_nested, key, octave, clef, major_or_minor) {
    ///returns multiple bars?

    var notes = [];
    for (var i=0; i<rhythms_nested.length; i+=1) {
        notes.push([])
        var oneMeasureNotes = makeLine(rhythms_nested[i], steps_nested[i], key, octave, clef, major_or_minor);
        notes[i] = oneMeasureNotes;
    
    }
    var fingerConverter_rh = {0: '1', 1: '2', 2: '3', 3: '4', 4:'5'};
    var fingerConverter_lh = {0: '5', 1:'4', 2: '3', 3:'2', 4:'1'};
    var note1 = notes[0][0];
    var note2 = notes[0][1]
    var step1 = steps_nested[0][0];
    var step2 = steps_nested[0][1];
    if (clef === 'treble'){
        var fingering = fingerConverter_rh[step1];
        var fingering2 = fingerConverter_rh[step2];
    }
    else {
        var fingering = fingerConverter_lh[step1];
        var fingering2 = fingerConverter_lh[step2];
    }
    console.log(note1);
    console.log(note1.modifiers);
    addFingering(note1,fingering);
    //addFingering(note2,fingering2);
    //console.log(note1);
    // console.log(note2);

    // measure1_length = notes[0].length;
    // for (var i=1; i<measure1_length; i+=1){
    //     var newnote = notes[0][i];
    //     addFingering(newnote,'2');
    //     removeFingering(newnote);
    //     console.log(newnote.modifiers);
    // }


    // var note2 = notes[0][1];
    // addFingering(note2,'3');
    // var noteProps = getNoteProps(note1);
    // console.log(noteProps);
    //notes[0][0] = createSingleNote(noteProps.keyName, noteProps.octave, noteProps.accidental,
    //noteProps.rhythm, noteProps.clef, '3');
    // var note2 = notes[0][1];
    // var noteProps2 = getNoteProps(note2);
    // notes[0][1] = createSingleNote(noteProps2.keyName, noteProps2.octave, noteProps2.accidental,
    //     noteProps2.rhythm, noteProps2.clef, '');
    // removeFingering(notes[0][1]);
    // //this function is creating the line in c major
    // console.log('first note generate by generate line function');
    console.log(notes)
    return notes;
}
