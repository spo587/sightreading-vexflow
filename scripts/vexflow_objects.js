//now the functions that make vexflow objects

//makeBars returns vexflow Stave objects
function makeBars(numBars, height, width) {
    /// make a bunch of bar instances for vex flow
    var bars = [new Vex.Flow.Stave(25, height, width + 50)];
    for (var i=1; i<numBars; i+=1) {
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
    // var add_to_lh = makeBars(numBars - 1, height + 80, width);
    // for (var i=0; i<add_to_lh.length; i+= 1) {
    //     bars_rh.push(add_to_rh[i]);
    //     bars_lh.push(add_to_lh[i]);
    // }
    bars_rh[0].addClef('treble');
    bars_rh[0].addTimeSignature(timeSig);
    var keySig = new SharpMajorScale(key).tonic;
    // if (major_or_minor === 'm') {
    //     var keySig = new SharpMinorScale(key).tonic + 'm';
    // }
    // else {
    //     var keySig = new SharpMajorScale(key).tonic;
    // }
    bars_rh[0].addKeySignature(keySig);
    
    bars_lh[0].addClef('bass');
    bars_lh[0].addTimeSignature(timeSig);
    bars_lh[0].addKeySignature(keySig);
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



//more failed attempts at adding fingerings below....need to look through again
// var b = createSingleNote('c','3','','q','treble');
// b.addAnnotation(0, newAnnotation("Text", 1, 1));
// // for (var prop in a) {
// //     //  console.log(prop);
// //     if (a.prop === e.prop) {
// //         console.log('huzzah')
// //     }
// //     else {
// //         console.log(a.prop);
// //         console.log(e.prop)
// //     };
// // };

// // a.addAnotation(0, newAnnotation("Text", 1, 1));



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
        var note = createSingleNote(keyName, octave, accidental, rhythms[i], clef, '5');
        notes.push(note);
    }
    return notes
}

//hmm rename this function? takes already existing rhythms and steps, makes a line from the above 
// function, and adds it to the given grand piano staff
function generateLine(rhythms_nested, steps_nested, key, octave, clef, major_or_minor) {
    // 
    //stave input is a multiple line piano grand staff. should rename this.
    // takes the inputs and renders the line to the appropriate staff
    var notes = [];
    for (var i=0; i<rhythms_nested.length; i+=1) {
        notes.push([])
        var oneMeasureNotes = makeLine(rhythms_nested[i], steps_nested[i], key, octave, clef, major_or_minor);
        notes[i] = oneMeasureNotes;
        

    }
    return notes;
}
