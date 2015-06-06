// {array: [1 2], layer: 0}
// [1 3 2]


// [1 3]  [3 2]

// [1 5 3] [3 2] no children

// [1 5] 2 [5 3] 1  [3 2]


// [c,e]

//for (var i=1; i<a.length; i+=2){a.splice(i,0,null)}

function makeArray(numLayers, firstDegrees){
    var arr = [];
    for (var i=0; i<Math.pow(2,numLayers+1) + 1; i+=1){
        arr.push(null);
    }
    arr[0] = firstDegrees[0];
    arr[arr.length - 1] = firstDegrees[1];
    return arr;
}


function findLeftArrayEntry(arr, index){
    for (var i=index - 1; i>-1; i-=1){
        if (arr[i] !== null) {
            return arr[i];
        }
    }
}

function findRightArrayEntry(arr, index){
    for (var i=index + 1; i<arr.length + 1; i+=1){
        if (arr[i] !== null) {
            return arr[i];
        }
    }
}

function fillLayerChoice(layerNum) {
    if (layerNum < 4 && Math.random() < 0.7){
        return true;
    }
    else {
        return false;
    }

}

function fillLayer(layerNum, arr, numLayers){
    var indices = [];
    //console.log(indices);
    //return indices
    for (var i=1; i<Math.pow(2,layerNum + 1); i+=2){
        indices.push(i*Math.pow(2, numLayers - layerNum));

    }
    console.log(indices);
    console.log(indices.length);
    for (var i=0; i<indices.length; i+=1) {
        var fillOrNot = fillLayerChoice(layerNum);
        console.log(fillOrNot);
        if (fillOrNot) {
            var leftParent = findLeftArrayEntry(arr, indices[i]);
            console.log(leftParent);
            var rightParent = findRightArrayEntry(arr, indices[i]);
            console.log(rightParent);
            toFill = chooseChild(leftParent, rightParent);
            arr[indices[i]] = toFill;
        }
    }
}

function chooseChild(leftParent, rightParent){

    //var choices = [1,2,3,4,5];
    //var rand = choices[Math.floor(Math.random() * choices.length)];
    //filters
    //how far apart are the two parents?
    var interval = Math.abs(leftParent - rightParent);
    if (interval === 1) {//step 
        var possibles = [rightParent, leftParent];
        var last = (leftParent + 1 === rightParent) ? rightParent + 1 : rightParent - 1;
        possibles.push(last);
        return possibles[Math.floor(Math.random() * possibles.length)];
    }
    else if (interval === 2) { // skip
        //weights?


    }
}

function ProlongedNote(scaleDegree, parents){
    this.parents = parents;
    this.scaleDegree = scaleDegree;
    this.children = [];
    this.toRight = parents !== undefined ? parents[1] : undefined ;
    this.toLeft = parents !== undefined ? parents[0] : undefined;
    if (parents !== undefined) {
        console.log('boom');
        for (var i=0; i<2; i+=1){
            parents[i].children.push(this);
        }
    }
}

function addNote(parents) {
    var newScaleDegree = 
    var newNote = prolongedNote(newScaleDegree, parents);
    parents[0].children.push(newnote);
    parents[1].children.push(newnote)

}

function createMop(initialArray) {

}