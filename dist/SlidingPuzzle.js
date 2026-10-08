"use strict";
/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
var PieceType;
(function (PieceType) {
    PieceType["B1x1"] = "b11";
    PieceType["B1x2"] = "b12";
    PieceType["B2x1"] = "b21";
    PieceType["B2x2"] = "b22";
})(PieceType || (PieceType = {}));
;
var Direction;
(function (Direction) {
    Direction[Direction["Left"] = 0] = "Left";
    Direction[Direction["Right"] = 1] = "Right";
    Direction[Direction["Up"] = 2] = "Up";
    Direction[Direction["Down"] = 3] = "Down";
})(Direction || (Direction = {}));
;
const Cardinals = [Direction.Left, Direction.Right, Direction.Up, Direction.Down];
const LeftOfs = { x: -1, y: 0 };
const RightOfs = { x: 1, y: 0 };
const UpOfs = { x: 0, y: -1 };
const DownOfs = { x: 0, y: 1 };
const EMPTY_SQUARE = -1;
const NO_PIECE = -1;
const INVALID_SIZE = { width: 0, height: 0 };
const INVALID_POSITION = { x: -1, y: -1 };
const ZERO_COORDINATE = { x: 0, y: 0 };
const PieceSizes = {};
PieceSizes[PieceType.B1x1] = { width: 1, height: 1 };
PieceSizes[PieceType.B1x2] = { width: 1, height: 2 };
PieceSizes[PieceType.B2x1] = { width: 2, height: 1 };
PieceSizes[PieceType.B2x2] = { width: 2, height: 2 };
var P1 = { id: 0, pieceType: PieceType.B1x1, position: { x: 0, y: 0 }, color: "#f7b475" };
var P2 = { id: 1, pieceType: PieceType.B1x1, position: { x: 3, y: 0 }, color: "#f7b475" };
var P3 = { id: 2, pieceType: PieceType.B1x1, position: { x: 1, y: 1 }, color: "#f7b475" };
var P4 = { id: 3, pieceType: PieceType.B1x1, position: { x: 2, y: 1 }, color: "#f7b475" };
var P5 = { id: 4, pieceType: PieceType.B1x2, position: { x: 0, y: 1 }, color: "#61ef6f" };
var P6 = { id: 5, pieceType: PieceType.B1x2, position: { x: 3, y: 1 }, color: "#61ef6f" };
var P7 = { id: 6, pieceType: PieceType.B1x2, position: { x: 0, y: 3 }, color: "#61ef6f" };
var P8 = { id: 7, pieceType: PieceType.B1x2, position: { x: 3, y: 3 }, color: "#61ef6f" };
var P9 = { id: 8, pieceType: PieceType.B2x1, position: { x: 1, y: 2 }, color: "#0000ff" };
var P10 = { id: 9, pieceType: PieceType.B2x2, position: { x: 1, y: 3 }, color: "#ffff00" };
const BoardScale = 75; // Scale factor for drawing
const AvailableMoveDisplayMargin = 15;
const Origin = { x: 50, y: 100 }; // Origin point for drawing
const Pieces = [P1, P2, P3, P4, P5, P6, P7, P8, P9, P10];
var SelectedPiece = NO_PIECE;
var AvailableMoves = [];
const board = [
    [EMPTY_SQUARE, EMPTY_SQUARE, EMPTY_SQUARE, EMPTY_SQUARE],
    [EMPTY_SQUARE, EMPTY_SQUARE, EMPTY_SQUARE, EMPTY_SQUARE],
    [EMPTY_SQUARE, EMPTY_SQUARE, EMPTY_SQUARE, EMPTY_SQUARE],
    [EMPTY_SQUARE, EMPTY_SQUARE, EMPTY_SQUARE, EMPTY_SQUARE],
    [EMPTY_SQUARE, EMPTY_SQUARE, EMPTY_SQUARE, EMPTY_SQUARE]
];
const boardWidth = board[0]?.length ?? 0;
const boardHeight = board.length;
function positionIsValid(position) {
    return position.x >= 0 && position.x < boardWidth && position.y >= 0 && position.y < boardHeight;
}
function getBoardPiece(position) {
    if (!positionIsValid(position)) {
        return EMPTY_SQUARE;
    }
    var boardRow = board[position.y];
    if (boardRow == null) {
        return EMPTY_SQUARE;
    }
    var result = boardRow[position.x];
    return result ?? EMPTY_SQUARE;
}
function setBoardPiece(position, pieceNumber) {
    if (!positionIsValid(position)) {
        return;
    }
    var boardRow = board[position.y];
    if (boardRow == null) {
        return;
    }
    boardRow[position.x] = pieceNumber;
}
function getClickCoordinates(coords) {
    const gridX = Math.floor((coords.x - Origin.x) / BoardScale);
    const gridY = Math.floor((coords.y - Origin.y) / BoardScale);
    return { x: gridX, y: gridY };
}
function clearBoard() {
    for (let row = 0; row < boardHeight; row++) {
        const boardRow = board[row];
        if (boardRow != null) {
            for (let col = 0; col < boardWidth; col++) {
                boardRow[col] = EMPTY_SQUARE;
            }
        }
    }
}
function updateBoard() {
    // Clear the board
    clearBoard();
    for (let i = 0; i < Pieces.length; i++) {
        const piece = Pieces[i];
        if (piece == null) {
            continue;
        }
        const size = PieceSizes[piece.pieceType];
        if (size == null) {
            continue;
        }
        for (let dx = 0; dx < size.width; dx++) {
            for (let dy = 0; dy < size.height; dy++) {
                const boardX = piece.position.x + dx;
                const boardY = piece.position.y + dy;
                setBoardPiece({ x: boardX, y: boardY }, i);
            }
        }
    }
}
canvas.addEventListener('click', function (event) {
    const x = event.offsetX;
    const y = event.offsetY;
    const gridPosition = getClickCoordinates({ x: x, y: y });
    const pieceIndex = getBoardPiece(gridPosition);
    console.log(`Clicked at grid position: X = ${gridPosition.x}, Y = ${gridPosition.y}`);
    console.log(`Clicked on piece index: ${pieceIndex}`);
    if (pieceIndex !== NO_PIECE) {
        SelectedPiece = pieceIndex;
        console.log(`Selected piece index: ${SelectedPiece}`);
        AvailableMoves = findAvailableMoves(SelectedPiece);
        console.log(`Available moves for piece ${SelectedPiece}:`, AvailableMoves);
    }
    else {
        console.log("Clicked on empty space.");
        tryMoveSelectedPiece(gridPosition);
    }
    drawBoard();
});
function positionIsEmpty(position) {
    console.log(`positionIsEmpty ${position.x}, ${position.y})`);
    var ret = positionIsValid(position) && getBoardPiece(position) === EMPTY_SQUARE;
    console.log(`result ${ret}`);
    return ret;
}
function getPieceSize(piece) {
    return PieceSizes[piece.pieceType];
}
function getMovePositions(pieceIndex, move) {
    console.log(`getMovePositions ${pieceIndex} ${move}`);
    const piece = Pieces[pieceIndex];
    if (piece == null) {
        return [];
    }
    const size = getPieceSize(piece) ?? INVALID_SIZE;
    console.log(`piece ${piece.pieceType} @${piece.position.x} ${piece.position.y}`);
    const position = piece.position;
    var positions = [];
    if (move == Direction.Left) {
        console.log('left');
        for (var y = 0; y < size.height; y++) {
            console.log(`pushing ${position.x - 1} ${position.y + y}`);
            positions.push({ x: position.x - 1, y: position.y + y });
        }
    }
    if (move == Direction.Right) {
        console.log('right');
        for (var y = 0; y < size.height; y++) {
            console.log(`pushing ${position.x + size.width} ${position.y + y}`);
            positions.push({ x: position.x + size.width, y: position.y + y });
        }
    }
    if (move == Direction.Up) {
        console.log('up');
        for (var x = 0; x < size.width; x++) {
            positions.push({ x: position.x + x, y: position.y - 1 });
        }
    }
    if (move == Direction.Down) {
        console.log('down');
        for (x = 0; x < size.width; x++) {
            positions.push({ x: position.x + x, y: position.y + size.height });
        }
    }
    console.log(`movePositions ${pieceIndex} ${move}`);
    for (var p = 0; p < positions.length; p++) {
        var pos = positions[p] ?? INVALID_POSITION;
        console.log(`pos: ${pos.x} ${pos.y}`);
    }
    return positions;
}
function findAvailableMoves(pieceIndex) {
    const piece = Pieces[pieceIndex];
    var candidateMoves = [];
    var availableMoves = [];
    for (var dir = 0; dir < Cardinals.length; dir++) {
        candidateMoves = getMovePositions(pieceIndex, Cardinals[dir] ?? Direction.Left);
        var valid = true;
        for (var i = 0; i < candidateMoves.length; i++) {
            if (!positionIsEmpty(candidateMoves[i] ?? ZERO_COORDINATE)) {
                valid = false;
            }
        }
        if (valid) {
            availableMoves = availableMoves.concat(candidateMoves);
        }
    }
    console.log(`availableMoves:`);
    for (var m = 0; m < availableMoves.length; m++) {
        var mov = availableMoves[m] ?? ZERO_COORDINATE;
        console.log(`${mov.x} ${mov.y}`);
    }
    return availableMoves;
}
function positionIsAdjacent(piece, targetPosition) {
    const offset = {
        x: targetPosition.x - piece.position.x,
        y: targetPosition.y - piece.position.y
    };
    if (!positionIsValid(targetPosition)) {
        return { adjacent: false, xOfs: 0, yOfs: 0 };
    }
    var size = getPieceSize(piece) ?? INVALID_SIZE;
    var xAdjacent = (offset.x == -1 || offset.x == size.width);
    var yAdjacent = (offset.y == -1 || offset.y == size.height);
    var xInterior = (offset.x >= 0 && offset.x < size.width);
    var yInterior = (offset.y >= 0 && offset.y < size.height);
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
    return { adjacent: adjacent, xOfs: xOfs, yOfs: yOfs };
}
function tryMoveSelectedPiece(targetPosition) {
    const selected = Pieces[SelectedPiece];
    if (selected == null) {
        return;
    }
    const size = getPieceSize(selected);
    var adjacentInfo = positionIsAdjacent(selected, targetPosition);
    if (adjacentInfo.adjacent) {
        console.log(`Attempting to move piece ${SelectedPiece} to (${targetPosition.x}, ${targetPosition.y})`);
        var newPosition = { x: selected.position.x + adjacentInfo.xOfs, y: selected.position.y + adjacentInfo.yOfs };
        tryMovePieceTo(SelectedPiece, newPosition);
    }
}
function isMovePieceValid(pieceIndex, targetPosition) {
    const piece = Pieces[pieceIndex];
    if (piece == null) {
        return false;
    }
    const size = getPieceSize(piece) ?? INVALID_SIZE;
    var available = true;
    for (let dx = 0; dx < size.width; dx++) {
        for (let dy = 0; dy < size.height; dy++) {
            const boardX = targetPosition.x + dx;
            const boardY = targetPosition.y + dy;
            const boardPosition = { x: boardX, y: boardY };
            // Check if the target position is valid and empty
            if (boardX >= 0 && boardX < boardWidth && boardY >= 0 && boardY < boardHeight) {
                var isAvailable = positionIsEmpty(boardPosition) || (getBoardPiece(boardPosition) == pieceIndex);
                if (!isAvailable) {
                    available = false;
                }
            }
            else {
                available = false;
            }
        }
    }
    return available;
}
function tryMovePieceTo(pieceIndex, targetPosition) {
    var available = isMovePieceValid(pieceIndex, targetPosition);
    if (available) {
        console.log(`Moving piece ${pieceIndex} to (${targetPosition.x}, ${targetPosition.y})`);
        movePiece(pieceIndex, targetPosition);
        AvailableMoves = findAvailableMoves(pieceIndex);
        updateBoard();
    }
}
function movePiece(pieceIndex, targetPosition) {
    const piece = Pieces[pieceIndex];
    if (piece == null) {
        return;
    }
    const size = getPieceSize(piece) ?? INVALID_SIZE;
    for (let dx = 0; dx < size.width; dx++) {
        for (let dy = 0; dy < size.height; dy++) {
            const boardX = piece.position.x + dx;
            const boardY = piece.position.y + dy;
            var boardPosition = { x: boardX, y: boardY };
            if (boardX >= 0 && boardX < boardWidth && boardY >= 0 && boardY < boardHeight) {
                setBoardPiece(boardPosition, EMPTY_SQUARE); // Clear the old position
            }
        }
    }
    for (let dx = 0; dx < size.width; dx++) {
        for (let dy = 0; dy < size.height; dy++) {
            const boardX = targetPosition.x + dx;
            const boardY = targetPosition.y + dy;
            var boardPosition = { x: boardX, y: boardY };
            if (boardX >= 0 && boardX < boardWidth && boardY >= 0 && boardY < boardHeight) {
                setBoardPiece(boardPosition, pieceIndex); // Set the new position
            }
        }
    }
    piece.position = targetPosition;
}
function drawBoard() {
    if (ctx == null) {
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < Pieces.length; i++) {
        const piece = Pieces[i];
        if (piece == null) {
            continue;
        }
        const x = Origin.x + piece.position.x * BoardScale;
        const y = Origin.y + piece.position.y * BoardScale;
        const size = getPieceSize(piece) ?? INVALID_SIZE;
        var color = piece.color;
        console.log(`Drawing piece ${i + 1}: Type=${piece.pieceType}, Position=(${piece.position.x}, ${piece.position.y}) Size=(${size.width}, ${size.height})`);
        ctx.beginPath();
        console.log(`Drawing piece ${i + 1}: Type=${piece.pieceType}, Position=(${piece.position.x}, ${piece.position.y}), Size=(${size.width}, ${size.height})`);
        var inset = 0;
        if (i === SelectedPiece) {
            ctx.lineWidth = 5;
            inset = 2;
            color = "#ff0000"; // Highlight selected piece in red
        }
        else {
            ctx.lineWidth = 1;
        }
        ctx.rect(x + inset, y + inset, size.width * BoardScale - inset * 2, size.height * BoardScale - inset * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "#000000";
        ctx.stroke();
        ctx.closePath();
    }
    for (let i = 0; i < AvailableMoves.length; i++) {
        const move = AvailableMoves[i];
        if (move == null) {
            continue;
        }
        const x = Origin.x + move.x * BoardScale;
        const y = Origin.y + move.y * BoardScale;
        ctx.beginPath();
        const margin = AvailableMoveDisplayMargin;
        ctx.rect(x + margin, y + margin, BoardScale - margin * 2, BoardScale - margin * 2);
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
//# sourceMappingURL=SlidingPuzzle.js.map