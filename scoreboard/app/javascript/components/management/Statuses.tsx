import React, {
  Component,
  useState,
  useEffect,
  useContext,
  ReactText,
} from 'react'
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
import { useSnackbar } from 'notistack'
import { makeFetch } from '../../helpers/MakeFetch'
import { useSession } from '../../helpers/Session'
import Loading from '../../layout/Loading'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import MenuItem from '@material-ui/core/MenuItem'
import Participants from './Participants'

interface StatusInterface {
  id: number
  duration: number
  endtime: number
  status_type: number
  participant: {
    team: {
      name: string
    }
  }
}

type StatusesListType = Array<StatusInterface>

interface NewStatusPropsInterface {
  handleRefresh: () => void
}

const NewStatus = (props: NewStatusPropsInterface) => {
  const [team, setTeam] = useState('1')
  const [status, setStatus] = useState('')

  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const handleChangeTeam = (event: React.ChangeEvent<HTMLInputElement>) =>
    setTeam(event.target.value)
  const handleChangeStatus = (event: React.ChangeEvent<HTMLInputElement>) =>
    setStatus(event.target.value)
  const session = useSession()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    await makeFetch({
      url: '/api/mgmt/statuses/',
      method: 'POST',
      body: { team: team, event: status },
      successFn: () => {
        enqueueSnackbar('Success')
      },
      unauthorizedFn: () => {
        if (session != null) {
          session.clear()
        }
      },
    })

    props.handleRefresh()
  }

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit}>
        <TextField
          select
          label="Team"
          name="team"
          value={team}
          helperText="Select Team"
          onChange={handleChangeTeam}
        >
          {[
            { name: 'Red', value: '1' },
            { name: 'Blue', value: '2' },
          ].map(({ name, value }) => (
            <MenuItem key={value} value={value}>
              {name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          type="text"
          label="Status"
          name="status"
          value={status}
          placeholder="cap_block|cap_delay"
          onChange={handleChangeStatus}
        />
        <Button variant="contained" type="submit">
          Create
        </Button>
      </form>
    </React.Fragment>
  )
}

interface StatusPropsInterface {
  key: number
  statusId: number
  duration: number
  endTime: number
  statusType: number
  teamName: string
  handleRefresh: () => void
}

const Status = (props: StatusPropsInterface) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const session = useSession()

  const handleDelete = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()

    if (!confirm('This action cannot be reversed? Are you sure?')) {
      return
    }

    await makeFetch({
      url: `/api/mgmt/statuses/${props.statusId}`,
      method: 'DELETE',
      successFn: () => {
        enqueueSnackbar('Deleted')
      },
      unauthorizedFn: () => {
        if (session != null) {
          session.clear()
        }
      },
    })

    props.handleRefresh()
  }

  return (
    <TableRow>
      <TableCell> {props.teamName} </TableCell>
      <TableCell> {props.duration} </TableCell>
      <TableCell> {props.statusType} </TableCell>
      <TableCell> {props.endTime} </TableCell>
      <TableCell>
        <Button
          href=""
          variant="contained"
          startIcon={<DeleteForeverIcon />}
          onClick={handleDelete}
        >
          Delete
        </Button>
      </TableCell>
    </TableRow>
  )
}

Status.propTypes = {
  key: PropTypes.number.isRequired,
  statusId: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
  endTime: PropTypes.number.isRequired,
  statusType: PropTypes.number.isRequired,
  teamName: PropTypes.string.isRequired,
  handleRefresh: PropTypes.func.isRequired,
}

const Statuses = ({}) => {
  const [statuses, setStatuses] = useState<StatusesListType>([])
  const [loaded, setLoaded] = useState(false)
  const session = useSession()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    await makeFetch({
      url: '/api/mgmt/statuses/',
      successFn: (data) => {
        setStatuses(data as StatusesListType)
      },
      unauthorizedFn: () => {
        if (session != null) {
          session.clear()
        }
      },
    })

    setLoaded(true)
  }

  const handleRefresh = () => {
    fetchData()
  }

  if (!loaded) {
    return <Loading />
  }

  return (
    <div>
      <Typography variant="h4">Statuses</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell> Team </TableCell>
              <TableCell> Duration </TableCell>
              <TableCell> Status </TableCell>
              <TableCell> End Time </TableCell>
              <TableCell> &nbsp; </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {statuses.map((status) => (
              <Status
                key={status.id}
                statusId={status.id}
                duration={status.duration}
                endTime={status.endtime}
                statusType={status.status_type}
                teamName={
                  status.participant.team ? status.participant.team.name : ''
                }
                handleRefresh={handleRefresh}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <ListItem>
        <NewStatus handleRefresh={handleRefresh} />
      </ListItem>
    </div>
  )
}

Statuses.propTypes = {}

export default Statuses
