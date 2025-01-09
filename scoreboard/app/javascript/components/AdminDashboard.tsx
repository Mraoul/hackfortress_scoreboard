// @ts-ignore
// See Issue/Error below about Snackbar typing issue

import React, { useState } from 'react'
import { Route } from 'react-router'
import { useRouteMatch, useHistory } from 'react-router-dom'

import { makeStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Divider from '@material-ui/core/Divider'

import NavBarLayout from '../layout/NavBarLayout'
import ManagementPage from './management/ManagementPage'
import { styles } from '../layout/NavBar'

import { useSession } from '../helpers/Session'

import AdminPanel from './management/controls/AdminPanel'
import JudgePanel from './management/controls/JudgePanel'

const useStyles = makeStyles(styles)

const JudgeDrawers = () => {
  const match = useRouteMatch()
  let history = useHistory()
  const components = [
    {
      path: 'categories',
      name: 'Puzzle Catalog',
    },
    {
      path: 'puzzlelist',
      name: 'Puzzle List',
    },
    {
      path: 'puzzlesets',
      name: 'Puzzle Preview',
    },
    {
      path: 'puzzlestats',
      name: 'Puzzle Stats',
    },
    {
      path: 'purchases',
      name: 'Purchases',
    },
  ]

  const handleClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    path: string
  ) => {
    event.preventDefault()
    history.push(`${match.url}/${path}`)
  }

  return (
    <React.Fragment>
      <List>
        {components.map(({ path, name }, index) =>
          path == 'divider' ? (
            <Divider key={index} />
          ) : (
            <ListItem
              key={index}
              button
              component="a"
              href={`${match.url}/${path}`}
              onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
                handleClick(event, path)
              }}
            >
              <ListItemText primary={name} />
            </ListItem>
          )
        )}
      </List>
      <Divider />
    </React.Fragment>
  )
}

const AdminDrawers = () => {
  const match = useRouteMatch()
  let history = useHistory()
  const components = [
    {
      path: 'rounds',
      name: 'Rounds',
    },
    {
      path: 'divider',
      name: 'divider',
    },
    {
      path: 'categories',
      name: 'Puzzle Catalog',
    },
    {
      path: 'puzzlelist',
      name: 'Puzzle List',
    },
    {
      path: 'puzzlesets',
      name: 'Puzzle Preview',
    },
    {
      path: 'puzzlestats',
      name: 'Puzzle Stats',
    },
    {
      path: 'divider',
      name: 'divider',
    },
    {
      path: 'teams',
      name: 'Teams',
    },
    {
      path: 'users',
      name: 'Users',
    },
    {
      path: 'players',
      name: 'Players',
    },
    {
      path: 'player_scores',
      name: 'Player Scores',
    },
    {
      path: 'divider',
      name: 'divider',
    },
    {
      path: 'store',
      name: 'Store Control',
    },
    {
      path: 'item_groups',
      name: 'Item Catalog',
    },
    {
      path: 'purchases',
      name: 'Purchases',
    },
    {
      path: 'divider',
      name: 'divider',
    },
    {
      path: 'participants',
      name: 'Participants',
    },
    {
      path: 'statuses',
      name: 'Statuses',
    },
    {
      path: 'submissions',
      name: 'Submissions',
    },
    {
      path: 'attempts',
      name: 'Submission Attempts',
    },
    {
      path: 'inventory',
      name: 'Inventory',
    },
  ]

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string
  ) => {
    e.preventDefault()
    history.push(`${match.url}/${path}`)
  }

  return (
    <React.Fragment>
      <List>
        {components.map(({ path, name }, index) =>
          path == 'divider' ? (
            <Divider key={index} />
          ) : (
            <ListItem
              key={index}
              button
              component="a"
              href={`${match.url}/${path}`}
              onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
                handleClick(event, path)
              }}
            >
              <ListItemText primary={name} />
            </ListItem>
          )
        )}
      </List>
      <Divider />
    </React.Fragment>
  )
}

export const AdminDashboard = ({}) => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const session = useSession()

  const handleDrawerOpen = () => setDrawerOpen(true)
  const handleDrawerClose = () => setDrawerOpen(false)

  // const classes = useStyles()
  const match = useRouteMatch()

  let role = 'contestant'
  if (session != null && session.user!.hasOwnProperty('role')) {
    role = session.user!.role
  }

  return (
    <div>
      <NavBarLayout
        drawers={role == 'judge' ? <JudgeDrawers /> : <AdminDrawers />}
      >
        <React.Fragment>
          <Route
            exact
            path={`${match.path}/`}
            render={() => {
              if (role == 'judge') {
                return <JudgePanel />
              } else {
                return <AdminPanel />
              }
            }}
          />
          <Route
            path={`${match.path}/:dbComponent`}
            render={() => {
              return (
                <ManagementPage
                // match={match}
                // drawerOpen={drawerOpen}
                />
              )
            }}
          />
        </React.Fragment>
      </NavBarLayout>
    </div>
  )
}

AdminDashboard.propTypes = {}

export default AdminDashboard
