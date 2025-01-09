import React, { useState, useEffect, useContext } from 'react'
import update from 'immutability-helper'
import { createContext } from 'react'
import Loading from '../layout/Loading'

export interface SessionStatusApiResponseInterface {
  username: string
  userid: number
  role: string
  teamid?: number
  teamname?: string
  color?: string
}

export interface UserSessionDataInterface {
  username: string
  userid: number
  role: string
  color?: string
  teamid?: number
  teamname?: string
  attribution?: number
}

export interface SessionContextInterface {
  authenticated: boolean
  user?: UserSessionDataInterface
  color?: string
  clear: () => void
  refresh: () => void
  setColor: (newColor: string) => void
  setAttribution: (player_id: number | undefined) => void
}

export const SessionContext = createContext<SessionContextInterface>({
  authenticated: false,
  user: undefined,
  color: undefined,
  clear: () => {},
  refresh: () => {},
  setColor: (newColor) => {},
  setAttribution: (player_id) => {},
})

export const useSession = () => {
  const session = useContext(SessionContext)
  return session
}

export const jwtStorageName = 'token'
export const getJwtToken = () => localStorage.getItem(jwtStorageName)
export const setJwtToken = (token: string) =>
  localStorage.setItem(jwtStorageName, token)
export const delJwtToken = () => localStorage.removeItem(jwtStorageName)

const colorStorageName = 'colorCache'
const getCachedColor = () => localStorage.getItem(colorStorageName)
const setCachedColor = (color: string) =>
  localStorage.setItem(colorStorageName, color)
const delCachedColor = () => localStorage.removeItem(colorStorageName)

const attributionStorageName = 'attribution'
export const getCachedAttribution = () => {
  const attribution_str = localStorage.getItem(attributionStorageName)
  if (attribution_str) {
    return parseInt(attribution_str) || undefined
  }
}
export const setCachedAttribution = (player_id: number) => {
  if (!isNaN(player_id)) {
    localStorage.setItem(attributionStorageName, player_id.toString())
  }
}
export const delCachedAttribution = () =>
  localStorage.removeItem(attributionStorageName)

interface SessionProps {
  children?: React.ReactNode
}

export const Session = ({ children }: SessionProps) => {
  const [authenticated, setAuthenticated] = useState<boolean>(false)
  const [loaded, setLoaded] = useState<boolean>(false)
  const [userData, setUserData] = useState<UserSessionDataInterface>()

  useEffect(() => {
    if (!authenticated) {
      return
    }

    let timer: NodeJS.Timeout
    const checkToken = () => {
      if (!!!getJwtToken()) {
        clearSession()
      } else {
        timer = setTimeout(checkToken, 1000)
      }
    }

    checkToken()

    return () => {
      if (timer !== undefined) {
        clearTimeout(timer)
      }
    }
  }, [authenticated])

  useEffect(() => {
    refreshSession().then(() => {
      setLoaded(true)
    })
  }, [])

  const setUser = (user: SessionStatusApiResponseInterface) => {
    let color = undefined
    if (user.hasOwnProperty('color')) {
      color = user.color
    } else if (['judge', 'admin'].includes(user.role)) {
      color = getCachedColor()
      if (!!!color || !['red', 'blue'].includes(color)) {
        // Default judge and admin to red
        color = 'red'
        setCachedColor(color)
      }
    }

    let attribution = getCachedAttribution()
    if (attribution && isNaN(attribution)) {
      delCachedAttribution()
    }

    setUserData({ ...user, color: color, attribution: attribution })
  }

  const clearSession = () => {
    delJwtToken()
    delCachedColor()
    delCachedAttribution()
    setUserData(undefined)
    setAuthenticated(false)
  }

  const setColor = (newColor: string) => {
    if (['red', 'blue'].includes(newColor)) {
      setCachedColor(newColor)
    }
    const newData = update(userData, { color: { $set: newColor } })
    setUserData(newData)
  }

  const setAttribution = (player_id: number | undefined) => {
    if (player_id === undefined) {
      delCachedAttribution()
    } else if (!isNaN(player_id)) {
      setCachedAttribution(player_id)
    }
    const newData = update(userData, { attribution: { $set: player_id } })
    setUserData(newData)
  }

  const refreshSession = async () => {
    if (!!getJwtToken()) {
      try {
        console.log('Fetching Session Status')
        let response = await fetch('/api/sessionstatus', {
          method: 'GET',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getJwtToken()}`,
          },
        })

        let data: { [key: string]: any }
        try {
          data = await response.json()
        } catch {
          data = {}
        }

        if (response.status === 200) {
          setUser(data as SessionStatusApiResponseInterface)
          setAuthenticated(true)
        } else if (response.status === 401) {
          clearSession()
        } else {
          console.log(response)
        }
      } catch (error: any) {
        console.error(error)
      }
    } else {
      clearSession()
    }
  }

  if (!loaded) {
    return <Loading />
  } else {
    return (
      <SessionContext.Provider
        value={{
          authenticated: authenticated,
          user: userData,
          clear: clearSession,
          refresh: refreshSession,
          setColor: setColor,
          setAttribution: setAttribution,
        }}
      >
        {children}
      </SessionContext.Provider>
    )
  }
}

Session.propTypes = {}

export default Session
