// //the next three functions are some very basic composing algorithms based on scale degrees. 
// // nothing exciting here


function NextStepDegree(currentScaleDegree, pinkyDegree, level) {
    //for five finger position only. gives you the next scale degree, based on a current one. 
    // up a step, down a step, repeat, or up a skip, down a skip
    // pinkyDegree argument gives option of going outside tonic five-finger posish. most of the time it 
    //will just be 4
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

function stepsAway(level){
    if (level == 1){
        return 1;
    }
    else if (level == 2){
        var possibles = range(2,1);
        return possibles[Math.floor(Math.random() * possibles.length)];

    }
    else if (level == 3) {
        var possibles = range(3, 1);
        return possibles[Math.floor(Math.random() * possibles.length)];
    }
}

var arrayUnique = function(a) {
    return a.reduce(function(p, c) {
        if (p.indexOf(c) < 0) p.push(c);
        return p;
    }, []);
};

function findLastEntryOf(arr, number) {
    var finalEntry = -1;
    for (var i=0; i<arr.length; i+=1){
        if (arr.indexOf(number, i) > -1) {
            finalEntry = i;
        }
    }
    return finalEntry;
}

function followInArray(arr, first, later) {
    //checks whether the later number follows instances of the first entry
    var check = findLastEntryOf(arr, first);
    if (check > -1){
        return findLastEntryOf(arr, later) > check;

    }
    else {
        return true;
    }

}

function chooseStepsAway(i, level, notes) {
    //console.log(i);
    //console.log(level);
    //console.log(notes);
    var lastInterval = false;
    var possibles = ['0', '1', '2', '3', '4'];
    lastNote = notes[i - 1];
    if (notes.length >= 2){
        console.log(lastNote);
        console.log(notes[i-2]);
        lastInterval = Number(notes[i - 1] - Number(notes[i - 2]));
        console.log(lastInterval);
    }
    // if (lastNote === '3' && lastInterval === '2') {
    //     console.log('this happened!!')
    //     return '2';
    // }
    lastNoteIndex = possibles.indexOf(lastNote);
    var up = Number(notes[i - 1]) < 4 ? stepsAway(level) : 0;
    var down = Number(notes[i - 1]) > 0 ? -stepsAway(level) : 0;
    var stay = 0;
    ///check for repeated notes?? 
    var choices = arrayUnique([stay, up, down]);
    var randNumWeighted = Math.pow(Math.random(), 0.4);
    var change = choices[Math.floor(randNumWeighted * choices.length)];
    var nextIndex = lastNoteIndex + change;
    if ([0,1,2,3,4].indexOf(nextIndex) > -1) {
        var nextNote = possibles[nextIndex];
        return nextNote;
    }
    
    else {
        console.log('looping through again');
        return chooseStepsAway(i, level, notes);
    }
}


function makeLineLevel1(rhythms, open_or_closed, level) {
    // return an array of numbers 0 through 4 for scale degrees, that adheres 
    // to a few heuristics. 1) range heuristic: must be for at least 4 fingers
    // 2) scale degree 4 heuristic: must be resolved to scale degree 3 later in sequence
    var numnotes = 0;

    for (var i=0; i<rhythms.length; i++) {
        numnotes += rhythms[i].length;    //find out how many total notes there are in rhythms array
    }
    //console.log(numnotes);
    var notes = ['0'];
    for (var i=1; i<numnotes; i+=1){

        var nextNote = chooseStepsAway(i, level, notes);

        notes.push(nextNote);
    }
    if (open_or_closed === 'closed'){
        notes.reverse();
    }
    if (arrayUnique(notes).length >= 4 && followInArray(notes, '3', '2')) {
        var notes_with_meter = [];
    // put the steps in nested arrays, each inner array for a single measure
        var ind = 0;
        for (var j=0; j<rhythms.length; j++) {
            notes_with_meter.push([]);
            for (var k=0; k<rhythms[j].length; k++) {
                notes_with_meter[j].push(notes[k+ind]);
            }
            ind += rhythms[j].length;
        }
        //console.log(notes_with_meter);
        return notes_with_meter;
    }
    else {
        return makeLineLevel1(rhythms, open_or_closed, level);
    }

}

function makeSteps(rhythms_nested, pinkyDegree, level, open_or_closed) {
    //combines the rhythms and generates a bunch of scale degrees to go along with.
    // returns a nested array, where each index is a single measure
    // open phrase starts on tonic and ends anywhere
    // closed phrase starts anywhere and ends on tonic
    //if (level === 1){
    return makeLineLevel1(rhythms_nested, open_or_closed, level);
    //}
    
    var numnotes = 0;
    for (var i=0; i<rhythms_nested.length; i++) {
        numnotes += rhythms_nested[i].length;    //find out how many total notes there are in rhythms array
    }
    var notes = [];
    if (open_or_closed == 'closed') {
        notes.push('0'); // this ensures closed melody will always end on tonic.
        for (var i=1; i<numnotes; i++) {
            notes.push(NextStepDegree(notes[i-1], pinkyDegree, level));  //build simple array of scale degrees
        }
        var finalNotes = notes.reverse()
    }
    else { //open melody
        var beginningNotes = []; //lets compose the melody from the front and the back, they'll meet in the middle
        // var endNotes = [];
        // var possible_notes = ['2', '4']; //open melody ends on 3rd of 5th scale degree
        // var firstNote = possible_notes[Math.floor(Math.random() * possible_notes.length)];
        // endNotes.push(firstNote); //end on 3rd or 5th
        beginningNotes.push('0');
        //console.log(numnotes);
        for (var i = 1; i < numnotes; i += 1) {
            //endNotes.push(NextStepDegree(endNotes[i - 1], pinkyDegree, level));
            beginningNotes.push(NextStepDegree(beginningNotes[i - 1], pinkyDegree, level));
            }
            // endNotes.reverse();
            // console.log(beginningNotes);
            // console.log(endNotes);
            
            
            // if (endNotes.length + beginningNotes.length !== numnotes) {
            //     console.log('lengths dont match');
            //     beginningNotes.push(NextStepDegree(beginningNotes[i-1], pinkyDegree, level));
            
            
            var finalNotes = beginningNotes //.concat(endNotes);
            //console.log(finalNotes)
        
        
    }
    
    //notes.reverse();
    var notes_with_meter = [];
    // put the steps in nested arrays, each inner array for a single measure
    var ind = 0;
    for (var i=0; i<rhythms_nested.length; i++) {
        notes_with_meter.push([]);
        for (var j=0; j<rhythms_nested[i].length; j++) {
            notes_with_meter[i].push(finalNotes[j+ind]);
        }
        ind += rhythms_nested[i].length;
    }
    return notes_with_meter;
}



function round(num, roundTo) {
    num = Math.round(num * 1 / roundTo) / (1 / roundTo);
    return num
}


function nextHierarchicBeat(beatsPer, currentBeat) {
    //returns the number of beats to the next beat one level up in the hierarchy
    if (currentBeat == 0) {
        return beatsPer
    }
    else {
        if (beatsPer / 2 == round(beatsPer/2, 1)) {
            nextLevel = beatsPer / 2;
            return nextHierarchicBeat(nextLevel, currentBeat % nextLevel);
        }
        else if (beatsPer / 3 == round(beatsPer / 3, 1)) {
            nextLevel = beatsPer / 3;
            return nextHierarchicBeat(nextLevel, currentBeat % nextLevel);
        }
        else {
            //on a half beat
            nextLevel = beatsPer / 2;
            return nextHierarchicBeat(nextLevel, currentBeat % nextLevel);
        }
    }
}


function range(num, increment){
    var arr = []
    for (var i = increment; i < num + 0.5; i+= increment){
        arr.push(i);
    }
    return arr;
}

function nextRhythm(beatsPer, currentBeat, level) {
    var shortestDurationDict = {1:1, 2:1, 3:0.5}
    var longestDuration = nextHierarchicBeat(beatsPer, currentBeat);
    var possibles = range(longestDuration, shortestDurationDict[level]);
    //console.log(possibles);
    randNumWeighted = Math.pow(Math.random(),1.3);
    var duration = possibles[Math.floor(randNumWeighted * possibles.length)];
    /// not ready for ties quite yet, change this to deal with ties later
    if (duration != 2.5 && duration != 3.5 && duration != 4 && duration != 0) {
        //console.log(duration);
        return duration;
    }
    else {
        return nextRhythm(beatsPer, currentBeat, 1);
    }
}




function durationToVex(duration, beatsPer) {
    var durationToVexDict = {4:'w', 3:'hd', 2:'h', 1:'q', 1.5:'qd', 0.5:'8'};
    if (beatsPer <= 4) {
        return durationToVexDict[duration];
    }
}

function vexToDuration(vexNote, beatsPer) {
    var vexToDurationDict = {'w':4, 'hd':3, 'h': 2, 'q':1, 'qd':1.5, '8':0.5};
    var dot = 0;
    if (vexNote.dots !== 0) {
        dot = 0.5;
    }
    if (beatsPer <= 4) {
        var base = vexToDurationDict[vexNote.duration] 
        return base + dot*base;
    }
}

function makeRhythms(numMeasures, beatsPer, level) {
    var rhythms = [];
    for (var i=0; i<numMeasures - 1; i+=1) {
        rhythms.push([]);
        var beat = 0;
        while (beat < beatsPer) {
            var next = nextRhythm(beatsPer, beat, level);
            rhythms[i].push(durationToVex(next, beatsPer));
            beat += next;
        }
    }
    rhythms.push([durationToVex(beatsPer, beatsPer)]);
    return rhythms;
}

function stepsAway(level){
    if (level === 1){
        return 1;
    }
    else if (level === 2){
        var possibles = range(2,1);
        return possibles[Math.floor(Math.random() * possibles.length)];

    }
    else if (level === 3) {
        var possibles = range(3, 1);
        return possibles[Math.floor(Math.random() * possibles.length)];
    }
}




// function makeRhythms(numMeasures, beatsPer) {
//     // 4/4 or 3/4 time only. quarter notes only on non-strong beats. returns 
//     //a nested array with the rhythms in each measure as strings, readable to vexflow as vexflow rhythms (ie, kinda cryptic)
//     if (beatsPer === undefined) {
//         beatsPer = 4;
//     }
//     var rhythms = [];
//     for (var i=0; i<numMeasures; i++) {
//         rhythms.push([]);
//     }
//     var beat = 0;
//     var measures = 0;
//     while (measures < numMeasures-1) {
//         if (beat > beatsPer-1) {
//             beat = beat % beatsPer;
//             measures += 1;
//         }
//         if (beat === 0) { //|| beat == beatsPer/2) {
//             randNum = Math.random();
//             if (randNum < 0.4) {
//                 rhythms[measures].push('q');
//                 beat += 1;
//             }
//             else if (randNum < 0.8) {
//                 rhythms[measures].push('h');
//                 beat += 2;
//             }
//             else {
//                 //console.log(randNum);
//                 rhythms[measures].push('hd');
//                 beat += 3;
//             }
//         }
//         else if (beat == beatsPer/2) {
//             if (randNum < 0.5) {
//                 rhythms[measures].push('q');
//                 beat += 1;
//             }
//             else { //if randNum < 0.9 {
//                 rhythms[measures].push('h');
//                 beat += 2;
//             }
//             // else {
//             //     rhythms[measures].push('q');
//             //     rhythms[measures].push('qr');
//             //     beat +=2; 
//             // }

//         }
//         else {
//             rhythms[measures].push('q');
//             beat += 1;
//         }
//     }
//     rhythms.slice(-1)[0][0] = beatsPer == 4 ? '1' : 'hd';
//     return rhythms;
// }