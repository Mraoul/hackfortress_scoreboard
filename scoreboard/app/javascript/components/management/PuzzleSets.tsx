import React, { Component, useState, useEffect, useContext } from 'react'
import { useRouteMatch, Route, useHistory } from 'react-router-dom'
import PropTypes from 'prop-types'
import update from 'immutability-helper'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import DeleteForeverIcon from '@material-ui/icons/DeleteForever'
import Typography from '@material-ui/core/Typography'
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'

import Category from '../puzzles/Category'
import Loading from '../../layout/Loading'
import GenericNavigation from '../../layout/Navigation'
import { useSnackbar } from 'notistack'
import { useSession } from '../../helpers/Session'

import type { PuzzleInterface } from '../puzzles/def'
import { makeFetch } from '../../helpers/MakeFetch'

type PuzzlesListType = Array<PuzzleInterface>

interface PuzzleCategoryInterface {
  id: number
  name: string
  puzzles: PuzzlesListType
}

type PuzzleCategoriesListType = Array<PuzzleCategoryInterface>

interface PuzzleSetInterface {
  id: number
  name: string
}

type PuzzleSetsListType = Array<PuzzleSetInterface>

const NewPuzzleSet = ({}) => {
  const [name, setName] = useState('')
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const handleChange = (event: React.FormEvent<HTMLFormElement>) => {
    const target = event.target as HTMLInputElement
    setName(target.value)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    let request_body = {
      puzzleset: {
        name: name,
      },
    }

    await makeFetch({
      url: `/api/mgmt/puzzlesets/`,
      method: 'POST',
      body: request_body,
      successFn: (data) => enqueueSnackbar('Success'),
      unauthorizedFn: (data) => enqueueSnackbar('Unauthorized'),
      unexpectedRespFn: (data, response) =>
        console.log('Unexpected response' + response),
    })
  }

  return (
    <div>
      <form onChange={handleChange} onSubmit={handleSubmit}>
        <TextField
          type="text"
          label="PuzzleSet Name"
          name="name"
          value={name}
          placeholder="PuzzleSet Name"
        />
        <Button variant="contained" type="submit">
          Create PuzzleSet
        </Button>
      </form>
    </div>
  )
}

NewPuzzleSet.propTypes = {
  addPuzzleSet: PropTypes.func.isRequired,
}

interface PuzzleSetPropsInterface {
  puzzleset: PuzzleSetInterface
  removePuzzleSet: (puzzleset: PuzzleSetInterface) => void
}

const PuzzleSet = (props: PuzzleSetPropsInterface) => {
  const [name, setName] = useState(props.puzzleset.name)
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  useEffect(() => {
    setName(props.puzzleset.name)
  }, [props.puzzleset.name])

  const deletePuzzleSet = async (
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
    event.preventDefault()
    if (!confirm('This action cannot be reversed? Are you sure?')) {
      return
    }

    await makeFetch({
      url: `/api/mgmt/puzzlesets/${props.puzzleset.id}`,
      method: 'DELETE',
      successFn: (data) => {
        enqueueSnackbar('Success')
        props.removePuzzleSet(props.puzzleset)
      },
      unauthorizedFn: (data) => enqueueSnackbar('Unauthorized'),
      unexpectedRespFn: (data, response) =>
        console.log('Unexpected response' + response),
    })
  }

  const handleChange = (event: React.FormEvent<HTMLFormElement>) => {
    const target = event.target as HTMLInputElement
    setName(target.value)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    let request_body = {
      puzzleset: {
        name: name,
      },
    }

    await makeFetch({
      url: `/api/mgmt/puzzlesets/${props.puzzleset.id}`,
      method: 'PUT',
      body: request_body,
      successFn: (data) => enqueueSnackbar('Success'),
      unauthorizedFn: (data) => enqueueSnackbar('Unauthorized'),
      unexpectedRespFn: (data, response) =>
        console.log('Unexpected response' + response),
    })
  }

  return (
    <ListItem>
      <ListItemIcon>
        <IconButton href="#" onClick={deletePuzzleSet} edge="start">
          <DeleteForeverIcon />
        </IconButton>
      </ListItemIcon>
      <form onChange={handleChange} onSubmit={handleSubmit}>
        <TextField
          type="text"
          label="PuzzleSet Name"
          name="name"
          value={name}
        />
        <Button variant="contained" type="submit">
          Update
        </Button>
      </form>
    </ListItem>
  )
}

PuzzleSet.propTypes = {
  puzzleset: PropTypes.object.isRequired,
  removePuzzleSet: PropTypes.func.isRequired,
}

interface PuzzleSetsPropsInterface {
  puzzleSets: PuzzleSetsListType
  puzzleSetPath: string
  addPuzzleSet: (puzzleset: PuzzleSetInterface) => void
  removePuzzleSet: (puzzleset: PuzzleSetInterface) => void
}

const PuzzleSets = (props: PuzzleSetsPropsInterface) => {
  const [puzzleSets, setPuzzleSets] = useState<PuzzleSetsListType>(
    props.puzzleSets
  )
  const session = useSession()

  useEffect(() => {
    setPuzzleSets(props.puzzleSets)
  }, [props.puzzleSets])

  let role = 'contestant'
  if (session.user!.hasOwnProperty('role')) {
    const user = session.user!
    role = user.role
  }

  return (
    <div>
      <GenericNavigation
        parentPath={props.puzzleSetPath}
        parentString="PuzzleSets"
        childPaths={puzzleSets}
        childString="Set"
      />
      {role == 'admin' && (
        <React.Fragment>
          <Typography variant="h4">PuzzleSets</Typography>
          <List>
            {puzzleSets.map((puzzleset) => (
              <PuzzleSet
                key={puzzleset.id}
                puzzleset={puzzleset}
                removePuzzleSet={props.removePuzzleSet}
              />
            ))}
          </List>

          <List>
            <ListItem>
              <NewPuzzleSet addPuzzleSet={props.addPuzzleSet} />
            </ListItem>
          </List>
        </React.Fragment>
      )}
    </div>
  )
}

PuzzleSets.propTypes = {
  puzzleSets: PropTypes.array.isRequired,
  puzzleSetPath: PropTypes.string.isRequired,
  addPuzzleSet: PropTypes.func.isRequired,
  removePuzzleSet: PropTypes.func.isRequired,
}

interface PreviewSetPropsInterface {
  puzzleSets: PuzzleSetsListType
  puzzleSetPath: string
}

const PreviewSet = (props: PreviewSetPropsInterface) => {
  const [categories, setCategories] = useState<
    PuzzleCategoriesListType | undefined
  >(undefined)
  const match = useRouteMatch<{ setId: string }>()

  const fetchPuzzleSet = async () => {
    await makeFetch({
      url: `/api/mgmt/puzzlesets/${match.params.setId}`,
      successFn: (data) => {
        setCategories(data as PuzzleCategoriesListType)
      },
      unexpectedRespFn: (data, response) => console.log(response),
    })
  }

  useEffect(() => {
    setCategories(undefined)
    fetchPuzzleSet()
  }, [match.params.setId])

  let render_categories: Array<React.ReactElement> = []
  if (categories != undefined) {
    categories.map((category) => {
      render_categories.push(
        <Category
          key={category.id}
          name={category.name}
          puzzles={category.puzzles}
          judgeView={true}
        />
      )
    })

    if (render_categories.length == 0) {
      render_categories.push(
        <Typography variant="h6">No Puzzles in Set</Typography>
      )
    }
  } else {
    render_categories.push(<Loading key={0} />)
  }

  return (
    <div id={'puzzle-preview'}>
      <GenericNavigation
        parentPath={props.puzzleSetPath}
        parentString="PuzzleSets"
        childPaths={props.puzzleSets}
        childString="Set"
        selectedChildPathId={parseInt(match.params.setId, 10)}
      />
      {render_categories}
    </div>
  )
}

PreviewSet.propTypes = {
  puzzleSets: PropTypes.array.isRequired,
  puzzleSetPath: PropTypes.string.isRequired,
}

interface PuzzleSetsCatalogPropsInterface {
  puzzleSetPath: string
}

export const PuzzleSetsCatalog = (props: PuzzleSetsCatalogPropsInterface) => {
  const [loaded, setLoaded] = useState(false)
  const [puzzleSets, setPuzzleSets] = useState<PuzzleSetsListType>([])
  const match = useRouteMatch()

  const fetchPuzzleSets = async () => {
    await makeFetch({
      url: '/api/mgmt/puzzlesets/',
      successFn: (data) => {
        console.log(data)
        setPuzzleSets(data as PuzzleSetsListType)
        setLoaded(true)
      },
      unexpectedRespFn: (data, response) => console.log(response),
      always: () => setLoaded(true),
    })
  }

  useEffect(() => {
    fetchPuzzleSets()
  }, [])

  const addPuzzleSet = (puzzleset: PuzzleSetInterface) => {
    const newPuzzleSets = update(puzzleSets, { $push: [puzzleset] })
    setPuzzleSets(newPuzzleSets)
  }

  const removePuzzleSet = (puzzleset: PuzzleSetInterface) => {
    const newPuzzleSets = update(puzzleSets, {
      $splice: [[puzzleSets.findIndex((item) => item.id == puzzleset.id), 1]],
    })
    setPuzzleSets(newPuzzleSets)
  }

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
            <PuzzleSets
              puzzleSets={puzzleSets}
              puzzleSetPath={props.puzzleSetPath}
              addPuzzleSet={addPuzzleSet}
              removePuzzleSet={removePuzzleSet}
            />
          )
        }}
      />
      <Route
        path={`${match.path}/:setId`}
        render={() => {
          return (
            <PreviewSet
              puzzleSets={puzzleSets}
              puzzleSetPath={props.puzzleSetPath}
            />
          )
        }}
      />
    </div>
  )
}

PuzzleSetsCatalog.propTypes = {
  puzzleSetPath: PropTypes.string.isRequired,
}

export default PuzzleSetsCatalog
