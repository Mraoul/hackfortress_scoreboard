import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import update from 'immutability-helper'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import DeleteForeverIcon from '@material-ui/icons/DeleteForever'
import Typography from '@material-ui/core/Typography'
import { useSnackbar } from 'notistack'
import { makeFetch } from '../../helpers/MakeFetch'

interface TeamInterface {
  id: number
  name: string
  user: {
    id: number
    username: string
  }
}

type TeamsListType = Array<TeamInterface>

const NewTeam = ({}) => {
  const [teamName, setTeamName] = useState('')
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTeamName(event.target.value)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    let request_body = {
      team: {
        name: teamName,
      },
    }

    await makeFetch({
      url: `/api/mgmt/teams/`,
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
      <form onSubmit={handleSubmit}>
        <TextField
          type="text"
          label="Team Name"
          name="teamName"
          value={teamName}
          placeholder="Team Name"
          onChange={handleChange}
        />
        <Button variant="contained" type="submit">
          Create Team
        </Button>
      </form>
    </div>
  )
}

NewTeam.propTypes = {
  addTeam: PropTypes.func.isRequired,
}

interface TeamPropsInterface {
  team: TeamInterface
  removeTeam: (team: TeamInterface) => void
}

const Team = (props: TeamPropsInterface) => {
  const [teamName, setTeamName] = useState(props.team.name)
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  useEffect(() => {
    setTeamName(props.team.name)
  }, [props.team.name])

  const deleteTeam = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!confirm('This action cannot be reversed? Are you sure?')) {
      return
    }

    await makeFetch({
      url: `/api/mgmt/teams/${props.team.id}`,
      method: 'DELETE',
      successFn: (data) => {
        enqueueSnackbar('Success')
        props.removeTeam(props.team)
      },
      unauthorizedFn: (data) => enqueueSnackbar('Unauthorized'),
      unexpectedRespFn: (data, response) =>
        console.log('Unexpected response' + response),
    })
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTeamName(event.target.value)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    let request_body = {
      team: {
        name: teamName,
      },
    }

    await makeFetch({
      url: `/api/mgmt/teams/${props.team.id}`,
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
        <IconButton onClick={deleteTeam} edge="start">
          <DeleteForeverIcon />
        </IconButton>
      </ListItemIcon>
      <form onSubmit={handleSubmit}>
        <TextField
          type="text"
          label="Team Name"
          name="teamName"
          value={teamName}
          onChange={handleChange}
        />
        <TextField
          type="text"
          label="Username"
          value={props.team.user.username}
          disabled
        />
        <Button variant="contained" type="submit">
          Update
        </Button>
      </form>
    </ListItem>
  )
}

Team.propTypes = {
  team: PropTypes.object.isRequired,
}

export const Teams = ({}) => {
  const [data, setData] = useState<TeamsListType>([])

  const fetchTeams = async () => {
    await makeFetch({
      url: '/api/mgmt/teams/',
      successFn: (data) => {
        console.log(data)
        setData(data as TeamsListType)
      },
      unexpectedRespFn: (data, response) => console.log(response),
    })
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  const addTeam = (team: TeamInterface) => {
    const new_data = update(data, { $push: [team] })
    setData(new_data)
  }

  const removeTeam = (team: TeamInterface) => {
    const new_data = update(data, {
      $splice: [[data.findIndex((item) => item.id == team.id), 1]],
    })
    setData(new_data)
  }

  return (
    <div>
      <Typography variant="h4">Teams</Typography>
      <List>
        {data.map((team) => (
          <Team key={team.id} team={team} removeTeam={removeTeam} />
        ))}
      </List>
      <List>
        <ListItem>
          <NewTeam addTeam={addTeam} />
        </ListItem>
      </List>
    </div>
  )
}

Teams.propTypes = {}

export default Teams
