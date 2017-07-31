# sudokusolver

This page uses recursive backtracking to solve sudoku puzzles, giving the option to show a visual animation of the recursion process.

Algorithm
  -Select a cell
  -Generate a list of usable values for said cell, and place one of the values into said cell
  -If no values are usable, set the cell back to 0 and return false
  -If value is found, recursively repeat these steps
