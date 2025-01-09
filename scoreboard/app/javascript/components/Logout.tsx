import React, { useEffect } from 'react'

import Loading from '../layout/Loading'
import { useSession } from '../helpers/Session'
import { makeFetch } from '../helpers/MakeFetch'

const LogoutPage = ({}) => {
  const session = useSession()

  useEffect(() => {
    logout()
  }, [])

  const logout = async () => {
    await makeFetch({
      url: '/api/logout',
      successFn: () => {
        session.clear()
      },
    })
  }

  // When the promise above returns, clearing the session
  // should cause an upstream element to redirect to the LoginPage
  return <Loading />
}

export default LogoutPage
