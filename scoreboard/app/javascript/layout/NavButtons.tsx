import React, { useState, useEffect, useContext } from 'react'
import { useHistory } from 'react-router-dom'

import Button from '@material-ui/core/Button'

import {
  dashboardPath,
  puzzlesPath,
  hackonomyPath,
  logoutPath,
} from '../helpers/PagePaths'

const NavButtons = ({}) => {
  let history = useHistory()

  const changePage = (path: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    history.push(path)
  }

  return (
    <>
      <Button
        href="#"
        color="inherit"
        onClick={(e) => changePage(dashboardPath, e)}
      >
        Dashboard
      </Button>
      <Button
        href="#"
        color="inherit"
        onClick={(e) => changePage(puzzlesPath, e)}
      >
        Puzzles
      </Button>
      <Button
        href="#"
        color="inherit"
        onClick={(e) => changePage(hackonomyPath, e)}
      >
        Hackonomy
      </Button>
      <Button
        href="#"
        color="inherit"
        onClick={(e) => changePage(logoutPath, e)}
      >
        Logout
      </Button>
    </>
  )
}

export default NavButtons
