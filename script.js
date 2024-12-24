const cells = document.querySelectorAll('.cell');
const resetButton = document.getElementById('reset');
const playerScoreEl = document.getElementById('playerScore');
const computerScoreEl = document.getElementById('computerScore');
const gameMessageEl = document.getElementById('gameMessage');
const playAgainButton = document.getElementById('playAgain');
const difficultySelector = document.getElementById('difficulty');

let currentPlayer = 'X';
let board = ['', '', '', '', '', '', '', '', ''];
let playerScore = 0;
let computerScore = 0;
let difficulty = 'easy';  // Default difficulty is easy

const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

function checkWin() {
    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a]; // Return the winning player ('X' or 'O')
        }
    }
    if (!board.includes('')) {
        return 'Draw'; // It's a draw if there are no empty cells left
    }
    return null; // No winner yet
}

function makeMove(index, player) {
    board[index] = player;
    cells[index].textContent = player;
}

function computerMove() {
    const emptyCells = board.map((value, index) => value === '' ? index : null).filter(index => index !== null);

    if (difficulty === 'easy') {
        // Easy: Make a random move
        const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        makeMove(randomIndex, 'O');
    } else if (difficulty === 'medium') {
        // Medium: Block winning moves or make a random move
        let moveMade = false;
        
        // Check if the player is about to win and block
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            const cellsToCheck = [board[a], board[b], board[c]];
            const emptyIndex = cellsToCheck.indexOf('');
            if (emptyIndex !== -1 && cellsToCheck.filter(cell => cell === 'X').length === 2) {
                const indexToBlock = pattern[emptyIndex];
                makeMove(indexToBlock, 'O');
                moveMade = true;
                break;
            }
        }

        // If no blocking move, make a random move
        if (!moveMade) {
            const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            makeMove(randomIndex, 'O');
        }
    } else if (difficulty === 'hard') {
        // Hard: Optimal move (minimax algorithm)
        const bestMove = getBestMove();
        makeMove(bestMove, 'O');
    }
}

function getBestMove() {
    // Minimax algorithm to find the best move for 'O'
    const emptyCells = board.map((value, index) => value === '' ? index : null).filter(index => index !== null);
    let bestScore = -Infinity;
    let bestMove = -1;

    for (const index of emptyCells) {
        board[index] = 'O';
        const score = minimax(board, false);
        board[index] = '';
        if (score > bestScore) {
            bestScore = score;
            bestMove = index;
        }
    }
    return bestMove;
}

function minimax(board, isMaximizing) {
    const winner = checkWin();
    if (winner === 'O') return 1;
    if (winner === 'X') return -1;
    if (winner === 'Draw') return 0;

    const emptyCells = board.map((value, index) => value === '' ? index : null).filter(index => index !== null);
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (const index of emptyCells) {
            board[index] = 'O';
            const score = minimax(board, false);
            board[index] = '';
            bestScore = Math.max(score, bestScore);
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (const index of emptyCells) {
            board[index] = 'X';
            const score = minimax(board, true);
            board[index] = '';
            bestScore = Math.min(score, bestScore);
        }
        return bestScore;
    }
}

function handleCellClick(event) {
    const index = event.target.dataset.index;

    if (board[index] !== '' || gameMessageEl.textContent) return;

    makeMove(index, 'X');

    const winner = checkWin();
    if (winner) {
        if (winner === 'X') {
            gameMessageEl.textContent = 'You win!';
            playerScore++;
            playerScoreEl.textContent = playerScore;
            highlightWinningCells('X');
        } else if (winner === 'O') {
            gameMessageEl.textContent = 'Computer wins!';
            computerScore++;
            computerScoreEl.textContent = computerScore;
            highlightWinningCells('O');
        } else {
            gameMessageEl.textContent = 'It\'s a draw!';
        }

        playAgainButton.style.display = 'block';
        return;
    }

    // Delay computer's move to give the player time to see the move
    setTimeout(() => {
        computerMove();
        const winner = checkWin();
        if (winner) {
            if (winner === 'X') {
                gameMessageEl.textContent = 'You win!';
                playerScore++;
                playerScoreEl.textContent = playerScore;
                highlightWinningCells('X');
            } else if (winner === 'O') {
                gameMessageEl.textContent = 'Computer wins!';
                computerScore++;
                computerScoreEl.textContent = computerScore;
                highlightWinningCells('O');
            } else {
                gameMessageEl.textContent = 'It\'s a draw!';
            }
            playAgainButton.style.display = 'block';
        }
    }, 1000); // Delay the computer's move by 1 second
}

function highlightWinningCells(winner) {
    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] === winner && board[b] === winner && board[c] === winner) {
            cells[a].classList.add('winning-cell');
            cells[b].classList.add('winning-cell');
            cells[c].classList.add('winning-cell');
            cells[a].innerHTML = winner === 'X' ? '<span class="cross-symbol">X</span>' : '<span class="cross-symbol">O</span>';
            cells[b].innerHTML = winner === 'X' ? '<span class="cross-symbol">X</span>' : '<span class="cross-symbol">O</span>';
            cells[c].innerHTML = winner === 'X' ? '<span class="cross-symbol">X</span>' : '<span class="cross-symbol">O</span>';
        }
    }
}

function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('winning-cell');
    });
    gameMessageEl.textContent = '';
    playAgainButton.style.display = 'none';
}

function handlePlayAgain() {
    resetGame();
}

function handleDifficultyChange() {
    difficulty = difficultySelector.value;
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', resetGame);
playAgainButton.addEventListener('click', handlePlayAgain);
difficultySelector.addEventListener('change', handleDifficultyChange);
