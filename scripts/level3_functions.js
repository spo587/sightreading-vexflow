

//psuedocode

//randomly choose a scale degree with simple heuristics:

//1. prefer steps

//2. prefer continuity of direction

//3. prefer novelty, ie, don't repeat same scale degrees too many times in too close a window

//4. resolve leaps in opposite direction

//5. compose scale degrees first, then rhythms



///need to store scale degrees, count of scale degrees, intervals and count of intervals all in an object
// as we add to the melody




function randomIntFromInterval(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}

function makeMelody(remainingLengthLessOne, melody){
    if (melody === undefined){
        var melody = {scaleDegrees: [0], intervals: [], intervalCounts: {step:0, skip:0, leap:0, repeat:0}, fifthDegreePosition: randomIntFromInterval(1,length)}
    }
    if (remainingLengthLessOne === 0){
        return melody;
    }
    melody = addToMelody(melody);
    return makeMelody(remainingLengthLessOne - 1, melody);
}

// function getIntervals(soFar, melodyScaleDegrees, remainingLength){
//     if (melodyScaleDegrees.length === 0){
//         return soFar
//     }
//     else {
//         return soFar.push(getIntervals(soFar, ))
//     }
//     var firstInterval = melodyScaleDegrees[soFar.length + 1] - melodyScaleDegrees[soFar.length];
//     return soFar.push(getIntervals())

// }

// function createMelody(length){
//     //start on tonic
//     var melody = {scaleDegrees: [0], intervals: [], intervalCounts: {step:0, skip:0, leap:0}, fifthDegreePosition: randomIntFromInterval(1,length)}
//     for (var i=0, i<length; i+=1){
//         melody = addToMelody(melody)
//     }
//     return melody
// }

function addToMelody(melody){
    //adds the next note to the melody, updates the other properties and returns the melody
    // if (melody.scaleDegrees.length === melody.fifthDegreePosition){
    //     melody = addFifthDegree(melody);
    // }
    if (needResolvingStep(melody)){
        melody = addResolvingStep(melody);
    }   
    else if (needStep(melody) || melody.scaleDegrees.length === melody.fifthDegreePosition - 1){
        //this function will need the heuristics broken down?
        melody = addStep(melody);
    }
    else {
        // more heuristics here
        melody = addStepOrSkipOrRepeat(melody);
    }
    return melody;
}

function addTheNote(nextNote, melody){
    var currentNote = melody.scaleDegrees[melody.scaleDegrees.length - 1];
    var nextInterval = nextNote - currentNote;
    melody.intervals.push(nextInterval);
    melody.intervalCounts[skipStepLeap(nextInterval)] += 1;
    melody.scaleDegrees.push(nextNote);
    return melody
}

function addFifthDegree(melody){
    return addTheNote(4, melody);
}

function skipStepLeap(nextInterval){
    if (Math.abs(nextInterval) === 0 ){
        return 'repeat';
    }
    else if (Math.abs(nextInterval) === 1){
        return 'step';
    }
    else if (Math.abs(nextInterval) === 2) {
        return 'skip';
    }
    else {
        return 'leap';
    }
}

function needResolvingStep(melody){
    var lastTwoIntervals = melody.intervals.slice(melody.intervals.length - 2, melody.intervals.length)
    //1, 2 or -1, -2
    if (Math.abs(melody.intervals[melody.intervals.length - 1]) > 2) {
        return true;
    }
    else if (lastTwoIntervals === [1,2] || lastTwoIntervals === [-1,-2]) {
        return true
    }
    else {
        return false;
    }
}

function addResolvingStep(melody){
    if (melody.intervals[(melody.intervals.length - 1)] < 0){
        melody = addStepUp(melody);
    }
    else {
        melody = addStepDown(melody);
    }
    return melody;
}

function addStepUp(melody){
    var nextNote = melody.scaleDegrees[melody.scaleDegrees.length - 1] + 1;
    
    return addTheNote(nextNote, melody);
}

function addStepDown(melody){
    var nextNote = melody.scaleDegrees[melody.scaleDegrees.length - 1] - 1;
    return addTheNote(nextNote, melody);
}

function needStep(melody){
    if (melody.intervalCounts.leap + melody.intervalCounts.skip > melody.intervalCounts.step){
        return true;
    }
    else {
        return false;
    }
}

function addStep(melody){
    var currentNote = melody.scaleDegrees[melody.scaleDegrees.length - 1];
    var possibles = stepsFromCurrentNote(currentNote);
    var nextNote = possibles[Math.floor(Math.random() * possibles.length)];
    return addTheNote(nextNote, melody);
}

function addStepOrSkipOrRepeat(melody){
    var currentNote = melody.scaleDegrees[melody.scaleDegrees.length - 1];
    var possibles = decidePossibles(melody);
    if (Math.random() < 0.8){
        console.log('should be removing repeated');
        possibles = removeRepeatNoteAsNextOption(melody, possibles);
    }
    var nextNote = possibles[Math.floor(Math.random() * possibles.length)];
    //remove repeated note as an option some of the time
    return addTheNote(nextNote, melody); 
}

function removeRepeatNoteAsNextOption(melody, possibles){
    if (possibles.indexOf(melody.scaleDegrees.length - 1) !== -1 && possibles.length > 1){
        //last note of the melody
        var index = possibles.indexOf(melody.scaleDegrees.length - 1);
        possibles.splice(index, 1);

    }
    return possibles;
}

function decidePossibles(melody){
    if (melody.intervals.length === 0){
        return [0,1,2,3,4];
    }
    var lastInterval = melody.intervals[melody.intervals.length - 1];
    var currentNote = melody.scaleDegrees[melody.scaleDegrees.length - 1];
    //var lastTwoIntervals = melody.intervals.slice(melody.intervals.length - 2, melody.intervals.length);
    if (lastInterval < 0) { //last interval down, no leaps down allowed
        var lowest = currentNote - 2 >= 0 ? currentNote - 2 : 0;
        var possibles = randomIntFromInterval(lowest, 4);
        return [possibles];
    }
    else if (lastInterval > 0){
        var highest = currentNote + 2 <= 4 ? currentNote + 2 : 4
        var possibles = randomIntFromInterval(0, highest);
        return [possibles];
    }
    else {
        return decidePossibles(melodyMinusOne(melody))
    }

}

function melodyMinusOne(melody){
    var abbreved = {scaleDegrees: melody.scaleDegrees.slice(0,melody.scaleDegrees.length - 1), 
        intervals: melody.intervals.slice(0, melody.intervals.length - 1)};
    return abbreved;
}

function stepsFromCurrentNote(currentNote){
    if (currentNote === 0){
        return [1];
    }
    else if (currentNote === 4){
        return [3];
    }
    else {
        return [currentNote + 1, currentNote - 1];
    }
}

function translateMelody(melody){
    var scaleDegrees = melody.scaleDegrees;
    for (var i=0; i<scaleDegrees.length; i+=1){
        scaleDegrees[i] = String(scaleDegrees[i]);
    }
    return scaleDegrees;
}

function nextHierarchicBeat2(beatsPer, currentBeat){
    var divider = beatsPer % 3 === 0 ? 3 : 2;
    if (currentBeat === 0){
        return beatsPer;
    }
    else {
        return nextHierarchicBeat2(beatsPer/divider, currentBeat%(beatsPer/divider));
    }
}

//never let ratio of skips to steps go above 1

//choose a random point in the melody to put the fifth scale degree

// randomly fill in the other notes with weights toward 1, 3

//decide a contour first? or tones in the outline?



//new idea: add notes in at different parts of the measure. maybe even bypass rhythms using the hierarchic
// function. proceed by eighth note, can be no longer than nexthierarchicbeat2. eighth notes always move by step.




