var current_box;
var state = [];
var running = false;
var load_timer;
var worker;

function styling() {
  for (var i=0; i<81; ++i) $('#board').append('<div class="box" data-index='+(i+1)+'></div>');
  $('.box').css('height', $('.box').width());
}
function listeners() {
  $(window).on('resize', function() {
    var width = $('.box').width()+4;
    $('.box').css('height', width);

  });
  $(document).on('keypress', function(event) {
    var value = event.charCode - 48;
    if (!current_box || value > 9 || value < 1) return;
    if (valid(state, value, Math.floor((current_box-1)/9), (current_box-1)%9)) {
      $('.box:nth-child('+current_box+')').css('background-color', 'white');
      state[(current_box-1).row()][(current_box-1).column()] = value;
      update();
    } else {
      $('.box:nth-child('+current_box+')').css('background-color', '#ff9191');
    }
  });
  $('.box').on('click', function() {
    if (current_box) $('.box:nth-child('+current_box+')').css('background-color', 'white');
    current_box = $(this).attr('data-index');
    $(this).css('background-color', '#c9f0ff');
  });
  $('.number').on('click', function() {
    if (!running) {
      if (!current_box) return;
      var a = $(this).text();
      $('.box:nth-child('+current_box+')').text(a);
      $('.box:nth-child('+current_box+')').css('background-color', 'white');
      state[(current_box-1).row()][(current_box-1).column()] = a;
    }
  });
  $('#clear').on('click', function() {
    state = [];
    for (var i=0; i<9; ++i) state.push([0,0,0,0,0,0,0,0,0]);
    update();
  });
  $('#solve').on('click', function() {
    worker.postMessage([state, false]);
    load_timer = setInterval(loading, 200);
  });
  $('#animate').on('click', function() {
    worker.postMessage([state, true]);
  });
  worker.onmessage = function(e) {
    state = e.data[0];
    clearInterval(load_timer);
    for (var i=1; i<10; ++i) $('.number:nth-child('+i+')').text(i);
    running = false;
    if (e.data[1]) animate(e.data[2]);
    else update();
  }
}

$(document).ready(function() {
  //webworkers dont load in chrome locally, solution found at https://stackoverflow.com/questions/21408510/chrome-cant-load-web-worker
  worker = new Worker(URL.createObjectURL(new Blob(["("+run_worker.toString()+")()"], {type: 'text/javascript'})));
  for (var i=0; i<9; ++i) state.push([0,0,0,0,0,0,0,0,0]);
  styling();
  listeners();
});

function update() {
  for (var i=0; i<9; ++i)
    for (var j=0; j<9; ++j) {
      if (state[i][j] != 0) $('.box:nth-child('+(i*9+j+1)+')').text(state[i][j]);
      else $('.box:nth-child('+(i*9+j+1)+')').text('');
    }
}
function animate(animation) {
  var frame = 0;
  var timer = setInterval(function() {
    var anim = animation[frame];
    frame++;
    if (anim.action == 'attempt') {
      $('.box:nth-child('+(anim.box+1)+')').css('background-color', '#c9f0ff');
      $('.box:nth-child('+(anim.box+1)+')').text(anim.value);
    } else if (anim.action == 'no value found') {
      $('.box:nth-child('+(anim.box+1)+')').css('background-color', '#ffc9c9');
      $('.box:nth-child('+(anim.box+1)+')').text('');
    } else if(anim.action == 'failed attempt') {
      $('.box:nth-child('+(anim.box+1)+')').css('background-color', 'red');
      $('.box:nth-child('+(anim.box+1)+')').text('');
    } else if (anim.action == 'complete') {
      $('.box').css('background-color', 'white');
      clearInterval(timer);
    }
  }, 10);
}
var loading = (function() {
  var letters = ['L', 'O', 'A', 'D', 'I', 'N', 'G', '.', '.', '.'];
  var pos = 0;
  return function() {
    for (var i=0; i<9; ++i) $('.number:nth-child('+((pos+i+1)<10?(pos+i+1):(pos+i-8))+')').text(letters[i]);
    pos++;
    if (pos >= 9) pos=0;
  };
})();
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
