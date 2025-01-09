import React, { Component, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'

import ItemGroup from './ItemGroup'
import type { ColorType } from '../def'
import type { ItemGroupInterface, ParticipantIdType } from './def'

interface TypeItemPropsInterface {
  itemgroups: Array<ItemGroupInterface>
  team_id: ParticipantIdType
  color: ColorType
  handlePurchase: (
    group_id: number,
    item_id: number,
    stock_status: number
  ) => void
  sale_ratio: number
}

const TypeItem = (props: TypeItemPropsInterface) => {
  const [itemgroups, setItemGroups] = useState(props.itemgroups)

  useEffect(() => {
    setItemGroups(props.itemgroups)
  }, [props.itemgroups])

  let item_groups: Array<React.ReactNode> = []
  itemgroups.map((item_group) => {
    item_groups.push(
      <Grid item key={item_group.id} lg={4}>
        <ItemGroup
          id={item_group.id}
          name={item_group.name}
          itemgroup={item_group}
          team_id={props.team_id}
          color={props.color}
          handlePurchase={props.handlePurchase}
          sale_ratio={props.sale_ratio}
        />
      </Grid>
    )
  })

  return (
    <div className={'category-container'}>
      <Grid container spacing={2}>
        {item_groups.map((item_group) => item_group)}
      </Grid>
    </div>
  )
}

//PropTypes
TypeItem.propTypes = {
  itemgroups: PropTypes.array.isRequired,
  team_id: PropTypes.number,
  color: PropTypes.string,
  handlePurchase: PropTypes.func.isRequired,
}

export default TypeItem
