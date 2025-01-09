import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { Theme, makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'

import { useSnackbar } from 'notistack'
import { makeFetch } from '../../../helpers/MakeFetch'

export const useStyles = makeStyles((theme: Theme) => ({
  teamPaper: {
    paddingBottom: theme.spacing(2),
  },
  allTeam: {
    borderRadius: '5px',
  },
  redTeam: {
    backgroundColor: '#d41919',
    color: '#fff',
  },
  blueTeam: {
    backgroundColor: '#2e5ce6',
    color: '#fff',
  },
  spacer: {
    height: theme.spacing(5),
  },
}))

interface BonusControlPropsInterface {
  participant_id: number
}

export const BonusControl = ({
  participant_id,
}: BonusControlPropsInterface) => {
  const [bonusPoints, setBonusPoints] = useState<number>(0)
  const handleBonusPointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value)
    if (isNaN(newValue)) {
      enqueueSnackbar('Bonus points must be a number')
    } else {
      setBonusPoints(newValue)
    }
  }
  const { enqueueSnackbar } = useSnackbar()

  const handleSubmit = async (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault()

    if (!!bonusPoints === false) {
      enqueueSnackbar('Bonus points field must hold a value')
      return
    }

    if (isNaN(bonusPoints)) {
      enqueueSnackbar('Bonus points must be a number')
      return
    }

    if (!confirm('This action cannot be reversed? Are you sure?')) {
      return
    }

    let request_body = {
      bonus_value: bonusPoints,
    }

    await makeFetch({
      url: `/api/mgmt/participants/bonus/${participant_id}`,
      method: 'POST',
      body: request_body,
      successFn: () => {
        enqueueSnackbar('Bonus Granted')
        setBonusPoints(0)
      },
      unauthorizedFn(data) {
        console.log(data)
      },
    })
  }

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Bonus Points"
              name="bonusPoints"
              type="text"
              placeholder="Bonus Points to Grant"
              value={bonusPoints}
              onChange={handleBonusPointsChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" type="submit" fullWidth>
              Grant Bonus
            </Button>
          </Grid>
        </Grid>
      </form>
    </React.Fragment>
  )
}

BonusControl.propTypes = {
  participant_id: PropTypes.number.isRequired,
}
