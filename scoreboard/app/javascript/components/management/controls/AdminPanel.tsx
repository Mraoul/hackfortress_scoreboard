import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import update from 'immutability-helper'

import Divider from '@material-ui/core/Divider'
import Grid from '@material-ui/core/Grid'
import Container from '@material-ui/core/Container'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'

import { useSnackbar } from 'notistack'

import Loading from '../../../layout/Loading'
import { BonusControl, useStyles } from './Common'
import { makeFetch } from '../../../helpers/MakeFetch'
import { SessionContextInterface, useSession } from '../../../helpers/Session'

import type { ColorType } from '../../def'
import type {
  ConsoleCategoriesInterface,
  ConsoleInterface,
  ConsoleParticipantContainerInterface,
  ConsoleParticipantInterface,
} from './def'

interface ParticipantControlPropsInterface {
  participant: ConsoleParticipantInterface
  reFetchData: () => void
}

const ParticipantControl = (props: ParticipantControlPropsInterface) => {
  const [participant, setParticipant] = useState(props.participant)
  const [formState, setFormState] = useState({
    hack_score_mod: 0,
    bonus_score_mod: 0,
    tf2_score_mod: 0,
    hackcoins_mod: 0,
    tf2coins_mod: 0,
    hints_mod: 0,
  })
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setFormState({ ...formState, [e.target.name]: e.target.value })
  const session = useSession() as SessionContextInterface

  useEffect(() => {
    setParticipant(props.participant)
  }, [props.participant])

  const handleSubmit = (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault()

    let request_body = formState

    makeFetch({
      url: `/api/mgmt/participants/patch/${participant.id}`,
      method: 'PATCH',
      body: request_body,
      successFn: () => {
        enqueueSnackbar('Update Accepted')
        // Reset mod details
        setFormState({
          hack_score_mod: 0,
          bonus_score_mod: 0,
          tf2_score_mod: 0,
          hackcoins_mod: 0,
          tf2coins_mod: 0,
          hints_mod: 0,
        })
        props.reFetchData()
      },
      unauthorizedFn: () => session.clear(),
    })
  }

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>+/</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Hack Score</TableCell>
                <TableCell>{participant.hack_score}</TableCell>
                <TableCell>
                  <TextField
                    label="Hack Score"
                    name="hack_score_mod"
                    type="text"
                    value={formState.hack_score_mod}
                    onChange={handleTextChange}
                    fullWidth
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>TF2 Score</TableCell>
                <TableCell>{participant.tf2_score}</TableCell>
                <TableCell>
                  <TextField
                    label="TF2 Score"
                    name="tf2_score_mod"
                    type="text"
                    value={formState.tf2_score_mod}
                    onChange={handleTextChange}
                    fullWidth
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Bonus Score</TableCell>
                <TableCell>{participant.bonus_score}</TableCell>
                <TableCell>
                  <TextField
                    label="Bonus Score"
                    name="bonus_score_mod"
                    type="text"
                    value={formState.bonus_score_mod}
                    onChange={handleTextChange}
                    fullWidth
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Hack Coins</TableCell>
                <TableCell>{participant.hackcoins}</TableCell>
                <TableCell>
                  <TextField
                    label="Hack Coins"
                    name="hackcoins_mod"
                    type="text"
                    value={formState.hackcoins_mod}
                    onChange={handleTextChange}
                    fullWidth
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>TF2 Coins</TableCell>
                <TableCell>{participant.tf2coins}</TableCell>
                <TableCell>
                  <TextField
                    label="TF2 Coins"
                    name="tf2coins_mod"
                    type="text"
                    value={formState.tf2coins_mod}
                    onChange={handleTextChange}
                    fullWidth
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Hints</TableCell>
                <TableCell>{participant.hints}</TableCell>
                <TableCell>
                  <TextField
                    label="Hints"
                    name="hints_mod"
                    type="text"
                    value={formState.hints_mod}
                    onChange={handleTextChange}
                    fullWidth
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Button variant="contained" type="submit" fullWidth>
              Update
            </Button>
          </Grid>
        </Grid>
      </form>
    </React.Fragment>
  )
}

ParticipantControl.propTypes = {
  participant: PropTypes.object.isRequired,
  reFetchData: PropTypes.func.isRequired,
}

interface TeamControlPropsInterface {
  participant: ConsoleParticipantContainerInterface
  puzzles: ConsoleCategoriesInterface
  color: ColorType
  reFetchData: () => void
}

const TeamControl = (props: TeamControlPropsInterface) => {
  const [participant, setParticipant] = useState(props.participant.participant)
  const [players, setPlayers] = useState(props.participant.players)
  const [solved, setSolved] = useState(props.participant.solved)
  const classes = useStyles()

  useEffect(() => {
    setParticipant(props.participant.participant)
    setPlayers(props.participant.players)
    setSolved(props.participant.solved)
  }, [props.participant])

  return (
    <Paper className={classes.teamPaper} elevation={2}>
      <Container>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography
              className={clsx(classes.allTeam, {
                [classes.redTeam]: props.color == 'red',
                [classes.blueTeam]: props.color == 'blue',
              })}
              variant="h5"
              align="center"
            >
              {participant.team.name}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <ParticipantControl
              participant={participant}
              reFetchData={props.reFetchData}
            />
          </Grid>
          <Grid item xs={12}>
            <BonusControl participant_id={participant.id} />
          </Grid>
        </Grid>
        <Divider />
        {/* <Grid item xs={12}>
          <PuzzleSubmission
            participant={participant}
            players={players}
            puzzles={props.puzzles}
            solved={solved}
          />
        </Grid> */}
      </Container>
    </Paper>
  )
}

TeamControl.propTypes = {
  color: PropTypes.string.isRequired,
  participant: PropTypes.object.isRequired,
  puzzles: PropTypes.object.isRequired,
  reFetchData: PropTypes.func.isRequired,
}

interface AdminPanelPropsInterface {
  consoleData: ConsoleInterface
  fetchData: () => void
}

type colorHandleEventFunctionType = (e: any, color: ColorType) => void

const AdminPanel = ({ consoleData, fetchData }: AdminPanelPropsInterface) => {
  const [roundName, setRoundName] = useState(consoleData.round.name)
  const [participants, setParticipants] = useState(consoleData.participants)
  const [puzzles, setPuzzles] = useState(consoleData.puzzles)
  const [gameTime, setGameTime] = useState(consoleData.gametime)
  const colorEventUrl = '/stream/updates'
  const colorEventHandlerRef = useRef<colorHandleEventFunctionType | undefined>(
    undefined
  )

  useEffect(() => {
    colorEventHandlerRef.current = colorHandleEvent
  })

  useEffect(() => {
    setRoundName(consoleData.round.name)
    setParticipants(consoleData.participants)
    setPuzzles(consoleData.puzzles)
    setGameTime(consoleData.gametime)
  }, [consoleData])

  useEffect(() => {
    if (!!colorEventHandlerRef.current) {
      const redUpdateSrc = new EventSource(`${colorEventUrl}/red`)
      redUpdateSrc.addEventListener(
        'update',
        (e) => {
          colorEventHandlerRef.current!(e, 'red') // TODO FIXME XXX see if this works reliably
        },
        false
      )

      const blueUpdateSrc = new EventSource(`${colorEventUrl}/blue`)
      blueUpdateSrc.addEventListener(
        'update',
        (e) => {
          colorEventHandlerRef.current!(e, 'blue')
        },
        false
      )

      redUpdateSrc.onerror = function (e) {
        console.log(e)
      }

      blueUpdateSrc.onerror = function (e) {
        console.log(e)
      }

      return () => {
        console.log('Closing Event Sources')
        redUpdateSrc.close()
        blueUpdateSrc.close()
      }
    }
  }, [colorEventUrl])

  const updateHints = (hintDiff: number, participantIndex: number) => {
    const newParticipants = update(participants, {
      [participantIndex]: {
        participant: {
          hints: {
            $set: participants[participantIndex].participant.hints + hintDiff,
          },
        },
      },
    })
    setParticipants(newParticipants)
  }

  const updateSolved = (id: number, participantIndex: number) => {
    const newParticipants = update(participants, {
      [participantIndex]: { solved: { $push: [id] } },
    })
    setParticipants(newParticipants)
  }

  const unlockPuzzle = (id: number) => {}

  const colorHandleEvent = (e: any, color: ColorType) => {
    let message = JSON.parse(e.data)
    let participantIndex = color == 'red' ? 0 : 1
    console.log(message)
    switch (message.type) {
      case 'hint':
        // message.quantity is the difference of hints
        updateHints(message.quantity, participantIndex)
        break
      case 'solved':
        updateSolved(message.puzzle, participantIndex)
        break
      case 'unlock':
        unlockPuzzle(message.puzzle_id)
        break
      default:
        console.log('Recieved unexpected message')
    }
  }

  return (
    <div>
      <Container>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5" align="center">
              {roundName}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TeamControl
              color="red"
              participant={participants[0]}
              puzzles={puzzles}
              reFetchData={fetchData}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TeamControl
              color="blue"
              participant={participants[1]}
              puzzles={puzzles}
              reFetchData={fetchData}
            />
          </Grid>
        </Grid>
      </Container>
    </div>
  )
}

const AdminPanelLoader = ({}) => {
  const [loaded, setLoaded] = useState(false)
  const [consoleData, setConsoleData] = useState<ConsoleInterface | undefined>(
    undefined
  )

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = () => {
    makeFetch({
      url: '/api/mgmt/rounds/console',
      method: 'GET',
      successFn: (data) => {
        if (data.hasOwnProperty('round')) {
          setConsoleData(data as ConsoleInterface)
        }
      },
      unauthorizedFn: () => {
        console.log('Unauthorized?')
      },
      always: () => {
        setLoaded(true)
      },
      onError: (error) => {
        console.error(error)
      },
    })
  }

  if (!loaded) {
    return <Loading />
  } else if (typeof consoleData === 'undefined') {
    return <Typography variant="h5"> No Round Active</Typography>
  } else {
    return (
      <React.Fragment>
        <AdminPanel consoleData={consoleData} fetchData={fetchData} />
      </React.Fragment>
    )
  }
}

export default AdminPanelLoader
