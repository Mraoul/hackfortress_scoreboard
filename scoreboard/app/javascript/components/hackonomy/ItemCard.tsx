import React, { Component, useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'

import { Theme, makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import Typography from '@material-ui/core/Typography'
import MuiDialogTitle from '@material-ui/core/DialogTitle'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

import Item from './Item'
import type { ColorType } from '../def'
import type { ItemInterface, ParticipantIdType } from './def'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  itemsDialog: {
    minHeight: '10rem',
    minWidth: '10rem',
    padding: theme.spacing(2),
  },
  itemCard: {
    width: '30rem',
    // height: '20rem',
    paddingBottom: theme.spacing(2),
  },
}))

interface ItemCardPropsInterface {
  group_name: string
  group_id: number
  items: Array<ItemInterface>
  team_id: ParticipantIdType
  color: ColorType
  show: boolean
  handlePurchase: (
    group_id: number,
    item_id: number,
    stock_status: number
  ) => void
  hideCard: () => void
  discountable: boolean
  sale_ratio: number
}

const ItemCard = (props: ItemCardPropsInterface) => {
  const [items, setItems] = useState(props.items)
  const [show, setShow] = useState(props.show)
  const classes = useStyles()

  useEffect(() => {
    setItems(props.items)
  }, [props.items])

  useEffect(() => {
    setShow(props.show)
  }, [props.show])

  let itemComponents: Array<React.ReactNode> = []
  items.map((item) => {
    itemComponents.push(
      <Grid item xs={12} key={item.id} className={classes.itemCard}>
        <Item
          item={item}
          group_id={props.group_id}
          team_id={props.team_id}
          color={props.color}
          handlePurchase={props.handlePurchase}
          hideCard={props.hideCard}
          discountable={props.discountable}
          sale_ratio={props.sale_ratio}
        />
      </Grid>
    )
  })

  return (
    <Dialog open={show} onClose={props.hideCard}>
      <MuiDialogTitle disableTypography className={classes.root}>
        <Typography variant="h6">{props.group_name}</Typography>
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={props.hideCard}
        >
          <CloseIcon />
        </IconButton>
      </MuiDialogTitle>
      <DialogContent className={classes.itemsDialog}>
        <Grid container spacing={2}>
          {itemComponents.map((item) => item)}
        </Grid>
      </DialogContent>
    </Dialog>
  )
}

//PropTypes
ItemCard.propTypes = {
  group_name: PropTypes.string.isRequired,
  group_id: PropTypes.number.isRequired,
  items: PropTypes.array.isRequired,
  team_id: PropTypes.number,
  color: PropTypes.string,
  show: PropTypes.bool.isRequired,
  handlePurchase: PropTypes.func.isRequired,
  hideCard: PropTypes.func.isRequired,
}

export default ItemCard
