//-------------------------------------------------------
// Customized merge sorting, sorting objects according to 'distance.value'
// Note, it takes only objects with 'status'=='OK', while ignoring the others
const distancesMergeSorting = function (drivers) {
    // No need to sort the array if the array only has one element or empty
    if (drivers.length <= 1) {
        return drivers;
    }
    // 
    const middle = Math.floor(drivers.length / 2);

    // This is where we will be dividing the array into left and right
    const left = drivers.slice(0, middle);
    const right = drivers.slice(middle);
    // Using recursion to combine the left and right
    return distancesMerging(
        distancesMergeSorting(left), distancesMergeSorting(right)
    );
}

// Merge the two arrays: left and right
const distancesMerging = function (left, right) {
    let resultArray = [], leftIndex = 0, rightIndex = 0;
    // We will concatenate values into the resultArray in order
    while (leftIndex < left.length && rightIndex < right.length) {
        // Ignore elements which status are != "OK"
        if (left[leftIndex][2].status != 'OK') {
            leftIndex++;
            continue;
        }
        if (right[rightIndex][2].status != 'OK') {
            rightIndex++;
            continue;
        }
        // Merge elements while sorting them ascendingly
        if (left[leftIndex][2].duration.value < right[rightIndex][2].duration.value) {
            resultArray.push(left[leftIndex]);
            leftIndex++; // move left array cursor
        }
        else {
            resultArray.push(right[rightIndex]);
            rightIndex++; // move right array cursor
        }
    }
    // We need to concat here because there will elements remaining from either left OR the right
    return resultArray
        .concat(left.slice(leftIndex).filter(d => d[2].status == 'OK'))
        .concat(right.slice(rightIndex).filter(d => d[2].status == 'OK'));
};

module.exports.sortingDrivers = distancesMergeSorting;