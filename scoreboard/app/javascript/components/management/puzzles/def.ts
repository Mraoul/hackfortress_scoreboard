export type CategoriesListType = Array<CategoryInterface>

export interface CategoryInterface {
  id: number
  name: string
}

export interface CategoryPuzzlesInterface {
  id: number
  name: string
  puzzles: CategoryPuzzleListType
}

export type CategoryPuzzleListType = Array<CategoryPuzzleInterface>

export interface CategoryPuzzleInterface {
  id: number
  description: string
  category_id: number
  hints?: string
  name: string
  data: string
  solution?: string
  quickdraw: boolean
  fcfs: boolean
  points: number
  unlock: number
  author: string
  data_source: string
  puzzlesets: Array<{ id: number }>
}

export interface CategoryPuzzleSetsType {
  id: number
  name: string
}
