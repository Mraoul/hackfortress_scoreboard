/* eslint no-console:0 */
// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.
//
// To reference this file, add <%= javascript_pack_tag 'application' %> to the appropriate
// layout file, like app/views/layouts/application.html.erb

// Uncomment to copy all static images under ../images to the output folder and reference
// them with the image_pack_tag helper in views (e.g <%= image_pack_tag 'rails.png' %>)
// or the `imagePath` JavaScript helper below.
//
// const images = require.context('../images', true)
// const imagePath = (name) => images(name, true)

// Import Styles
// import 'bootstrap/dist/css/bootstrap.min.css';

// Import Javascript
import React, { Suspense } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'

import CssBaseline from '@material-ui/core/CssBaseline'
import { SnackbarProvider } from 'notistack'

import Session from '../helpers/Session'

import {
  rootPath,
  dashboardPath,
  loginPath,
  logoutPath,
  puzzlesPath,
  hackonomyPath,
} from '../helpers/PagePaths'

import LoginPage from '../components/Login'
import LogoutPage from '../components/Logout'
import { ThemeHandler } from '../layout/Themes'
import PrivateRoute from '../layout/PrivateRoute'
import Loading from '../layout/Loading'

const LazyDashboard = React.lazy(() => import('../components/Dashboard'))
const LazyPuzzlePage = React.lazy(() =>
  import('../components/puzzles/PuzzlePage')
)
const LazyStorePage = React.lazy(() =>
  import('../components/hackonomy/StorePage')
)

const App = ({}) => {
  return (
    <React.Fragment>
      <CssBaseline />
      <Session>
        <BrowserRouter>
          <ThemeHandler>
            {/* // TODO FIXME: https://github.com/iamhosseindhv/notistack/issues/485 */}
            <SnackbarProvider
              maxSnack={2}
              anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
            >
              <Suspense fallback={<Loading />}>
                <Switch>
                  <Route exact path={rootPath}>
                    <Redirect to={dashboardPath} />
                  </Route>
                  <Route path={loginPath} component={LoginPage} />
                  <PrivateRoute
                    path={dashboardPath}
                    component={LazyDashboard}
                  />
                  <PrivateRoute path={puzzlesPath} component={LazyPuzzlePage} />
                  <PrivateRoute
                    path={hackonomyPath}
                    component={LazyStorePage}
                  />
                  <PrivateRoute path={logoutPath} component={LogoutPage} />
                  <Redirect to={rootPath} />
                </Switch>
              </Suspense>
            </SnackbarProvider>
          </ThemeHandler>
        </BrowserRouter>
      </Session>
    </React.Fragment>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
