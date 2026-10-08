/** @type {HTMLCanvasElement} */
declare const canvas: HTMLCanvasElement;
declare const resetButton: HTMLButtonElement;
declare const undoButton: HTMLButtonElement;
declare const ctx: CanvasRenderingContext2D | null;
declare enum PieceType {
    B1x1 = "b11",
    B1x2 = "b12",
    B2x1 = "b21",
    B2x2 = "b22"
}
declare enum Direction {
    Left = 0,
    Right = 1,
    Up = 2,
    Down = 3
}
declare const Cardinals: Direction[];
type Coordinates = {
    x: number;
    y: number;
};
type Size = {
    width: number;
    height: number;
};
type MoveRecord = {
    pieceIndex: number;
    oldPosition: Coordinates;
    newPosition: Coordinates;
};
declare const LeftOfs: Coordinates;
declare const RightOfs: Coordinates;
declare const UpOfs: Coordinates;
declare const DownOfs: Coordinates;
declare const EMPTY_SQUARE = -1;
declare const NO_PIECE = -1;
declare const INVALID_SIZE: {
    width: number;
    height: number;
};
declare const INVALID_POSITION: {
    x: number;
    y: number;
};
declare const ZERO_COORDINATE: {
    x: number;
    y: number;
};
declare const INVALID_MOVE: {
    pieceIndex: number;
    oldPosition: {
        x: number;
        y: number;
    };
    newPosition: {
        x: number;
        y: number;
    };
};
declare const PieceSizes: {
    [key: string]: Size;
};
type Piece = {
    id: number;
    pieceType: PieceType;
    position: Coordinates;
    color: string;
};
declare var P1: Piece;
declare var P2: Piece;
declare var P3: Piece;
declare var P4: Piece;
declare var P5: Piece;
declare var P6: Piece;
declare var P7: Piece;
declare var P8: Piece;
declare var P9: Piece;
declare var P10: Piece;
declare const BoardScale = 75;
declare const AvailableMoveDisplayMargin = 15;
declare const Origin: {
    x: number;
    y: number;
};
declare const Pieces: Piece[];
declare var SelectedPiece: number;
declare var AvailableMoves: Coordinates[];
declare var MoveLog: MoveRecord[];
declare const board: number[][];
declare const boardWidth: number;
declare const boardHeight: number;
declare function positionIsValid(position: Coordinates): boolean;
declare function getBoardPiece(position: Coordinates): number;
declare function setBoardPiece(position: Coordinates, pieceNumber: number): void;
declare function getClickCoordinates(coords: Coordinates): Coordinates;
declare function clearBoard(): void;
declare function initialisePiecePositions(): void;
declare function resetBoard(): void;
declare function updateBoard(): void;
declare function positionIsEmpty(position: Coordinates): boolean;
declare function getPieceSize(piece: Piece): Size | undefined;
declare function getMovePositions(pieceIndex: number, move: Direction): Coordinates[];
declare function findAvailableMoves(pieceIndex: number): Coordinates[];
declare function positionIsAdjacent(piece: Piece, targetPosition: Coordinates): {
    adjacent: boolean;
    xOfs: number;
    yOfs: number;
};
declare function tryMoveSelectedPiece(targetPosition: Coordinates): void;
declare function isMovePieceValid(pieceIndex: number, targetPosition: Coordinates): Boolean;
declare function tryMovePieceTo(pieceIndex: number, targetPosition: Coordinates): void;
declare function movePiece(pieceIndex: number, targetPosition: Coordinates, doRecordMove?: boolean): void;
declare function recordMove(pieceIndex: number, oldPosition: Coordinates, newPosition: Coordinates): void;
declare function undoMove(): void;
declare function drawBoard(): void;
//# sourceMappingURL=SlidingPuzzle.d.ts.map