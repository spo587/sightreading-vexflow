// rhythmic rules for 'first species'

//no syncopations (hierarchically speaking)
//will need to generate a random, non-syncopated

// mixture of motion and repose

// rhythms should relate to each other (motivic??) over the first 3 bars

// large leaps in melody should coincide with rhythmic repose

function makeRandomRhythm(lengthLessOne, numBarsLessOne, beatsPer, shortestDuration){
    //shortestDuration === 1/2 for 8th note, 1 for quarter notes, etc. ?

    //first, number of rhythmic 'slots' that we can put notes into
    var numSlots = beatsPer * numBarsLessOne / shortestDuration;
    //console.log(numSlots);
    var slots = rangeBetter(0, beatsPer * numBarsLessOne, shortestDuration);
    //console.log(slots);
    var rhythms = [];
    //start on the beat. FIX THIS when we have rests
    rhythms.push(0);
    slots.splice(0, 1);
    for (var i = 1; i < lengthLessOne - 1; i += 1){
        var toAdd = randomChoiceFromArray(slots);
        slots.splice(slots.indexOf(toAdd), 1);
        rhythms.push(toAdd);
    }
    rhythms.sort(function(a,b){
        return a > b;
    });
    var unsyncopated = unsyncopate(rhythms, beatsPer, []);
    return {slots: unsyncopated, beatsPer: beatsPer, beats: unsyncopated.map(function(current){
        return current % beatsPer;
    })}
    // return {slots: rhythms, beatsPer: beatsPer, beats: rhythms.map(function(current){
    //     return current % beatsPer; 
    // })}

    //okay, for now, syncopations are allowed, but the objective function will frown upon them heavily

}

function unsyncopate(slots, beatsPer, soFar){ 
    if (slots.length === 1){
        //console.log(slots);
        return soFar.concat(slots[0]);
    }
    //recursively unsyncopate
    else {
        var dist = nextHierarchicBeat2(beatsPer, slots[0] % beatsPer);
        //dist should never send us farther than the next downbeat
        if (slots[1] - slots[0] > dist){
            slots[1] = slots[0] + dist;
        }
        soFar.push(slots[0]);
        //console.log(soFar);
        //return soFar.concat(unsyncopate(beats, beatsPer, soFar));
        return unsyncopate(slots.slice(1), beatsPer, soFar);
    }

}


function convertToDuration(slots, beatsPer, soFar){
    if (slots.length === 1){
        return soFar.concat(beatsPer - slots[0] % beatsPer)
    }

    else {
        var dist = slots[1] - slots[0];
        //dist should never send us farther than the next downbeat
        soFar.push(dist);
        //console.log(soFar);
        //return soFar.concat(unsyncopate(beats, beatsPer, soFar));
        return convertToDuration(slots.slice(1), beatsPer, soFar);
    }

}


// function groupByMeasure(durations){
//     var currentBar = 0;
//     var currentBeat = 0;
//     var lengths = durations.map(function(elem, ind, arr){

//     })
// }


function findFirstMeasure(durations, beatsPer){
    var oneMeasure = durations.reduce(function(prev, curr){
            if (prev.reduce(function(a, b){
                return a + b;
            }, 0) + curr > beatsPer){
                return prev;
            }
            else {
                return prev.concat(curr);
            }
        },[]);
    return oneMeasure;
}


function findMeasures(durations, beatsPer){
    if (durations.length === 0){
        return [];
    }
    //recurse
    var firstMeasure = findFirstMeasure(durations, beatsPer);
    var firstMeasureLength = firstMeasure.length;
    return [firstMeasure].concat(findMeasures(durations.slice(firstMeasureLength), beatsPer));
}


