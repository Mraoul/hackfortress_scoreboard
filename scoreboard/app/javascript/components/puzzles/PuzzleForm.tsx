import React, { Component, useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import MenuItem from '@material-ui/core/MenuItem'
import Grid from '@material-ui/core/Grid'

import { useSnackbar } from 'notistack'
import { getCachedAttribution, useSession } from '../../helpers/Session'
import type { PlayersInterface, PuzzleInterface } from './def'
import { makeFetch } from '../../helpers/MakeFetch'

const styles = (theme: Theme) => ({
  submitControl: {
    marginLeft: '0px',
  },
  textField: {
    paddingBottom: theme.spacing(1),
  },
})

const useStyles = makeStyles(styles)

interface PuzzleFormPropsInterface {
  players: PlayersInterface
  team_id: number
  isJudge: boolean
  hideCard: () => void
  data: PuzzleInterface
}

export const PuzzleForm = (props: PuzzleFormPropsInterface) => {
  const defaultPlayerAttribution = props.players[0][1] as number
  const [solution, setSolution] = useState('')
  const [attribution, setAttribution] = useState<number>(
    defaultPlayerAttribution
  )
  const [judgeMode, setJudgeMode] = useState(false)
  const [submitText, setSubmitText] = useState('Submit')
  const [solutionPlaceholder, setSolutionPlaceholder] = useState('Solution')
  const [solutionEnabled, setSolutionEnabled] = useState(true)

  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const session = useSession()
  const classes = useStyles()

  useEffect(() => {
    if (session != null) {
      const user = session.user!
      const cachedAttribution = getCachedAttribution()
      if (cachedAttribution) {
        if (!isNaN(cachedAttribution)) {
          setAttribution(cachedAttribution)
        }
      }
    }
  }, [])

  const handleChangeSolution = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target != null) {
      const target = e.target as HTMLInputElement
      if (target.value.length < 255) {
        setSolution(target.value)
      }
    }
  }
  const handleChangeAttribution = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement
    setAttribution(parseInt(target.value))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!judgeMode && !!solution === false) {
      enqueueSnackbar('Solution Field Cannot be empty!')
      return
    }

    interface RequestBodyInterface {
      team: number
      player: number
      puzzle: number
      judge_submit: boolean | undefined
      soln: string | undefined
    }

    let request_body: RequestBodyInterface = {
      team: props.team_id,
      player: attribution,
      puzzle: props.data.id,
      judge_submit: undefined,
      soln: undefined,
    }

    if (judgeMode) {
      request_body['judge_submit'] = true
      var retVal = confirm('This action cannot be reversed? Are you sure?')

      if (!retVal) {
        return
      }
    } else {
      request_body['soln'] = solution
    }

    await makeFetch({
      url: '/api/submit_solution',
      method: 'POST',
      body: request_body,
      successFn: (data) => {
        props.hideCard()
        enqueueSnackbar('Solution Accepted!')
      },
      unauthorizedFn: (data) => {
        enqueueSnackbar('Unauthorized: ' + data.error)
      },
      statusFns: {
        '400': (data) => {
          if (data.hasOwnProperty('error')) {
            console.log(data.error)
          } else {
            switch (data.reason) {
              case 'solved':
                enqueueSnackbar('Puzzle Solved ' + data.message)
                break
              case 'solved_other':
                break
              case 'incorrect':
                enqueueSnackbar('Incorrect ' + data.message)
                break
              case 'solutionempty':
                enqueueSnackbar(data.message)
                break
              default:
                enqueueSnackbar(data.message)
                console.log(data)
            }
          }
        },
      },
      unexpectedRespFn: (data, response) => {
        enqueueSnackbar('Unexpected response from server -- Contact judge')
        console.log(response)
      },
    })
  }

  const toggleJudgeMode = () => {
    if (judgeMode) {
      setJudgeMode(false)
      setSubmitText('Submit')
      setSolutionPlaceholder('Solution')
      setSolutionEnabled(true)
    } else {
      setJudgeMode(true)
      setSubmitText('Force Submit')
      setSolutionPlaceholder('Solution Ignored')
      setSolutionEnabled(false)
    }
  }

  let judge_controls

  if (props.isJudge) {
    judge_controls = (
      <Grid item xs={12}>
        <FormControlLabel
          className={classes.submitControl}
          label="Judge Submit"
          labelPlacement="start"
          control={<Checkbox checked={judgeMode} onChange={toggleJudgeMode} />}
        />
      </Grid>
    )
  }

  return (
    <div className="puzzle-form-container">
      <div className="puzzle-form">
        <form onSubmit={handleSubmit}>
          <Grid container>
            {judge_controls}
            <Grid item xs={12}>
              <TextField
                className={classes.textField}
                select
                label="Attribution"
                name="attribution"
                value={attribution}
                helperText="Select who solved this puzzle"
                fullWidth={true}
                onChange={handleChangeAttribution}
              >
                {props.players.map((player) => (
                  <MenuItem
                    key={props.data.id + '.' + player[1]}
                    value={player[1]}
                  >
                    {player[0]}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                className={classes.textField}
                disabled={!solutionEnabled}
                label={solutionPlaceholder}
                name={'solution'}
                type="text"
                placeholder={solutionPlaceholder}
                helperText="The puzzle solution"
                fullWidth={true}
                value={solution}
                onChange={handleChangeSolution}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                color="primary"
                variant="contained"
                type="submit"
                fullWidth
              >
                {submitText}
              </Button>
            </Grid>
          </Grid>
        </form>
      </div>
    </div>
  )
}

//PropTypes
PuzzleForm.propTypes = {
  data: PropTypes.object.isRequired,
  players: PropTypes.array.isRequired,
  team_id: PropTypes.number.isRequired,
  hideCard: PropTypes.func.isRequired,
  isJudge: PropTypes.bool.isRequired,
}

export default PuzzleForm
