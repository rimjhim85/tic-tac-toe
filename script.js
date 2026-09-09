const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");

const restartButton = document.getElementById("restart");

const scoreXElement = document.getElementById("scoreX");
const scoreOElement = document.getElementById("scoreO");
const scoreDrawElement = document.getElementById("scoreDraw");

const modeButtons = document.querySelectorAll(".mode");

// Overlay elements
const gameOverlay = document.getElementById("gameOverlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayMessage = document.getElementById("overlayMessage");
const overlayIcon = document.getElementById("overlayIcon");
const startGameButton = document.getElementById("startGame");


/* ==========================================
   GAME VARIABLES
========================================== */

let board = ["", "", "", "", "", "", "", ""];

let currentPlayer = "X";

let gameActive = true;

let gameMode = "friend";

let computerThinking = false;

let scores = {
    X: 0,
    O: 0,
    draws: 0
};


/* ==========================================
   WINNING PATTERNS
========================================== */

const winningPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6]
];


/* ==========================================
   CELL CLICK
========================================== */

cells.forEach(cell => {

    cell.addEventListener("click", () => {

        const index = Number(cell.dataset.index);


        // Game already finished
        if (!gameActive) {
            return;
        }


        // Computer is thinking
        if (
            gameMode === "computer" &&
            computerThinking
        ) {
            return;
        }


        // Cell already occupied
        if (cell.textContent !== "") {
            return;
        }


        // Current player makes the move
        const player = currentPlayer;

        board[index] = player;

        cell.textContent = player;

        cell.classList.add(
            player.toLowerCase()
        );


        // Check win or draw
        const gameEnded = checkResult();


        if (gameEnded) {
            return;
        }


        /* ==================================
           VS COMPUTER
        ================================== */

        if (gameMode === "computer") {

            currentPlayer = "O";

            computerThinking = true;

            statusText.textContent =
                "Computer's turn";


            setTimeout(() => {

                computerMove();

            }, 400);


            return;
        }


        /* ==================================
           TWO PLAYERS
        ================================== */

        currentPlayer =
            currentPlayer === "X"
                ? "O"
                : "X";


        statusText.textContent =
            `Player ${currentPlayer}'s turn`;
    });

});


/* ==========================================
   CHECK RESULT
========================================== */

function checkResult() {

    // Check all winning patterns
    for (const pattern of winningPatterns) {

        const [a, b, c] = pattern;


        if (board[a] === "") {
            continue;
        }


        if (
            board[a] === board[b] &&
            board[b] === board[c]
        ) {

            endGame(
                board[a],
                pattern
            );

            return true;
        }
    }


    /* ==================================
       DRAW
    ================================== */

    if (
        board.every(
            cell => cell !== ""
        )
    ) {

        gameActive = false;

        computerThinking = false;

        scores.draws++;

        updateScores();

        statusText.textContent =
            "It's a draw!";


        // Show draw overlay
        setTimeout(() => {

            showDrawScreen();

        }, 500);


        return true;
    }


    return false;
}


/* ==========================================
   END GAME
========================================== */

function endGame(
    winner,
    winningPattern
) {

    gameActive = false;

    computerThinking = false;


    // Update score
    scores[winner]++;

    updateScores();


    /* ==================================
       WINNING MESSAGE
    ================================== */

    if (gameMode === "computer") {

        if (winner === "X") {

            statusText.textContent =
                "You win! 🎉";

        } else {

            statusText.textContent =
                "Computer wins!";
        }

    } else {

        statusText.textContent =
            `Player ${winner} wins!`;
    }


    /* ==================================
       HIGHLIGHT WINNING CELLS
    ================================== */

    winningPattern.forEach(index => {

        cells[index].classList.add(
            "winner"
        );

    });


    /* ==================================
       SHOW WIN SCREEN
    ================================== */

    setTimeout(() => {

        showWinScreen(winner);

    }, 500);
}


/* ==========================================
   COMPUTER MOVE
========================================== */

function computerMove() {

    if (!gameActive) {

        computerThinking = false;

        return;
    }


    const move = getBestMove();


    if (move === null) {

        computerThinking = false;

        return;
    }


    // Computer plays O
    board[move] = "O";

    cells[move].textContent = "O";

    cells[move].classList.add("o");


    // Check result
    const gameEnded = checkResult();


    if (gameEnded) {

        computerThinking = false;

        return;
    }


    // Give control back to player
    computerThinking = false;

    currentPlayer = "X";

    statusText.textContent =
        "Your turn";
}


/* ==========================================
   FIND BEST COMPUTER MOVE
========================================== */

function getBestMove() {

    let bestScore = -Infinity;

    let bestMove = null;


    for (
        let i = 0;
        i < board.length;
        i++
    ) {

        if (board[i] === "") {

            // Try O
            board[i] = "O";


            const score = minimax(
                board,
                0,
                false
            );


            // Undo move
            board[i] = "";


            if (score > bestScore) {

                bestScore = score;

                bestMove = i;
            }
        }
    }


    return bestMove;
}


/* ==========================================
   MINIMAX
========================================== */

function minimax(
    position,
    depth,
    maximizing
) {

    const winner =
        getWinner(position);


    // Computer wins
    if (winner === "O") {

        return 10 - depth;
    }


    // Player wins
    if (winner === "X") {

        return depth - 10;
    }


    // Draw
    if (!position.includes("")) {

        return 0;
    }


    /* ==================================
       COMPUTER TURN
    ================================== */

    if (maximizing) {

        let bestScore = -Infinity;


        for (
            let i = 0;
            i < position.length;
            i++
        ) {

            if (position[i] === "") {

                position[i] = "O";


                const score = minimax(
                    position,
                    depth + 1,
                    false
                );


                position[i] = "";


                bestScore =
                    Math.max(
                        bestScore,
                        score
                    );
            }
        }


        return bestScore;
    }


    /* ==================================
       PLAYER TURN
    ================================== */

    else {

        let bestScore = Infinity;


        for (
            let i = 0;
            i < position.length;
            i++
        ) {

            if (position[i] === "") {

                position[i] = "X";


                const score = minimax(
                    position,
                    depth + 1,
                    true
                );


                position[i] = "";


                bestScore =
                    Math.min(
                        bestScore,
                        score
                    );
            }
        }


        return bestScore;
    }
}


/* ==========================================
   GET WINNER
========================================== */

function getWinner(position) {

    for (
        const pattern of winningPatterns
    ) {

        const [a, b, c] = pattern;


        if (
            position[a] !== "" &&
            position[a] === position[b] &&
            position[b] === position[c]
        ) {

            return position[a];
        }
    }


    return null;
}


/* ==========================================
   UPDATE SCORE
========================================== */

function updateScores() {

    scoreXElement.textContent =
        scores.X;

    scoreOElement.textContent =
        scores.O;

    scoreDrawElement.textContent =
        scores.draws;
}


/* ==========================================
   RESTART GAME
========================================== */

function restartGame() {

    board = [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
    ];


    currentPlayer = "X";

    gameActive = true;

    computerThinking = false;


    cells.forEach(cell => {

        cell.textContent = "";

        cell.classList.remove(
            "x",
            "o",
            "winner"
        );
    });


    if (gameMode === "computer") {

        statusText.textContent =
            "Your turn";

    } else {

        statusText.textContent =
            "Player X's turn";
    }
}


/* ==========================================
   CHANGE GAME MODE
========================================== */

modeButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            // Remove active state
            modeButtons.forEach(btn => {

                btn.classList.remove(
                    "active"
                );

            });


            // Activate selected mode
            button.classList.add(
                "active"
            );


            // Set mode
            gameMode =
                button.dataset.mode;


            // Start new game
            restartGame();
        }
    );
});


/* ==========================================
   NEW GAME BUTTON
========================================== */

restartButton.addEventListener(
    "click",
    restartGame
);


/* ==========================================
   START SCREEN
========================================== */

function showStartScreen() {

    gameOverlay.classList.remove(
        "hidden"
    );

    gameOverlay.classList.remove(
        "win-overlay"
    );


    overlayIcon.textContent = "🎮";

    overlayTitle.textContent =
        "Let's Play!";

    overlayMessage.textContent =
        "Tic Tac Toe";

    startGameButton.textContent =
        "Start Game";
}


/* ==========================================
   HIDE OVERLAY
========================================== */

function hideOverlay() {

    gameOverlay.classList.add(
        "hidden"
    );
}


/* ==========================================
   WIN SCREEN
========================================== */

function showWinScreen(winner) {

    gameOverlay.classList.remove(
        "hidden"
    );

    gameOverlay.classList.add(
        "win-overlay"
    );


    overlayIcon.textContent = "🏆";


    if (gameMode === "computer") {

        if (winner === "X") {

            overlayTitle.textContent =
                "You Win!";

            overlayMessage.textContent =
                "Congratulations!";

        } else {

            overlayTitle.textContent =
                "Computer Wins!";

            overlayMessage.textContent =
                "Better luck next time!";
        }

    } else {

        overlayTitle.textContent =
            `Player ${winner} Wins!`;

        overlayMessage.textContent =
            "Congratulations!";
    }


    startGameButton.textContent =
        "Play Again";


    // Sparkle effect
    createSparkles();


    // Automatically restart
    setTimeout(() => {

        gameOverlay.classList.add(
            "hidden"
        );

        gameOverlay.classList.remove(
            "win-overlay"
        );

        restartGame();

    }, 3000);
}


/* ==========================================
   DRAW SCREEN
========================================== */

function showDrawScreen() {

    gameOverlay.classList.remove(
        "hidden"
    );

    gameOverlay.classList.remove(
        "win-overlay"
    );


    overlayIcon.textContent = "—";

    overlayTitle.textContent =
        "It's a Draw!";

    overlayMessage.textContent =
        "Nobody takes this one.";

    startGameButton.textContent =
        "Play Again";


    // Automatically restart
    setTimeout(() => {

        gameOverlay.classList.add(
            "hidden"
        );

        restartGame();

    }, 2500);
}


/* ==========================================
   SPARKLES
========================================== */

function createSparkles() {

    for (let i = 0; i < 45; i++) {

        const sparkle =
            document.createElement("div");


        sparkle.classList.add(
            "sparkle"
        );


        const startX =
            window.innerWidth / 2;

        const startY =
            window.innerHeight / 2;


        const x =
            (Math.random() - 0.5) *
            window.innerWidth;

        const y =
            (Math.random() - 0.5) *
            window.innerHeight;


        sparkle.style.left =
            `${startX}px`;

        sparkle.style.top =
            `${startY}px`;


        sparkle.style.setProperty(
            "--x",
            `${x}px`
        );

        sparkle.style.setProperty(
            "--y",
            `${y}px`
        );


        document.body.appendChild(
            sparkle
        );


        setTimeout(() => {

            sparkle.remove();

        }, 1200);
    }
}


/* ==========================================
   START BUTTON
========================================== */

startGameButton.addEventListener(
    "click",
    () => {

        hideOverlay();

        restartGame();
    }
);


/* ==========================================
   SHOW START SCREEN
========================================== */

showStartScreen();