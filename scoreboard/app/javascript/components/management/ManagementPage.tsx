import React from 'react'
import { useRouteMatch } from 'react-router'

import { makeStyles } from '@material-ui/core/styles'

import PuzzleStats from './PuzzleStats'
import Players from './Players'
import Purchases from './Purchases'
import Teams from './Teams'
import Users from './Users'
import Submissions from './Submissions'
import SubmissionAttempts from './SubmissionsAttempts'
import PuzzleSets from './PuzzleSets'
import PuzzleCatalog from './puzzles/PuzzleCatalog'
import StoreCatalog from './items/StoreCatalog'
import Rounds from './Rounds'
import PuzzleListCatalog from './PuzzleList'
import Store from './Store'
import InventoryCatalog from './Inventory'
import PlayerScores from './PlayerScores'
import Participants from './Participants'
import Statuses from './Statuses'

import { styles } from '../../layout/NavBar'

const useStyles = makeStyles(styles)

export const ManagementPage = ({}) => {
  const match = useRouteMatch<{ dbComponent: string }>()

  let page
  switch (match.params.dbComponent) {
    case 'puzzlestats':
      page = <PuzzleStats />
      break
    case 'users':
      page = <Users />
      break
    case 'teams':
      page = <Teams />
      break
    case 'players':
      page = <Players />
      break
    // case "scores":
    //   page = (
    //     <Scores/>
    //   )
    //   break;
    case 'purchases':
      page = <Purchases />
      break
    case 'participants':
      page = <Participants />
      break
    case 'submissions':
      page = <Submissions />
      break
    case 'attempts':
      page = <SubmissionAttempts />
      break
    case 'puzzlesets':
      page = <PuzzleSets puzzleSetPath={match.url} />
      break
    case 'categories':
      page = <PuzzleCatalog catalogPath={match.url} />
      break
    case 'item_groups':
      page = <StoreCatalog catalogPath={match.url} />
      break
    case 'rounds':
      page = <Rounds />
      break
    case 'puzzlelist':
      page = <PuzzleListCatalog catalogPath={match.url} />
      break
    case 'store':
      page = <Store />
      break
    case 'inventory':
      page = <InventoryCatalog catalogPath={match.url} />
      break
    case 'player_scores':
      page = <PlayerScores />
      break
    case 'statuses':
      page = <Statuses />
      break
    default:
      console.log(`Unknown page: ${match.params.dbComponent}`)
  }

  return <React.Fragment>{page}</React.Fragment>
}

export default ManagementPage
