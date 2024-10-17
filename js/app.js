document.addEventListener('DOMContentLoaded', () => {

    // Элементы DOM
    const gameGrid = document.querySelector('.game-grid');
    const startPauseButton = document.getElementById('start-pause-button');
    const scoreDisplay = document.getElementById('score');
    const levelDisplay = document.getElementById('level');

    // Игровое поле
    const gridWidth = 10;
    const gridHeight = 20;
    const gridSize = gridWidth * gridHeight;

    // Создание игрового поля
    for (let i = 0; i < gridSize; i++) {
        const block = document.createElement('div');
        gameGrid.appendChild(block);
    }

    const blocks = Array.from(document.querySelectorAll('.game-grid div'));

    // Фигуры
    const tetrominoes = [
        // I
        {
            rotations: [
                [[0, 1], [0, 2], [0, 3], [0, 0]],
                [[-1, 0], [0, 0], [1, 0], [2, 0]],
            ],
            color: 'cyan',
        },
        // O
        {
            rotations: [
                [[0, 0], [0, 1], [1, 0], [1, 1]],
            ],
            color: 'yellow',
        },
        // T
        {
            rotations: [
                [[0, 0], [0, -1], [0, 1], [1, 0]],
                [[0, 0], [-1, 0], [1, 0], [0, -1]],
                [[0, 0], [0, -1], [0, 1], [-1, 0]],
                [[0, 0], [-1, 0], [1, 0], [0, 1]],
            ],
            color: 'pink',
        },
        // S
        {
            rotations: [
                [[0, 0], [0, 1], [1, -1], [1, 0]],
                [[0, 0], [-1, 0], [0, -1], [1, -1]],
            ],
            color: 'green',
        },
        // Z
        {
            rotations: [
                [[0, 0], [0, -1], [1, 0], [1, 1]],
                [[0, 0], [-1, -1], [0, -1], [1, 0]],
            ],
            color: 'red',
        },
        // J
        {
            rotations: [
                [[0, 0], [0, -1], [0, 1], [1, -1]],
                [[0, 0], [-1, 0], [1, 0], [-1, -1]],
                [[0, 0], [0, -1], [0, 1], [-1, 1]],
                [[0, 0], [-1, 0], [1, 0], [1, 1]],
            ],
            color: 'blue',
        },
        // L
        {
            rotations: [
                [[0, 0], [0, -1], [0, 1], [1, 1]],
                [[0, 0], [-1, 0], [1, 0], [-1, 1]],
                [[0, 0], [0, -1], [0, 1], [-1, -1]],
                [[0, 0], [-1, 0], [1, 0], [1, -1]],
            ],
            color: 'orange',
        },
    ];

    // Игровые переменные
    let currentTetromino;
    let currentRotation = 0;
    let currentPosition = { x: 4, y: 0 };
    let timerId;
    let isPaused = false;
    let score = 0;
    let level = 1;
    let linesCleared = 0;

    // Функция для создания новой фигуры
    function createNewTetromino() {
        const randomIndex = Math.floor(Math.random() * tetrominoes.length);
        currentTetromino = tetrominoes[randomIndex];
        currentRotation = 0;
        currentPosition = { x: 4, y: 0 };
        if (!isValidMove(0, 0, currentTetromino.rotations[currentRotation])) {
            alert('Игра окончена :(');
            clearInterval(timerId);
            document.removeEventListener('keydown', control);
            startPauseButton.innerText = 'Начать новую игру';
            isPaused = true;
        } else {
            draw();
        }
    }

    // Управление с клавиатуры
    function control(e) {
        if (!isPaused) {
            if (e.keyCode === 37) {
                moveLeft();
            } else if (e.keyCode === 38) {
                rotate();
            } else if (e.keyCode === 39) {
                moveRight();
            } else if (e.keyCode === 40) {
                moveDown();
            }
        }
    }
    document.addEventListener('keydown', control);

    // Функции движения
    function moveLeft() {
        if (isValidMove(-1, 0, currentTetromino.rotations[currentRotation])) {
            undraw();
            currentPosition.x -= 1;
            draw();
        }
    }

    function moveRight() {
        if (isValidMove(1, 0, currentTetromino.rotations[currentRotation])) {
            undraw();
            currentPosition.x += 1;
            draw();
        }
    }

    function rotate() {
        const nextRotation = (currentRotation + 1) % currentTetromino.rotations.length;
        if (isValidMove(0, 0, currentTetromino.rotations[nextRotation])) {
            undraw();
            currentRotation = nextRotation;
            draw();
        }
    }

    function moveDown() {
        if (isValidMove(0, 1, currentTetromino.rotations[currentRotation])) {
            undraw();
            currentPosition.y += 1;
            draw();
        } else {
            freeze();
        }
    }

    // Функция фиксации фигуры на поле
    function freeze() {
        currentTetromino.rotations[currentRotation].forEach(block => {
            const x = currentPosition.x + block[0];
            const y = currentPosition.y + block[1];
            const index = y * gridWidth + x;
            if (blocks[index]) {
                blocks[index].classList.add('taken');
                blocks[index].style.backgroundColor = currentTetromino.color;
            }
        });
        checkForCompletedLines();
        createNewTetromino();
    }

    // Функция рисования фигуры
    function draw() {
        currentTetromino.rotations[currentRotation].forEach(block => {
            const x = currentPosition.x + block[0];
            const y = currentPosition.y + block[1];
            const index = y * gridWidth + x;
            if (blocks[index]) {
                blocks[index].classList.add('tetromino');
                blocks[index].style.backgroundColor = currentTetromino.color;
            }
        });
    }

    // Функция удаления фигуры
    function undraw() {
        currentTetromino.rotations[currentRotation].forEach(block => {
            const x = currentPosition.x + block[0];
            const y = currentPosition.y + block[1];
            const index = y * gridWidth + x;
            if (blocks[index]) {
                blocks[index].classList.remove('tetromino');
                blocks[index].style.backgroundColor = '';
            }
        });
    }

    // Проверка валидности движения
    function isValidMove(deltaX, deltaY, rotation) {
        return rotation.every(block => {
            const x = currentPosition.x + block[0] + deltaX;
            const y = currentPosition.y + block[1] + deltaY;
            const index = y * gridWidth + x;
            return (
                x >= 0 &&
                x < gridWidth &&
                y < gridHeight &&
                (y < 0 || !blocks[index].classList.contains('taken'))
            );
        });
    }

    // Кнопка старт/пауза
    startPauseButton.addEventListener('click', () => {
        if (startPauseButton.innerText === 'Начать новую игру') {
            resetGame();
        } else if (isPaused) {
            timerId = setInterval(moveDown, 1000 - (level - 1) * 100);
            document.addEventListener('keydown', control);
            startPauseButton.innerText = 'Пауза';
            isPaused = false;
        } else {
            clearInterval(timerId);
            document.removeEventListener('keydown', control);
            startPauseButton.innerText = 'Старт';
            isPaused = true;
        }
    });

    // Функция сброса игры
    function resetGame() {
        blocks.forEach(block => {
            block.classList.remove('tetromino', 'taken');
            block.style.backgroundColor = '';
        });
        score = 0;
        level = 1;
        linesCleared = 0;
        scoreDisplay.innerText = score;
        levelDisplay.innerText = level;
        isPaused = false;
        startPauseButton.innerText = 'Пауза';
        document.addEventListener('keydown', control);
        createNewTetromino();
        timerId = setInterval(moveDown, 1000);
    }

    // Запуск игры
    createNewTetromino();
    timerId = setInterval(moveDown, 1000);

    // Проверка и удаление заполненных линий
    function checkForCompletedLines() {
        for (let y = 0; y < gridHeight; y++) {
            let isComplete = true;
            for (let x = 0; x < gridWidth; x++) {
                const index = y * gridWidth + x;
                if (!blocks[index].classList.contains('taken')) {
                    isComplete = false;
                    break;
                }
            }
            if (isComplete) {
                score += 10;
                linesCleared += 1;
                scoreDisplay.innerText = score;

                // Удаляем заполненную линию
                for (let x = 0; x < gridWidth; x++) {
                    const index = y * gridWidth + x;
                    blocks[index].classList.remove('taken', 'tetromino');
                    blocks[index].style.backgroundColor = '';
                }

                // Опускаем верхние блоки вниз
                for (let i = y * gridWidth - 1; i >= 0; i--) {
                    if (blocks[i].classList.contains('taken')) {
                        blocks[i].classList.remove('taken', 'tetromino');
                        blocks[i + gridWidth].classList.add('taken');
                        blocks[i + gridWidth].style.backgroundColor = blocks[i].style.backgroundColor;
                        blocks[i].style.backgroundColor = '';
                    }
                }

                // Обновление уровня и скорости
                if (linesCleared % 10 === 0) {
                    level += 1;
                    levelDisplay.innerText = level;
                    clearInterval(timerId);
                    timerId = setInterval(moveDown, 1000 - (level - 1) * 100);
                }

                // Проверяем ту же строку снова после опускания блоков
                y--;
            }
        }
    }
});
