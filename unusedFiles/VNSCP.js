

function makeRandomCounterPoint()


function VNSCP(initialcp, numIters, perturbChanges){
    var melody = initialcp;
    // var open_or_closed = initialcp.open_or_closed;
    // if (open_or_closed === 'open'){
    //     var lowestChangeIndex = 1;
    //     var highestChangeIndex = initialcp.scaleDegrees.length;
    // }
    // else {
    //     var lowestChangeIndex = 0;
    //     var highestChangeIndex = initialcp.scaleDegrees.length - 1;
    // }
    var bestMelody = initialcp.scaleDegrees;
    //this time through, the VNSscore has to include the regular horizontal term plus a CF dependent vertical term
    var bestScore = initialcp.VNSscore;
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