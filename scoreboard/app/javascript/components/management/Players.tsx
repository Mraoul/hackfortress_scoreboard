import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { useSnackbar } from 'notistack'
import { makeFetch } from '../../helpers/MakeFetch'

interface PlayerInterface {
  id: number
  name: string
  email: string
  team_id: number
  points: number
}

type PlayersListType = Array<PlayerInterface>

interface TeamInterface {
  id: number
  name: string
}

type TeamsListType = Array<TeamInterface>

interface PlayerPropsInterface {
  player: PlayerInterface
}

const Player = (props: PlayerPropsInterface) => {
  const [state, setState] = useState({
    name: props.player.name,
    email: props.player.email,
  })

  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  useEffect(() => {
    setState({
      name: props.player.name,
      email: props.player.email,
    })
  }, [props.player])

  const handleChange = (event: React.FormEvent<HTMLFormElement>) => {
    const target = event.target as HTMLInputElement
    setState({ ...state, [target.name]: target.value })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    let request_body = {
      player: {
        name: state.name,
        email: state.email,
      },
    }

    await makeFetch({
      url: `/api/mgmt/players/${props.player.id}`,
      method: 'PUT',
      body: request_body,
      successFn: (data) => enqueueSnackbar('Success'),
      unauthorizedFn: (data) => enqueueSnackbar('Unauthorized'),
      unexpectedRespFn: (data) => console.log('Unexpected response' + data),
    })
  }

  return (
    <ListItem>
      <form onChange={handleChange} onSubmit={handleSubmit}>
        <TextField
          type="text"
          label="Player Name"
          name="name"
          value={state.name}
        />
        <TextField type="text" label="Email" name="email" value={state.email} />
        <TextField
          type="text"
          label="Points"
          value={props.player.points}
          disabled
        />
        <Button variant="contained" type="submit">
          Update
        </Button>
      </form>
    </ListItem>
  )
}

Player.propTypes = {
  player: PropTypes.object.isRequired,
}

interface TeamPropsInterface {
  players: Array<PlayerInterface>
  teamName: string
  teamId: number
}

const Team = (props: TeamPropsInterface) => {
  const [players, setPlayers] = useState(
    props.players.filter((player) => player.team_id == props.teamId)
  )
  const [teamName, setTeamName] = useState(props.teamName)

  useEffect(() => {
    setPlayers(props.players.filter((player) => player.team_id == props.teamId))
  }, [props.players, props.teamId])

  return (
    <React.Fragment>
      <Typography variant="h6">{teamName}</Typography>
      <List>
        {players.map((player) => (
          <Player key={player.id} player={player} />
        ))}
      </List>
    </React.Fragment>
  )
}

Team.propTypes = {
  players: PropTypes.array.isRequired,
  teamName: PropTypes.string.isRequired,
  teamId: PropTypes.number.isRequired,
}

const Players = ({}) => {
  const [players, setPlayers] = useState<PlayersListType>([])
  const [teams, setTeams] = useState<TeamsListType>([])

  const fetchPlayers = async () => {
    await makeFetch({
      url: '/api/mgmt/players/',
      successFn: (data) => {
        setPlayers(data.players)
        setTeams(data.teams)
      },
      unexpectedRespFn: (data) => console.log(data),
    })
  }

  useEffect(() => {
    fetchPlayers()
  }, [])

  return (
    <div>
      <Typography variant="h4">Players</Typography>
      {teams.map(({ id, name }) => (
        <Team key={id} teamId={id} teamName={name} players={players} />
      ))}

      {/* <List>
        {players.map((player) =>
          <Player
            key={player.id}
            player={player}
          />
        )}
      </List> */}
    </div>
  )
}

Players.propTypes = {}

export default Players
