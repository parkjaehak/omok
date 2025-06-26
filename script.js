const SIZE = 15;
const CELL = 40;
const board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0)); // 0: 빈칸, 1: 흑, 2: 백
let turn = 1; // 1: 사람(흑), 2: AI(백)
let gameOver = false;

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const message = document.getElementById("message");
const restartBtn = document.getElementById("restart");

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // 격자
  for (let i = 0; i < SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(CELL / 2, CELL / 2 + i * CELL);
    ctx.lineTo(CELL / 2 + (SIZE - 1) * CELL, CELL / 2 + i * CELL);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(CELL / 2 + i * CELL, CELL / 2);
    ctx.lineTo(CELL / 2 + i * CELL, CELL / 2 + (SIZE - 1) * CELL);
    ctx.stroke();
  }
  // 돌
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (board[y][x] !== 0) drawStone(x, y, board[y][x]);
    }
  }
}

function drawStone(x, y, color) {
  ctx.beginPath();
  ctx.arc(CELL / 2 + x * CELL, CELL / 2 + y * CELL, CELL * 0.4, 0, 2 * Math.PI);
  ctx.fillStyle = color === 1 ? "#222" : "#fff";
  ctx.strokeStyle = "#222";
  ctx.fill();
  ctx.stroke();
}

function checkWin(x, y, color) {
  const dirs = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
  ];
  for (const [dx, dy] of dirs) {
    let cnt = 1;
    for (let d = 1; d < 5; d++) {
      const nx = x + dx * d,
        ny = y + dy * d;
      if (
        nx < 0 ||
        ny < 0 ||
        nx >= SIZE ||
        ny >= SIZE ||
        board[ny][nx] !== color
      )
        break;
      cnt++;
    }
    for (let d = 1; d < 5; d++) {
      const nx = x - dx * d,
        ny = y - dy * d;
      if (
        nx < 0 ||
        ny < 0 ||
        nx >= SIZE ||
        ny >= SIZE ||
        board[ny][nx] !== color
      )
        break;
      cnt++;
    }
    if (cnt >= 5) return true;
  }
  return false;
}

function evaluate(x, y, color) {
  // 해당 칸에 color(1:플레이어, 2:AI)가 두었을 때 만들 수 있는 최대 연속 돌 수를 반환
  let maxCount = 0;
  const dirs = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
  ];
  for (const [dx, dy] of dirs) {
    let count = 1;
    for (let d = 1; d < 5; d++) {
      const nx = x + dx * d,
        ny = y + dy * d;
      if (
        nx < 0 ||
        ny < 0 ||
        nx >= SIZE ||
        ny >= SIZE ||
        board[ny][nx] !== color
      )
        break;
      count++;
    }
    for (let d = 1; d < 5; d++) {
      const nx = x - dx * d,
        ny = y - dy * d;
      if (
        nx < 0 ||
        ny < 0 ||
        nx >= SIZE ||
        ny >= SIZE ||
        board[ny][nx] !== color
      )
        break;
      count++;
    }
    if (count > maxCount) maxCount = count;
  }
  return maxCount;
}

canvas.addEventListener("click", (e) => {
  if (gameOver || turn !== 1) return;
  const rect = canvas.getBoundingClientRect();
  const x = Math.round((e.clientX - rect.left - CELL / 2) / CELL);
  const y = Math.round((e.clientY - rect.top - CELL / 2) / CELL);
  if (x < 0 || y < 0 || x >= SIZE || y >= SIZE || board[y][x] !== 0) return;
  board[y][x] = 1;
  drawBoard();
  if (checkWin(x, y, 1)) {
    message.textContent = "플레이어(흑)가 승리했습니다!";
    gameOver = true;
    return;
  }
  turn = 2;
  message.textContent = "AI(백) 차례입니다...";
  setTimeout(aiMove, 500);
});

function aiMove() {
  if (gameOver) return;
  let bestScore = -1;
  let candidates = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (board[y][x] !== 0) continue;
      const aiScore = evaluate(x, y, 2);
      const playerScore = evaluate(x, y, 1);
      let score = 0;
      if (aiScore >= 5) score = 10000; // AI 즉시 승리
      else if (playerScore >= 5) score = 9000; // 플레이어 즉시 승리 막기
      else if (aiScore === 4) score = 8500; // AI 4목 만들기(이길 기회)
      else if (playerScore === 4) score = 8000; // 플레이어 4목 막기
      else if (playerScore === 3) score = 5000; // 플레이어 3목 막기
      else score = aiScore * 10 + playerScore * 8;
      if (score > bestScore) {
        bestScore = score;
        candidates = [[x, y]];
      } else if (score === bestScore) {
        candidates.push([x, y]);
      }
    }
  }
  if (candidates.length === 0) {
    message.textContent = "무승부!";
    gameOver = true;
    return;
  }
  const [x, y] = candidates[Math.floor(Math.random() * candidates.length)];
  board[y][x] = 2;
  drawBoard();
  if (checkWin(x, y, 2)) {
    message.textContent = "AI(백)가 승리했습니다!";
    gameOver = true;
    return;
  }
  turn = 1;
  message.textContent = "플레이어(흑) 차례입니다.";
}

restartBtn.addEventListener("click", () => {
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) board[y][x] = 0;
  turn = 1;
  gameOver = false;
  message.textContent = "흑(플레이어)부터 시작하세요.";
  drawBoard();
});

drawBoard();
