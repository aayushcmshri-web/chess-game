// ---- Game state ----
const game = new Chess();
let board = null;

const turnText = document.getElementById('turn-text');
const turnDot = document.getElementById('turn-dot');
const statusMessage = document.getElementById('status-message');

// ---- Board event handlers ----

function onDragStart(source, piece) {
  // don't pick up pieces if the game is over
  if (game.game_over()) return false;

  // only allow the side whose turn it is to move
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false;
  }
}

function onDrop(source, target) {
  const move = game.move({
    from: source,
    to: target,
    promotion: 'q' // always promote to queen for simplicity
  });

  // illegal move -> snap piece back
  if (move === null) return 'snapback';

  updateStatus();
}

// update the board position after the piece snap animation finishes
function onSnapEnd() {
  board.position(game.fen());
}

// ---- Status / UI updates ----

function updateStatus() {
  let statusText = '';
  let danger = false;

  const turnIsWhite = game.turn() === 'w';
  turnDot.classList.toggle('black', !turnIsWhite);
  turnText.textContent = turnIsWhite ? 'White to move' : 'Black to move';

  if (game.in_checkmate()) {
    statusText = `Checkmate — ${turnIsWhite ? 'Black' : 'White'} wins`;
    danger = true;
  } else if (game.in_draw()) {
    statusText = 'Draw';
  } else if (game.in_stalemate()) {
    statusText = 'Stalemate';
  } else if (game.in_threefold_repetition()) {
    statusText = 'Draw by repetition';
  } else if (game.insufficient_material()) {
    statusText = 'Draw — insufficient material';
  } else if (game.in_check()) {
    statusText = `${turnIsWhite ? 'White' : 'Black'} is in check`;
    danger = true;
  }

  statusMessage.textContent = statusText;
  statusMessage.classList.toggle('danger', danger);
}

// ---- Board setup ----
const config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd,
  // Use a direct CDN function or reliable image path:
  pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
};

board = Chessboard('board', config);
updateStatus();

// ---- Controls ----

document.getElementById('resetBtn').addEventListener('click', () => {
  game.reset();
  board.start();
  updateStatus();
});

document.getElementById('undoBtn').addEventListener('click', () => {
  game.undo();
  board.position(game.fen());
  updateStatus();
});

// keep board sized correctly on window resize
window.addEventListener('resize', () => board.resize());