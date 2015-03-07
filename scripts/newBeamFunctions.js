function beamMeasureByBeat(voice){
    var beatsPerMeasure = voice.totalTicks.numerator / 4096;
    console.log(beatsPerMeasure);
    var beams = [];
    for (var i=0; i<beatsPerMeasure; i+=1){
        var empty = [];
        console.log(i);
        var beatNotes = beatOfNotes(empty, voice.tickables, i, 1);
        console.log(beatNotes);
        console.log('next line');
        if (beatNotes.length > 1){
                console.log('adding beam');
                beams.push(new Vex.Flow.Beam(beatNotes));
            }
        }
        
    return beams;
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