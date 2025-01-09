import React, {
  Component,
  useState,
  useEffect,
  useContext,
  ReactText,
} from 'react'
import PropTypes, { string } from 'prop-types'
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
import MenuItem from '@material-ui/core/MenuItem'
import { useSnackbar } from 'notistack'
import { makeFetch } from '../../helpers/MakeFetch'

interface UserInterface {
  id: number
  username: string
  role: string
  team?: {
    id: number
    name: string
  }
}

type UsersListType = Array<UserInterface>

interface RoleInterface {
  name: string
  value: string
}

type RolesListType = Array<RoleInterface>

interface NewUserPropsInterface {
  reFetchUsers: () => void
  roles: RolesListType
}

const NewUser = (props: NewUserPropsInterface) => {
  const [user, setUser] = useState({
    username: '',
    password: '',
    role: 'contestant', // FIXME TODO don't hardcode value?
  })
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const handleChange = (event: React.FormEvent<HTMLFormElement>) => {
    const target = event.target as HTMLInputElement
    setUser({ ...user, [target.name]: target.value })
  }
  const handleChangeRole = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, role: event.target.value })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    let request_body = {
      user: user,
    }

    await makeFetch({
      url: `/api/mgmt/users/`,
      method: 'POST',
      body: request_body,
      successFn: (data) => {
        enqueueSnackbar('Success')
        props.reFetchUsers()
      },
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
          label="UserName"
          name="username"
          value={user.username}
          placeholder="User Name"
        />
        <TextField
          type="text"
          label="Password"
          name="password"
          value={user.password}
          placeholder="Password"
        />
        <TextField
          select
          label="Role"
          name="role"
          value={user.role}
          helperText="User Role"
          onChange={handleChangeRole}
        >
          {props.roles.map(({ name, value }) => (
            <MenuItem key={value} value={name}>
              {name}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="contained" type="submit">
          Create User
        </Button>
      </form>
    </div>
  )
}

NewUser.propTypes = {
  roles: PropTypes.array.isRequired,
  reFetchUsers: PropTypes.func.isRequired,
}

interface UserPropsInterface {
  user: UserInterface
  roles: RolesListType
  removeUser: (user: UserInterface) => void
}

const User = (props: UserPropsInterface) => {
  const [user, setUser] = useState({
    username: props.user.username,
    password: '',
    role: props.user.role,
  })
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  useEffect(() => {
    setUser({
      username: props.user.username,
      password: '',
      role: props.user.role,
    })
  }, [props.user.username, props.user.role])

  const deleteUser = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()

    if (!confirm('This action cannot be reversed? Are you sure?')) {
      return
    }

    await makeFetch({
      url: `/api/mgmt/users/${props.user.id}`,
      method: 'DELETE',
      successFn: (data) => {
        enqueueSnackbar('Success')
        props.removeUser(props.user)
      },
      unauthorizedFn: (data) => {
        enqueueSnackbar('Unauthorized')
      },
      statusFns: {
        '400': (data) => enqueueSnackbar(data.error),
      },
      unexpectedRespFn: (data, response) =>
        console.log('Unexpected response' + response),
    })
  }

  const handleChange = (event: React.FormEvent<HTMLFormElement>) => {
    const target = event.target as HTMLInputElement
    setUser({ ...user, [target.name]: target.value })
  }
  const handleChangeRole = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, role: event.target.value })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    interface request_body_interface {
      user: {
        user: string
        role: string
        password?: string
      }
    }

    let request_body: request_body_interface = {
      user: {
        user: user.username,
        role: user.role,
      },
    }

    if (!!user.password) {
      request_body.user['password'] = user.password
    }

    await makeFetch({
      url: `/api/mgmt/users/${props.user.id}`,
      method: 'PUT',
      body: request_body,
      successFn: (data) => enqueueSnackbar('Success'),
      unauthorizedFn: (data) => enqueueSnackbar('Unauthorized'),
      statusFns: {
        '400': (data) => enqueueSnackbar(data.error),
      },
      unexpectedRespFn: (data, response) =>
        console.log('Unexpected response' + response),
    })
  }

  const forceLogout = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    if (!confirm('This will invalidate all sessions for this user? Are you sure?')) {
      return
    }

    makeFetch({
      url: `/api/sessioninvalidate`,
      method: 'POST',
      body: { username: user.username},
      successFn: (data) => enqueueSnackbar('Success'),
      unauthorizedFn: (data) => enqueueSnackbar('Unauthorized'),
      statusFns: {
        '400': (data) => enqueueSnackbar(data.error),
      },
    })
  }

  return (
    <ListItem>
      <ListItemIcon>
        <IconButton href="#" onClick={deleteUser} edge="start">
          <DeleteForeverIcon />
        </IconButton>
      </ListItemIcon>
      <form onChange={handleChange} onSubmit={handleSubmit}>
        <TextField
          type="text"
          label="User Name"
          name="username"
          value={user.username}
        />
        <TextField
          type="text"
          name="password"
          label="New Password"
          value={user.password}
          placeholder={'New Password'}
        />
        <TextField
          select
          label="Role"
          name="role"
          value={user.role}
          helperText="User Role"
          onChange={handleChangeRole}
        >
          {props.roles.map(({ name, value }) => (
            <MenuItem key={value} value={name}>
              {name}
            </MenuItem>
          ))}
        </TextField>

        <Button variant="contained" type="submit">
          Update
        </Button>
        <Button style={{ marginLeft: '10px' }} variant="contained" onClick={forceLogout}>
          Logout User
        </Button>
      </form>
    </ListItem>
  )
}

User.propTypes = {
  user: PropTypes.object.isRequired,
  roles: PropTypes.array.isRequired,
  removeUser: PropTypes.func.isRequired,
}

export const Users = ({}) => {
  const [users, setUsers] = useState<UsersListType>([])
  const [roles, setRoles] = useState<RolesListType>([])

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    await makeFetch({
      url: '/api/mgmt/users/',
      successFn: (data) => {
        console.log(data)
        setUsers(data.users)
        setRoles(data.roles)
      },
      unexpectedRespFn: (data, response) => console.log(response),
    })
  }

  const removeUser = (user: UserInterface) => {
    const newUsers = update(users, {
      $splice: [[users.findIndex((item) => item.id == user.id), 1]],
    })
    setUsers(newUsers)
  }

  if (users.length == 0 || roles.length == 0) {
    return <div>Loading</div>
  } else {
    return (
      <div>
        <Typography variant="h4">Users</Typography>
        <List>
          {users.map((user) => (
            <User
              key={user.id}
              user={user}
              roles={roles}
              removeUser={removeUser}
            />
          ))}
        </List>
        <List>
          <ListItem>
            <NewUser reFetchUsers={fetchUsers} roles={roles} />
          </ListItem>
        </List>
      </div>
    )
  }
}

Users.propTypes = {}

export default Users
