// a constructor function for the scale abstraction
function SharpMajorScale(halfStepsFromC) {
    //constructor with a steps property, with k,v pairs corresponding to scale degree : note name, and 
    // this.reverse_steps, which gives the reverse
    // also, a scalestepstohalfsteps property, which takes scale steps (eg, 1#) and tells you how many half steps 
    // above the tonic note
    //all indexed to 0
    var transpose_dict_sharp_from_c = {0: 'C', 1:'C#', 2:'D', 3:'D#', 4:'E', 5:'F', 6:'F#', 7:'G', 8:'G#', 9:'A', 10:'A#', 11:'B'};
    var transpose_dict_flat_from_c = {0: 'C', 1: 'Db', 2:'D', 3: 'Eb', 4:'E', 5:'F', 6:'Gb', 7:'G', 8: 'Ab', 9: 'A', 10: 'Bb', 11:'B'}
    var sharps = [0, 2, 4, 6, 7, 9, 11];
    var flats = [1, 3, 5, 8, 10];
    if (flats.indexOf(halfStepsFromC) > -1) {
        var transposeDict = transpose_dict_flat_from_c;
    }
    else {
        var transposeDict = transpose_dict_sharp_from_c;
    }
    this.steps = {};
    this.steps = {'0':transposeDict[halfStepsFromC]};
    var scaleHalfSteps = [0, 2, 4, 5, 7, 9, 11];
    for (var i=1; i<7; i+=1) {
        this.steps[i] = transposeDict[(scaleHalfSteps[i] + halfStepsFromC) % 12];
    }
    //have to fix below for flat scales
    this.steps_reverse = {};
    for (var prop in this.steps) {
        if (this.steps.hasOwnProperty(prop)) {
            this.steps[prop + '#'] = this.steps[prop] + '#';
            if (this.steps[prop + '#'].slice(1) === 'b#') {
                this.steps[prop + '#'] = this.steps[prop].slice(0,1);
            }
            this.steps[prop + 'b'] = this.steps[prop] + 'b';
            if (this.steps[prop + 'b'].slice(1) === '#b') {
                this.steps[prop + 'b'] = this.steps[prop].slice(0,1);
            }

        }
    }
    //create the reverse dict
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
}


//function to create a scale
function makeScale(halfStepsFromC_of_rel_maj, major_or_minor) {
    if (major_or_minor == 'm'){
        return new SharpMinorScale(halfStepsFromC_of_rel_maj);
    }
    else {
        return new SharpMajorScale(halfStepsFromC_of_rel_maj);
    }
}



//function to transpose a voice from any key to another based on the two different scales. 
// will use this extensively.
function transposeVoice(voice, oldKey_steps_from_c, newKey_steps_from_c, oldScale_major_or_minor, newScale_major_or_minor) { //start here tomorrow!!
    //takes the notes of the voice, converts them to scale degrees, and spits back the scale degrees in the new voice, 
    // converted back to notes
    var oldScale = makeScale(oldKey_steps_from_c, oldScale_major_or_minor);
    var newScale = makeScale(newKey_steps_from_c, newScale_major_or_minor);

    transposedNotes = [];
    var beatsPer = voice.time.num_beats;
    var notes = voice.tickables;
    for (var i=0; i<notes.length; i+=1) {
        var keyProps = notes[i].keyProps[0]
        var key = keyProps.key;

        //but it's complicated
        if (key.length > 1 && key[1] == 'B') {
            //for some reason it records the key in caps, but wants it back in lower-case
            key = key[0] + 'b';
        }
        // going to have to deal with accidental later
        // if there's no accidental in the untransposed version, then we're good
        // if there is an accidental, it may need to be changed
        //this old way i did it wasn't quite right

        //need to change accidental too!!!
        // var accidental = '';
        // if (newScale.steps[scaleDegree].length > 1) {
        //     accidental = newScale.steps[scaleDegree][1]
        // };
        var accidental;
        if (keyProps.accidental === null) {
            accidental = null;
        }
        // if there was an accidental, we need to figure out the new one
        // for this we'll need something in the Scale constructor that tells us which degrees in the key
        // signature ALREADY have accidentals, and detect whether this is one of those. do this!!!
        // else if (keyProps.accidental = '#')
        // var accidental = keyProps.accidental;

        var scaleDegree = oldScale.steps_reverse[key];
        var octave_old = keyProps.octave;
        
        // need to change the octave, if we 'crossed' a c
        // okay, say we're in a major. the fifth of the scale gets transposed from g to e
        // need to change octave because we've gone more than 12 half steps up
        if (newScale.scaleStepsToHalfSteps[scaleDegree] + newScale.halfStepsFromC >= 12) {
            octave = String(Number(octave_old) + 1);
        }
        else {
            octave = octave_old;   
        }
        //find the fingering. it's in the modifiers array, but unclear which index, since it's
        //an array, not a property gah not the smartest set up mohit
        var modifiers = notes[i].modifiers;
        var modifiers_len = modifiers.length;
        var fingering;
        for (var j=0; j<modifiers_len; j+=1){
            if (modifiers[j].constructor.name === 'StringNumber'){
                var fingeringObject = modifiers[j];
                console.log(fingeringObject);
                fingering = fingeringObject.string_number;
            }
        }

        //have to add back in the dot as well, since the duration property doesnt have it
        var duration = notes[i].duration;
        if (notes[i].dots !== 0) {
            duration += 'd';
        }
        
        //need to change ALL the properties of the note that matter??? next line doesn't do it
        //notes[i].keyProps[0].key = newScale.steps[scaleDegree]        
        //yup, have to actually create a whole new note instance. what a bummer. below does the trick

        newNote = createSingleNote(newScale.steps[scaleDegree].toLowerCase(), octave, accidental, duration, notes[i].clef, fingering);

        transposedNotes.push(newNote);

    }
    return createVoice(transposedNotes, beatsPer, 4);

}