import React, { Component, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Container, Grid } from '@material-ui/core'

import { Theme, withStyles, makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import Badge from '@material-ui/core/Badge'
import HelpIcon from '@material-ui/icons/Help'
import MenuIcon from '@material-ui/icons/Menu'
import Tooltip from '@material-ui/core/Tooltip'

import { hackonomyPath } from '../../helpers/PagePaths'
import type { RoundInterface } from './def'

const CustomTooltip = withStyles(({ palette }) => ({
  tooltipArrow: {
    fontSize: '1rem',
    backgroundColor: palette.info.light,
  },
  arrow: {
    color: palette.info.light,
  },
}))(Tooltip)

const useStyles = makeStyles((theme: Theme) => ({
  roundName: {
    marginRight: theme.spacing(2),
  },
  grow: {
    flexGrow: 1,
  },
  appBar: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}))

interface StatusBarPropsInterface {
  hints: number
  round: RoundInterface
  color: string
  gameTime: number | undefined
}

export const StatusBar = (props: StatusBarPropsInterface) => {
  const [hints, setHints] = useState(props.hints)

  useEffect(() => {
    setHints(props.hints)
  }, [props.hints])

  const classes = useStyles()
  let history = useHistory()

  const NavigateToStore = ({}) => {
    history.push(hackonomyPath)
  }

  const timer = `(Minutes Elapsed: ${props.gameTime})`

  return (
    <AppBar position="sticky" className={classes.appBar}>
      <Toolbar>
        <Typography variant="h6">
          {props.round.name} {props.gameTime !== undefined ? timer : ''}
        </Typography>
        <div className={classes.grow} />
        <CustomTooltip
          title="Purchase Hints in the Store"
          placement="left"
          onClick={NavigateToStore}
          arrow
        >
          <IconButton edge="start" color="inherit">
            <Badge badgeContent={hints} color="secondary" overlap="rectangular">
              <HelpIcon />
            </Badge>
          </IconButton>
        </CustomTooltip>
      </Toolbar>
    </AppBar>
  )
}

StatusBar.propTypes = {
  color: PropTypes.string.isRequired,
  hints: PropTypes.number.isRequired,
  round: PropTypes.object.isRequired,
}

export default StatusBar
