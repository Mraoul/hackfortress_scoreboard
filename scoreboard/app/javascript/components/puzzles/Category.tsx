import React, { Component, useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { Theme, makeStyles } from '@material-ui/core/styles'

import Puzzle from './Puzzle'
import type { PuzzleInterface, PlayersInterface, SolvedInterface } from './def'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
  },
  control: {
    padding: theme.spacing(2),
  },
}))

interface CategoryPropsInterface {
  puzzles: Array<PuzzleInterface>
  solved: SolvedInterface
  name: string
  players: PlayersInterface
  team_id: number
  isJudge: boolean
  judgeView: boolean
}

const Category = (props: CategoryPropsInterface) => {
  const [solved, setSolved] = useState(props.solved)
  const classes = useStyles()

  useEffect(() => {
    setSolved(props.solved)
  }, [props.solved])

  return (
    <Grid container className={classes.root}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          {props.name}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={1}>
          {props.puzzles.map((puzzle) => (
            <Grid item key={puzzle.id} xs="auto">
              <Puzzle
                puzzle={puzzle}
                players={props.players}
                team_id={props.team_id}
                solved={
                  solved.hasOwnProperty(puzzle.id) ? solved[puzzle.id] : false
                }
                isJudge={props.isJudge}
                judgeView={props.judgeView}
              />
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  )
}

//PropTypes
Category.propTypes = {
  puzzles: PropTypes.array.isRequired,
  solved: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  players: PropTypes.array.isRequired,
  team_id: PropTypes.number.isRequired,
  isJudge: PropTypes.bool.isRequired,
  judgeView: PropTypes.bool.isRequired,
}

Category.defaultProps = {
  team_id: 0,
  isJudge: false,
  judgeView: false,
  players: [],
  solved: {},
}

export default Category
