import React, { useState, useEffect, useContext } from 'react'
import PropTypes, { string } from 'prop-types'

import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import { makeStyles, Theme } from '@material-ui/core/styles'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import MenuItem from '@material-ui/core/MenuItem'
import Grid from '@material-ui/core/Grid'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import Divider from '@material-ui/core/Divider'

import Loading from '../../layout/Loading'
import { useSnackbar } from 'notistack'
import { makeFetch } from '../../helpers/MakeFetch'
import { unchangedTextChangeRange } from 'typescript'

import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked'
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked'

const styles = (theme: Theme) => ({
  nameCell: {
    width: '15%',
  },
  prpCell: {
    width: '10%',
  },
  actCell: {
    width: '10%',
  },
  psCell: {
    width: '15%',
  },
  tCell: {
    width: '20%',
  },
  btnCell: {
    width: '10%',
  },
})

const useStyles = makeStyles(styles)

interface GameInterface {
  live_round: number | null
  ready_round: number | null
  automated: boolean | null
}
interface RoundParticipant {
  id: number
  team_id: number
}

interface RoundInterface {
  id: number
  name: string
  puzzleset_id: number
  participants: Array<RoundParticipant>
}

type RoundsListType = Array<RoundInterface>

interface RoundTeamInterface {
  id: number
  name: number
}

type RoundTeamsListType = Array<RoundTeamInterface>

interface AutomationInterface {
  automated: boolean
  game_state: string
  start_time: number
  mytime: number
  pid: number
  game_duration: number
  game_id: string
  red_team: string
  blue_team: string
}

interface RoundPuzzleSetInterface {
  id: number
  name: string
}

type RoundPuzzleSetsType = Array<RoundPuzzleSetInterface>

const AutomationUnlock = ({}) => {
  const [unlockValue, setUnlockValue] = useState(5)
  const { enqueueSnackbar } = useSnackbar()

  const handleSelectChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUnlockValue(parseInt(event.target.value))
  }

  const handleAutomationSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (!confirm('This action cannot be reversed? Are you sure?')) {
      return
    }

    let request_body = {
      gametime: unlockValue,
    }

    await makeFetch({
      url: '/api/mgmt/rounds/unlock',
      method: 'POST',
      body: request_body,
      successFn: (data) => enqueueSnackbar('Puzzles Unlocked'),
      unauthorizedFn: (data) => enqueueSnackbar('Unauthorized'),
      unexpectedRespFn: (data, response) => console.log(response),
    })
  }

  return (
    <form onSubmit={handleAutomationSubmit}>
      <TextField
        select
        label="Unlock Time"
        name="unlockValue"
        value={unlockValue}
        onChange={handleSelectChange}
      >
        {Array.from({ length: 10 }, (x, i) => (i + 1) * 5).map((key) => (
          <MenuItem key={key} value={key}>
            {key}
          </MenuItem>
        ))}
      </TextField>
      <Button color="primary" variant="contained" type="submit">
        Manual Unlock
      </Button>
    </form>
  )
}

interface AutomationControlPropsInterface {
  isAutomated: boolean
  reFetchData: () => void
}

const AutomationControl = (props: AutomationControlPropsInterface) => {
  const [isAutomated, setIsAutomated] = useState(props.isAutomated)
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    setIsAutomated(props.isAutomated)
  }, [props.isAutomated])

  const handleToggleAutomation = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsAutomated(event.target.checked)
  }

  const handleToggleAutomationSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    let request_body = {
      automated: isAutomated,
    }

    await makeFetch({
      url: '/api/mgmt/rounds/automation',
      method: 'POST',
      body: request_body,
      successFn: (data) => {
        enqueueSnackbar('Automation Updated')
        props.reFetchData()
      },
      unauthorizedFn: (data) => enqueueSnackbar('Unauthorized'),
      unexpectedRespFn: (data, response) => console.log(response),
    })
  }

  const handleForceGameStart = async (
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
    event.preventDefault()

    if (!confirm('This action cannot be reversed? Are you sure?')) {
      return
    }

    await makeFetch({
      url: '/api/mgmt/rounds/gamestart',
      method: 'POST',
      successFn: (data) => {
        enqueueSnackbar('Game Forcefully Started')
        props.reFetchData()
      },
      unauthorizedFn: (data) => enqueueSnackbar('Unauthorized'),
    })
  }

  const handleForceGameEnd = async (
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
    event.preventDefault()

    if (!confirm('This action cannot be reversed? Are you sure?')) {
      return
    }

    await makeFetch({
      url: '/api/mgmt/rounds/gameend',
      method: 'POST',
      successFn: (data) => {
        enqueueSnackbar('Game Forcefully Ended')
        props.reFetchData()
      },
      unauthorizedFn: (data) => enqueueSnackbar('Unauthorized'),
    })
  }

  return (
    <Grid container>
      <form onSubmit={handleToggleAutomationSubmit}>
        <Grid item xs={12}>
          <FormControlLabel
            label="Automated"
            labelPlacement="start"
            control={
              <Checkbox
                checked={isAutomated}
                onChange={handleToggleAutomation}
              />
            }
          />
          <Button color="primary" variant="contained" type="submit">
            Toggle
          </Button>
        </Grid>
      </form>
      <Grid item xs={12}>
        <Button
          href="#"
          color="primary"
          variant="contained"
          type="submit"
          onClick={handleForceGameStart}
        >
          Force Game Start
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Button
          href="#"
          color="primary"
          variant="contained"
          type="submit"
          onClick={handleForceGameEnd}
        >
          Force Game End
        </Button>
      </Grid>
    </Grid>
  )
}

AutomationControl.propTypes = {
  isAutomated: PropTypes.bool.isRequired,
  reFetchData: PropTypes.func.isRequired,
}

interface AutomationInfoInterface {
  automation: AutomationInterface
}

const AutomationInfo = (props: AutomationInfoInterface) => {
  const [automation, setAutomation] = useState(props.automation)

  useEffect(() => {
    setAutomation(props.automation)
  }, [props.automation])

  const duration = Math.floor(Date.now() / 1000) - automation['start_time']
  const minutes = Math.trunc(duration / 60)
  const seconds = duration % 60
  const state =
    automation['game_state'][0].toUpperCase() +
    automation['game_state'].slice(1)
  const game_time =
    automation['start_time'] > 0 ? `${minutes}m ${seconds}s` : `0m 0s`

  return (
    <div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Game Active</TableCell>
              <TableCell>Game Time</TableCell>
              <TableCell>PID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{state}</TableCell>
              <TableCell>{game_time}</TableCell>
              <TableCell>{automation['pid']}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Game ID</TableCell>
              <TableCell>Game Duration</TableCell>
              <TableCell>Red Team</TableCell>
              <TableCell>Blue Team</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{automation['game_id']}</TableCell>
              <TableCell>{automation['game_duration']}</TableCell>
              <TableCell>{automation['red_team']}</TableCell>
              <TableCell>{automation['blue_team']}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

AutomationInfo.propTypes = {
  automation: PropTypes.object.isRequired,
}

interface NewRoundPropsInterface {
  reFetchData: () => void
  teams: RoundTeamsListType
  puzzlesets: RoundPuzzleSetsType
}

const NewRound = (props: NewRoundPropsInterface) => {
  const [formState, setFormState] = useState({
    name: '',
    puzzleset: 0,
    team1: 0,
    team2: 0,
  })

  const classes = useStyles()
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const handleChange = (event: React.FormEvent<HTMLFormElement>) => {
    const target = event.target as HTMLInputElement
    const value = target.type == 'checkbox' ? target.checked : target.value

    setFormState({ ...formState, [target.name]: value })
  }

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({ ...formState, name: event.target.value })
  }
  const handleSelectChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) => {
    setFormState({ ...formState, [name]: event.target.value })
  }
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    interface request_body_interface {
      round: {
        name: string
        puzzleset?: number
      }
      team1: number
      team2: number
    }

    let request_body: request_body_interface = {
      round: {
        name: formState.name,
      },
      team1: formState.team1,
      team2: formState.team2,
    }

    if (formState.puzzleset > 0) {
      request_body.round['puzzleset'] = formState.puzzleset
    }

    await makeFetch({
      url: `/api/mgmt/rounds/`,
      method: 'POST',
      body: request_body,
      successFn: (data) => {
        enqueueSnackbar('Round Created')
        props.reFetchData()
      },
      unauthorizedFn: (data) => enqueueSnackbar('Unauthorized'),
    })
  }

  return (
    <form onChange={handleChange} onSubmit={handleSubmit}>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className={classes.nameCell}>
              <TextField
                label="Round Name"
                name="name"
                type="text"
                placeholder="Round Name"
                value={formState.name}
                onChange={handleNameChange}
              />
            </TableCell>
            <TableCell className={classes.psCell}>
              <TextField
                select
                label="PuzzleSet"
                name="puzzleset"
                value={formState.puzzleset}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  handleSelectChange(event, 'puzzleset')
                }
              >
                <MenuItem key={0} value={0} disabled>
                  Select PuzzleSet
                </MenuItem>
                {props.puzzlesets.map((puzzleset) => (
                  <MenuItem key={puzzleset.id} value={puzzleset.id}>
                    {puzzleset.name}
                  </MenuItem>
                ))}
              </TextField>
            </TableCell>
            <TableCell className={classes.tCell}>
              <TextField
                select
                label="Team 1"
                name="team1"
                value={formState.team1}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  handleSelectChange(event, 'team1')
                }
              >
                <MenuItem key={0} value={0}>
                  Select Team
                </MenuItem>
                {props.teams.map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    {team.name}
                  </MenuItem>
                ))}
              </TextField>
            </TableCell>
            <TableCell className={classes.tCell}>
              <TextField
                select
                label="Team 2"
                name="team2"
                value={formState.team2}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  handleSelectChange(event, 'team2')
                }
              >
                <MenuItem key={0} value={0}>
                  Select Team
                </MenuItem>
                {props.teams.map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    {team.name}
                  </MenuItem>
                ))}
              </TextField>
            </TableCell>
            <TableCell className={classes.btnCell}>
              <Button color="primary" variant="contained" type="submit">
                Create
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </form>
  )
}

NewRound.propTypes = {
  reFetchData: PropTypes.func.isRequired,
  teams: PropTypes.array.isRequired,
  puzzlesets: PropTypes.array.isRequired,
}

interface RoundPropsInterface {
  reFetchData: () => void
  round: RoundInterface
  ready: boolean
  live: boolean
  puzzlesets: RoundPuzzleSetsType
  teams: RoundTeamsListType
}

const Round = (props: RoundPropsInterface) => {
  const [round, setRound] = useState(props.round)
  const [formState, setFormState] = useState({
    ready: props.ready,
    live: props.live,
    puzzleset: props.round.puzzleset_id != null ? props.round.puzzleset_id : 0,
    team1:
      props.round.participants[0].team_id != null
        ? props.round.participants[0].team_id
        : 0,
    team2:
      props.round.participants[1].team_id != null
        ? props.round.participants[1].team_id
        : 0,
  })
  const classes = useStyles()
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  useEffect(() => {
    setRound(props.round)
  }, [props.round])

  useEffect(() => {
    setFormState({
      ready: props.ready,
      live: props.live,
      puzzleset:
        props.round.puzzleset_id != null ? props.round.puzzleset_id : 0,
      team1:
        props.round.participants[0].team_id != null
          ? props.round.participants[0].team_id
          : 0,
      team2:
        props.round.participants[1].team_id != null
          ? props.round.participants[1].team_id
          : 0,
    })
  }, [round])

  const handleChange = (event: React.FormEvent<HTMLFormElement>) => {
    const target = event.target as HTMLInputElement
    const value = target.type == 'checkbox' ? target.checked : target.value

    setFormState({ ...formState, [target.name]: value })
  }

  const handleSelectChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) => {
    setFormState({ ...formState, [name]: event.target.value })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    interface request_body_interface {
      round: {
        name: string
        puzzleset?: number
      }
      team1: number
      team2: number
    }

    let request_body: request_body_interface = {
      round: {
        name: round.name,
      },
      team1: formState.team1,
      team2: formState.team2,
    }

    if (formState.puzzleset > 0) {
      request_body.round['puzzleset'] = formState.puzzleset
    }

    await makeFetch({
      url: `/api/mgmt/rounds/${round.id}`,
      method: 'PATCH',
      body: request_body,
      successFn: (data) => {
        enqueueSnackbar('Round Updated')
        props.reFetchData()
      },
      unauthorizedFn: (data) => enqueueSnackbar('Unauthorized'),
    })
  }

  const handleReady = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    await makeFetch({
      url: `/api/mgmt/rounds/${round.id}/ready`,
      method: 'POST',
      successFn: () => {
        enqueueSnackbar('Round ready status toggled')
        props.reFetchData()
      },
      unauthorizedFn: () => enqueueSnackbar('Unauthorized'),
    })
  }

  const handleLive = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    await makeFetch({
      url: `/api/mgmt/rounds/${round.id}/live`,
      method: 'POST',
      successFn: () => {
        enqueueSnackbar('Round live status toggled')
        props.reFetchData()
      },
      unauthorizedFn: () => enqueueSnackbar('Unauthorized'),
    })
  }

  let ready_icon = <RadioButtonUncheckedIcon />
  if (formState.ready) {
    ready_icon = <RadioButtonCheckedIcon />
  }

  let live_icon = <RadioButtonUncheckedIcon />
  if (formState.live) {
    live_icon = <RadioButtonCheckedIcon />
  }

  return (
    <form onChange={handleChange} onSubmit={handleSubmit}>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className={classes.nameCell}> {round.name} </TableCell>
            <TableCell className={classes.prpCell}>{ready_icon}</TableCell>
            <TableCell className={classes.actCell}>{live_icon}</TableCell>
            <TableCell className={classes.psCell}>
              <TextField
                select
                label="PuzzleSet"
                name="puzzleset"
                value={formState.puzzleset}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  handleSelectChange(event, 'puzzleset')
                }
              >
                <MenuItem key={0} value={0} disabled>
                  Select PuzzleSet
                </MenuItem>
                {props.puzzlesets.map((puzzleset) => (
                  <MenuItem key={puzzleset.id} value={puzzleset.id}>
                    {puzzleset.name}
                  </MenuItem>
                ))}
              </TextField>
            </TableCell>
            <TableCell className={classes.tCell}>
              <TextField
                select
                label="Team 1"
                name="team1"
                value={formState.team1}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  handleSelectChange(event, 'team1')
                }
              >
                <MenuItem key={0} value={0}>
                  Select Team
                </MenuItem>
                {props.teams.map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    {team.name}
                  </MenuItem>
                ))}
              </TextField>
            </TableCell>
            <TableCell className={classes.tCell}>
              <TextField
                select
                label="Team 2"
                name="team2"
                value={formState.team2}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  handleSelectChange(event, 'team2')
                }
              >
                <MenuItem key={0} value={0}>
                  Select Team
                </MenuItem>
                {props.teams.map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    {team.name}
                  </MenuItem>
                ))}
              </TextField>
            </TableCell>
            <TableCell className={classes.btnCell}>
              <Button color="primary" variant="contained" type="submit">
                Update
              </Button>
            </TableCell>
            <TableCell className={classes.btnCell}>
              <Button
                color="secondary"
                variant="contained"
                onClick={handleReady}
                href="#"
              >
                Ready
              </Button>
            </TableCell>
            <TableCell className={classes.btnCell}>
              <Button
                color="secondary"
                variant="contained"
                onClick={handleLive}
                href="#"
              >
                Live
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </form>
  )
}

Round.propTypes = {
  reFetchData: PropTypes.func.isRequired,
  round: PropTypes.object.isRequired,
  puzzlesets: PropTypes.array.isRequired,
  teams: PropTypes.array.isRequired,
}

export const Rounds = ({}) => {
  const [loaded, setLoaded] = useState(false)
  const [game, setGame] = useState<GameInterface>({
    live_round: null,
    ready_round: null,
    automated: null,
  })
  const [rounds, setRounds] = useState<RoundsListType>([])
  const [puzzlesets, setPuzzlesets] = useState<RoundPuzzleSetsType>([])
  const [automation, setAutomation] = useState<AutomationInterface>()
  const [teams, setTeams] = useState<RoundTeamsListType>([])
  const classes = useStyles()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    await makeFetch({
      url: '/api/mgmt/rounds/',
      successFn: (data) => {
        setGame(data.game)
        setRounds(data.rounds)
        setTeams(data.teams)
        setAutomation(data.automation)
        setPuzzlesets(data.puzzlesets)
      },
      unauthorizedFn: (data) => console.log(data),
      unexpectedRespFn: (data, response) => console.log(response),
      always: () => setLoaded(true),
    })
  }

  if (!loaded) {
    return <Loading />
  } else {
    return (
      <div>
        <AutomationControl
          isAutomated={(automation as AutomationInterface).automated}
          reFetchData={fetchData}
        />
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className={classes.nameCell}> Name </TableCell>
                <TableCell className={classes.prpCell}> Ready </TableCell>
                <TableCell className={classes.actCell}> Active </TableCell>
                <TableCell className={classes.psCell}> PuzzleSet </TableCell>
                <TableCell className={classes.tCell}> Team 1 </TableCell>
                <TableCell className={classes.tCell}> Team 2 </TableCell>
                <TableCell className={classes.btnCell}> &nbsp; </TableCell>
                <TableCell className={classes.btnCell}> &nbsp; </TableCell>
                <TableCell className={classes.btnCell}> &nbsp; </TableCell>
              </TableRow>
            </TableHead>
          </Table>
          {rounds.map((round) => {
            return (
              <Round
                key={round.id}
                round={round}
                ready={game.ready_round == round.id}
                live={game.live_round == round.id}
                teams={teams}
                puzzlesets={puzzlesets}
                reFetchData={fetchData}
              />
            )
          })}
          <Divider />
          <NewRound
            teams={teams}
            puzzlesets={puzzlesets}
            reFetchData={fetchData}
          />
        </TableContainer>
        <Divider />
        <AutomationInfo automation={automation as AutomationInterface} />
        <AutomationUnlock />
      </div>
    )
  }
}

Rounds.propTypes = {}

export default Rounds
