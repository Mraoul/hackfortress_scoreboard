import React, { Component, useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'

import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { Theme, makeStyles } from '@material-ui/core/styles'

import ItemCard from './ItemCard'
import type { ColorType } from '../def'
import { ItemGroupInterface, ParticipantIdType } from './def'

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    width: '20rem',
    height: '22rem',
  },
  cardActionArea: {
    height: '18rem',
  },
  cardImg: {
    height: '10rem',
    width: 'auto',
    marginRight: 'auto',
    marginLeft: 'auto',
  },
}))

interface ItemGroupPropsInterface {
  id: number
  name: string
  itemgroup: ItemGroupInterface
  team_id: ParticipantIdType
  color: ColorType
  handlePurchase: (
    group_id: number,
    item_id: number,
    stock_status: number
  ) => void
  sale_ratio: number
}

const ItemGroup = (props: ItemGroupPropsInterface) => {
  const [show, setShow] = useState(false)
  const [items, setItems] = useState(props.itemgroup.items)
  const classes = useStyles()

  useEffect(() => {
    setItems(props.itemgroup.items)
  }, [props.itemgroup.items])

  const showCard = () => {
    setShow(true)
  }

  const hideCard = () => {
    setShow(false)
  }

  let item_group_image = props.itemgroup.picture_location
  return (
    <div className={'itemgroup-container'}>
      <Card className={classes.card} onClick={showCard}>
        <CardActionArea className={classes.cardActionArea}>
          <CardMedia
            className={classes.cardImg}
            component="img"
            image={item_group_image}
            // style={classes.cardImg}
          />
          <CardContent>
            <Typography className="itemgroup-name">{props.name}</Typography>
            <Typography className="itemgroup-desc">
              {props.itemgroup.description}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
          <Button variant="contained" color="primary" fullWidth>
            View Items
          </Button>
        </CardActions>
      </Card>

      <ItemCard
        group_name={props.name}
        group_id={props.id}
        items={props.itemgroup.items}
        team_id={props.team_id}
        color={props.color}
        show={show}
        hideCard={hideCard}
        handlePurchase={props.handlePurchase}
        discountable={props.itemgroup.discountable}
        sale_ratio={props.sale_ratio}
      />
    </div>
  )
}

//PropTypes
ItemGroup.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  itemgroup: PropTypes.object.isRequired,
  team_id: PropTypes.number,
  color: PropTypes.string,
  handlePurchase: PropTypes.func.isRequired,
}

export default ItemGroup
