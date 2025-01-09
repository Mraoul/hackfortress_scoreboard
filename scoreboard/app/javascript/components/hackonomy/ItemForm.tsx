import React, { useState } from 'react'
import PropTypes from 'prop-types'

import Button from '@material-ui/core/Button'

import { useSnackbar } from 'notistack'
import { useSession } from '../../helpers/Session'
import { makeFetch } from '../../helpers/MakeFetch'

import type { ColorType } from '../def'
import type { ItemInterface, ParticipantIdType } from './def'

interface ItemFormPropsInterface {
  item: ItemInterface
  group_id: number
  team_id: ParticipantIdType
  handlePurchase: (
    group_id: number,
    item_id: number,
    stock_status: number
  ) => void
  hideCard: () => void
  color: ColorType
}

export const ItemForm = (props: ItemFormPropsInterface) => {
  const [state, setState] = useState({})
  const [buttonDisabled, setButtonDisabled] = useState(false)
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const session = useSession()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // Disable the Purchase button to prevent double-clicks
    setButtonDisabled(true)
    e.preventDefault()

    let request_body = {
      team: props.team_id,
      item: props.item.id,
    }

    console.log(request_body)
    await makeFetch({
      url: '/api/purchaseItem',
      method: 'POST',
      body: request_body,
      successFn: (data) => {
        props.hideCard()
        props.handlePurchase(props.group_id, props.item.id, data.stock)
        enqueueSnackbar('Purchase Complete ' + data.perk)
      },
      unauthorizedFn: (data) => {
        enqueueSnackbar('Unauthorized ' + data.error)
      },
      statusFns: {
        '400': (data) => {
          if (data.hasOwnProperty('error')) {
            enqueueSnackbar(data.error)
            console.log(data.error)
          } else {
            switch (data.reason) {
              case 'store_down':
                enqueueSnackbar('Store Unavailable ' + data.message)
                break
              case 'no_stock':
                enqueueSnackbar('Out of Stock')
                break
              case 'low_funds':
                enqueueSnackbar('Insufficient Funds ' + data.message)
                break
              default:
                enqueueSnackbar(data.message)
            }
          }
        },
      },
      // Always re-enable purchase button regardless of response
      always: () => setButtonDisabled(false),
    })
  }

  return (
    <div className="item-form-container">
      <div className="item-form">
        <form onSubmit={handleSubmit}>
          <Button fullWidth disabled={buttonDisabled} variant="outlined" color="primary" type="submit">
            Purchase
          </Button>
        </form>
      </div>
    </div>
  )
}

//PropTypes
ItemForm.propTypes = {
  item: PropTypes.object.isRequired,
  group_id: PropTypes.number.isRequired,
  team_id: PropTypes.number.isRequired,
  handlePurchase: PropTypes.func.isRequired,
  hideCard: PropTypes.func.isRequired,
  color: PropTypes.string.isRequired,
}

export default ItemForm
