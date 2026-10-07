/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("myCanvas");

const ctx = canvas.getContext("2d");

const B1x1 = 0;
const B1x2 = 1;
const B2x1 = 2;
const B2x2 = 3;
const Left = 0;
const Right = 1;
const Up = 2;
const Down = 3;
const Cardinals = [Left, Right, Up, Down];

const LeftOfs = { x: -1, y: 0 };
const RightOfs = { x: 1, y: 0 };
const UpOfs = { x: 0, y: -1 };
const DownOfs = { x: 0, y: 1 };

const EMPTY_SQUARE = -1;
const NO_PIECE = -1;

const sizes = [{ width: 1, height: 1 },
{ width: 1, height: 2 },
{ width: 2, height: 1 },
{ width: 2, height: 2 }
];

var P1 = { pieceType: B1x1, x: 0, y: 0, color: "#f7b475" };
var P2 = { pieceType: B1x1, x: 3, y: 0, color: "#f7b475" };
var P3 = { pieceType: B1x1, x: 1, y: 1, color: "#f7b475" };
var P4 = { pieceType: B1x1, x: 2, y: 1, color: "#f7b475" };
var P5 = { pieceType: B1x2, x: 0, y: 1, color: "#61ef6f" };
var P6 = { pieceType: B1x2, x: 3, y: 1, color: "#61ef6f" };
var P7 = { pieceType: B1x2, x: 0, y: 3, color: "#61ef6f" };
var P8 = { pieceType: B1x2, x: 3, y: 3, color: "#61ef6f" };
var P9 = { pieceType: B2x1, x: 1, y: 2, color: "#0000ff" };
var P10 = { pieceType: B2x2, x: 1, y: 3, color: "#ffff00" };

const scale = 75; // Scale factor for drawing
const AvailableMoveDisplayMargin = 15;
const origin = { x: 50, y: 100 }; // Origin point for drawing

const Pieces = [P1, P2, P3, P4, P5, P6, P7, P8, P9, P10];

var SelectedPiece = NO_PIECE;

var board = [
    [EMPTY_SQUARE, EMPTY_SQUARE, EMPTY_SQUARE, EMPTY_SQUARE],
    [EMPTY_SQUARE, EMPTY_SQUARE, EMPTY_SQUARE, EMPTY_SQUARE],
    [EMPTY_SQUARE, EMPTY_SQUARE, EMPTY_SQUARE, EMPTY_SQUARE],
    [EMPTY_SQUARE, EMPTY_SQUARE, EMPTY_SQUARE, EMPTY_SQUARE],
    [EMPTY_SQUARE, EMPTY_SQUARE, EMPTY_SQUARE, EMPTY_SQUARE]
];

const boardWidth = board[0].length;
const boardHeight = board.length;

function clickCoordinates(x, y) {
    const gridX = Math.floor((x - origin.x) / scale);
    const gridY = Math.floor((y - origin.y) / scale);
    return { x: gridX, y: gridY };
}

function clearBoard() {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            board[i][j] = EMPTY_SQUARE;
        }
    }
}

function updateBoard() {
    // Clear the board
    clearBoard();

    for (let i = 0; i < Pieces.length; i++) {
        const piece = Pieces[i];
        const size = sizes[piece.pieceType];
        for (let dx = 0; dx < size.width; dx++) {
            for (let dy = 0; dy < size.height; dy++) {
                const boardX = piece.x + dx;
                const boardY = piece.y + dy;
                if (boardX >= 0 && boardX < board[0].length && boardY >= 0 && boardY < board.length) {
                    board[boardY][boardX] = i;
                }
            }
        }
    }
}

canvas.addEventListener('click', function (event) {
    const x = event.offsetX;
    const y = event.offsetY;

    const gridPosition = clickCoordinates(x, y);
    const pieceIndex = board[gridPosition.y][gridPosition.x];

    console.log(`Clicked at grid position: X = ${gridPosition.x}, Y = ${gridPosition.y}`);
    console.log(`Clicked on piece index: ${pieceIndex}`);
    if (pieceIndex !== NO_PIECE) {
        SelectedPiece = pieceIndex;
        console.log(`Selected piece index: ${SelectedPiece}`);
        AvailableMoves = findAvailableMoves(SelectedPiece);
        console.log(`Available moves for piece ${SelectedPiece}:`, AvailableMoves);
    } else {
        console.log("Clicked on empty space.");
        tryMoveSelectedPiece(gridPosition);
    }
    drawBoard();
});

function positionIsValid(position) {
    return position.x >= 0 && position.x < boardWidth && position.y >= 0 && position.y < boardHeight;
}

function positionIsEmpty(position) {
    console.log(`positionIsEmpty ${position.x}, ${position.y})`)
    var ret = positionIsValid(position) && board[position.y][position.x] === EMPTY_SQUARE;
    console.log(`result ${ret}`);
    return ret;
}

function getPieceSize(piece) {
    return sizes[piece.pieceType];
}

function getMovePositions(pieceIndex, move) {
    console.log(`getMovePositions ${pieceIndex} ${move}`);
    const piece = Pieces[pieceIndex];
    const size = getPieceSize(piece);
    console.log(`piece ${piece.pieceType} @${piece.x} ${piece.y}`);
    var positions = [];
    if (move == Left) {
        console.log('left');
        for (y = 0; y < size.height; y++) {
            console.log(`pushing ${piece.x - 1} ${piece.y + y}`);
            positions.push({ x: piece.x - 1, y: piece.y + y });
        }
    }
    if (move == Right) {
        console.log('right');
        for (y = 0; y < size.height; y++) {
            console.log(`pushing ${piece.x + size.width} ${piece.y + y}`);
            positions.push({ x: piece.x + size.width, y: piece.y + y });
        }
    }
    if (move == Up) {
        console.log('up');
        for (x = 0; x < size.width; x++) {
            positions.push({ x: piece.x + x, y: piece.y - 1 });
        }
    }
    if (move == Down) {
        console.log('down');
        for (x = 0; x < size.width; x++) {
            positions.push({ x: piece.x + x, y: piece.y + size.height });
        }
    }
    console.log(`movePositions ${pieceIndex} ${move}`);
    for (p = 0; p < positions.length; p++) {
        console.log(`pos: ${positions[p].x} ${positions[p].y}`);
    }
    return positions;
}

function findAvailableMoves(pieceIndex) {
    const piece = Pieces[pieceIndex];
    var candidateMoves = [];
    var availableMoves = [];


    for (dir = 0; dir < Cardinals.length; dir++) {
        candidateMoves = getMovePositions(pieceIndex, Cardinals[dir]);
        valid = true;
        for (i = 0; i < candidateMoves.length; i++) {
            if (!positionIsEmpty(candidateMoves[i])) {
                valid = false;
            }
        }
        if (valid) {
            availableMoves = availableMoves.concat(candidateMoves);
        }
    }
    console.log(`availableMoves:`);
    for (m = 0; m < availableMoves.length; m++) {
        console.log(`${availableMoves[m].x} ${availableMoves[m].y}`);
    }
    return availableMoves;
}

function positionIsAdjacent(piece, targetPosition) {
    const offset = {
        x: targetPosition.x - piece.x,
        y: targetPosition.y - piece.y
    };
    if (!positionIsValid(targetPosition)) {
        return { adjacent: false, xOfs: 0, yOfs: 0 };
    }
    var xAdjacent = (offset.x == -1 || offset.x == sizes[piece.pieceType].width);
    var yAdjacent = (offset.y == -1 || offset.y == sizes[piece.pieceType].height);
    var xInterior = (offset.x >= 0 && offset.x < sizes[piece.pieceType].width);
    var yInterior = (offset.y >= 0 && offset.y < sizes[piece.pieceType].height);
    var xOfs = 0;
    var yOfs = 0;
    var adjacent = false;
    if (xAdjacent && yInterior) {
        xOfs = (offset.x < 0) ? -1 : 1;
        adjacent = true;
    }
    if (yAdjacent && xInterior) {
        yOfs = (offset.y < 0) ? -1 : 1;
        adjacent = true;
    }
    return { adjacent: adjacent, xOfs: xOfs, yOfs: yOfs }
}

function tryMoveSelectedPiece(targetPosition) {
    const selected = Pieces[SelectedPiece];
    const size = sizes[selected.pieceType];
    var adjacentInfo = positionIsAdjacent(selected, targetPosition);
    if (adjacentInfo.adjacent) {
        console.log(`Attempting to move piece ${SelectedPiece} to (${targetPosition.x}, ${targetPosition.y})`);
        var newPosition = { x: selected.x + adjacentInfo.xOfs, y: selected.y + adjacentInfo.yOfs };
        tryMovePieceTo(SelectedPiece, newPosition);
    }
}

function isMovePieceValid(pieceIndex, targetPosition) {
    const piece = Pieces[pieceIndex];
    const size = sizes[piece.pieceType];
    var available = true;
    for (let dx = 0; dx < size.width; dx++) {
        for (let dy = 0; dy < size.height; dy++) {
            const boardX = targetPosition.x + dx;
            const boardY = targetPosition.y + dy;
            const boardPosition = { x: boardX, y: boardY };
            // Check if the target position is valid and empty
            if (boardX >= 0 && boardX < boardWidth && boardY >= 0 && boardY < boardHeight) {
                isAvailable = positionIsEmpty(boardPosition) || (board[boardY][boardX] == pieceIndex);
                if (!isAvailable

                ) {
                    available = false;
                }
            } else {
                available = false;
            }
        }
    }
    return available;
}

function tryMovePieceTo(pieceIndex, targetPosition) {
    available = isMovePieceValid(pieceIndex, targetPosition);
    if (available) {
        console.log(`Moving piece ${pieceIndex} to (${targetPosition.x}, ${targetPosition.y})`);
        movePiece(pieceIndex, targetPosition);
        AvailableMoves = findAvailableMoves(pieceIndex);
        updateBoard();
    }
}

function movePiece(pieceIndex, targetPosition) {
    const piece = Pieces[pieceIndex];
    const size = sizes[piece.pieceType];
    for (let dx = 0; dx < size.width; dx++) {
        for (let dy = 0; dy < size.height; dy++) {
            const boardX = piece.x + dx;
            const boardY = piece.y + dy;
            if (boardX >= 0 && boardX < boardWidth && boardY >= 0 && boardY < boardHeight) {
                board[boardY][boardX] = EMPTY_SQUARE; // Clear the old position
            }
        }
    }
    for (let dx = 0; dx < size.width; dx++) {
        for (let dy = 0; dy < size.height; dy++) {
            const boardX = targetPosition.x + dx;
            const boardY = targetPosition.y + dy;
            if (boardX >= 0 && boardX < boardWidth && boardY >= 0 && boardY < boardHeight) {
                board[boardY][boardX] = pieceIndex; // Set the new position
            }
        }
    }
    Pieces[pieceIndex].x = targetPosition.x;
    Pieces[pieceIndex].y = targetPosition.y;
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < Pieces.length; i++) {
        const piece = Pieces[i];
        const x = origin.x + piece.x * scale;
        const y = origin.y + piece.y * scale;
        const size = sizes[piece.pieceType];
        var color = piece.color;
        // console.log(`Drawing piece ${i + 1}: Type=${piece.pieceType}, Position=(${piece.x}, ${piece.y}) Size=(${size.width}, ${size.height})`);
        ctx.beginPath();
        ctx.rect(x, y, size.width * scale, size.height * scale);
        // console.log(`Drawing piece ${i + 1}: Type=${piece.pieceType}, Position=(${piece.x}, ${piece.y}), Size=(${size.width}, ${size.height})`);
        if (i === SelectedPiece) {
            ctx.lineWidth = 5;
            color = "#ff0000"; // Highlight selected piece in red
        } else {
            ctx.lineWidth = 1;
        }
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "#000000";
        ctx.stroke();
        ctx.closePath();
    }
    for (let i = 0; i < AvailableMoves.length; i++) {
        const move = AvailableMoves[i];
        const x = origin.x + move.x * scale;
        const y = origin.y + move.y * scale;

        ctx.beginPath();
        const margin = AvailableMoveDisplayMargin;
        ctx.rect(x + margin, y + margin, scale - margin * 2, scale - margin * 2);
        ctx.fillStyle = "rgba(3, 83, 194, 0.5)";
        ctx.fill();
        ctx.strokeStyle = "#000000";
        ctx.stroke();
        ctx.closePath();
    }
}

// Start the animation
SelectedPiece = 0;
updateBoard();
AvailableMoves = findAvailableMoves(SelectedPiece);
drawBoard();
