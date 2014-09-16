//the next three functions are some very basic composing algorithms based on scale degrees. 
// nothing exciting here
function makeRhythms(numMeasures, beatsPer) {
    // 4/4 or 3/4 time only. quarter notes only on non-strong beats. returns 
    //a nested array with the rhythms in each measure as strings, readable to vexflow as vexflow rhythms (ie, kinda cryptic)
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
        if (beat === 0) { //|| beat == beatsPer/2) {
            randNum = Math.random();
            if (randNum < 0.4) {
                rhythms[measures].push('q');
                beat += 1;
            }
            else if (randNum < 0.8) {
                rhythms[measures].push('h');
                beat += 2;
            }
            else {
                //console.log(randNum);
                rhythms[measures].push('hd');
                beat += 3;
            }
        }
        else if (beat == beatsPer/2) {
            if (randNum < 0.5) {
                rhythms[measures].push('q');
                beat += 1;
            }
            else { //if randNum < 0.9 {
                rhythms[measures].push('h');
                beat += 2;
            }
            // else {
            //     rhythms[measures].push('q');
            //     rhythms[measures].push('qr');
            //     beat +=2; 
            // }

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

function makeSteps(rhythms_nested, pinkyDegree, level, open_or_closed) {
    //combines the rhythms and generates a bunch of scale degrees to go along with.
    // returns a nested array, where each index is a single measure
    // open phrase starts on tonic and ends anywhere
    // closed phrase starts anywhere and ends on tonic
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