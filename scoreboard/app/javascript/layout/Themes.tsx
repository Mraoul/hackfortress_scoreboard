import React, { useEffect, useState } from 'react'
import { useSession } from '../helpers/Session'
import { createTheme, Theme, ThemeOptions } from '@material-ui/core/styles'
import { MuiThemeProvider } from '@material-ui/core/styles'
import update from 'immutability-helper'
import Loading from './Loading'
import { useLocation } from 'react-router'

const redThemeBase: ThemeOptions = {
  palette: {
    primary: {
      main: '#d41919',
    },
    secondary: {
      main: '#d4d419',
    },
  },
}

const blueThemeBase: ThemeOptions = {
  palette: {
    primary: {
      main: '#2e5ce6',
    },
    secondary: {
      main: '#e6da2e',
    },
  },
}

const neutralThemeBase: ThemeOptions = {
  palette: {
    primary: {
      main: '#757575',
    },
    secondary: {
      main: '#8d6e63',
    },
  },
}

const mgmtThemeBase: ThemeOptions = {
  palette: {
    primary: {
      light: '#4f5b62',
      main: '#263238',
      dark: '#000a12',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff9e40',
      main: '#ff6d00',
      dark: '#c43c00',
      contrastText: '#000',
    },
    type: 'dark',
  },
}

const redDarkThemeBase = { ...redThemeBase, type: 'dark' }
const blueDarkThemeBase = { ...blueThemeBase, type: 'dark' }
const neutralDarkThemeBase = { ...neutralThemeBase, type: 'dark' }

export const redTheme = createTheme(redThemeBase)
export const redThemeDark = createTheme(redDarkThemeBase)
export const blueTheme = createTheme(blueThemeBase)
export const blueThemeDark = createTheme(blueDarkThemeBase)
export const neutralTheme = createTheme(neutralThemeBase)
export const neutralThemeDark = createTheme(neutralDarkThemeBase)
export const mgmtTheme = createTheme(mgmtThemeBase)

export const generateTheme = (
  color: string | null = null,
  role = 'contestant'
) => {
  // console.log(color, role)
  let baseTheme
  switch (color) {
    case 'red':
      baseTheme = redThemeBase
      break
    case 'blue':
      baseTheme = blueThemeBase
      break
    case 'black':
      baseTheme = mgmtTheme
      break
    default:
      baseTheme = neutralThemeBase
  }

  let generatedTheme // = createTheme({...baseTheme})
  if (['admin', 'judge'].includes(role)) {
    generatedTheme = createTheme(
      update(baseTheme, { palette: { type: { $set: 'dark' } } })
    )
  } else {
    generatedTheme = createTheme({ ...baseTheme })
  }

  return generatedTheme
}

export const darkModeTheme = createTheme({
  palette: {
    type: 'dark',
  },
})

// TF Red: #d41919
// TF Blue: #2e5ce6

interface ThemeHandlerProps {
  children?: React.ReactNode
}

export const ThemeHandler = ({ children }: ThemeHandlerProps) => {
  const [theme, setTheme] = useState<Theme>()
  const session = useSession()
  const location = useLocation()

  useEffect(() => {
    if (location.pathname.startsWith('/login')) {
      setTheme(createTheme())
    } else if (session.user === undefined) {
      setTheme(generateTheme())
    } else {
      let role = session.user.role
      let color = session.user.color || null

      if (
        location.pathname.startsWith('/dashboard') &&
        ['admin', 'judge'].includes(role)
      ) {
        color = 'black'
      }
      setTheme(generateTheme(color, role))
    }
  }, [session, location])

  return theme === undefined ? (
    <Loading />
  ) : (
    <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
  )
}
