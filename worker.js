function run_worker() {
  onmessage = function(e) {
    if (e.data[1]) animated_solve(e.data[0], 0, 0);
    else solve(e.data[0], 0, 0);
  }

  var iterations = 0;
  var animation = [];

  function solve(board, row, col) {
    iterations++;
    //termination conditions
    if (row>8) {
      console.log('recursive iterations: '+iterations);
      postMessage([board, false]);
      return true;
    }
    if (board[row][col] != 0) {
      if (col<8) {
        if (solve(board, row, col+1)) return true;
      } else {
        if (solve(board, row+1, 0)) return true;
      }
      return false;
    }
    //setting and checking value
    var a = options(board, row, col);
    for (var j=0; j<a.length; ++j) {
      var i=a[j];
      if (valid(board, i, row, col)) {
        board[row][col] = i;
        if (col==8) {
          if (solve(board, row+1, 0)) return true;
        } else {
          if (solve(board, row, col+1)) return true;
        }
        board[row][col] = 0;
      }
    }
    return false;
  }
  function animated_solve(board, row, col) {
    //termination conditions
    if (row>8) {
      animation.push({
        action: 'complete',
      });
      postMessage([board, true, animation]);
      return true;
    }
    if (board[row][col] != 0) {
      if (col<8) {
        if (animated_solve(board, row, col+1)) return true;
      } else {
        if (animated_solve(board, row+1, 0)) return true;
      }
      animation.push({
        action: 'failed attempt',
        row: row,
        col: col,
        box: (row*9+col)
      });
      return false;
    }

    var a = options(board, row, col);
    for (var j=0; j<a.length; ++j) {
      var i=a[j];
      if (valid(board, i, row, col)) {
        board[row][col] = i;
        animation.push({
          action: 'attempt',
          value: i,
          row: row,
          col: col,
          box: (row*9+col)
        });
        if (col==8) {
          if (animated_solve(board, row+1, 0)) return true;
        } else {
          if (animated_solve(board, row, col+1)) return true;
        }
        board[row][col] = 0;
        animation.push({
          action: 'no value found',
          value: i,
          row: row,
          col: col,
          box: (row*9+col)
        });
      }
    }
    return false;
  }

  function options(board, y, x) {
    if (x > 8 || y > 8) return [];
    var used = '123456789';
    for (var i=0; i<9; ++i) {
      used = used.replace(board[y][i], '');
      used = used.replace(board[i][x], '');
    }/*
    for (var i=Math.floor(y/3)*3; i<Math.floor(y/3)*3+3; ++i)
      for (var j=Math.floor(x/3)*3; j<Math.floor(x/3)*3+3; ++j)
        used = used.replace(board[i][j], '');*/
    return used.split('');
  }
  function valid(board, val, y, x) {
    var row = board[y];
    var col = [];
    for (var i=0; i<9; ++i) col.push(board[i][x]);

    if (board[y][x] != 0) return false;
    if (row.contains(val)) return false;
    if (col.contains(val)) return false;

    var s_row = Math.floor(y/3)*3;
    var s_col = Math.floor(x/3)*3;

    var set = [];
    for (var i=s_row; i<s_row+3; i++)
      for (var j=s_col; j<s_col+3; j++)
        set.push(board[i][j]);
    if (set.contains(val)) return false;
    return true;
  }

  Number.prototype.row = function() { return Math.floor(this/9); }
  Number.prototype.column = function() { return this%9; }
  Array.prototype.contains = function(a) {
    for (var i=0; i<this.length; ++i)
      if (this[i] == a)
        return true;
    return false;
  }

}
