

function makeContext(elementId) {
    var canvas = document.getElementById(elementId);
    var renderer = new Vex.Flow.Renderer(canvas, Vex.Flow.Renderer.Backends.CANVAS);
    var ctx = renderer.getContext();
    return ctx;
}

var ctx = makeContext('canvas-1');
var ctx2 = makeContext('canvas-2');


function renderBars(barsSingleLine, context) {
    //put bars oon canvas and add connectors and shit
    var bars_rh = barsSingleLine.bars_rh;
    var bars_lh = barsSingleLine.bars_lh;
    var numBars = bars_rh.length;
    var connectors = [];
    bars_rh[0].setContext(context).draw();
    bars_lh[0].setContext(context).draw();
    var newConnector = new Vex.Flow.StaveConnector(bars_rh[0], bars_lh[0]);
    newConnector.setType(Vex.Flow.StaveConnector.type.BRACE).setContext(context).draw();
    for (var i=1; i<numBars; i+=1) {
        bars_rh[i].setContext(context).draw();
        bars_lh[i].setContext(context).draw();
        var newConnector1 = new Vex.Flow.StaveConnector(bars_rh[i], bars_lh[i]);
        var newConnector2 = new Vex.Flow.StaveConnector(bars_rh[i], bars_lh[i]);
        // connectors.push(newConnector);
        newConnector1.setType(Vex.Flow.StaveConnector.type.SINGLE_LEFT).setContext(context).draw();
        newConnector2.setType(Vex.Flow.StaveConnector.type.SINGLE_RIGHT).setContext(context).draw();
    }
}

function renderBarsMultipleLines(lines, context) {
    for (var i=0; i<lines.length; i+=1) {
        renderBars(lines[i], context);
    }
}

function putLineOnStaff(line_multiple_bars, staffSingleLine, hand, major_or_minor, context) {
    var timeSig = staffSingleLine.timeSig;
    var beatsPer = Number(timeSig[0])
    var bars_rh = staffSingleLine.bars_rh;
    var bars_lh = staffSingleLine.bars_lh;
    var len = bars_rh[0].modifiers.length;
    var sharp_or_flat_array = bars_rh[0].modifiers[len - 2].accList;
    if (sharp_or_flat_array.length > 0){
        var numSharps = sharp_or_flat_array[0].type === '#' ? sharp_or_flat_array.length : undefined;
        var numFlats = sharp_or_flat_array[0].type === 'b' ? sharp_or_flat_array.length : undefined;
        var keyHalfStepsFromC = numSharps > -1 ? numSharps * 7 % 12 : numFlats * 5 % 12;
    }
    else {
        var keyHalfStepsFromC = 0;
    }
    var voices = []
    var transposedVoices = []
    //careful here. the keySignature may not be the correct index in the array. find a better way?
    //be wary of major vs minor right here
    
    for (var i=0; i<bars_rh.length; i+=1) {
        voices.push(createVoice(line_multiple_bars[i], beatsPer, 4));

        //for now assuming the voice was created in a major key only
        transposedVoices.push(transposeVoice(voices[i], 0, keyHalfStepsFromC, 'M', major_or_minor));

        if (hand === 'r'){
            formatVoice(transposedVoices[i], bars_rh[i], context);
        }
        else if (hand === 'l'){
            formatVoice(transposedVoices[i], bars_lh[i], context);
        }
    };


}


function formatVoice(voice, stave, context) {
    //render a non-transposed voice to the stave
    var beams = Vex.Flow.Beam.applyAndGetBeams(voice);
    var formatter = new Vex.Flow.Formatter().joinVoices([voice]).formatToStave([voice], stave);
    voice.draw(context,stave);
    for (var i=0; i< beams.length; i+=1){
        beams[i].setContext(context).draw();
    }
    
    // var beams = beamVoiceByBeat(voice, 4, stave);
    // renderBeams(beams);
}


//work on a new beam function later
// function beamNotesByBeat(measure_of_notes, beat_duration, stave) {
//     var total_duration = 0;
//     var beam_groups = []; //final array of notes, with each entry a group to be beamed
//     var current_beam_group = []
//     for (i=0; i<measure_of_notes.length; i += 1) {
//         total_duration += note_duration(measure_of_notes[i]);
//         if (total_duration % beat_duration !== 0) { //check if we've landed on a beat
//             current_beam_group.push(measure_of_notes[i])
//         }
//         else {
//             current_beam_group.push(measure_of_notes[i]); // can't beam single note
//             if (current_beam_group.length > 1) {
//                 var beam = new Vex.Flow.Beam(current_beam_group);
//                 beam_groups.push(beam);
//                 current_beam_group = [];
//             };
//         };
//     };
//     Vex.Flow.Formatter.FormatAndDraw(ctx, stave, measure_of_notes);
//     return beam_groups
// }

// function beamVoiceByBeat(voice_measure, beat_duration, stave) {
//   var notes = voice_measure.tickables;
//   return beamNotesByBeat(notes,beat_duration,stave) 

// }

// function note_duration(note) {
//   var base_duration =  1/Number(note.duration);
//     if (note.dots === 0) {
//       return base_duration;
//     }
//     else if (note.dots === 2) {
//       return base_duration + base_duration/2;
//     }
//     else {throw Error('unknown dot error: double dot, maybe?')};
// };

// function renderBeams(beam_groups) {
//     for (i=0; i<beam_groups.length; i+=1) {
//         beam_groups[i].setContext(ctx).draw()
//     };
// }



function formatNotes(notes, stave, context) {
    /// not using this function right now, but can render notes without a voice if you want
    Vex.Flow.Formatter.FormatAndDraw(context, stave, notes);
}

function decideOctaves(hand, key){
    if (key < 6){
        var right = randomChoiceFromArray([4, 5]);
        var left = randomChoiceFromArray([2, 3]);
    }
    else if (key >= 6){
        var right = randomChoiceFromArray([4]);
        var left = randomChoiceFromArray([2, 3]);
    }
    if (hand === 'r'){
        var toRet = [right, left];
    }
    else {
        var toRet = [left, right];
    }
    if (left !== right){
        return toRet;
    }
    else {
        return decideOctaves(hand, key);
    }
}

function randomChoiceFromArray(arr){
    return arr[Math.floor(Math.random() * arr.length)]
}

function makeSightreading(numBars, beatsPer, key, level, hand, barsPerLine, distance_from_top, context, major_or_minor, highestScaleDegree1, highestScaleDegree2) {
    /// randomly generate a sightreading exercise, generating rhythms and scale steps in a line in each hand separately
    // then transposing to the given key
    


    var first_hand = hand;
    var second_hand = hand === 'r' ? 'l' : 'r';
     
    var firstClef = first_hand == 'r' ? 'treble' : 'bass';
    var secondClef = first_hand == 'r' ? 'bass' : 'treble';

    var first_octave = decideOctaves(first_hand, key)[0];
    var second_octave = decideOctaves(second_hand, key)[0];


    var TwoSystems = makePianoStaffMultipleLines(key, String(beatsPer) + '/' + '4', barsPerLine, 2, distance_from_top, context, major_or_minor);
    // var rhythms_r = makeRhythms(numBars, beatsPer, level);
    // var steps_r = makeSteps(rhythms_r, 4, level, 'open');
    var r = makeLineRhythmsFirst(beatsPer, numBars, level, highestScaleDegree1, 'open');
    var rhythms_r = r.rhythms;
    var steps_r = r.melody;
    // start in measure 0
    var start = 0;
    var line1 = generateLine(rhythms_r, steps_r, key, first_octave, firstClef, barsPerLine, major_or_minor);
    addFingeringFirstNoteOfLine(line1.notes, line1.steps, firstClef, highestScaleDegree1);

    start += numBars;
    // var rhythms_l = makeRhythms(numBars, beatsPer, level);
    // var steps_l = makeSteps(rhythms_l, 4, level, 'closed');
    var l = makeLineRhythmsFirst(beatsPer, numBars, level, highestScaleDegree2, 'closed');
    var rhythms_l = l.rhythms;
    var steps_l = l.melody;
    var line2 = generateLine(rhythms_l, steps_l, key, second_octave, secondClef, barsPerLine, major_or_minor);
    addFingeringFirstNoteOfLine(line2.notes, line2.steps, secondClef, highestScaleDegree2);

    renderBarsMultipleLines(TwoSystems, context);
    putLineOnStaff(line1.notes, TwoSystems[0], first_hand, major_or_minor, context);
    putLineOnStaff(line2.notes, TwoSystems[1], second_hand, major_or_minor, context);
    return {firsthand: hand, line1: line1, line2: line2, major_or_minor: major_or_minor};
}

function makeRandomSightReading(numBars, level, barsPerLine, distance_from_top, context, standardFiveFingerOrNot) {
    // has to be 6 bar length lines for now. fix this!!
    // 8 bars total;
    var first_hand = ['r', 'l'];
    var hand = first_hand[Math.floor(Math.random() * first_hand.length)];
    var beats = [3, 4];
    var beatsPer = beats[Math.floor(Math.random() * beats.length)];
    if (level === 2 || level === 3) {
        var major_minor_combos = [[0, 'M'], [0, 'm'], [7, 'M'], [7, 'm'], [2, 'M'], [4,'M'], [9, 'M'], [5, 'm'], [5, 'M'], [7, 'm'], [5, 'm'], [3, 'm']];
    }
    else {
        var major_minor_combos = [[0, 'M'], [0, 'm'], [7, 'M'], [5, 'm'], [5, 'm']];
        
    }
    var major_minor_combo = major_minor_combos[Math.floor(Math.random() * major_minor_combos.length)];
    var key = major_minor_combo[0];
    var major_or_minor = major_minor_combo[1];
    if (standardFiveFingerOrNot === false && major_or_minor === 'M'){
        var highestScaleDegrees = [2, 4];
        shuffleArray(highestScaleDegrees);
        var highestScaleDegree1 = highestScaleDegrees[0];
        var highestScaleDegree2 = highestScaleDegrees[1];

    }
    else {
        var highestScaleDegree1 = 4;
        var highestScaleDegree2 = 4;
    }
    console.log(major_or_minor);
    console.log(highestScaleDegree1);
    console.log(highestScaleDegree2);
    var score = makeSightreading(numBars, beatsPer, key, level, hand, barsPerLine, distance_from_top, context, major_or_minor, highestScaleDegree1, highestScaleDegree2);
    return {line1: score.line1, line2: score.line2, firsthand: score.firsthand, beatsPer: beatsPer, keySig: key, major_or_minor: major_or_minor};
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function decideHighestFingerChoice(major_minor_combo, level){
    var major_or_minor = major_minor_combo[1];
    if (major_or_minor === 'm'){
        return 4;
    }
    else {
        var fingerChoices = [2,4];
        var choice = fingerChoices[Math.floor(Math.random() * fingerChoices.length)];

    }
    if (checkThumbOnSharpSeven(major_minor_combo, choice) === true) {
        return decideHighestFingerChoice(major_minor_combo, level);
    }
    else {
        return choice;
    }
}

function checkThumbOnSharpSeven(key, highestScaleDegree){
    if (highestScaleDegree === 3){
        return true;
    }
    return false;
}



