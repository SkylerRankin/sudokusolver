# sudokusolver

#### This page uses recursive backtracking to solve sudoku puzzles, giving the option to show a visual animation of the recursion process.

### Algorithm
1. Select a cell
2. Generate a lsit of usable values for the cell, and place one of the values into it
3. If no values are usable, set the cell back to 0 and return false
4. If value is found, recursively repeat these steps
