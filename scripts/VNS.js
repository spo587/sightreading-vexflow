

function makeRandomMelody(melody, remainingLength, highestScaleDegree, open_or_closed){
    if (melody === undefined){
        var melody = {scaleDegrees: [], highestScaleDegree: highestScaleDegree}
    }
    if (remainingLength === 0){
        if (open_or_closed === 'open'){
            console.log('okay, open1!!')
            melody.scaleDegrees[0] = 0;
            melody.open_or_closed = 'open';
        }
        else if (open_or_closed === 'closed'){
            console.log('okay, closed!!!')
            melody.scaleDegrees[melody.scaleDegrees.length - 1] = 0;
            melody.open_or_closed = 'closed';
        }
        melody.VNSscore = getVNSscore(melody.scaleDegrees);
        console.log(melody.scaleDegrees);
        return melody;
    }
    melody = addToMelodyRandom(melody);
    return makeRandomMelody(melody, remainingLength - 1, highestScaleDegree, open_or_closed);

}

function addToMelodyRandom(melody){
    var possibleScaleDegrees = rangeBetter(melody.highestScaleDegree - 4, 5, 1);
    var currentLength = melody.scaleDegrees.length;
    melody.scaleDegrees.push(randomChoiceFromArray(possibleScaleDegrees));
    var nextInterval = melody.scaleDegrees[currentLength - 1] - melody.scaleDegrees[currentLength - 2];
    //melody.intervals.push(nextInterval);
    return melody;

}


function getVNSscore(scaleDegrees){
    //lets do a quick, easy version for now
    //steps predominate
    // ratio of 4:1 optimal
    var scores = [];
    var conjunctSubscore = conjunctScore(scaleDegrees);
    scores.push(conjunctSubscore);
    //large leaps resolve
    var leapResSubscore = leapResScore(scaleDegrees);
    scores.push(leapResSubscore);
    //single climax to the line
    var climaxSubscore = climaxScore(scaleDegrees);
    scores.push(climaxSubscore);
    // no more than 2 consec small leaps
    //var consecLeapsSubscore = consecLeapsScore(melody);
    // dont repeat a signle note too many times in whole frag
    //var noteRepSubscore = noteRepScore(scaleDegrees);
    //scores.push(noteRepSubscore);
    //console.log(scores);
    var directionSubscore = getDirectionScore(scaleDegrees);
    scores.push(directionSubscore);
    //don't have a single note as too high a percentage of all notes (too many repeats)
    var repeatSubscore = repeatScore(scaleDegrees);
    scores.push(repeatSubscore);

    var leapSubscore3 = leapScore3(scaleDegrees);
    scores.push(leapSubscore3);
    return scores.reduce(function(p, c){
        return p + c
    }, 0);
}



function repeatScore(scaleDegrees){
    var length = scaleDegrees.length;
    var optimal = length / 5;
    var possibleScaleDegrees = arrayUnique(scaleDegrees);
    //awkward hack
    var toPush = 10;
    while (possibleScaleDegrees.length < 5){
        possibleScaleDegrees.push(toPush);
        toPush += 1;
    }
    var deviations = possibleScaleDegrees.map(function(current, index){
        return Math.pow(numEntriesOf(scaleDegrees, current) - optimal, 2)
    });
    var sumDeviations = deviations.reduce(function(p, c){
        return p + c;
    }, 0);
    var maximum = Math.pow(length - length / 5, 2) + Math.pow(length / 5, 2) * 4
    return Math.sqrt(sumDeviations / maximum);

}
 


function getDirectionScore(scaleDegrees){
    var length = scaleDegrees.length;
    //max number of changes of direction is every note except the first
    var directionChanges = numDirectionChanges(0, scaleDegrees);
    return directionChanges / (length - 1);
}

function numDirectionChanges(current, scaleDegrees){
    if (scaleDegrees.length === 2){
        return current;
    }
    else {
        if (Math.sign(scaleDegrees[1] - scaleDegrees[0]) !== Math.sign(scaleDegrees[2] - scaleDegrees[1])){
            current += 1
        }
        return numDirectionChanges(current, scaleDegrees.slice(1))
    }
}
// function noteRepScore(scaleDegrees){
//     //first, don't allow more than 2 repeats of a single note consecutively
//     var length = scaleDegrees.length;
//     var numDoubleRepeats = doubleRepeats(scaleDegrees);
//     return numDoubleRepeats / (length - 2); 

// }

// function doubleRepeats(current, scaleDegrees){
//     if (scaleDegrees.length === 2){
//         return current;
//     }
//     else {
//         if (scaleDegrees[0] === scaleDegrees[1] && scaleDegrees[1] === scaleDegrees[2]){
//             current += 1;
//         }
//         return doubleRepeats(current, scaleDegrees.slice(1));
//     }
// }

function repeats(current, scaleDegrees){
    if (scaleDegrees.length === 1){
        return current;
    }
    else {
        if (scaleDegrees[0] === scaleDegrees[1]){
            current += 1;
        }
        return repeats(current, scaleDegrees.slice(1));
    }
}

function conjunctScore(scaleDegrees){
    //var scaleDegrees = melody.scaleDegrees;
    var L = scaleDegrees.length / 16;
    var numSteps = findNumSteps(0, scaleDegrees);
    var numLeapsAndRepeats = findNumLeaps(0, scaleDegrees) + repeats(0, scaleDegrees);
    if (4*L < numLeapsAndRepeats){
        return (numLeapsAndRepeats - (4*L)) / (scaleDegrees.length - 1 - (4*L))
    }
    else {
        return 0
    }
}

function findNumSteps(current, scaleDegrees){
    if (scaleDegrees.length === 1) {
        return current;
    }
    else {
        if (Math.abs(scaleDegrees[1] - scaleDegrees[0]) === 1){
            current += 1;
        }
        return findNumSteps(current, scaleDegrees.slice(1));
    }
}


function findNumLeaps(current, scaleDegrees){
    if (scaleDegrees.length === 1) {
        return current;
    }
    else {
        if (Math.abs(scaleDegrees[1] - scaleDegrees[0]) > 1){
            current += 1;
        }
        return findNumLeaps(current, scaleDegrees.slice(1));
    }
}

function leapsResolved(current, scaleDegrees){
    if (scaleDegrees.length === 2) {
        return current;
    }
    else {
        if (Math.abs(scaleDegrees[1] - scaleDegrees[0]) > 2){
            var toResolve = scaleDegrees[1] - scaleDegrees[0] > 0 ? -1 : 1;
            if (scaleDegrees[2] - scaleDegrees[1] === toResolve){
                current += 1;
            }
        }
        return leapsResolved(current, scaleDegrees.slice(1));
    }
}


function findNumLargeLeaps(current, scaleDegrees){
    if (scaleDegrees.length === 1) {
        return current;
    }
    else {
        if (Math.abs(scaleDegrees[1] - scaleDegrees[0]) > 2){
            current += 1;
        }
        return findNumLargeLeaps(current, scaleDegrees.slice(1));
    }
}

function leapResScore(scaleDegrees){
    //var scaleDegrees = melody.scaleDegrees;
    var numLeaps = findNumLargeLeaps(0, scaleDegrees);
    if (numLeaps > 0){
        var ratio = leapsResolved(0, scaleDegrees) / numLeaps;
        return 1 - ratio;
    }
    else {
        return 0;
    }
}

function leapScore3(scaleDegrees){
    //leaps of a third that skip third scale degree should resolve to 3
    var numLeaps = numLeapsOverThird(0, scaleDegrees);
    if (numLeaps > 0){
        var ratio = leapsOverThirdResolved(0, scaleDegrees) / numLeaps;
        return 1 - ratio;
    }
    else {
        return 0;
    }
}

function leapsOverThirdResolved(current, scaleDegrees){
    if (scaleDegrees.length === 2){
        return current;
    }
    else {
        if ((scaleDegrees[1] - scaleDegrees[0] === 2 && scaleDegrees[1] === 3) ||
            (scaleDegrees[1] - scaleDegrees[0] === -2 && scaleDegrees[1] === 1)){
            if (scaleDegrees[2] === 2){
                current += 1;
            }
        }
        return leapsOverThirdResolved(current, scaleDegrees.slice(1));
    }
}

function numLeapsOverThird(current, scaleDegrees){
    if (scaleDegrees.length === 1){
        return current;
    }
    else {
        if ((scaleDegrees[1] - scaleDegrees[0] === 2 && scaleDegrees[1] === 3) ||
            (scaleDegrees[1] - scaleDegrees[0] === -2 && scaleDegrees[1] === 1)){
            current += 1
        }
        return numLeapsOverThird(current, scaleDegrees.slice(1));
    }
}



function climaxScore(scaleDegrees){
    //var scaleDegrees = melody.scaleDegrees;
    var maxNote = arrayMax(scaleDegrees);
    var numClimaxes = numEntriesOf(scaleDegrees, maxNote);
    return (numClimaxes - 1) / scaleDegrees.length;
}

function swap(scaleDegrees, firstIndex, secondIndex){
    var first = scaleDegrees[firstIndex];
    var second = scaleDegrees[secondIndex];
    var copy = scaleDegrees.map(function(current){
        return current;
    });
    copy[firstIndex] = second;
    copy[secondIndex] = first;
    return copy;
}

function N1min(melody, lowestChangeIndex, highestChangeIndex){
    //console.log('scale degrees passed to n1min function');
    var scaleDegrees = melody.scaleDegrees;
    //console.log(scaleDegrees);
    var best = scaleDegrees;
    var VNSscore = getVNSscore(scaleDegrees);
    //dont swap out first note, tonic
    for (var i = lowestChangeIndex; i < highestChangeIndex - 1; i += 1){
        for (var j = i + 1; j < highestChangeIndex; j+= 1){
            var swapped = swap(scaleDegrees, i, j);
            //console.log(swapped);
            var score = getVNSscore(swapped);
            //console.log(score);
            if (score < VNSscore){

                VNSscore = score;
                best = swapped;
       
            }
        }
    }
    return {scaleDegrees: best, VNSscore: VNSscore, highestScaleDegree: melody.highestScaleDegree};
}

function N2min(melody, lowestChangeIndex, highestChangeIndex){
    var scaleDegrees = melody.scaleDegrees;
    var best = scaleDegrees; 
    var lowest = melody.highestScaleDegree - 4;
    var highest = melody.highestScaleDegree;
    var VNSscore = getVNSscore(scaleDegrees);
    for (var index = lowestChangeIndex; index < highestChangeIndex; index+=1){
        for (var degree = lowest; degree < highest + 1; degree+=1){
            var changed = changeOneNote(scaleDegrees, index, degree);
            //console.log(changed);
            var score = getVNSscore(changed);
            if (score < VNSscore){
                
               
                VNSscore = score;
               
                best = changed;
              
            }
        }
    }
    return {scaleDegrees: best, VNSscore: VNSscore, highestScaleDegree: melody.highestScaleDegree};
}

function N3min(melody, lowestChangeIndex, highestChangeIndex){
    var scaleDegrees = melody.scaleDegrees;
    var best = scaleDegrees; 
    var lowest = melody.highestScaleDegree - 4;
    var highest = melody.highestScaleDegree;
    var VNSscore = getVNSscore(scaleDegrees);
    for (var index1 = lowestChangeIndex; index1 < highestChangeIndex - 1; index1 += 1){
        for (var index2 = index1 + 1; index2 < highestChangeIndex; index2 += 1){
            for (var degree1 = lowest; degree1< highest + 1; degree1+= 1){
                for (var degree2 = lowest; degree2 < highest + 1; degree2 += 1){
                    var changed = changeTwoNotes(scaleDegrees, index1, index2, degree1, degree2);
                    //console.log(changed);
                    var score = getVNSscore(changed);
                    if (score < VNSscore){

                        VNSscore = score;

                        best = changed;
                        
                    }
                }
            }
        }
    }
    return {scaleDegrees: best, VNSscore: VNSscore, highestScaleDegree: melody.highestScaleDegree};
}

function changeOneNote(scaleDegrees, index, degree){
    var copy = scaleDegrees.map(function(current){
        return current;
    });
    copy[index] = degree;
    //console.log(copy);
    return copy;
}

function changeTwoNotes(scaleDegrees, index1, index2, degree1, degree2){
    var copy = scaleDegrees.map(function(current){
        return current;
    });
    copy[index1] = degree1;
    copy[index2] = degree2;
    //console.log(copy);  
    return copy;
}


function updateVNS(melody, lowestChangeIndex, highestChangeIndex){
    var scaleDegrees = melody.scaleDegrees;
    var best = {scaleDegrees: melody.scaleDegrees, VNSscore: melody.VNSscore, highestScaleDegree: melody.highestScaleDegree};
    var bestScore = melody.VNSscore;
    var n1 = N1min(melody, lowestChangeIndex, highestChangeIndex);
    best = update(best, n1);
    var n2 = N2min(melody, lowestChangeIndex, highestChangeIndex);
    best = update(best, n2);
    var n3 = N3min(melody, lowestChangeIndex, highestChangeIndex);
    best = update(best, n3);
    // either we've found a better solution or we haven't

    return best;
}

function update(n1, n2){
    if (n2.VNSscore < n1.VNSscore) {
        return n2
    }
    else {
        return n1
    }
}


function goThroughAgain(initialMelody, lowestChangeIndex, highestChangeIndex){
    var onceThrough = updateVNS(initialMelody, lowestChangeIndex, highestChangeIndex);
    //console.log('once through ');
    //console.log(onceThrough.scaleDegrees);
    if (onceThrough.VNSscore >= initialMelody.VNSscore){
        //we havent improved. return out
        return onceThrough;
    }
    else {
        return goThroughAgain(onceThrough);
    }
}



function VNS(initialMelody, numIters, perturbChanges){
    var melody = initialMelody;
    var open_or_closed = initialMelody.open_or_closed;
    if (open_or_closed === 'open'){
        var lowestChangeIndex = 1;
        var highestChangeIndex = initialMelody.scaleDegrees.length;
    }
    else {
        var lowestChangeIndex = 0;
        var highestChangeIndex = initialMelody.scaleDegrees.length - 1;
    }
    var bestMelody = initialMelody.scaleDegrees;
    var bestScore = initialMelody.VNSscore;
    for (var i = 0; i < numIters; i += 1){
        threeNHSearch = goThroughAgain(melody, lowestChangeIndex, highestChangeIndex);
        if (Math.min(threeNHSearch.VNSscore, bestScore) === threeNHSearch.VNSscore){

            bestMelody = threeNHSearch.scaleDegrees;
        }
        var bestScore = Math.min(threeNHSearch.VNSscore, bestScore);

    
        //update adaptive weights
        var melody = perturb(threeNHSearch, perturbChanges, lowestChangeIndex, highestChangeIndex);
    }

    return {scaleDegrees: bestMelody, VNSscore: bestScore, highestScaleDegree: melody.highestScaleDegree}
}

function perturb(melody, numToChange, lowestChangeIndex, highestChangeIndex){
    //console.log('highest change index');
    //console.log(highestChangeIndex);
    var scaleDegrees = melody.scaleDegrees;
    var possibleScaleDegrees = rangeBetter(melody.highestScaleDegree - 4, 5, 1);

    var copy = scaleDegrees.map(function(current){
        return current;
    });
    for (var i = 0; i<numToChange; i+=1){
        var index = -1;
        while (index < lowestChangeIndex || index > highestChangeIndex - 1){
            index = Math.floor(Math.random() * copy.length);
            //console.log(index);
        }
        copy[index] = randomChoiceFromArray(possibleScaleDegrees);
    }
    return {scaleDegrees: copy, VNSscore: getVNSscore(copy), highestScaleDegree: melody.highestScaleDegree}
}
