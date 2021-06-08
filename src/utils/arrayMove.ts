export const arrayMove = function <T>(array: T[], pos1: number, pos2: number) {
  // local variables
  var i, tmp;
  // if positions are different and inside array
  if (pos1 !== pos2 && 0 <= pos1 && pos1 <= array.length && 0 <= pos2 && pos2 <= array.length) {
    // save element from position 1
    tmp = array[pos1];
    // move element down and shift other elements up
    if (pos1 < pos2) {
      for (i = pos1; i < pos2; i++) {
        array[i] = array[i + 1];
      }
    }
    // move element up and shift other elements down
    else {
      for (i = pos1; i > pos2; i--) {
        array[i] = array[i - 1];
      }
    }
    // put element from position 1 to destination
    array[pos2] = tmp;
  }
};
