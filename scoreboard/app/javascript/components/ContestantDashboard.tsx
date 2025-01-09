import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import { makeStyles, Theme } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import Button from '@material-ui/core/Button'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'

import NavBar from '../layout/NavBar'
import { Typography } from '@material-ui/core'
import { useSnackbar } from 'notistack'
import { useSession } from '../helpers/Session'
import { makeFetch } from '../helpers/MakeFetch'

const styles = (theme: Theme) => ({
  teamPaper: {
    marginBottom: theme.spacing(1),
    padding: theme.spacing(2),
  },
  playersPaper: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
  },
  attributionPaper: {
    padding: theme.spacing(2),
  },
})

const useStyles = makeStyles(styles)

interface PlayerInterface {
  id: number
  name: string
  email: string
}

type PlayersListType = Array<PlayerInterface>

const PasswordChange = ({}) => {
  const [formState, setFormState] = useState({
    password1: '',
    password2: '',
  })
  const classes = useStyles()

  const session = useSession()
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (formState.password1 != formState.password2) {
      enqueueSnackbar('Passwords do not match!')
      return
    }

    if (formState.password1.length == 0) {
      enqueueSnackbar('Password cannot be empty!')
      return
    }

    let request_body = {
      id: session.user!.userid,
      password: formState.password2,
    }

    await makeFetch({
      url: `/api/change_password`,
      method: 'POST',
      body: request_body,
      successFn: (data) => {
        enqueueSnackbar('Updated Succesfully')
      },
      unauthorizedFn: (data) => {
        enqueueSnackbar('Not Authorized')
      },
      statusFns: {
        '400': (data) => {
          enqueueSnackbar(data.error)
        },
      },
      unexpectedRespFn: (data, response) => {
        enqueueSnackbar('Unexpected error')
      },
    })
  }

  const handleChange = (event: React.FormEvent<HTMLFormElement>) => {
    const target = event.target as HTMLInputElement
    if (target.value.length < 255) {
      setFormState({ ...formState, [target.name]: target.value })
    }
  }

  return (
    <form onSubmit={handleSubmit} onChange={handleChange}>
      <Grid
        className={classes.teamPaper}
        container
        spacing={1}
        component={Paper}
      >
        <Grid item xs={12}>
          <Typography variant="h6">Team Password</Typography>
        </Grid>
        <Grid item>
          <TextField
            label="Password"
            name="password1"
            type="password"
            value={formState.password1}
            placeholder="Password"
            helperText="New Password"
          />
        </Grid>
        <Grid item>
          <TextField
            label="Again"
            name="password2"
            type="password"
            value={formState.password2}
            placeholder="Password Again"
            helperText="New Password"
          />
        </Grid>
        <Grid item>
          <Button color="primary" variant="contained" type="submit">
            Change Password
          </Button>
        </Grid>
      </Grid>
    </form>
  )
}

interface PuzzleAttributionPropsInterface {
  players: PlayersListType
}

const PuzzleAttribution = (props: PuzzleAttributionPropsInterface) => {
  const [players, setPlayers] = useState(props.players)
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const session = useSession()

  const [attribution, setAttribution] = useState<number>(
    session.user!.attribution || props.players[0].id
  )

  const getPlayerIds = () => {
    let player_ids = []
    for (const player of players) {
      player_ids.push(player.id)
    }
    return player_ids
  }

  useEffect(() => {
    // Unset attribution if out of range
    if (
      session.user!.attribution &&
      !getPlayerIds().includes(session.user!.attribution)
    ) {
      session.setAttribution(undefined)
    }
  }, [])

  useEffect(() => {
    setPlayers(props.players)
  }, [props.players])

  useEffect(() => {
    if (session.user!.attribution) {
      setAttribution(session.user!.attribution)
    } else {
      setAttribution(props.players[0].id)
    }
  }, [session.user!.attribution])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (attribution) {
      session.setAttribution(attribution)
      enqueueSnackbar('Attribution Set')
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAttribution(parseInt(event.target.value))
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={1}>
        <Grid item>
          <TextField
            select
            label="Default Attribution"
            name="attribution"
            value={attribution}
            helperText="Select Default Attribution"
            onChange={handleChange}
          >
            {players.map((player) => (
              <MenuItem key={player.id} value={player.id}>
                {player.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item>
          <Button color="primary" variant="contained" type="submit">
            Set Attribution
          </Button>
        </Grid>
      </Grid>
    </form>
  )
}

PuzzleAttribution.propTypes = {
  players: PropTypes.array.isRequired,
  attribution: PropTypes.number,
}

interface EditUserPropsInterface {
  player: PlayerInterface
  fetchPlayers: () => void
}

const EditUser = (props: EditUserPropsInterface) => {
  const [player, setPlayer] = useState(props.player)

  useEffect(() => {
    setPlayer(props.player)
  }, [props.player])

  const session = useSession()
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    let request_body = {
      id: player.id,
      name: player.name,
      email: player.email,
    }

    await makeFetch({
      url: `/api/update_player`,
      method: 'POST',
      body: request_body,
      successFn: (data) => {
        enqueueSnackbar('Updated Succesfully')
        props.fetchPlayers()
      },
      multiStatusFns: [
        {
          statuses: [400, 401],
          func: (data) => enqueueSnackbar(data.error),
        },
      ],
      unexpectedRespFn: (data, response) => {
        enqueueSnackbar('Internal Error')
        console.log(response)
      },
    })
  }

  const handleChange = (event: React.FormEvent<HTMLFormElement>) => {
    const target = event.target as HTMLInputElement
    if (target.value.length < 255) {
      setPlayer({ ...player, [target.name]: target.value })
    }
  }

  return (
    <form onSubmit={handleSubmit} onChange={handleChange}>
      <Grid container spacing={1}>
        <Grid item>
          <TextField
            label="Player Name"
            name="name"
            type="text"
            value={player.name}
            placeholder="Player Name"
            helperText="Player Name"
          />
        </Grid>
        <Grid item>
          <TextField
            label="Email Address"
            name="email"
            type="text"
            value={player.email}
            placeholder="Email Address"
            helperText="Player Email Address"
          />
        </Grid>
        <Grid item>
          <Button color="primary" variant="contained" type="submit">
            Update
          </Button>
        </Grid>
      </Grid>
    </form>
  )
}

EditUser.propTypes = {
  player: PropTypes.object.isRequired,
  fetchPlayers: PropTypes.func.isRequired,
}

const EditUsers = ({}) => {
  const [players, setPlayers] = useState<PlayersListType>([])
  const classes = useStyles()

  const fetchPlayers = async () => {
    await makeFetch({
      url: `/api/list_players`,
      successFn: (data) => {
        setPlayers(data.players)
      },
      unauthorizedFn: (data) => {
        console.log(data)
      },
      unexpectedRespFn: (data, response) => {
        console.log(response)
      },
    })
  }

  useEffect(() => {
    fetchPlayers()
  }, [])

  if (players.length == 0) {
    return <div></div>
  } else {
    return (
      <div>
        <Grid
          className={classes.playersPaper}
          spacing={2}
          container
          direction="column"
          alignItems="center"
          justifyContent="center"
          component={Paper}
        >
          <Grid item xs={12}>
            <Typography variant="h6">Player Names/Contacts</Typography>
          </Grid>
          {players.map(
            (player) =>
              player.name != 'Team Effort' && (
                <Grid key={player.id} item xs={12}>
                  <EditUser
                    key={player.id}
                    player={player}
                    fetchPlayers={fetchPlayers}
                  />
                </Grid>
              )
          )}
        </Grid>
        <Grid className={classes.attributionPaper} container component={Paper}>
          <Grid item xs={12}>
            <PuzzleAttribution players={players} />
          </Grid>
        </Grid>
      </div>
    )
  }
}

const ContestantDashboard = ({}) => {
  // const classes = useStyles()
  const session = useSession()

  return (
    <div>
      <NavBar />
      <Container>
        <Grid
          container
          spacing={2}
          direction="column"
          alignItems="center"
          justifyContent="center"
        >
          <Grid item xs={12}>
            <Typography variant="h5">
              {session.user!.teamname} Dashboard
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <PasswordChange />
          </Grid>
          <Grid item xs={12}>
            <EditUsers />
          </Grid>
        </Grid>
      </Container>
    </div>
  )
}

ContestantDashboard.propTypes = {}

export default ContestantDashboard
