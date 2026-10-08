/** @type {HTMLCanvasElement} */
const canvas: HTMLCanvasElement = document.getElementById("myCanvas") as HTMLCanvasElement;
const resetButton: HTMLButtonElement = document.getElementById("resetButton") as HTMLButtonElement;
const undoButton: HTMLButtonElement = document.getElementById("undoButton") as HTMLButtonElement;
const replayButton: HTMLButtonElement = document.getElementById("replayButton") as HTMLButtonElement;
const ctx = canvas.getContext("2d");

enum PieceType { B1x1 = "b11", B1x2 = "b12", B2x1 = "b21", B2x2 = "b22" };
enum Direction { Left, Right, Up, Down };
const Cardinals = [Direction.Left, Direction.Right, Direction.Up, Direction.Down];

type Coordinates = { x: number, y: number };
type Size = { width: number, height: number };
type MoveRecord = { pieceIndex: number, oldPosition: Coordinates, newPosition: Coordinates };

const LeftOfs: Coordinates = { x: -1, y: 0 };
const RightOfs: Coordinates = { x: 1, y: 0 };
const UpOfs: Coordinates = { x: 0, y: -1 };
const DownOfs: Coordinates = { x: 0, y: 1 };

const REPLAY_MOVE_DELAY = 500;
const REPLAY_SELECTION_DELAY = 200;
const EMPTY_SQUARE = -1;
const NO_PIECE = -1;
const INVALID_SIZE = { width: 0, height: 0 };
const INVALID_POSITION = { x: -1, y: -1 };
const ZERO_COORDINATE = { x: 0, y: 0 };
const INVALID_MOVE = { pieceIndex: -1, oldPosition: ZERO_COORDINATE, newPosition: ZERO_COORDINATE };

const PieceSizes: { [key: string]: Size } = {}
PieceSizes[PieceType.B1x1] = { width: 1, height: 1 };
PieceSizes[PieceType.B1x2] = { width: 1, height: 2 };
PieceSizes[PieceType.B2x1] = { width: 2, height: 1 };
PieceSizes[PieceType.B2x2] = { width: 2, height: 2 };

type Piece = { id: number, pieceType: PieceType, position: Coordinates, color: string };

var P1: Piece = { id: 0, pieceType: PieceType.B1x1, position: { x: 0, y: 0 }, color: "#f7b475" };
var P2: Piece = { id: 1, pieceType: PieceType.B1x1, position: { x: 3, y: 0 }, color: "#f7b475" };
var P3: Piece = { id: 2, pieceType: PieceType.B1x1, position: { x: 1, y: 1 }, color: "#f7b475" };
var P4: Piece = { id: 3, pieceType: PieceType.B1x1, position: { x: 2, y: 1 }, color: "#f7b475" };
var P5: Piece = { id: 4, pieceType: PieceType.B1x2, position: { x: 0, y: 1 }, color: "#61ef6f" };
var P6: Piece = { id: 5, pieceType: PieceType.B1x2, position: { x: 3, y: 1 }, color: "#61ef6f" };
var P7: Piece = { id: 6, pieceType: PieceType.B1x2, position: { x: 0, y: 3 }, color: "#61ef6f" };
var P8: Piece = { id: 7, pieceType: PieceType.B1x2, position: { x: 3, y: 3 }, color: "#61ef6f" };
var P9: Piece = { id: 8, pieceType: PieceType.B2x1, position: { x: 1, y: 2 }, color: "#0000ff" };
var P10: Piece = { id: 9, pieceType: PieceType.B2x2, position: { x: 1, y: 3 }, color: "#ffff00" };

const BoardScale = 75; // Scale factor for drawing
const AvailableMoveDisplayMargin = 15;
const Origin = { x: 50, y: 100 }; // Origin point for drawing

const Pieces = [P1, P2, P3, P4, P5, P6, P7, P8, P9, P10];


var SelectedPiece = NO_PIECE;
var AvailableMoves: Coordinates[] = [];
var MoveLog: MoveRecord[] = [];

const board: number[][] = [
    [EMPTY_SQUARE, EMPTY_SQUARE, EMPTY_SQUARE, EMPTY_SQUARE],
    [EMPTY_SQUARE, EMPTY_SQUARE, EMPTY_SQUARE, EMPTY_SQUARE],
    [EMPTY_SQUARE, EMPTY_SQUARE, EMPTY_SQUARE, EMPTY_SQUARE],
    [EMPTY_SQUARE, EMPTY_SQUARE, EMPTY_SQUARE, EMPTY_SQUARE],
    [EMPTY_SQUARE, EMPTY_SQUARE, EMPTY_SQUARE, EMPTY_SQUARE]
];

const boardWidth: number = board[0]?.length ?? 0;
const boardHeight: number = board.length;

function positionIsValid(position: Coordinates): boolean {
    return position.x >= 0 && position.x < boardWidth && position.y >= 0 && position.y < boardHeight;
}

function getBoardPiece(position: Coordinates): number {
    if (!positionIsValid(position)) {
        return EMPTY_SQUARE;
    }
    var boardRow = board[position.y];
    if (boardRow == null) { return EMPTY_SQUARE; }
    var result = boardRow[position.x];
    return result ?? EMPTY_SQUARE;
}

function setBoardPiece(position: Coordinates, pieceNumber: number) {
    if (!positionIsValid(position)) {
        return;
    }
    var boardRow = board[position.y];
    if (boardRow == null) { return; }
    boardRow[position.x] = pieceNumber;
}

function getClickCoordinates(coords: Coordinates): Coordinates {
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

function initialisePiecePositions() {
    P1.position = { x: 0, y: 0 };
    P2.position = { x: 3, y: 0 };
    P3.position = { x: 1, y: 1 };
    P4.position = { x: 2, y: 1 };
    P5.position = { x: 0, y: 1 };
    P6.position = { x: 3, y: 1 };
    P7.position = { x: 0, y: 3 };
    P8.position = { x: 3, y: 3 };
    P9.position = { x: 1, y: 2 };
    P10.position = { x: 1, y: 3 };
}

function resetBoard() {
    console.log("Resetting Board");
    initialisePiecePositions();
    updateBoard();
    SelectedPiece = 0;
    AvailableMoves = findAvailableMoves(SelectedPiece);
    drawBoard();
}

function resetPuzzle() {
    MoveLog = [];
    resetBoard();
}

function updateBoard() {
    // Clear the board
    clearBoard();

    for (let i = 0; i < Pieces.length; i++) {
        const piece = Pieces[i] ?? P1;
        const size = PieceSizes[piece.pieceType] ?? INVALID_SIZE;
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

    const gridPosition: Coordinates = getClickCoordinates({ x: x, y: y });
    const pieceIndex: number = getBoardPiece(gridPosition);

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

resetButton.addEventListener('click', resetPuzzle);
undoButton.addEventListener('click', undoMove);
replayButton.addEventListener('click', replayMoves);



function positionIsEmpty(position: Coordinates) {
    console.log(`positionIsEmpty ${position.x}, ${position.y})`)
    var ret = positionIsValid(position) && getBoardPiece(position) === EMPTY_SQUARE;
    console.log(`result ${ret}`);
    return ret;
}

function getPieceSize(piece: Piece) {
    return PieceSizes[piece.pieceType];
}

function getMovePositions(pieceIndex: number, move: Direction): Coordinates[] {
    console.log(`getMovePositions ${pieceIndex} ${move}`);
    const piece = Pieces[pieceIndex];
    if (piece == null) { return []; }
    const size: Size = getPieceSize(piece) ?? INVALID_SIZE;
    console.log(`piece ${piece.pieceType} @${piece.position.x} ${piece.position.y}`);
    const position: Coordinates = piece.position;
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
        var pos: Coordinates = positions[p] ?? INVALID_POSITION;
        console.log(`pos: ${pos.x} ${pos.y}`);
    }
    return positions;
}

function findAvailableMoves(pieceIndex: number) {
    const piece = Pieces[pieceIndex];
    var candidateMoves: Coordinates[] = [];
    var availableMoves: Coordinates[] = [];


    for (var dir = 0; dir < Cardinals.length; dir++) {
        candidateMoves = getMovePositions(pieceIndex, Cardinals[dir] ?? Direction.Left);
        var valid: Boolean = true;
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

function positionIsAdjacent(piece: Piece, targetPosition: Coordinates) {
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
    return { adjacent: adjacent, xOfs: xOfs, yOfs: yOfs }
}

function tryMoveSelectedPiece(targetPosition: Coordinates) {
    const selected = Pieces[SelectedPiece];
    if (selected == null) { return; }
    const size = getPieceSize(selected);
    var adjacentInfo = positionIsAdjacent(selected, targetPosition);
    if (adjacentInfo.adjacent) {
        console.log(`Attempting to move piece ${SelectedPiece} to (${targetPosition.x}, ${targetPosition.y})`);
        var newPosition = { x: selected.position.x + adjacentInfo.xOfs, y: selected.position.y + adjacentInfo.yOfs };
        tryMovePieceTo(SelectedPiece, newPosition);
    }
}

function isMovePieceValid(pieceIndex: number, targetPosition: Coordinates): Boolean {
    const piece = Pieces[pieceIndex];
    if (piece == null) { return false; }
    const size = getPieceSize(piece) ?? INVALID_SIZE;
    var available = true;
    for (let dx = 0; dx < size.width; dx++) {
        for (let dy = 0; dy < size.height; dy++) {
            const boardX = targetPosition.x + dx;
            const boardY = targetPosition.y + dy;
            const boardPosition = { x: boardX, y: boardY };
            if (positionIsValid(boardPosition)) {
                var isAvailable: Boolean = positionIsEmpty(boardPosition) || (getBoardPiece(boardPosition) == pieceIndex);
                if (!isAvailable) {
                    available = false;
                }
            } else {
                available = false;
            }
        }
    }
    return available;
}

function tryMovePieceTo(pieceIndex: number, targetPosition: Coordinates) {
    var available: Boolean = isMovePieceValid(pieceIndex, targetPosition);
    if (available) {
        console.log(`Moving piece ${pieceIndex} to (${targetPosition.x}, ${targetPosition.y})`);
        movePiece(pieceIndex, targetPosition);
        AvailableMoves = findAvailableMoves(pieceIndex);
        updateBoard();
    }
}

function movePiece(pieceIndex: number, targetPosition: Coordinates, doRecordMove: boolean = true) {
    const piece = Pieces[pieceIndex];
    if (piece == null) { return; }
    const oldPosition: Coordinates = piece.position;
    const size = getPieceSize(piece) ?? INVALID_SIZE;
    for (let dx = 0; dx < size.width; dx++) {
        for (let dy = 0; dy < size.height; dy++) {
            const boardX = piece.position.x + dx;
            const boardY = piece.position.y + dy;
            var boardPosition = { x: boardX, y: boardY };
            if (positionIsValid(boardPosition)) {
                setBoardPiece(boardPosition, EMPTY_SQUARE);
            }
        }
    }
    for (let dx = 0; dx < size.width; dx++) {
        for (let dy = 0; dy < size.height; dy++) {
            const boardX = targetPosition.x + dx;
            const boardY = targetPosition.y + dy;
            var boardPosition = { x: boardX, y: boardY };
            if (positionIsValid(boardPosition)) {
                setBoardPiece(boardPosition, pieceIndex);
            }
        }
    }
    piece.position = targetPosition;
    if (doRecordMove) {
        recordMove(pieceIndex, oldPosition, targetPosition);
    }
}

function recordMove(pieceIndex: number, oldPosition: Coordinates, newPosition: Coordinates) {
    MoveLog.push({ pieceIndex: pieceIndex, oldPosition: oldPosition, newPosition: newPosition });
}

function undoMove() {
    if (MoveLog.length < 1) { return; }
    var lastMove: MoveRecord = MoveLog.pop() ?? INVALID_MOVE;
    console.log("Undo Move");
    console.log(`LastMove: ${lastMove.pieceIndex} ${lastMove.oldPosition.x},${lastMove.oldPosition.y} to ${lastMove.newPosition.x},${lastMove.newPosition.y}`)
    movePiece(lastMove.pieceIndex, lastMove.oldPosition, false);
    AvailableMoves = findAvailableMoves(lastMove.pieceIndex);
    updateBoard();
    drawBoard();
}

function replayMoves() {
    if (MoveLog.length == 0) {
        return;
    }
    resetBoard();
    setTimeout(() => {
        showReplaySelectionThenReplayMove(0);
    }, REPLAY_MOVE_DELAY);
}
function showReplaySelectionThenReplayMove(index:number) {
    if (index > MoveLog.length - 1) {
        replayIndexedMove(index);
        return;
    }
    const move: MoveRecord = MoveLog[index] ?? INVALID_MOVE;
    SelectedPiece = move.pieceIndex;
    AvailableMoves = findAvailableMoves(move.pieceIndex);
    updateBoard();
    drawBoard();
    setTimeout(() => {
        replayIndexedMove(index);
    }, REPLAY_SELECTION_DELAY);
}

function replayIndexedMove(index: number) {
    if (index > MoveLog.length - 1) {
        console.log(`Finished Replay: selected piece = ${SelectedPiece}`);
        AvailableMoves = findAvailableMoves(SelectedPiece);
        updateBoard();
        drawBoard();
        return;
    }
    const move = MoveLog[index] ?? INVALID_MOVE;
    SelectedPiece = move.pieceIndex;
    movePiece(move.pieceIndex, move.newPosition, false);
    AvailableMoves = findAvailableMoves(move.pieceIndex);
    updateBoard();
    drawBoard();
    setTimeout(() => {
        showReplaySelectionThenReplayMove(index + 1);
    }, REPLAY_MOVE_DELAY);
}

function drawBoardFrame() {
    if (ctx == null) { return; }
    var lineWidth = 15;
    var margin = lineWidth + 5;
    var top = Origin.y - margin;
    var bottom = Origin.y + boardHeight * BoardScale + margin;
    var left = Origin.x - margin;
    var right = Origin.x + BoardScale * boardWidth + margin;
    var outletLeft = Origin.x + BoardScale;
    var outletRight = Origin.x + BoardScale * 3;
    ctx.beginPath();
    ctx.moveTo(outletLeft, top);
    ctx.lineTo(left, top);
    ctx.lineTo(left, bottom);
    ctx.lineTo(right, bottom);
    ctx.lineTo(right, top);
    ctx.lineTo(outletRight, top);
    ctx.lineWidth = 15;
    ctx.strokeStyle = "#f4f402";
    ctx.stroke();
    ctx.closePath();
}

function drawBoard() {
    if (ctx == null) { return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoardFrame();
    for (let i = 0; i < Pieces.length; i++) {
        const piece = Pieces[i];
        if (piece == null) { continue; }
        const x = Origin.x + piece.position.x * BoardScale;
        const y = Origin.y + piece.position.y * BoardScale;
        const size = getPieceSize(piece) ?? INVALID_SIZE;
        var color = piece.color;
        // console.log(`Drawing piece ${i + 1}: Type=${piece.pieceType}, Position=(${piece.position.x}, ${piece.position.y}) Size=(${size.width}, ${size.height})`);
        ctx.beginPath();
        // console.log(`Drawing piece ${i + 1}: Type=${piece.pieceType}, Position=(${piece.position.x}, ${piece.position.y}), Size=(${size.width}, ${size.height})`);
        var inset = 0;
        if (i === SelectedPiece) {
            ctx.lineWidth = 5;
            inset = 2;
            color = "#ff0000"; // Highlight selected piece in red
        } else {
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
        if (move == null) { continue; }
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

resetBoard();
