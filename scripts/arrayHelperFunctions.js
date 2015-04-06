function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function unNestArray(array){
    var unnested = [];
    array.forEach(function(elem, ind, arr){
        array[ind].forEach(function(innerelem, innerind, innerarr){
            unnested.push(innerelem)
        });
    });
    return unnested;
}

function randomChoiceFromArray(arr){
    return arr[Math.floor(Math.random() * arr.length)]
}

function findLength(nestedArray){
    var total = 0;
    nestedArray.forEach(function(element, index, array){
        total += array[index].length
    })
    return total;
}


function combineNestedArrays(array1, array2){
    var finalArray = [];
    for (var i=0; i<array1.length; i+=1){
        finalArray.push([array1[i], array2[i]])
    }
    return finalArray;
}

function combineArray(array1, array2){
    //array1 is a nested array, returned from rhythms. array 2 is one dimensional, returned from generateMelody
    //return a three dimensional array? each innermost array is a rhythm/scale degree pair?
    var index = -1;
    var finalArray = array1.map(function(elem){
        var modified = elem.map(function(innerelem){
            index += 1;
            return [innerelem, array2[index]]
        });
        return modified;
    });
    return finalArray;
}



function nestArray(array1, array2){
    //array 1 is already nested (array or arrrays), array 2 needs to be nested with each inner array matching
    //the corresponding length of array1
    var array2nested = [];
    var lengths = [];
    array1.forEach(function(element, index, array){
        lengths.push(array[index].length);
        array2nested.push([]);
    })
    var currentIndex = -1;
    for (var i = 0; i < lengths.length; i++){
        for (var j=0; j < lengths[i]; j++){
            currentIndex += 1
            array2nested[i].push(array2[currentIndex]);
        }
    }
    return array2nested;
}

function arrayMin(arr){
    return arr.reduce(function(prev, current){ //highest note
        return Math.min(prev, current);
    });
}

function arrayMax(arr){
    return arr.reduce(function(prev, current){ //highest note
        return Math.max(prev, current);
    });
}

function numEntriesOf(arr, num){
    return arr.reduce(function(previous, current){
        var add = current === num ? 1 : 0;
        //console.log(add);
        return previous + add;
    }, 0);
}

var arrayUnique = function(a) {
    return a.reduce(function(p, c) {
        if (p.indexOf(c) < 0) p.push(c);
        return p;
    }, []);
};

function findLastEntryOf(arr, number) {
    var finalEntry = -1;
    arr.forEach(function(element, index, array){
        if (array[index] === number){
            finalEntry = index
        }
    })
    return finalEntry
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


function round(num, roundTo) {
    num = Math.round(num * 1 / roundTo) / (1 / roundTo);
    return num
}


function range(num, increment){
    var arr = []
    for (var i = increment; i < num + 0.5; i+= increment){
        arr.push(i);
    }
    return arr;
}

function rangeBetter(min, length, increment){
    var arr = []
    for (var i = 0; i < length; i += increment){
        arr.push(i + min);
    }
    return arr;
}

