export type ItemGroupsType = Array<ItemGroupInterface>

export interface ItemGroupInterface {
  id: number
  name: string
  description: string
  picture_location: string
  discountable: boolean
  hack_item: boolean
  items: ItemsListType
}

export type ItemsListType = Array<ItemInterface>

export interface ItemInterface {
  id: number
  name: string
  cost: number
  description: string
  discountable: boolean
  item_group_id: number
  modifier: number
  players: number
  argument: number
  starting_quantity: number
  friendly_text: string
  effect_iden: string
  is_buff: boolean
}
