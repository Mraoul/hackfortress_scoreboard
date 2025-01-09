export type ConsolePlayersType = Array<Array<string | number>>
export type ConsoleSolvedType = Array<number>
export interface ConsoleRoundInterface {
  name: string
}

export interface ConsoleTeamInterface {
  name: string
}

export interface ConsoleParticipantInterface {
  id: number
  team_id: number
  hack_score: number
  bonus_score: number
  tf2_score: number
  hackcoins: number
  tf2coins: number
  dominate: boolean
  hints: number
  team: ConsoleTeamInterface
}

export interface ConsoleParticipantContainerInterface {
  participant: ConsoleParticipantInterface
  players: ConsolePlayersType
  solved: ConsoleSolvedType
}

export interface ConsolePuzzleInterface {
  id: number
  name: string
  unlock: number
}

export interface ConsoleCategoriesInterface {
  [key: string]: Array<ConsolePuzzleInterface>
}

export interface ConsoleInterface {
  round: ConsoleRoundInterface
  participants: Array<ConsoleParticipantContainerInterface>
  puzzles: ConsoleCategoriesInterface
  gametime: number
}
