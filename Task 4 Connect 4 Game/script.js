const ROWS = 6, COLS = 7;
let currentPlayer = 'red';
let board = [];
let gameOver = false;
let history = [];
let gameMode = 'single'; // default mode

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const undoBtn = document.getElementById('undoBtn');
const singleBtn = document.getElementById('singleBtn');
const multiBtn = document.getElementById('multiBtn');

const dropSoundRed = document.getElementById('dropSoundRed');
const dropSoundYellow = document.getElementById('dropSoundYellow');
const winSound = document.getElementById('winSound');

// Highlight single player mode by default
singleBtn.classList.add('active');

function initBoard() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  boardEl.innerHTML = '';
  gameOver = false;
  currentPlayer = 'red';
  history = [];
  statusEl.textContent = "Player Red's turn";

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.classList.add('cell', 'empty');
      cell.dataset.row = r;
      cell.dataset.col = c;
      boardEl.appendChild(cell);
    }
  }
}

function getAvailableRow(col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (!board[r][col]) return r;
  }
  return null;
}

function dropToken(row, col) {
  board[row][col] = currentPlayer;
  const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
  const token = document.createElement('div');
  token.classList.add('token', currentPlayer);
  cell.appendChild(token);
  cell.classList.remove('empty');

  // Play different sound depending on current player
  if (currentPlayer === 'red') {
    dropSoundRed.play();
  } else {
    dropSoundYellow.play();
  }
}

function switchPlayer() {
  currentPlayer = currentPlayer === 'red' ? 'yellow' : 'red';
  statusEl.textContent = `Player ${capitalize(currentPlayer)}'s turn`;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function checkWinner() {
  function checkDir(r, c, dr, dc) {
    const token = board[r][c];
    if (!token) return false;
    for (let i = 1; i < 4; i++) {
      const nr = r + dr * i;
      const nc = c + dc * i;
      if (
        nr < 0 || nr >= ROWS ||
        nc < 0 || nc >= COLS ||
        board[nr][nc] !== token
      ) return false;
    }
    return true;
  }

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (
        checkDir(r, c, 0, 1) ||
        checkDir(r, c, 1, 0) ||
        checkDir(r, c, 1, 1) ||
        checkDir(r, c, 1, -1)
      ) return board[r][c];
    }
  }
  return null;
}

function checkDraw() {
  return board.every(row => row.every(cell => cell));
}

function undoMove() {
  if (!history.length || gameOver) return;
  const last = history.pop();
  board[last.row][last.col] = null;

  const cell = document.querySelector(`.cell[data-row="${last.row}"][data-col="${last.col}"]`);
  cell.innerHTML = '';
  cell.classList.add('empty');

  currentPlayer = last.player;
  gameOver = false;
  statusEl.textContent = `Player ${capitalize(currentPlayer)}'s turn`;
}

function makeMove(col) {
  if (gameOver) return;

  const row = getAvailableRow(col);
  if (row === null) return;

  history.push({ row, col, player: currentPlayer });
  dropToken(row, col);

  const winner = checkWinner();
  if (winner) {
    statusEl.textContent = `🎉 Player ${capitalize(winner)} wins!`;
    winSound.play();
    setTimeout(() => {
      alert(`🎉 Player ${capitalize(winner)} wins the game!`);
      initBoard();
    }, 100);
    gameOver = true;
    return;
  }

  if (checkDraw()) {
    statusEl.textContent = "It's a draw!";
    setTimeout(() => {
      alert("🤝 The game is a draw!");
      initBoard();
    }, 100);
    gameOver = true;
    return;
  }

  switchPlayer();

  if (gameMode === 'single' && currentPlayer === 'yellow') {
    setTimeout(aiMove, 400);
  }
}

function aiMove() {
  if (gameOver) return;
  const validCols = [];
  for (let c = 0; c < COLS; c++) {
    if (getAvailableRow(c) !== null) validCols.push(c);
  }
  const randomCol = validCols[Math.floor(Math.random() * validCols.length)];
  makeMove(randomCol);
}

boardEl.addEventListener('click', e => {
  if (!e.target.classList.contains('cell')) return;
  const col = parseInt(e.target.dataset.col);
  if (gameMode === 'single' && currentPlayer !== 'red') return;
  makeMove(col);
});

resetBtn.addEventListener('click', initBoard);
undoBtn.addEventListener('click', undoMove);

singleBtn.addEventListener('click', () => {
  gameMode = 'single';
  singleBtn.classList.add('active');
  multiBtn.classList.remove('active');
  initBoard();
});

multiBtn.addEventListener('click', () => {
  gameMode = 'multi';
  multiBtn.classList.add('active');
  singleBtn.classList.remove('active');
  initBoard();
});

initBoard();
