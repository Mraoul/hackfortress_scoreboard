import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import { Theme, makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableRow from '@material-ui/core/TableRow'

import ItemForm from './ItemForm'
import type { ColorType } from '../def'
import type { ItemInterface, ParticipantIdType } from './def'

const useStyles = makeStyles((theme: Theme) => ({
  itemTable: {
    // minWidth: '10rem'
  },
  itemContainer: {},
  noStock: {
    padding: theme.spacing(1),
  },
}))

interface ItemPropsInterface {
  item: ItemInterface
  group_id: number
  team_id: ParticipantIdType
  color: ColorType
  handlePurchase: (
    group_id: number,
    item_id: number,
    stock_status: number
  ) => void
  hideCard: () => void
  discountable: boolean
  sale_ratio: number
}

const Item = (props: ItemPropsInterface) => {
  const [item, setItem] = useState(props.item)
  const classes = useStyles()

  useEffect(() => {
    setItem(props.item)
  }, [props.item])

  const cost = Math.floor(
    item.cost * ((props.discountable ? props.sale_ratio : 100) / 100)
  )

  let form
  if (item.inventory > 0) {
    form = (
      <ItemForm
        item={props.item}
        group_id={props.group_id}
        team_id={props.team_id}
        color={props.color}
        handlePurchase={props.handlePurchase}
        hideCard={props.hideCard}
      />
    )
  } else {
    form = (
      <Typography align="center" className={classes.noStock} variant="h6">
        Out of Stock
      </Typography>
    )
  }
  return (
    <TableContainer
      component={Paper}
      elevation={3}
      className={classes.itemContainer}
    >
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Name:</TableCell>
            <TableCell>{item.name}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Cost:</TableCell>
            <TableCell>{cost <= 0 ? 1 : cost}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Inventory:</TableCell>
            <TableCell>{item.inventory}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Description:</TableCell>
            <TableCell>{item.description}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      {form}
    </TableContainer>
  )
}

//PropTypes
Item.propTypes = {
  item: PropTypes.object.isRequired,
  group_id: PropTypes.number.isRequired,
  team_id: PropTypes.number,
  color: PropTypes.string,
  handlePurchase: PropTypes.func.isRequired,
  hideCard: PropTypes.func.isRequired,
}

export default Item
