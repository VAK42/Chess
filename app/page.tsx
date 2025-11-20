"use client"
import React, { useState, useEffect, useCallback } from 'react'
enum Color {
  White = 'white',
  Black = 'black',
}
enum PieceType {
  King = 'king',
  Queen = 'queen',
  Rook = 'rook',
  Bishop = 'bishop',
  Knight = 'knight',
  Pawn = 'pawn',
}
enum GameMode {
  PvP = 'pvp',
  Bot = 'bot',
}
enum GameStatus {
  Playing = 'playing',
  Checkmate = 'checkmate',
  Draw = 'draw',
}
enum Difficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}
interface Position {
  r: number
  c: number
}
interface Piece {
  type: PieceType
  color: Color
  id: string
  hasMoved?: boolean
}
interface Move {
  from: Position
  to: Position
  captured?: Piece | null
  notation?: string
  score?: number
  pieceType: PieceType
  isCastling?: boolean
  rookFrom?: Position
  rookTo?: Position
}
const boardSize = 8
const pieceNotationLabels: Record<PieceType, string> = {
  [PieceType.King]: 'K', [PieceType.Queen]: 'Q', [PieceType.Rook]: 'R',
  [PieceType.Bishop]: 'B', [PieceType.Knight]: 'N', [PieceType.Pawn]: ''
}
const tutorialText: Record<PieceType, string> = {
  [PieceType.King]: "The King Moves One Square In Any Direction. It Is The Most Important Piece; Protect It At All Costs. Castling Is A Special Move Involving The King And Rook.",
  [PieceType.Queen]: "The Queen Is The Most Powerful Piece, Combining The Powers Of The Rook And Bishop. It Can Move Any Number Of Squares Horizontally, Vertically, Or Diagonally.",
  [PieceType.Rook]: "The Rook Moves Any Number Of Squares Horizontally Or Vertically.",
  [PieceType.Bishop]: "The Bishop Moves Any Number Of Squares Diagonally. It Always Remains On Squares Of The Same Color.",
  [PieceType.Knight]: "The Knight Moves In An 'L' Shape: Two Squares In A Cardinal Direction, Then One Perpendicular. It Is The Only Piece That Can Jump Over Others.",
  [PieceType.Pawn]: "The Pawn Moves Forward One Square, But Captures Diagonally. On Its First Move, It Can Move Two Squares Forward.",
}
const pst: Record<PieceType, number[][]> = {
  [PieceType.Pawn]: [[0, 0, 0, 0, 0, 0, 0, 0], [50, 50, 50, 50, 50, 50, 50, 50], [10, 10, 20, 30, 30, 20, 10, 10], [5, 5, 10, 25, 25, 10, 5, 5], [0, 0, 0, 20, 20, 0, 0, 0], [5, -5, -10, 0, 0, -10, -5, 5], [5, 10, 10, -20, -20, 10, 10, 5], [0, 0, 0, 0, 0, 0, 0, 0]],
  [PieceType.Knight]: [[-50, -40, -30, -30, -30, -30, -40, -50], [-40, -20, 0, 0, 0, 0, -20, -40], [-30, 0, 10, 15, 15, 10, 0, -30], [-30, 5, 15, 20, 20, 15, 5, -30], [-30, 0, 15, 20, 20, 15, 0, -30], [-30, 5, 10, 15, 15, 10, 5, -30], [-40, -20, 0, 5, 5, 0, -20, -40], [-50, -40, -30, -30, -30, -30, -40, -50]],
  [PieceType.Bishop]: Array(8).fill(Array(8).fill(0)),
  [PieceType.Rook]: Array(8).fill(Array(8).fill(0)),
  [PieceType.Queen]: Array(8).fill(Array(8).fill(0)),
  [PieceType.King]: Array(8).fill(Array(8).fill(0)),
}
const pieceValues: Record<PieceType, number> = {
  [PieceType.King]: 20000,
  [PieceType.Queen]: 900,
  [PieceType.Rook]: 500,
  [PieceType.Bishop]: 330,
  [PieceType.Knight]: 320,
  [PieceType.Pawn]: 100,
}
const PieceIcon = ({ type, color }: { type: PieceType, color: Color }) => {
  const isWhite = color === Color.White
  const fill = isWhite ? '#FFFFFF' : '#121212'
  const stroke = isWhite ? '#121212' : '#FFFFFF'
  return (
    <svg viewBox="0 0 45 45" className="w-full h-full" style={{ filter: 'drop-shadow(0px 3px 2px rgba(0,0,0,0.5))' }}>
      <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {type === PieceType.Pawn && (
          <path d="M22 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38-1.81 1.12-3.13 3.21-3.13 5.62 0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" />
        )}
        {type === PieceType.Knight && (
          <g>
            <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" fill={fill} stroke={stroke} />
            <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10" fill={fill} stroke={stroke} />
            <path d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z" fill={stroke} stroke="none" />
          </g>
        )}
        {type === PieceType.Bishop && (
          <g>
            <path d="M9 36c3.39-.97 9.11-1.45 13.5-1.45 4.38 0 10.11.48 13.5 1.45" />
            <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
            <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" />
            <path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" />
          </g>
        )}
        {type === PieceType.Rook && (
          <g>
            <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" strokeLinecap="butt" />
            <path d="M34 14l-3 3H14l-3-3" />
            <path d="M31 17v12.5c1 2 2 5 2 5H12s1-3 2-5V17h17z" strokeLinecap="butt" />
            <path d="M31 29.5l1.5 2.5h-20l1.5-2.5" />
            <path d="M11 14h23" fill="none" stroke={stroke} strokeWidth="1" />
          </g>
        )}
        {type === PieceType.Queen && (
          <g>
            <path d="M10 34 L12 30 L33 30 L35 34 L35 38 L10 38 Z" />
            <path d="M 9 26 L 12 15 L 17 21 L 22.5 12 L 28 21 L 33 15 L 36 26 Z" fill={fill} stroke={stroke} strokeLinejoin="round" />
            <path d="M12 30 L 33 30" stroke={stroke} />
            <circle cx="12" cy="15" r="2.5" fill={fill} stroke={stroke} />
            <circle cx="22.5" cy="12" r="2.5" fill={fill} stroke={stroke} />
            <circle cx="33" cy="15" r="2.5" fill={fill} stroke={stroke} />
            <circle cx="9" cy="26" r="2" fill={fill} stroke={stroke} />
            <circle cx="36" cy="26" r="2" fill={fill} stroke={stroke} />
          </g>
        )}
        {type === PieceType.King && (
          <g>
            <path d="M 22.5 12 L 22.5 4 M 18.5 8 H 26.5" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
            <path d="M 15 19 C 15 13 30 13 30 19" fill={fill} stroke={stroke} strokeWidth="2" />
            <path d="M 15 19 H 30 V 24 H 15 Z" fill={fill} stroke={stroke} strokeLinejoin="round" />
            <path d="M 16 24 L 14 30 H 31 L 29 24" fill={fill} stroke={stroke} />
            <path d="M 13 30 L 32 30 L 34 34 L 34 38 L 11 38 L 11 34 L 13 30 Z" fill={fill} stroke={stroke} />
            <path d="M 22.5 13 L 22.5 19" stroke={stroke} strokeWidth="1.5" />
          </g>
        )}
      </g>
    </svg>
  )
}
const createInitialBoard = (): (Piece | null)[][] => {
  const grid = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null))
  const placeRow = (row: number, color: Color, pieces: PieceType[]) => {
    pieces.forEach((type, col) => {
      grid[row][col] = { type, color, id: `${color}-${type}-${col}`, hasMoved: false }
    })
  }
  const backRow = [PieceType.Rook, PieceType.Knight, PieceType.Bishop, PieceType.Queen, PieceType.King, PieceType.Bishop, PieceType.Knight, PieceType.Rook]
  placeRow(0, Color.Black, backRow)
  placeRow(1, Color.Black, Array(8).fill(PieceType.Pawn))
  placeRow(6, Color.White, Array(8).fill(PieceType.Pawn))
  placeRow(7, Color.White, backRow)
  return grid
}
const isValidPos = (pos: Position) => pos.r >= 0 && pos.r < boardSize && pos.c >= 0 && pos.c < boardSize
const getPositionValue = (piece: Piece, r: number, c: number) => {
  let value = pieceValues[piece.type]
  if (pst[piece.type]) {
    const pstRow = piece.color === Color.White ? r : 7 - r
    const pstCol = piece.color === Color.White ? c : 7 - c
    value += pst[piece.type][pstRow][pstCol] || 0
  }
  return value
}
const isPathClear = (grid: (Piece | null)[][], from: Position, to: Position): boolean => {
  const dr = Math.sign(to.r - from.r)
  const dc = Math.sign(to.c - from.c)
  let r = from.r + dr
  let c = from.c + dc
  while (r !== to.r || c !== to.c) {
    if (grid[r][c]) return false
    r += dr
    c += dc
  }
  return true
}
const getRawMoves = (grid: (Piece | null)[][], pos: Position, type: PieceType, color: Color, hasMoved?: boolean, checkCastling: boolean = true): Move[] => {
  const moves: Move[] = []
  const { r, c } = pos
  const addMove = (toR: number, toC: number) => {
    if (isValidPos({ r: toR, c: toC })) {
      const target = grid[toR][toC]
      if (!target || target.color !== color) {
        moves.push({ from: pos, to: { r: toR, c: toC }, pieceType: type, captured: target })
      }
    }
  }
  switch (type) {
    case PieceType.Pawn: {
      const dir = color === Color.White ? -1 : 1
      const startRow = color === Color.White ? 6 : 1
      if (isValidPos({ r: r + dir, c }) && !grid[r + dir][c]) {
        moves.push({ from: pos, to: { r: r + dir, c }, pieceType: type })
        if (r === startRow && isValidPos({ r: r + dir * 2, c }) && !grid[r + dir * 2][c]) {
          moves.push({ from: pos, to: { r: r + dir * 2, c }, pieceType: type })
        }
      }
      ;[[dir, -1], [dir, 1]].forEach(([dr, dc]) => {
        const nr = r + dr, nc = c + dc
        if (isValidPos({ r: nr, c: nc })) {
          const target = grid[nr][nc]
          if (target && target.color !== color) {
            moves.push({ from: pos, to: { r: nr, c: nc }, pieceType: type, captured: target })
          }
        }
      })
      break
    }
    case PieceType.Knight:
      [[1, 2], [1, -2], [-1, 2], [-1, -2], [2, 1], [2, -1], [-2, 1], [-2, -1]].forEach(([dr, dc]) => addMove(r + dr, c + dc))
      break
    case PieceType.Bishop:
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
        let nr = r + dr, nc = c + dc
        while (isValidPos({ r: nr, c: nc })) {
          const target = grid[nr][nc]
          if (!target) moves.push({ from: pos, to: { r: nr, c: nc }, pieceType: type })
          else { if (target.color !== color) moves.push({ from: pos, to: { r: nr, c: nc }, pieceType: type, captured: target }); break }
          nr += dr; nc += dc
        }
      })
      break
    case PieceType.Rook:
      [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
        let nr = r + dr, nc = c + dc
        while (isValidPos({ r: nr, c: nc })) {
          const target = grid[nr][nc]
          if (!target) moves.push({ from: pos, to: { r: nr, c: nc }, pieceType: type })
          else { if (target.color !== color) moves.push({ from: pos, to: { r: nr, c: nc }, pieceType: type, captured: target }); break }
          nr += dr; nc += dc
        }
      })
      break
    case PieceType.Queen:
      [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
        let nr = r + dr, nc = c + dc
        while (isValidPos({ r: nr, c: nc })) {
          const target = grid[nr][nc]
          if (!target) moves.push({ from: pos, to: { r: nr, c: nc }, pieceType: type })
          else { if (target.color !== color) moves.push({ from: pos, to: { r: nr, c: nc }, pieceType: type, captured: target }); break }
          nr += dr; nc += dc
        }
      })
      break
    case PieceType.King:
      [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => addMove(r + dr, c + dc))
      if (checkCastling && !hasMoved && !isInCheck(grid, color)) {
        if (grid[r][7]?.type === PieceType.Rook && !grid[r][7]?.hasMoved && isPathClear(grid, pos, { r, c: 7 })) {
          moves.push({ from: pos, to: { r, c: 6 }, pieceType: type, isCastling: true, rookFrom: { r, c: 7 }, rookTo: { r, c: 5 } })
        }
        if (grid[r][0]?.type === PieceType.Rook && !grid[r][0]?.hasMoved && isPathClear(grid, pos, { r, c: 0 })) {
          moves.push({ from: pos, to: { r, c: 2 }, pieceType: type, isCastling: true, rookFrom: { r, c: 0 }, rookTo: { r, c: 3 } })
        }
      }
      break
  }
  return moves
}
const findKing = (grid: (Piece | null)[][], color: Color): Position | null => {
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      const p = grid[r][c]
      if (p && p.type === PieceType.King && p.color === color) return { r, c }
    }
  }
  return null
}
const isInCheck = (grid: (Piece | null)[][], color: Color): boolean => {
  const kingPos = findKing(grid, color)
  if (!kingPos) return true
  const enemyColor = color === Color.White ? Color.Black : Color.White
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      const p = grid[r][c]
      if (p && p.color === enemyColor) {
        const moves = getRawMoves(grid, { r, c }, p.type, enemyColor, p.hasMoved, false)
        if (moves.some(m => m.to.r === kingPos.r && m.to.c === kingPos.c)) return true
      }
    }
  }
  return false
}
const getLegalMoves = (grid: (Piece | null)[][], pos: Position): Move[] => {
  const p = grid[pos.r][pos.c]
  if (!p) return []
  const moves = getRawMoves(grid, pos, p.type, p.color, p.hasMoved, true)
  return moves.filter(m => {
    const newGrid = grid.map(row => [...row])
    newGrid[m.to.r][m.to.c] = newGrid[m.from.r][m.from.c]
    newGrid[m.from.r][m.from.c] = null
    if (m.isCastling && m.rookFrom && m.rookTo) {
      newGrid[m.rookTo.r][m.rookTo.c] = newGrid[m.rookFrom.r][m.rookFrom.c]
      newGrid[m.rookFrom.r][m.rookFrom.c] = null
      if (isInCheck(newGrid, p.color)) return false
      const midC = (m.from.c + m.to.c) / 2
      const midGrid = grid.map(row => [...row])
      midGrid[m.from.r][midC] = midGrid[m.from.r][m.from.c]
      midGrid[m.from.r][m.from.c] = null
      if (isInCheck(midGrid, p.color)) return false
    }
    return !isInCheck(newGrid, p.color)
  })
}
const checkGameStatus = (grid: (Piece | null)[][], turn: Color): GameStatus => {
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (grid[r][c]?.color === turn) {
        if (getLegalMoves(grid, { r, c }).length > 0) return GameStatus.Playing
      }
    }
  }
  return GameStatus.Checkmate
}
const evaluateBoard = (grid: (Piece | null)[][], color: Color): number => {
  let score = 0
  grid.forEach((row, r) => row.forEach((p, c) => {
    if (p) {
      const val = getPositionValue(p, r, c)
      score += (p.color === color ? val : -val)
    }
  }))
  return score
}
const findBestMove = async (grid: (Piece | null)[][], difficulty: Difficulty, turn: Color): Promise<Move | null> => {
  const allMoves: Move[] = []
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (grid[r][c]?.color === turn) {
        const p = grid[r][c]!
        const valid = getLegalMoves(grid, { r, c })
        valid.forEach(move => {
          const nextGrid = grid.map(row => [...row])
          nextGrid[move.to.r][move.to.c] = nextGrid[move.from.r][move.from.c]
          nextGrid[move.from.r][move.from.c] = null
          let score = evaluateBoard(nextGrid, turn)
          if (move.captured) score += (pieceValues[move.captured.type] * 10)
          allMoves.push({ ...move, score })
        })
      }
    }
  }
  if (allMoves.length === 0) return null
  allMoves.sort((a, b) => (b.score || 0) - (a.score || 0))
  const range = difficulty === Difficulty.Hard ? 1 : (difficulty === Difficulty.Medium ? 3 : 6)
  const candidates = allMoves.slice(0, Math.min(allMoves.length, range))
  return new Promise(resolve => {
    setTimeout(() => {
      const choice = candidates[Math.floor(Math.random() * candidates.length)]
      resolve(choice)
    }, 600)
  })
}
const SvgBoardLayer = () => {
  const squares = []
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const isDark = (r + c) % 2 === 1
      squares.push(
        <rect key={`${r}-${c}`} x={c * 12.5} y={r * 12.5} width="12.5" height="12.5" fill={isDark ? "#8B4513" : "#F3D094"} stroke="none" />
      )
    }
  }
  const files = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1']
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none z-0">
      {squares}
      {files.map((f, i) => (
        <text key={`f-${i}`} x={i * 12.5 + 10.5} y="99" fontSize="2.5" fill="#3a2312" fontWeight="bold" className="select-none">{f}</text>
      ))}
      {ranks.map((r, i) => (
        <text key={`r-${i}`} x="0.5" y={i * 12.5 + 3} fontSize="2.5" fill="#3a2312" fontWeight="bold" className="select-none">{r}</text>
      ))}
    </svg>
  )
}
interface BoardProps {
  grid: (Piece | null)[][]
  selectedPos: Position | null
  validMoves: Move[]
  lastMove: Move | null
  onSquareClick: (pos: Position) => void
}
const Board: React.FC<BoardProps> = ({ grid, selectedPos, validMoves, lastMove, onSquareClick }) => {
  return (
    <div className="relative select-none shadow-[0_20px_50px_rgba(0,0,0,0.7)] rounded-[4px] p-[1.2%]" style={{
      width: 'min(95vw, 65vh)',
      aspectRatio: '1/1',
      background: '#3a2312'
    }}>
      <div className="relative w-full h-full overflow-hidden bg-[#1a1110]">
        <SvgBoardLayer />
        <div className="absolute inset-0 grid grid-rows-8 grid-cols-8 z-10">
          {grid.map((row, r) => row.map((piece, c) => {
            const isSelected = selectedPos?.r === r && selectedPos?.c === c
            const isLastFrom = lastMove?.from.r === r && lastMove?.from.c === c
            const isLastTo = lastMove?.to.r === r && lastMove?.to.c === c
            const move = validMoves.find(m => m.to.r === r && m.to.c === c)
            const isValidMove = !!move
            const isCapture = move && (move.captured || (move.pieceType === PieceType.Pawn && move.from.c !== move.to.c))
            return (
              <div key={`${r}-${c}`} onClick={() => onSquareClick({ r, c })} className="relative flex items-center justify-center w-full h-full cursor-pointer group">
                {(isLastFrom || isLastTo) && <div className="absolute w-full h-full bg-yellow-500/30" />}
                {isValidMove && !isCapture && (
                  <div className="absolute w-[25%] h-[25%] rounded-full bg-green-600/50 z-20 pointer-events-none shadow-[0_0_5px_rgba(0,0,0,0.5)]" />
                )}
                {isCapture && (
                  <div className="absolute w-[100%] h-[100%] z-50 pointer-events-none flex items-center justify-center">
                    <div className="absolute inset-0 border-[6px] border-red-600/60 rounded-full animate-pulse"></div>
                    <div className="absolute inset-2 border-2 border-red-500 rounded-full opacity-50"></div>
                  </div>
                )}
                {piece && (
                  <div className={`w-[90%] h-[90%] flex items-center justify-center transition-transform duration-200 ${isSelected ? 'scale-110 -translate-y-2 drop-shadow-[0_10px_10px_rgba(0,0,0,0.6)] z-40' : 'drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)] z-30'} relative`}>
                    <PieceIcon type={piece.type} color={piece.color} />
                  </div>
                )}
              </div>
            )
          }))}
        </div>
      </div>
    </div>
  )
}
export default function Page() {
  const [grid, setGrid] = useState<(Piece | null)[][]>(createInitialBoard())
  const [turn, setTurn] = useState<Color>(Color.White)
  const [status, setStatus] = useState<GameStatus>(GameStatus.Playing)
  const [selectedPos, setSelectedPos] = useState<Position | null>(null)
  const [validMoves, setValidMoves] = useState<Move[]>([])
  const [history, setHistory] = useState<Move[]>([])
  const [lastMove, setLastMove] = useState<Move | null>(null)
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.PvP)
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Medium)
  const [playerSide, setPlayerSide] = useState<Color>(Color.White)
  const [isThinking, setIsThinking] = useState(false)
  const [selectedTutorialPiece, setSelectedTutorialPiece] = useState<PieceType | null>(null)
  const resetGame = useCallback(() => {
    setGrid(createInitialBoard())
    setTurn(Color.White)
    setStatus(GameStatus.Playing)
    setHistory([])
    setLastMove(null)
    setSelectedPos(null)
    setValidMoves([])
    setIsThinking(false)
    setSelectedTutorialPiece(null)
  }, [])
  const handleMove = (move: Move) => {
    const newGrid = grid.map(r => [...r])
    newGrid[move.to.r][move.to.c] = { ...newGrid[move.from.r][move.from.c]!, hasMoved: true }
    newGrid[move.from.r][move.from.c] = null
    if (move.isCastling && move.rookFrom && move.rookTo) {
      newGrid[move.rookTo.r][move.rookTo.c] = { ...newGrid[move.rookFrom.r][move.rookFrom.c]!, hasMoved: true }
      newGrid[move.rookFrom.r][move.rookFrom.c] = null
    }
    if (move.pieceType === PieceType.Pawn) {
      if ((turn === Color.White && move.to.r === 0) || (turn === Color.Black && move.to.r === 7)) {
        newGrid[move.to.r][move.to.c] = { type: PieceType.Queen, color: turn, id: `promoted-${Date.now()}`, hasMoved: true }
      }
    }
    setGrid(newGrid)
    const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    const notation = `${pieceNotationLabels[move.pieceType]}${cols[move.from.c]}${8 - move.from.r}→${cols[move.to.c]}${8 - move.to.r}`
    const recordedMove = { ...move, notation }
    setHistory(prev => [...prev, recordedMove])
    setLastMove(recordedMove)
    const nextTurn = turn === Color.White ? Color.Black : Color.White
    const newStatus = checkGameStatus(newGrid, nextTurn)
    setTurn(nextTurn)
    setStatus(newStatus)
    setSelectedPos(null)
    setValidMoves([])
  }
  const onSquareClick = (pos: Position) => {
    if (status !== GameStatus.Playing || isThinking) return
    if (gameMode === GameMode.Bot && turn !== playerSide) return
    const clickedPiece = grid[pos.r][pos.c]
    const isSameColor = clickedPiece && clickedPiece.color === turn
    if (isSameColor) {
      setSelectedPos(pos)
      setValidMoves(getLegalMoves(grid, pos))
      return
    }
    if (selectedPos) {
      const move = validMoves.find(m => m.to.r === pos.r && m.to.c === pos.c)
      if (move) {
        handleMove(move)
      } else {
        setSelectedPos(null)
        setValidMoves([])
      }
    }
  }
  useEffect(() => {
    const runBot = async () => {
      if (gameMode === GameMode.Bot && status === GameStatus.Playing && turn !== playerSide) {
        setIsThinking(true)
        const bestMove = await findBestMove(grid, difficulty, turn)
        setIsThinking(false)
        if (bestMove) handleMove(bestMove)
        else setStatus(GameStatus.Checkmate)
      }
    }
    runBot()
  }, [turn, gameMode, status, playerSide, difficulty, grid])
  const handleUndo = () => {
    if (history.length === 0 || isThinking) return
    let steps = (gameMode === GameMode.Bot && turn === playerSide) ? 2 : 1
    if (history.length < steps) steps = history.length
    const targetHistory = history.slice(0, history.length - steps)
    let replayGrid = createInitialBoard()
    let replayTurn = Color.White
    targetHistory.forEach(m => {
      replayGrid[m.to.r][m.to.c] = { ...replayGrid[m.from.r][m.from.c]!, hasMoved: true }
      replayGrid[m.from.r][m.from.c] = null
      if (m.isCastling && m.rookFrom && m.rookTo) {
        replayGrid[m.rookTo.r][m.rookTo.c] = { ...replayGrid[m.rookFrom.r][m.rookFrom.c]!, hasMoved: true }
        replayGrid[m.rookFrom.r][m.rookFrom.c] = null
      }
      if (m.pieceType === PieceType.Pawn) {
        if ((replayTurn === Color.White && m.to.r === 0) || (replayTurn === Color.Black && m.to.r === 7)) {
          replayGrid[m.to.r][m.to.c] = { type: PieceType.Queen, color: replayTurn, id: `promoted-replay`, hasMoved: true }
        }
      }
      replayTurn = replayTurn === Color.White ? Color.Black : Color.White
    })
    setGrid(replayGrid)
    setTurn(replayTurn)
    setHistory(targetHistory)
    setLastMove(targetHistory.length > 0 ? targetHistory[targetHistory.length - 1] : null)
    setStatus(GameStatus.Playing)
    setSelectedPos(null)
    setValidMoves([])
  }
  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans text-slate-200 bg-[#1a1110]">
      <header className="bg-[#1a1110] border-b border-[#3a2312] z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#e2e2e2] rounded-lg shadow-inner flex items-center justify-center text-[#1a1a1a] font-serif font-bold text-2xl border-2 border-[#3a2312]">
              <svg viewBox="0 0 45 45" className="w-8 h-8"><g fill="#1a1a1a" stroke="#000" strokeWidth="1.5"><path d="M22.5 11.63V6M20 8h5M22.5 25s4.5-1.5 3-7c-3-4-3 4-6 0 0 0 .75-6.25-6 0-1.5 5.5 3 7 3 7H22.5M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-8.5c0-5-7.5-6-8-1.5-2.5 4.5-7.5 1-8-4-2.5-4.5-7.5-1-8 1.5-.5-4.5-8-3.5-8 1.5-3 4 6 8.5 6 8.5v7" /><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" /></g></svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#f3d094]">Western <span className="text-[#d97706]">Chess</span></h1>
              <p className="text-[#8B4513] text-[10px] font-bold uppercase tracking-widest">Classic Strategy</p>
            </div>
          </div>
          {status === GameStatus.Playing && (
            <div className="flex items-center bg-[#251812] rounded-full px-6 py-2 border border-[#3a2312] gap-6">
              <div className={`flex items-center gap-2 ${turn === Color.White ? 'opacity-100' : 'opacity-30 grayscale'}`}>
                <div className="w-3 h-3 rounded-full bg-[#e2e2e2] shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse"></div>
                <span className="text-[#eecfa1] font-bold text-sm uppercase tracking-wider">White</span>
              </div>
              <div className="h-4 w-px bg-[#3a2312]"></div>
              <div className={`flex items-center gap-2 ${turn === Color.Black ? 'opacity-100' : 'opacity-30 grayscale'}`}>
                <span className="text-[#eecfa1] font-bold text-sm uppercase tracking-wider">Black</span>
                <div className="w-3 h-3 rounded-full bg-[#1a1a1a] shadow-[0_0_8px_rgba(0,0,0,0.8)] animate-pulse border border-white/20"></div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <select className="bg-[#251812] border border-[#3a2312] text-[#eecfa1] text-sm rounded px-3 py-2 outline-none focus:border-[#d97706]" value={gameMode} onChange={(e) => { setGameMode(e.target.value as GameMode); resetGame(); }}>
              <option value={GameMode.PvP}>PVP</option>
              <option value={GameMode.Bot}>PVE</option>
            </select>
            <button onClick={resetGame} className="bg-[#d97706] hover:bg-[#b45309] text-[#251812] font-bold rounded text-sm px-5 py-2 shadow-lg transition-colors">New Game</button>
            <button onClick={handleUndo} disabled={history.length === 0} className="bg-[#3a2312] hover:bg-[#4e2f1b] text-[#eecfa1] border border-[#5c3a1e] font-medium rounded text-sm px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Undo</button>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        <aside className="hidden lg:flex lg:w-72 bg-[#160e0c] border-r border-[#3a2312] flex-col z-30 shadow-[5px_0_15px_rgba(0,0,0,0.3)]">
          <div className="p-5 border-b border-[#3a2312]">
            <h2 className="font-bold text-[#d97706] text-sm uppercase tracking-widest mb-4 border-l-2 border-[#d97706] pl-3">Game Settings</h2>
            {gameMode === GameMode.Bot && (
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-[#8B4513] uppercase mb-2 tracking-wider">Difficulty</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[Difficulty.Easy, Difficulty.Medium, Difficulty.Hard].map((diff) => (
                      <button key={diff} onClick={() => setDifficulty(diff)} className={`py-1.5 rounded-sm text-xs font-bold border transition-all ${difficulty === diff ? 'bg-[#3a2312] text-[#d97706] border-[#d97706]' : 'bg-[#251812] text-[#666] border-[#3a2312] hover:text-[#999]'}`}>{diff}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#8B4513] uppercase mb-2 tracking-wider">Play As</label>
                  <div className="flex gap-2">
                    <button className={`flex-1 py-1.5 rounded-sm text-xs font-bold border transition-all ${playerSide === Color.White ? 'bg-[#3a2312] border-[#e2e2e2] text-[#e2e2e2]' : 'bg-[#251812] border-[#3a2312] text-[#666]'}`} onClick={() => { setPlayerSide(Color.White); resetGame(); }}>White</button>
                    <button className={`flex-1 py-1.5 rounded-sm text-xs font-bold border transition-all ${playerSide === Color.Black ? 'bg-[#3a2312] border-[#888] text-[#ccc]' : 'bg-[#251812] border-[#3a2312] text-[#666]'}`} onClick={() => { setPlayerSide(Color.Black); resetGame(); }}>Black</button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="p-5 border-b border-[#3a2312]">
            <h2 className="font-bold text-[#eecfa1] text-sm uppercase tracking-widest mb-4 border-l-2 border-[#eecfa1] pl-3">Piece Tutorial</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.values(PieceType).map(type => (
                <button key={type} onClick={() => setSelectedTutorialPiece(type)} className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wide font-bold border transition-all capitalize ${selectedTutorialPiece === type ? 'bg-[#3a2312] text-[#eecfa1] border-[#5c3a1e]' : 'bg-[#251812] text-[#666] border-[#3a2312] hover:bg-[#2f1f18]'}`}>{type}</button>
              ))}
            </div>
            {selectedTutorialPiece ? (
              <div className="bg-[#251812] border border-[#3a2312] p-4 rounded-lg text-xs text-[#bda588] leading-relaxed shadow-inner">
                <strong className="block mb-2 text-[#d97706] font-bold tracking-wide uppercase text-[10px]">{selectedTutorialPiece}</strong>
                {tutorialText[selectedTutorialPiece]}
              </div>
            ) : (
              <div className="flex items-center justify-center h-24 text-[#4a3525] text-xs italic border border-dashed border-[#3a2312] rounded-lg bg-[#1a1110]">Select A Piece To Learn</div>
            )}
          </div>
          <div className="p-5 flex-1 overflow-y-auto">
            <h2 className="font-bold text-[#eecfa1] text-sm uppercase tracking-widest mb-4 border-l-2 border-[#eecfa1] pl-3">Move History</h2>
            <div className="space-y-1">
              {history.length === 0 ? (
                <div className="text-center py-8 text-[#4a3525] text-sm italic">No Moves Yet</div>
              ) : (
                <table className="w-full text-xs text-left text-[#999]">
                  <thead className="text-[10px] uppercase text-[#555] border-b border-[#3a2312]">
                    <tr><th className="py-2 font-bold">#</th><th className="py-2 text-[#e2e2e2]">White</th><th className="py-2 text-[#888]">Black</th></tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: Math.ceil(history.length / 2) }).map((_, i) => (
                      <tr key={i} className="border-b border-[#3a2312]/50 hover:bg-[#251812]">
                        <td className="py-2 font-mono text-[#555]">{i + 1}.</td>
                        <td className="py-2 font-medium text-[#eecfa1]">{history[i * 2]?.notation}</td>
                        <td className="py-2 font-medium text-[#999]">{history[i * 2 + 1]?.notation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </aside>
        <section className="flex-1 flex flex-col items-center justify-center p-2 bg-[#120c0a] relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: `
 repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 40px),
 linear-gradient(0deg, #120c0a 0%, #1a1110 50%, #120c0a 100%)
 `
          }}></div>
          <div className="z-10 mb-4 flex flex-col items-center">
            {status !== GameStatus.Playing && (
              <div className="bg-[#251812] border-2 border-[#d97706] rounded-xl px-8 py-6 text-center shadow-[0_0_50px_rgba(217,119,6,0.2)] z-50 animate-in fade-in zoom-in duration-300">
                <h2 className="text-3xl font-serif font-bold text-[#d97706] mb-2">
                  {status === GameStatus.Checkmate ? (turn === Color.White ? 'Black Wins' : 'White Wins') : 'Draw'}
                </h2>
                <p className="text-[#8B4513] text-xs uppercase tracking-widest font-bold mb-4">Game Over</p>
                <button onClick={resetGame} className="bg-[#d97706] hover:bg-[#b45309] text-[#251812] px-6 py-2 rounded font-bold text-sm shadow-lg transition-transform active:scale-95">Play Again</button>
              </div>
            )}
            {isInCheck(grid, turn) && status === GameStatus.Playing && (
              <div className="mt-3 text-[#b91c1c] bg-[#3a1010] px-4 py-1.5 rounded text-xs font-bold uppercase tracking-widest border border-[#b91c1c] animate-bounce shadow-[0_0_15px_rgba(185,28,28,0.4)]">
                Check!
              </div>
            )}
            {isThinking && <div className="mt-2 text-[#d97706] text-xs font-bold animate-pulse">Opponent Is Thinking...</div>}
          </div>
          <div className="relative z-10">
            <Board grid={grid} selectedPos={selectedPos} validMoves={validMoves} lastMove={lastMove} onSquareClick={onSquareClick} />
          </div>
        </section>
      </main>
    </div>
  )
}