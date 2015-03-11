function beamMeasureByBeat(voice){
    var beatsPerMeasure = voice.totalTicks.numerator / 4096;
    console.log(beatsPerMeasure);
    var beams = [];
    for (var i=0; i<beatsPerMeasure; i+=1){
        var empty = [];
        console.log(i);
        var beatNotes = beatOfNotes(empty, voice.tickables, i, 1);
        //now deal with the stem directions bug. if the beamed notes have different stem 
        //directions, we have to change them so they're all the same
        if (!stemDirectionsSame(beatNotes)){
            makeStemDirectionsSame(beatNotes)
        }
        console.log(beatNotes);
        console.log('next line');
        if (beatNotes.length > 1){
                console.log('adding beam');
                beams.push(new Vex.Flow.Beam(beatNotes));
            }
        }
        
    return beams;
}

function stemDirectionsSame(notes){
    //return true if all stems are in the same direction. otherwise, return false
    var directions = [];
    notes.forEach(function(note){
        directions.push(note.stem_direction);
    });
    return arrayUnique(directions).length === 1;
}

function makeStemDirectionsSame(notes){
    var direction = decideStemDirection(notes);
    //for now, let's just make it a downstem, but fix this later
    notes.forEach(function(note){
        note.stem_direction = direction;
    });
}

function decideStemDirection(notes){
    var middle = 3; //third line is middle of staff, reference for beam
    var upOrDown = notes.reduce(function(previous, current){
        console.log(Math.abs(current.max_line - 3));
        return Math.abs(current.max_line - 3) > previous ? current.max_line : previous;
    }, 0);
    console.log(upOrDown);
    return upOrDown > 0 ? 1 : -1;
}


function beatOfNotes(soFar, voiceNotes, beatStart, beatRemaining){
    if (beatRemaining === 0){
        return soFar
    }
    else {
        var note = getNote(voiceNotes, beatStart);
        if (note){
            soFar.push(note);
        }
        //only deal with 8th notes, for now
        return beatOfNotes(soFar, voiceNotes, beatStart + 0.5, beatRemaining - 0.5);

    }
}

function getNote(notes, beat){
    if (beat === 0){
        return notes[0];
    }
    else if (beat < 0){
        return undefined;
    }
    else {
        var move = getDuration(notes[0]);
        return getNote(notes.slice(1), beat - move);
    }
}



function getDuration(note){
    //return fractions of a total beat
    if (note !== undefined){
        return note.ticks.numerator / 4096;
    }
    return 0;

}