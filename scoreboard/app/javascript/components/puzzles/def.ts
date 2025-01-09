import type { ColorType } from '../def'

export interface RoundInterface {
  id: number
  name: string
}

export interface ParticpantInterface {
  id: number
  score: {
    hack: number
    bonus: number
    tf2: number
  }
  hints: number
  color: ColorType
}

export interface PuzzleInterface {
  id: number
  status: string
  name: string
  data: string
  data_source: string
  points: number
  description: string
  unlock: number
  author: string
  solution: string
  hints: string
}

export interface CategoriesInterface {
  [key: string]: {
    id: number
    puzzles: Array<PuzzleInterface>
  }
}

export interface PlayersInterface extends Array<Array<string | number>> {}

export interface SolvedInterface {
  [key: number]: string
}
