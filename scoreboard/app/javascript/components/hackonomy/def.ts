import type { ColorType } from '../def'

export type StoreStatusType = 'up' | 'down'
export type ParticipantIdType = number | null
export type handlePurchaseFunctionType = (
  group_id: number,
  item_id: number,
  stock_status: number
) => void

export interface StoreInterface {
  status: StoreStatusType
  sale_ratio: number
}

export interface WalletInterface {
  hack: number
  tf2: number
}

export interface ParticipantInterface {
  id: number | null
}

export interface ItemInterface {
  id: number
  name: string
  description: string
  cost: number
  inventory: number
}

export interface ItemGroupInterface {
  id: number
  name: string
  description: string
  picture_location: string
  discountable: boolean
  items: Array<ItemInterface>
}

export interface ItemsInterface {
  hack: Array<ItemGroupInterface>
  tf2: Array<ItemGroupInterface>
}

export interface StorefrontInterface {
  team: number
  color: ColorType
  store: StoreInterface
  wallet: WalletInterface
  participant: ParticipantInterface
  items: ItemsInterface
}
