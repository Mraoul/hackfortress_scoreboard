import React, { useState, useEffect } from 'react'
import { Route } from 'react-router'
import { useRouteMatch } from 'react-router-dom'
import PropTypes from 'prop-types'
import clsx from 'clsx'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Typography from '@material-ui/core/Typography'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import Grid from '@material-ui/core/Grid'
import { makeStyles, Theme } from '@material-ui/core/styles'

import GenericNavigation from '../../layout/Navigation'
import { makeFetch } from '../../helpers/MakeFetch'

const styles = (theme: Theme) => ({
  solved: {
    color: 'red',
  },
  unsolved: {
    color: 'green',
  },
})

const useStyles = makeStyles(styles)

interface SolvedChallengeInterface {
  [key: string]: boolean
}

interface PuzzleInterface {
  id: number
  description: string
  hints?: string
  name: string
  data: string
  solution?: string
  points: number
  unlock: number
  author: string
}

type PuzzlesListType = Array<PuzzleInterface>

interface PuzzleCategoryInterface {
  id: number
  name: string
  puzzles: PuzzlesListType
}

interface PuzzleSetInterface {
  id: number
  name: string
}

type PuzzleSetsType = Array<PuzzleSetInterface>

const PuzzleList = ({}) => {
  const [solved, setSolved] = useState<SolvedChallengeInterface>({})
  const [puzzles, setPuzzles] = useState<Array<PuzzleCategoryInterface> | null>(
    null
  )
  const match = useRouteMatch<{ setId: string }>()
  const classes = useStyles()

  const fetchPuzzleList = async () => {
    await makeFetch({
      url: `/api/mgmt/challenges/${match.params.setId}`,
      successFn: (data) => {
        console.log(data)
        setSolved(data.solved)
        setPuzzles(data.puzzles)
      },
    })
  }

  useEffect(() => {
    fetchPuzzleList()
  }, [])

  if (puzzles == null) {
    return <div> Loading </div>
  }

  return (
    <div>
      {puzzles.map((category, cindex) => (
        <div key={cindex}>
          <Typography variant="h6">{category.name}</Typography>
          <List>
            {category.puzzles.map((puzzle, pindex) => (
              <ListItem key={pindex}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography
                      className={clsx({
                        [classes.solved]: solved.hasOwnProperty(puzzle.id),
                        [classes.unsolved]: !solved.hasOwnProperty(puzzle.id),
                      })}
                    >
                      {puzzle.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell>Description</TableCell>
                          <TableCell>{puzzle.description}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Points</TableCell>
                          <TableCell>{puzzle.points}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Unlock</TableCell>
                          <TableCell>{puzzle.unlock}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Location</TableCell>
                          <TableCell>{puzzle.data}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Hints</TableCell>
                          <TableCell>{puzzle.hints}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Solution</TableCell>
                          <TableCell>{puzzle.solution}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Author</TableCell>
                          <TableCell>{puzzle.author}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Grid>
                </Grid>
              </ListItem>
            ))}
          </List>
        </div>
      ))}
    </div>
  )
}

interface PuzzleListsPropsInterface {
  puzzleSets: PuzzleSetsType
  puzzleListsPath: string
}

const PuzzleLists = (props: PuzzleListsPropsInterface) => {
  const [puzzleSets, setPuzzleSets] = useState(props.puzzleSets)

  useEffect(() => {
    setPuzzleSets(props.puzzleSets)
  }, [props.puzzleSets])

  return (
    <div>
      <GenericNavigation
        parentPath={props.puzzleListsPath}
        parentString="Puzzle Lists"
        childPaths={puzzleSets}
        childString="List"
      />
    </div>
  )
}

interface PuzzleListCatalogPropsInterface {
  catalogPath: string
}

export const PuzzleListCatalog = (props: PuzzleListCatalogPropsInterface) => {
  const [loaded, setLoaded] = useState(false)
  const [puzzleSets, setPuzzleSets] = useState<PuzzleSetsType>([])
  const match = useRouteMatch()

  const fetchPuzzleSets = async () => {
    await makeFetch({
      url: '/api/mgmt/puzzlesets/',
      successFn: (data) => {
        console.log(data)
        setPuzzleSets(data as PuzzleSetsType)
      },
      always: () => {
        setLoaded(true)
      },
    })
  }

  useEffect(() => {
    fetchPuzzleSets()
  }, [])

  if (!loaded) {
    return <div> </div>
  }

  return (
    <div>
      <Route
        exact
        path={`${match.path}/`}
        render={() => {
          return (
            <PuzzleLists
              puzzleSets={puzzleSets}
              puzzleListsPath={props.catalogPath}
            />
          )
        }}
      />
      <Route
        path={`${match.path}/:setId`}
        render={() => {
          return <PuzzleList />
        }}
      />
    </div>
  )
}

PuzzleListCatalog.propTypes = {
  catalogPath: PropTypes.string.isRequired,
}

export default PuzzleListCatalog
