import React, { useState, useEffect, useContext } from 'react'
import { useRouteMatch } from 'react-router'
import PropTypes from 'prop-types'

import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import DeleteForeverIcon from '@material-ui/icons/DeleteForever'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import FileCopyIcon from '@material-ui/icons/FileCopy'
import UpdateIcon from '@material-ui/icons/Update'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import RadioGroup from '@material-ui/core/RadioGroup'
import Radio from '@material-ui/core/Radio'

import Loading from '../../../layout/Loading'
import GenericNavigation from '../../../layout/Navigation'
import { useSnackbar } from 'notistack'
import {
  CategoryPuzzleInterface,
  CategoryPuzzleSetsType,
  CategoryPuzzlesInterface,
} from './def'
import { makeFetch } from '../../../helpers/MakeFetch'

interface NewPuzzlePropsInterface {
  categoryId: number
  reFetchPuzzles: () => void
}

const NewPuzzle = (props: NewPuzzlePropsInterface) => {
  const [puzzle, setPuzzle] = useState({
    name: '',
    data: '',
    solution: '',
  })
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const handleChange = (event: React.FormEvent<HTMLFormElement>) => {
    const target = event.target as HTMLInputElement
    setPuzzle({
      ...puzzle,
      [target.name]: target.value,
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    let request_body = {
      category_id: props.categoryId,
      puzzle: puzzle,
    }

    await makeFetch({
      url: `/api/mgmt/puzzles/`,
      method: 'POST',
      body: request_body,
      successFn: (data) => {
        enqueueSnackbar('Puzzle Created')
        props.reFetchPuzzles()
      },
      unexpectedRespFn: (data, response) => {
        console.log(response)
      },
    })
  }

  return (
    <Paper>
      <Typography variant="h6">New Puzzle</Typography>
      <form onSubmit={handleSubmit} onChange={handleChange}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <TextField
              label="Name"
              name="name"
              type="text"
              placeholder="Puzzle Name"
              value={puzzle.name}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Location"
              name="data"
              type="text"
              placeholder="Puzzle Location"
              value={puzzle.data}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="solution"
              name="solution"
              type="text"
              placeholder="Puzzle Solution"
              value={puzzle.solution}
            />
          </Grid>
        </Grid>
        <Button variant="contained" type="submit" fullWidth>
          Add Puzzle
        </Button>
      </form>
    </Paper>
  )
}

NewPuzzle.propTypes = {
  reFetchPuzzles: PropTypes.func.isRequired,
  categoryId: PropTypes.number.isRequired,
}

interface PuzzlePropsInterface {
  puzzle: CategoryPuzzleInterface
  puzzlesets: Array<CategoryPuzzleSetsType>
  reFetchPuzzles: () => void
  deletePuzzle: (puzzle_id: number) => void
}

const Puzzle = (props: PuzzlePropsInterface) => {
  const [puzzle, setPuzzle] = useState({
    description: !!props.puzzle.description ? props.puzzle.description : '',
    hints: !!props.puzzle.hints ? props.puzzle.hints : '',
    name: props.puzzle.name,
    data: !!props.puzzle.data ? props.puzzle.data : '',
    solution: !!props.puzzle.solution ? props.puzzle.solution : '',
    quickdraw: props.puzzle.quickdraw,
    fcfs: props.puzzle.fcfs,
    points: props.puzzle.points,
    unlock: props.puzzle.unlock,
    data_source: props.puzzle.data_source,
    author: !!props.puzzle.author ? props.puzzle.author : '',
    puzzleset_ids: props.puzzle.puzzlesets.map(({ id }: { id: number }) => {
      return id
    }),
  })

  const [menuEl, setMenuEl] = useState<Element | null>(null)
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuEl(event.currentTarget)
  }

  const handleCloseMenu = () => {
    setMenuEl(null)
  }

  const clonePuzzle = async () => {
    let request_body = {
      id: props.puzzle.id,
    }

    handleCloseMenu()

    await makeFetch({
      url: `/api/mgmt/puzzles/`,
      method: 'POST',
      body: request_body,
      successFn: (data) => {
        enqueueSnackbar('Puzzle Cloned')
        props.reFetchPuzzles()
      },
      unexpectedRespFn: (data, response) => {
        console.log(response)
      },
    })
  }

  const deletePuzzle = () => {
    if (!confirm('This action cannot be reversed? Are you sure?')) {
      return
    }
    handleCloseMenu()
    props.deletePuzzle(props.puzzle.id)
  }

  const handleChange = (event: React.FormEvent<HTMLFormElement>) => {
    const target = event.target as HTMLInputElement
    if (target.name == 'puzzleset') {
      const value = parseInt(target.value, 10)
      let newps = puzzle.puzzleset_ids.slice()
      if (target.checked) {
        // Adding value
        newps.push(value)
      } else {
        // Removing value
        newps = newps.filter((item: number) => item != value)
      }

      setPuzzle({
        ...puzzle,
        puzzleset_ids: newps,
      })
    } else {
      const value = target.type == 'checkbox' ? target.checked : target.value

      setPuzzle({
        ...puzzle,
        [target.name]: value,
      })
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    let request_body = {
      puzzle: puzzle,
    }

    await makeFetch({
      url: `/api/mgmt/puzzles/${props.puzzle.id}`,
      method: 'PATCH',
      body: request_body,
      successFn: (data) => {
        enqueueSnackbar('Puzzle Updated')
      },
      unexpectedRespFn: (data, response) => {
        console.log(response)
      },
    })
  }

  return (
    <React.Fragment>
      <Menu
        anchorEl={menuEl}
        keepMounted
        open={Boolean(menuEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={clonePuzzle}>
          <ListItemIcon>
            <FileCopyIcon />
          </ListItemIcon>
          <ListItemText primary="Clone" />
        </MenuItem>
        <MenuItem onClick={deletePuzzle}>
          <ListItemIcon>
            <DeleteForeverIcon />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>
      <Card>
        <CardHeader
          title={puzzle.name}
          action={
            <IconButton onClick={handleOpenMenu}>
              <MoreVertIcon />
            </IconButton>
          }
        ></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} onChange={handleChange}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Name"
                  name="name"
                  type="text"
                  placeholder="Puzzle Name"
                  value={puzzle.name}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Description"
                  name="description"
                  type="text"
                  multiline={true}
                  placeholder="Puzzle Description"
                  minRows={6}
                  value={puzzle.description}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Hints"
                  name="hints"
                  type="text"
                  multiline={true}
                  minRows={6}
                  placeholder="Puzzle Hints"
                  value={puzzle.hints}
                  fullWidth
                />
              </Grid>
              <Grid item xs={4} sm={3}>
                <TextField
                  label="Points"
                  name="points"
                  type="text"
                  placeholder="Puzzle Points"
                  value={puzzle.points}
                />
              </Grid>
              <Grid item xs={4} sm={3}>
                <TextField
                  label="Unlock"
                  name="unlock"
                  type="text"
                  placeholder="Puzzle Unlock"
                  value={puzzle.unlock}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField
                  label="author"
                  name="author"
                  type="text"
                  placeholder="Puzzle Author"
                  value={puzzle.author}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <FormControlLabel
                  label="Download"
                  labelPlacement="top"
                  control={
                    <RadioGroup
                      row
                      name="data_source"
                      // label="data_source"
                      value={puzzle.data_source}
                    >
                      <FormControlLabel
                        value="text_only"
                        control={<Radio />}
                        label="Text"
                      />
                      <FormControlLabel
                        value="gcloud"
                        control={<Radio />}
                        label="GCloud"
                      />
                      <FormControlLabel
                        value="local"
                        control={<Radio />}
                        label="Local"
                      />
                    </RadioGroup>
                  }
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField
                  label="Location"
                  name="data"
                  type="text"
                  placeholder="Puzzle Location"
                  value={puzzle.data}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField
                  label="solution"
                  name="solution"
                  type="text"
                  placeholder="Puzzle Solution"
                  value={puzzle.solution}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <FormControlLabel
                  label="QuickDraw"
                  labelPlacement="start"
                  control={
                    <Checkbox
                      name="quickdraw"
                      // label="quickdraw"
                      checked={puzzle.quickdraw}
                    />
                  }
                />
              </Grid>
              <Grid item xs={12}>
                {props.puzzlesets.map(
                  ({ id, name }: CategoryPuzzleSetsType) => (
                    <FormControlLabel
                      key={id}
                      label={name}
                      labelPlacement="start"
                      control={
                        <Checkbox
                          checked={puzzle.puzzleset_ids.includes(id)}
                          name="puzzleset"
                          value={id}
                          // label={name}
                        />
                      }
                    />
                  )
                )}
              </Grid>
            </Grid>
            <Button
              variant="contained"
              type="submit"
              fullWidth
              startIcon={<UpdateIcon />}
            >
              Update
            </Button>
          </form>
        </CardContent>
      </Card>
    </React.Fragment>
  )
}

Puzzle.propTypes = {
  puzzle: PropTypes.object.isRequired,
  puzzlesets: PropTypes.array.isRequired,
  reFetchPuzzles: PropTypes.func.isRequired,
  deletePuzzle: PropTypes.func.isRequired,
}

interface PuzzlesPropsInterface {
  catalogPath: string
  categories: Array<{ id: number; name: string }>
}

export const Puzzles = (props: PuzzlesPropsInterface) => {
  const [category, setCategory] = useState<CategoryPuzzlesInterface | null>(
    null
  )
  const [puzzlesets, setPuzzleSets] = useState([])
  const match = useRouteMatch<{ catId: string }>()
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  useEffect(() => {
    // Reset information
    setCategory(null)
    setPuzzleSets([])
    fetchPuzzles()
  }, [match.params.catId])

  const fetchPuzzles = async () => {
    await makeFetch({
      url: `/api/mgmt/categories/${match.params.catId}`,
      successFn: (data) => {
        setCategory(data.category)
        setPuzzleSets(data.puzzlesets)
      },
      unexpectedRespFn: (data, response) => {
        console.log(response)
      },
    })
  }

  const deletePuzzle = async (puzzle_id: number) => {
    await makeFetch({
      url: `/api/mgmt/puzzles/${puzzle_id}`,
      method: 'DELETE',
      successFn: (data) => {
        enqueueSnackbar('Puzzle Deleted')
        fetchPuzzles()
      },
      unexpectedRespFn: (data, response) => {
        console.log(response)
      },
    })
  }

  return (
    <div>
      <GenericNavigation
        parentPath={props.catalogPath}
        parentString="Categories"
        childPaths={props.categories}
        childString="Category"
        selectedChildPathId={category != null ? category.id : undefined}
      />
      {category != null ? (
        <React.Fragment>
          <Grid container spacing={2}>
            {category.puzzles.map((puzzle) => (
              <Grid item key={puzzle.id} xs={12} lg={6}>
                <Puzzle
                  key={puzzle.id}
                  puzzle={puzzle}
                  puzzlesets={puzzlesets}
                  reFetchPuzzles={fetchPuzzles}
                  deletePuzzle={deletePuzzle}
                />
              </Grid>
            ))}
          </Grid>
          <NewPuzzle reFetchPuzzles={fetchPuzzles} categoryId={category.id} />
        </React.Fragment>
      ) : (
        <Loading />
      )}
    </div>
  )
}

Puzzles.propTypes = {
  categories: PropTypes.array.isRequired,
  catalogPath: PropTypes.string.isRequired,
}

export default Puzzles
