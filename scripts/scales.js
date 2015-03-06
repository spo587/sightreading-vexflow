// a constructor function for the scale abstraction
function SharpMajorScale(halfStepsFromC) {
    //constructor with a steps property, with k,v pairs corresponding to scale degree : note name, and 
    // this.reverse_steps, which gives the reverse
    // also, a scalestepstohalfsteps property, which takes scale steps (eg, 1#) and tells you how many half steps 
    // above the tonic note
    //all indexed to 0
    var transpose_dict_sharp_from_c = {0: 'C', 1:'C#', 2:'D', 3:'D#', 4:'E', 5:'F', 6:'F#', 7:'G', 8:'G#', 9:'A', 10:'A#', 11:'B'};
    var transpose_dict_flat_from_c = {0: 'C', 1: 'Db', 2:'D', 3: 'Eb', 4:'E', 5:'F', 6:'Gb', 7:'G', 8: 'Ab', 9: 'A', 10: 'Bb', 11:'B'}
    var sharps = [0, 2, 4, 6, 7, 9, 11]; // sharp major scales, half steps up from c
    var flats = [1, 3, 5, 8, 10]; //flat major scales, half steps up from c
    if (flats.indexOf(halfStepsFromC) > -1) {
        var transposeDict = transpose_dict_flat_from_c;
        this.flatorsharp = 'flat'
    }
    else {
        var transposeDict = transpose_dict_sharp_from_c;
        this.flatorsharp = 'sharp'
    }
    this.steps = {};
    this.steps = {'0':transposeDict[halfStepsFromC]};
    var scaleSteps = [0, 2, 4, 5, 7, 9, 11];
    for (var i=1; i<7; i+=1) {
        //add all 7 scale steps to the major scale and store in this.steps
        this.steps[i] = transposeDict[(scaleSteps[i] + halfStepsFromC) % 12];
    }
    //add chromatic notes, sharps and flats
    for (var prop in this.steps) {
        if (this.steps.hasOwnProperty(prop)) {
            this.steps[prop + '#'] = this.steps[prop] + '#';
            //flat sharp should be natural
            if (this.steps[prop + '#'].slice(1) === 'b#') { // ie, b flat sharp, in f major, for instance
                this.steps[prop + '#'] = this.steps[prop].slice(0,1);
            }
            this.steps[prop + 'b'] = this.steps[prop] + 'b';
            //sharp flat should be natural
            if (this.steps[prop + 'b'].slice(1) === '#b') {
                this.steps[prop + 'b'] = this.steps[prop].slice(0,1);
            }

        }
    }
    //create the reverse dict
    //have to fix below for flat scales
    this.steps_reverse = {};
    for (var prop in this.steps) {
        if (this.steps.hasOwnProperty(prop)) {
            this.steps_reverse[this.steps[prop]] = prop;
        }
    }
    this.halfStepsFromC = halfStepsFromC;
    this.scaleStepsToHalfSteps = {0:0, 1:2, 2:4, 3:5, 4:7, 5:9, 6:11};
    for (var prop in this.scaleStepsToHalfSteps) {
        if (this.scaleStepsToHalfSteps.hasOwnProperty(prop)) {
            this.scaleStepsToHalfSteps[prop + '#'] = this.scaleStepsToHalfSteps[prop] + 1;
            this.scaleStepsToHalfSteps[prop + 'b'] = this.scaleStepsToHalfSteps[prop] - 1;
        }
    }
    this.tonic = this.steps[0];
}

//uses the major scale to adjust for relative minor
function SharpMinorScale(halfStepsFromC_of_rel_maj) {
    this.relativeMajor = new SharpMajorScale(halfStepsFromC_of_rel_maj);
    this.steps = {};
    // move all of the relative major's properties down two steps
    for (var prop in this.relativeMajor.steps) {
        if (this.relativeMajor.steps.hasOwnProperty(prop) && Number(prop)) { //no sharps or flats
            this.steps[(Number(prop) + 2) % 7] = this.relativeMajor.steps[prop];
        }
        else if (this.relativeMajor.steps.hasOwnProperty(prop) && prop.length === 2) { //accidental
            this.steps[((Number(prop.slice(0,1)) + 2) % 7) + prop.slice(1)] = this.relativeMajor.steps[prop];
        }
    }
    this.steps[2] = this.relativeMajor.steps[0];  //not sure why the above didn't do this....okay for now
    //create the reverse mapping
    this.steps_reverse = {};
    for (var prop in this.steps) {
        if (this.steps.hasOwnProperty(prop)) {
            this.steps_reverse[this.steps[prop]] = prop;
        }
    }
    this.scaleStepsToHalfSteps = {0:0, 1:2, 2:3, 3:5, 4:7, 5:6, 6:10};
    this.halfStepsFromC = (halfStepsFromC_of_rel_maj - 3 + 12) % 12;
    this.tonic = this.steps[0];
    //add harmonic and melodic
     //exceptions?
    //create new objects
    ///deal with this later
    this.naturalScale = this.steps;
    this.harmonicScale = this.steps;
    // this.harmonicScale[6] = this.relativeMajor.flatorsharp === 'sharp';

}


//function to create a scale
function makeScale(halfStepsFromC_of_rel_maj, major_or_minor) {
    //major or minor is 'M' for major, 'm' for minor
    if (major_or_minor == 'm'){
        return new SharpMinorScale(halfStepsFromC_of_rel_maj);
    }
    else {
        return new SharpMajorScale(halfStepsFromC_of_rel_maj);
    }
}



// function to transpose a voice from any key to another based on the two different scales. 
// will use this extensively.
function transposeVoice(voice, oldKey_steps_from_c, newKey_steps_from_c, oldScale_major_or_minor, newScale_major_or_minor) { //start here tomorrow!!
    //takes the notes of the voice, converts them to scale degrees, and spits back the scale degrees in the new voice, 
    // converted back to notes
    //single measure

    //change inputs: old key object, new key object
    var oldScale = makeScale(oldKey_steps_from_c, oldScale_major_or_minor);
    var newScale = makeScale(newKey_steps_from_c, newScale_major_or_minor);

    var transposedNotes;
    var beatsPer = voice.time.num_beats;
    var notes = voice.tickables;
    transposedNotes = notes.map(function(note){
        return transposeNote(note, oldScale, newScale);
    });
    return createVoice(transposedNotes, beatsPer, 4);
}


function transposeNote(note, oldScaleObject, newScaleObject){
    var chroma = findChromaAndOctave(note, oldScaleObject, newScaleObject).chroma;
    var octave = findChromaAndOctave(note, oldScaleObject, newScaleObject).octave;
    var accidental = findAccidental(note, oldScaleObject, newScaleObject);
    var duration = findDuration(note, oldScaleObject, newScaleObject);
    var clef = note.clef;
    var fingering = findFingering(note, oldScaleObject, newScaleObject);
    return createSingleNote(chroma, octave, accidental, duration, clef, fingering);
}

function findChromaAndOctave(note, oldScaleObject, newScaleObject){
    var keyProps = note.keyProps[0];
    var key = keyProps.key;
    if (key.length > 1 && key[1] == 'B') {
        //for some reason it records the flat in caps, but wants it back in lower-case
        key = key[0] + 'b';
    }
    var scaleDegree = oldScaleObject.steps_reverse[key];
    var octave_old = keyProps.octave;
    if (newScaleObject.scaleStepsToHalfSteps[scaleDegree] + newScaleObject.halfStepsFromC >= 12) {
        var octave = String(Number(octave_old) + 1);
    }
    else {
        var octave = octave_old;   
    }
    console.log(octave);
    return {chroma: newScaleObject.steps[scaleDegree].toLowerCase(), octave: octave};   
}

function findFingering(note, oldScaleObject, newScaleObject){
    var modifiers = note.modifiers;
    var modifiers_len = modifiers.length;
    var fingering = '';
    for (var j=0; j<modifiers_len; j+=1){
        if (modifiers[j].constructor.name === 'StringNumber'){
            var fingeringObject = modifiers[j];
            fingering = fingeringObject.string_number;
        }
    }
    return fingering;
}

function findDuration(note, oldScaleObject, newScaleObject){
    var duration = note.duration;
    if (note.dots !== 0) {
        duration += 'd';
    }
    return duration;
}

function findAccidental(note, oldScaleObject, newScaleObject){
    var keyProps = note.keyProps[0];
    var accidental;
    //need to work on this
    if (keyProps.accidental === null) {
        accidental = null;
    }
    return accidental;
}



// 