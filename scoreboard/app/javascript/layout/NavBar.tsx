import React, { useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import { useHistory } from 'react-router-dom'

import { Theme, makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import CssBaseline from '@material-ui/core/CssBaseline'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'

import { useSession } from '../helpers/Session'
import type { ColorType } from '../components/def'
import NavButtons from './NavButtons'

export const styles = (theme: Theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    marginBottom: theme.spacing(1),
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
  toolbar: theme.mixins.toolbar,
  grow: {
    flexGrow: 1,
  },
  offset: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
})

const useStyles = makeStyles(styles)

interface NavBarPropInterface {
  color: ColorType
  changeColorCb?: (newColor: ColorType) => void
}

const NavBar = (props: NavBarPropInterface) => {
  const [colorSwitch, setColorSwitch] = useState(
    props.color == 'red' ? false : true
  )
  const [colorString, setColorString] = useState(
    props.color == 'red' ? 'Red' : 'Blue'
  )
  const classes = useStyles()
  const session = useSession()
  let history = useHistory()

  useEffect(() => {
    changeColor(props.color)
  }, [props.color])

  const changeColor = (color: ColorType) => {
    if (color == 'red') {
      setColorSwitch(false)
      setColorString('Red')
    } else {
      setColorSwitch(true)
      setColorString('Blue')
    }
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newColor: ColorType
    if (!e.target.checked) {
      newColor = 'red'
    } else {
      newColor = 'blue'
    }

    session.setColor(newColor)
  }

  const changePage = (path: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    history.push(path)
  }

  let colorSwitchFragment: React.ReactNode
  if (session.user!.hasOwnProperty('role')) {
    if (['admin', 'judge'].includes(session.user!.role)) {
      colorSwitchFragment = (
        <React.Fragment>
          <div className={classes.grow} />
          <FormControlLabel
            control={
              <Switch checked={colorSwitch} onChange={handleColorChange} />
            }
            label={colorString}
            labelPlacement="start"
          />
        </React.Fragment>
      )
    }
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="sticky" className={classes.appBar}>
        <Toolbar>
          <NavButtons />
          {colorSwitchFragment}
        </Toolbar>
      </AppBar>
      {/* https://material-ui.com/components/app-bar/#fixed-placement */}
      {/* <div className={`${classes.offset} ${classes.offsetSpacer}`} /> */}
    </div>
  )
}

NavBar.propTypes = {
  changeColorCb: PropTypes.func,
  color: PropTypes.string,
}

NavBar.defaultProps = {
  color: 'red',
}

export default NavBar
