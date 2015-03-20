//todo: find key signature bug, and add radio buttons
//add fingering at beginning of each line and qwhen hands switch
// add closure option ??
// add position where hands are next to each other, single big-range melody


function makeContext(elementId) {
    var canvas = document.getElementById(elementId);
    var renderer = new Vex.Flow.Renderer(canvas, Vex.Flow.Renderer.Backends.CANVAS);
    var ctx = renderer.getContext();
    function draw() {
        var width = window.innerWidth;
        if (width < 1100){
            console.log('limiting width of canvas')
            ctx.canvas.width  = width;
        }
        else {
            ctx.canvas.width = 1100;
        }
        //ctx.canvas.height = window.innerHeight;   
    }
    draw();
    return ctx;
}

var ctx = makeContext('canvas-1');
//var ctx2 = makeContext('canvas-2');



function renderBars(barsSingleLine, context) {
    //put bars oon canvas and add connectors and shit
    var bars_rh = barsSingleLine.bars_rh;
    var bars_lh = barsSingleLine.bars_lh;
    var numBars = bars_rh.length;
    setFirstBarConnectors(bars_rh[0], bars_lh[0], context);
    bars_rh.forEach(function(bar, index){
        addLeftandRightConnector(bar, bars_lh[index], context);
        bar.setContext(context).draw();
        bars_lh[index].setContext(context).draw();
    });
}

function setFirstBarConnectors(rh_bar, lh_bar, context){
    var brace = new Vex.Flow.StaveConnector(rh_bar, lh_bar);
    brace.setType(Vex.Flow.StaveConnector.type.BRACE);
    brace.setContext(context).draw();
    
}

function addLeftandRightConnector(rh_bar, lh_bar, context){
    var left = new Vex.Flow.StaveConnector(rh_bar, lh_bar);
    var right = new Vex.Flow.StaveConnector(rh_bar, lh_bar);
    left.setType(Vex.Flow.StaveConnector.type.SINGLE_LEFT);
    right.setType(Vex.Flow.StaveConnector.type.SINGLE_RIGHT);
    left.setContext(context).draw();
    right.setContext(context).draw();
}

function renderBarsMultipleLines(lines, context) {
    for (var i=0; i<lines.length; i+=1) {
        renderBars(lines[i], context);
    }
}

function transposeVoiceMultipleBars(line_multiple_bars, key, timeSig, major_or_minor) {
    //var timeSig = staffSingleLine.timeSig;
    var beatsPer = Number(timeSig[0]);
    var beat_value = Number(timeSig[2]);
    console.log(key);
    var transposedVoices = line_multiple_bars.map(function(singleBar){
        return createTransposedVoice(singleBar, beatsPer, beat_value, key, major_or_minor);
    });
    return transposedVoices;
}




function putLineOnStaff2(line_multiple_bars, staffSingleLine, hand, key, timeSig, major_or_minor, context) {
    var bars_rh = staffSingleLine.bars_rh;
    var bars_lh = staffSingleLine.bars_lh;
    console.log(line_multiple_bars);
    var transposedVoices = transposeVoiceMultipleBars(line_multiple_bars, key, timeSig, major_or_minor)
    if (hand === 'r'){
        transposedVoices.forEach(function(measure, index){
            formatVoice(measure, bars_rh[index], context);
        });
    }
    else if (hand === 'l'){
        transposedVoices.forEach(function(measure, index){
            formatVoice(measure, bars_lh[index], context);
        });
    }
}

function putLineOnStaff(line_multiple_bars, staffMultipleLines, hand, startingBar, key, timeSig, major_or_minor, context){
    //transpose the voice and put it on the staff
    var index = 0;
    transposedVoices = transposeVoiceMultipleBars(line_multiple_bars, key, timeSig, major_or_minor);
    if (hand === 'r'){
        transposedVoices.forEach(function(oneMeasureVoice, index){
            var lineBar = findCorrectBar(staffMultipleLines, startingBar, index, hand);
            formatVoice(oneMeasureVoice, lineBar.bar, context);
            staffMultipleLines[lineBar.line].bars_rh[lineBar.barNumberinLine].voice = oneMeasureVoice;
            index += 1;
        });
    }
    else if (hand === 'l'){
        transposedVoices.forEach(function(oneMeasureVoice, index){
            var lineBar = findCorrectBar(staffMultipleLines, startingBar, index, hand);
            formatVoice(oneMeasureVoice, lineBar.bar, context);
            staffMultipleLines[lineBar.line].bars_lh[lineBar.barNumberinLine].voice = oneMeasureVoice;
            index += 1;
        });
    }
}

function firstBarinStaffLine(staffMultipleLines, startingBar, index){
    var barNumberinLine = (startingBar + index) % barsPerLine;
    return barNumberinLine === 0;
}

function findCorrectBar(staffMultipleLines, startingBar, index, hand){
    var barsPerLine = staffMultipleLines[0].bars_rh.length;
    var line = Math.floor((startingBar + index) / barsPerLine);
    var barNumberinLine = (startingBar + index) % barsPerLine;
    if (hand === 'r'){

        return {line: line, bar: staffMultipleLines[line].bars_rh[barNumberinLine], barNumberinLine: barNumberinLine};
    }
    else {
    
        return {line: line, bar: staffMultipleLines[line].bars_lh[barNumberinLine], barNumberinLine: barNumberinLine};
    }

}



function formatVoice(voice, stave, context) {
    //render a non-transposed voice to the stave
    //var beams = Vex.Flow.Beam.applyAndGetBeams(voice);
    //console.log(voice);
    var beams = beamMeasureByBeat(voice);
    var formatter = new Vex.Flow.Formatter().joinVoices([voice]).formatToStave([voice], stave);
    voice.draw(context,stave);
    beams.forEach(function(beam){
        beam.setContext(context).draw();
    });
}



function formatNotes(notes, stave, context) {
    /// not using this function right now, but can render notes without a voice if you want
    Vex.Flow.Formatter.FormatAndDraw(context, stave, notes);
}


function decideOctaves2(octaves){
    var choices = [2,3,4,5];
    var first = octaves === undefined ? randomChoiceFromArray(choices) : octaves[0];
    choices.splice(choices.indexOf(first), 1);
    var second = octaves === undefined ? randomChoiceFromArray(choices) : octaves[1];

    var firstHand = first < second ? 'l' : 'r';
    var secondHand = firstHand === 'l' ? 'r': 'l';
    var leftClef = Math.min(first, second) <= 3 ? 'bass' : 'treble';
    var rightClef = Math.max(first, second) <= 3 ? 'bass' : 'treble';
    return {l: Math.min(first, second), r: Math.max(first, second), leftClef: leftClef, rightClef: rightClef, firstHand: firstHand, secondHand: secondHand}
}



function setStaff(numBarsPerHand, numPhrases, beatsPerMeasure, beatValue, key, major_or_minor, context, octaves){
    var timeSig = String(beatsPerMeasure) + '/' + String(beatValue);
    var octaves = decideOctaves2(octaves);
    console.log(octaves);
    //var octavesArray = [octaves['l'], octaves['r']]; //should be ordered left to right
    var clefs = [octaves.rightClef, octaves.leftClef]
    // var reverseClefs = octaves.firstHand === 'l' ? clefsInit.reversed : clefsInit.nonReversed;
    var emptyBarLines = makePianoStaffMultipleBars([], numBarsPerHand * numPhrases, 230, 10, clefs);
    //console.log(key);
    addKeyAndTimeSignature(emptyBarLines, timeSig, key);
    renderBarsMultipleLines(emptyBarLines, ctx);

    return {octaves: octaves, emptyBarLines: emptyBarLines, timeSig: timeSig, clefs: clefs}; //right hand clef first now
}

function makeSightReading(numBarsPerHand, numPhrases, beatsPerMeasure, beatValue, key, level, major_or_minor, highestScaleDegree1, highestScaleDegree2, context, octaves){
    var octavesAndClefsAndBars = setStaff(numBarsPerHand, numPhrases, beatsPerMeasure, beatValue, key, major_or_minor, context, octaves);
    var octaves = octavesAndClefsAndBars.octaves;
    var clefs = octavesAndClefsAndBars.clefs;
    console.log(clefs);
    var timeSig = octavesAndClefsAndBars.timeSig;
    var emptyBarLines = octavesAndClefsAndBars.emptyBarLines;
    var firstClef = octaves.firstHand === 'r' ? octaves.rightClef : octaves.leftClef;
    var secondClef = firstClef === octaves.rightClef ? octaves.leftClef : octaves.rightClef;
    var firstHand = {hand: octaves.firstHand, highestScaleDegree: highestScaleDegree1, clef: firstClef};
    var secondHand = {hand: octaves.secondHand, highestScaleDegree: highestScaleDegree2, clef: secondClef};
    
    var handOrder = [firstHand, secondHand];
    for (var i=2; i<numPhrases; i+=1){
        handOrder.push(randomChoiceFromArray([firstHand, secondHand]));
    }
    var openClosed = ['open', 'closed'];
    //console.log(clefs);

    var phrases = [];
    for (var i=0; i<numPhrases; i+=1){
        phrases.push(makeLineRhythmsFirst(beatsPerMeasure, numBarsPerHand, level, handOrder[i].highestScaleDegree, openClosed[i % 2]));
    }
    phrases = phrases.map(function(currentVal, index){
        var currentHand = handOrder[index].hand;
        var currentClef = handOrder[index].clef;
        return generateLine(currentVal.rhythms, currentVal.melody, octaves[currentHand], currentClef, numBarsPerHand);
    })
    var measureCounter = 0;
    phrases.forEach(function(phrase, index){
        addFingeringFirstNoteOfLine(phrase.notes, phrase.steps, handOrder[index].hand, handOrder[index].highestScaleDegree);
        //check whether we're in the first note of a staff line. if so, add fingering
        //console.log(phrase);
        addFingeringFirstNoteOfStaffLines(phrase, measureCounter, emptyBarLines, handOrder[index].hand, handOrder[index].highestScaleDegree);
        putLineOnStaff(phrase.notes, emptyBarLines, handOrder[index].hand, measureCounter, key, timeSig, major_or_minor, context);
        measureCounter += numBarsPerHand;
    });
    //need to modify fingering function to search for hand, not clef
    return {beatsPerMeasure: beatsPerMeasure, numBarsPerHand: numBarsPerHand, 
        beatValue: beatValue, key: key, major_or_minor: major_or_minor, timeSig: timeSig,
        phrases: phrases, clefs: clefs, firstHand: firstHand, secondHand: secondHand, handOrder: handOrder, numPhrases: numPhrases};
}

function addFingeringFirstNoteOfStaffLines(phrase, measureNumber, emptyBarLines, hand, highestScaleDegree){
    var numStaffLines = emptyBarLines.length;
    var barsPerStaffLine = emptyBarLines[0].bars_rh.length;
    var phraseLength = phrase.notes.length;
    var startInLine = measureNumber % barsPerStaffLine;
    //measurenumber = 7, barsperstaffline = 6
    var newLineMeasureNumber = barsPerStaffLine - (measureNumber % barsPerStaffLine);
    if (newLineMeasureNumber !== 0 && newLineMeasureNumber < phraseLength){
        //onsole.log(phrase.not[newLineMeasureNumber])
        console.log(phrase.notes[newLineMeasureNumber][0]);
        addFingering(phrase.notes[newLineMeasureNumber][0], decideFingering(phrase.steps[newLineMeasureNumber][0], hand, highestScaleDegree));
    }
}


function makeRandomSightreading(level, numPhrases, standardFiveFingerOrNot, context, key, major_or_minor, beatsPer, beatValue, octaves){
    var numbars = 4;
    var distance_from_top = 10;
    var context = ctx;
    var keyObject = key === undefined ? decideKey(level) : {key: key, major_or_minor: major_or_minor};
    var timeSig = beatsPer === undefined ? decideTimeSig(level) : {beatsPerMeasure: beatsPer, beatValue: beatValue};
    var highestScaleDegrees = decideHighFingerChoice(standardFiveFingerOrNot, keyObject);
    //console.log(highestScaleDegrees);
    var octaveChoice = octaves === true ? [3,4] : undefined;
    console.log(octaveChoice);
    return makeSightReading(numbars, numPhrases, timeSig.beatsPerMeasure, timeSig.beatValue, keyObject.key, level, keyObject.major_or_minor, highestScaleDegrees[0], highestScaleDegrees[1], context, octaveChoice);
}

function decideHighFingerChoice(standardFiveFingerOrNot, keyObject){
    if (standardFiveFingerOrNot === true){
        return [4, 4];
    }
    else if (keyObject.major_or_minor === 'M'){
        return shuffleArray([4, 2]);
    }
    return [4,4];
}

function decideTimeSig(level){
    if (level === 1 || level === 2){
        var beatValue = 4;
        var beatsPerMeasure = randomChoiceFromArray([3, 4]);
    }
    else if (level === 3){
        var beatValue = 4;
        var beatsPerMeasure = randomChoiceFromArray([2, 3, 4]);
    }
    return {beatsPerMeasure: beatsPerMeasure, beatValue: beatValue};
}
function decideKey(level){
    if (level === 1){
        var major_minor_combos = [[0, 'M'], [0, 'm'], [7, 'M'], [5, 'm'], [5, 'm']];
        
    }
    else if (level === 2 || level === 3){
        var major_minor_combos = [[0, 'M'], [0, 'm'], [7, 'M'], [7, 'm'], [2, 'M'], [4,'M'], [9, 'M'], [5, 'm'], [5, 'M'], [7, 'm'], [5, 'm'], [3, 'm']];
    }
    var major_minor_combo = randomChoiceFromArray(major_minor_combos);
    return {key: major_minor_combo[0], major_or_minor: major_minor_combo[1]};
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

// function decideHighestFingerChoice(major_minor_combo, level){
//     var major_or_minor = major_minor_combo[1];
//     if (major_or_minor === 'm'){
//         return 4;
//     }
//     else {
//         var fingerChoices = [2,4];
//         var choice = fingerChoices[Math.floor(Math.random() * fingerChoices.length)];

//     }
//     if (checkThumbOnSharpSeven(major_minor_combo, choice) === true) {
//         return decideHighestFingerChoice(major_minor_combo, level);
//     }
//     else {
//         return choice;
//     }
// }

// function checkThumbOnSharpSeven(key, highestScaleDegree){
//     if (highestScaleDegree === 3){
//         return true;
//     }
//     return false;
// }

// function makeSightreading(numBars, beatsPer, key, level, hand, barsPerLine, distance_from_top, context, major_or_minor, highestScaleDegree1, highestScaleDegree2) {
//     /// randomly generate a sightreading exercise, generating rhythms and scale steps in a line in each hand separately
//     // then transposing to the given key
    

//     //only quarter note beats now. fix this!!!
//     var timeSig = String(beatsPer) + '/' + '4'

//     var first_hand = hand;
//     var second_hand = hand === 'r' ? 'l' : 'r';
     
//     var firstClef = first_hand == 'r' ? 'treble' : 'bass';
//     var secondClef = first_hand == 'r' ? 'bass' : 'treble';

//     var first_octave = decideOctaves(first_hand, key)[0];
//     var second_octave = decideOctaves(second_hand, key)[0];


//     var TwoSystems = makePianoStaffMultipleLines(key, timeSig, barsPerLine, 2, distance_from_top, context, major_or_minor);
//     // var rhythms_r = makeRhythms(numBars, beatsPer, level);
//     // var steps_r = makeSteps(rhythms_r, 4, level, 'open');
//     var r = makeLineRhythmsFirst(beatsPer, numBars, level, highestScaleDegree1, 'open');
//     var rhythms_r = r.rhythms;
//     var steps_r = r.melody;
//     // start in measure 0
//     var start = 0;
//     var line1 = generateLine(rhythms_r, steps_r, first_octave, firstClef, barsPerLine);
//     addFingeringFirstNoteOfLine(line1.notes, line1.steps, firstClef, highestScaleDegree1);

//     start += numBars;
//     // var rhythms_l = makeRhythms(numBars, beatsPer, level);
//     // var steps_l = makeSteps(rhythms_l, 4, level, 'closed');
//     var l = makeLineRhythmsFirst(beatsPer, numBars, level, highestScaleDegree2, 'closed');
//     var rhythms_l = l.rhythms;
//     var steps_l = l.melody;
//     var line2 = generateLine(rhythms_l, steps_l, second_octave, secondClef, barsPerLine);
//     addFingeringFirstNoteOfLine(line2.notes, line2.steps, secondClef, highestScaleDegree2);

//     renderBarsMultipleLines(TwoSystems, context);
//     putLineOnStaff2(line1.notes, TwoSystems[0], first_hand, key, timeSig, major_or_minor, context);
//     putLineOnStaff2(line2.notes, TwoSystems[1], second_hand, key, timeSig, major_or_minor, context);
//     return {firsthand: hand, line1: line1, line2: line2, major_or_minor: major_or_minor};
// }

// function makeRandomSightReading(numBars, level, barsPerLine, distance_from_top, context, standardFiveFingerOrNot) {
//     // has to be 6 bar length lines for now. fix this!!
//     // 8 bars total;
//     var first_hand = ['r', 'l'];
//     var hand = first_hand[Math.floor(Math.random() * first_hand.length)];
//     var beats = [3, 4];
//     var beatsPer = beats[Math.floor(Math.random() * beats.length)];
//     if (level === 2 || level === 3) {
//         var major_minor_combos = [[0, 'M'], [0, 'm'], [7, 'M'], [7, 'm'], [2, 'M'], [4,'M'], [9, 'M'], [5, 'm'], [5, 'M'], [7, 'm'], [5, 'm'], [3, 'm']];
//     }
//     else {
//         var major_minor_combos = [[0, 'M'], [0, 'm'], [7, 'M'], [5, 'm'], [5, 'm']];
        
//     }
//     var major_minor_combo = major_minor_combos[Math.floor(Math.random() * major_minor_combos.length)];
//     var key = major_minor_combo[0];
//     var major_or_minor = major_minor_combo[1];
//     if (standardFiveFingerOrNot === false && major_or_minor === 'M'){
//         var highestScaleDegrees = [2, 4];
//         shuffleArray(highestScaleDegrees);
//         var highestScaleDegree1 = highestScaleDegrees[0];
//         var highestScaleDegree2 = highestScaleDegrees[1];

//     }
//     else {
//         var highestScaleDegree1 = 4;
//         var highestScaleDegree2 = 4;
//     }
//     console.log(major_or_minor);
//     console.log(highestScaleDegree1);
//     console.log(highestScaleDegree2);
//     var score = makeSightreading(numBars, beatsPer, key, level, hand, barsPerLine, distance_from_top, context, major_or_minor, highestScaleDegree1, highestScaleDegree2);
//     return {line1: score.line1, line2: score.line2, firsthand: score.firsthand, beatsPer: beatsPer, keySig: key, major_or_minor: major_or_minor};
// }

