import React, { Component, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

import Card from '@material-ui/core/Card'
import Grid from '@material-ui/core/Grid'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import LockIcon from '@material-ui/icons/Lock'
import DoneOutlineIcon from '@material-ui/icons/DoneOutline'
import { Theme, makeStyles } from '@material-ui/core/styles'

import PuzzleCard from './PuzzleCard'
import type { PuzzleInterface, SolvedInterface, PlayersInterface } from './def'

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    width: '10rem',
    height: '10rem',
    textAlign: 'center',
  },
  cardContent: {
    height: '8rem',
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 16,
    height: '100%',
  },
  lockedTitle: {
    color: '#fafafa',
  },
  pos: {
    marginBottom: 12,
  },
  locked: {
    backgroundColor: theme.palette.primary.dark, //'#424242',
  },
  solved: {
    backgroundColor: theme.palette.primary.light,
  },
}))

interface PuzzlePropsInterface {
  puzzle: PuzzleInterface
  solved: string | false
  players: PlayersInterface
  team_id: number
  isJudge: boolean
  judgeView: boolean
}

const Puzzle = (props: PuzzlePropsInterface) => {
  const [locked, setLocked] = useState(
    props.puzzle.status == 'locked' ? true : false
  )
  const [show, setShow] = useState(false)
  const [solved, setSolved] = useState(props.solved)
  const classes = useStyles()

  useEffect(() => {
    setLocked(props.puzzle.status == 'locked' ? true : false)
  }, [props.puzzle.status])

  useEffect(() => {
    setSolved(props.solved)
  }, [props.solved])

  const showCard = () => setShow(true)
  const hideCard = () => setShow(false)

  if (locked && !props.judgeView) {
    let locked_body
    if (props.puzzle.hasOwnProperty('name')) {
      // Must be a judge
      locked_body = (
        <Grid item xs={12}>
          <Typography
            className={`${classes.title} ${classes.lockedTitle}`}
            gutterBottom
          >
            {`${props.puzzle.name}(${props.puzzle.unlock})`}
          </Typography>
        </Grid>
      )
    } else {
      locked_body = <React.Fragment />
    }

    return (
      <div className="puzzle-container-locked">
        <Card
          className={`${classes.card}  ${classes.locked}`}
          variant="outlined"
        >
          <CardContent className={classes.cardContent}>
            <Grid container spacing={2}>
              {locked_body}
              <Grid item xs={12}>
                <LockIcon className={classes.lockedTitle} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </div>
    )
  } else {
    const puzzle_name = props.judgeView
      ? `${props.puzzle.name} (${props.puzzle.unlock})`
      : props.puzzle.name
    const card_body = (
      <Grid item xs={12}>
        <Typography className={classes.title} color="textPrimary">
          {puzzle_name}
        </Typography>
      </Grid>
    )

    return (
      <div className={'puzzle-container'}>
        <Card
          className={clsx(classes.card, { [classes.solved]: !!solved })}
          variant="outlined"
          onClick={showCard}
        >
          <CardContent className={classes.cardContent}>
            <Grid container spacing={2}>
              {card_body}
              {!!solved && (
                <Grid item xs={12}>
                  <DoneOutlineIcon />
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        <PuzzleCard
          data={props.puzzle}
          players={props.players}
          team_id={props.team_id}
          solved={solved}
          show={show}
          hideCard={hideCard}
          isJudge={props.isJudge}
          judgeView={props.judgeView}
        />
      </div>
    )
  }
}

//PropTypes
Puzzle.propTypes = {
  puzzle: PropTypes.object.isRequired,
  solved: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
  players: PropTypes.array.isRequired,
  team_id: PropTypes.number.isRequired,
  isJudge: PropTypes.bool.isRequired,
  judgeView: PropTypes.bool.isRequired,
}

export default Puzzle
