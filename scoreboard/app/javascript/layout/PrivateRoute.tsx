import React, { useEffect } from 'react'
import { Route, useHistory } from 'react-router-dom'

import { useSession } from '../helpers/Session'
import { loginPath } from '../helpers/PagePaths'
import Loading from '../layout/Loading'

interface PrivateRoutePropsInterface {
  component: any // TODO FIXME any way to type hint this?
}

export const PrivateRoute = ({
  component: Component,
  ...args
}: PrivateRoutePropsInterface) => {
  const session = useSession()
  const history = useHistory()

  useEffect(() => {
    if (!session.authenticated) {
      history.push(loginPath)
    }
  }, [session.authenticated])

  return (
    <Route
      {...args}
      render={(props) =>
        session.authenticated ? <Component {...props} /> : <Loading />
      }
    />
  )
}

export default PrivateRoute
