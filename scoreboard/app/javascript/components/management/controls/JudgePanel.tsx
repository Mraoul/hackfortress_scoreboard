import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

import Divider from '@material-ui/core/Divider'
import Grid from '@material-ui/core/Grid'
import Container from '@material-ui/core/Container'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import MenuItem from '@material-ui/core/MenuItem'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import Input from '@material-ui/core/Input'
import Backdrop from '@material-ui/core/Backdrop'
import CircularProgress from '@material-ui/core/CircularProgress'
import { Theme, makeStyles } from '@material-ui/core/styles'

import { useSnackbar } from 'notistack'

import Loading from '../../../layout/Loading'
import { SessionContextInterface, useSession } from '../../../helpers/Session'
import { makeFetch } from '../../../helpers/MakeFetch'

import { useStyles, BonusControl } from './Common'

import type { ColorType } from '../../def'
import type {
  ConsoleCategoriesInterface,
  ConsoleInterface,
  ConsoleParticipantContainerInterface,
  ConsoleParticipantInterface,
  ConsolePlayersType,
  ConsolePuzzleInterface,
  ConsoleSolvedType,
} from './def'

interface PuzzleSubmissionPropsInterface {
  participant: ConsoleParticipantInterface
  players: ConsolePlayersType
  puzzles: ConsoleCategoriesInterface
  solved: ConsoleSolvedType
  setLoadingOpen: (value: boolean) => void
}

const PuzzleSubmission = (props: PuzzleSubmissionPropsInterface) => {
  const [submitPuzzleId, setSubmitPuzzleId] = useState<number | undefined>(
    undefined
  )
  const [attribution, setAttribution] = useState(props.players[0][1] as number)
  const { enqueueSnackbar } = useSnackbar()

  const handleSelectPuzzle = (
    e: React.ChangeEvent<{
      name?: string | undefined
      value: unknown
    }>
  ) => {
    setSubmitPuzzleId(parseInt(e.target.value as string))
  }
  const handleChangeAttribution = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setAttribution(parseInt(e.target.value))
  const session = useSession() as SessionContextInterface

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!!submitPuzzleId == false) {
      enqueueSnackbar('Puzzle cannot be empty')
      return
    }

    if (!confirm('This action cannot be reversed? Are you sure?')) {
      return
    }

    interface RequestBodyInterface {
      team: number
      player: number
      puzzle: number
      judge_submit: boolean
    }

    let request_body: RequestBodyInterface = {
      team: props.participant.id,
      player: attribution,
      puzzle: submitPuzzleId as number,
      judge_submit: true,
    }

    props.setLoadingOpen(true)
    makeFetch({
      url: '/api/submit_solution',
      method: 'POST',
      body: request_body,
      successFn: () => {
        enqueueSnackbar('Solution Accepted!')
        setSubmitPuzzleId(undefined)
      },
      unauthorizedFn: () => {
        enqueueSnackbar('Unauthorized')
        session.clear()
      },
      statusFns: {
        400: (response) => {
          if (response.hasOwnProperty('error')) {
            enqueueSnackbar(`Error: ${response.error}`)
            console.log(response.error)
          } else {
            switch (response.reason) {
              case 'solved':
                enqueueSnackbar('Puzzle Already Solved')
                break
              case 'solved_other':
                break
              case 'incorrect':
                enqueueSnackbar('Incorrect ' + response.message)
                break
              case 'solutionempty':
                enqueueSnackbar(response.message)
                break
              default:
                console.log(response)
            }
          }
        },
        500: (response) => {
          enqueueSnackbar('Received Internal Server Error')
          console.log(response)
        },
      },
      always: () => {
        props.setLoadingOpen(false)
      },
      onError: (error: any) => {
        enqueueSnackbar('Unexpected error ocurred in fetch process')
        console.log(error)
      },
    })
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel htmlFor="grouped-native-select">Puzzle</InputLabel>
              <Select
                native
                value={submitPuzzleId}
                input={<Input id="grouped-native-select" />}
                onChange={handleSelectPuzzle}
                fullWidth
              >
                <option value="" />
                {Object.keys(props.puzzles).map((key) => {
                  return (
                    <optgroup key={key} label={key}>
                      {props.puzzles[key].map((puzzle) => {
                        return (
                          <option
                            key={puzzle.id}
                            value={puzzle.id}
                            disabled={props.solved.indexOf(puzzle.id) != -1}
                          >
                            {puzzle.name}
                          </option>
                        )
                      })}
                    </optgroup>
                  )
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              select
              label="Attribution"
              name="attribution"
              value={attribution}
              helperText="Select who solved this puzzle"
              fullWidth={true}
              onChange={handleChangeAttribution}
            >
              {props.players.map((player) => (
                <MenuItem key={player[1]} value={player[1]}>
                  {player[0]}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" type="submit" fullWidth>
              Force Submit
            </Button>
          </Grid>
        </Grid>
      </form>
    </div>
  )
}

PuzzleSubmission.propTypes = {
  participant: PropTypes.object.isRequired,
  players: PropTypes.array.isRequired,
  puzzles: PropTypes.object.isRequired,
  solved: PropTypes.array.isRequired,
  setLoadingOpen: PropTypes.func.isRequired,
}

interface HintsControlPropsInterface {
  participant_id: number
  hints: number
}

const HintsControl = (props: HintsControlPropsInterface) => {
  const [hints, setHints] = useState(props.hints)
  const [hintsClaim, setHintsClaim] = useState(1)
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    setHints(props.hints)
  }, [props.hints])

  const handleSelectChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setHintsClaim(parseInt(e.target.value))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    let request_body = {
      hints_mod: hintsClaim * -1,
    }

    if (hints - hintsClaim < 0) {
      enqueueSnackbar('Cannot claim more hints than available')
      return
    }

    await makeFetch({
      url: `/api/mgmt/participants/patch/${props.participant_id}`,
      method: 'PATCH',
      body: request_body,
      successFn: () => {
        enqueueSnackbar('Hints Claimed')
      },
    })
  }

  return (
    <React.Fragment>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6">Hints: {hints}</Typography>
        </Grid>
      </Grid>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              select
              label="Claim Hints"
              name="hintsClaim"
              value={hintsClaim}
              onChange={handleSelectChange}
              fullWidth
            >
              {Array.from({ length: 5 }, (x, i) => i + 1).map((key) => (
                <MenuItem key={key} value={key}>
                  {key}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" type="submit" fullWidth>
              Claim Hints
            </Button>
          </Grid>
        </Grid>
      </form>
    </React.Fragment>
  )
}

HintsControl.propTypes = {
  participant_id: PropTypes.number.isRequired,
  hints: PropTypes.number.isRequired,
}

interface TeamControlPropsInterface {
  color: ColorType
  participant: ConsoleParticipantInterface
  puzzles: ConsoleCategoriesInterface
  players: ConsolePlayersType
  solved: ConsoleSolvedType
  setLoadingOpen: (value: boolean) => void
}

type updateHandlerEventFunctionType = (e: any) => void
type dashboardHandlerEventFunctionType = (e: any) => void

const TeamControl = (props: TeamControlPropsInterface) => {
  const [color, setColor] = useState(props.color)

  const [participant, setParticipant] = useState(props.participant)
  const [hints, setHints] = useState(props.participant.hints)
  const [hack_score, setHackScore] = useState(props.participant.hack_score)
  const [bonus_score, setBonusScore] = useState(props.participant.bonus_score)
  const [tf2_score, setTF2Score] = useState(props.participant.tf2_score)

  const [players, setPlayers] = useState(props.players)
  const [solved, setSolved] = useState(props.solved)

  const updateEventHandlerRef = useRef<
    updateHandlerEventFunctionType | undefined
  >(undefined)
  const dashboardEventHandlerRef = useRef<
    dashboardHandlerEventFunctionType | undefined
  >(undefined)
  const classes = useStyles()

  useEffect(() => {
    setPlayers(props.players)
  }, props.players)

  useEffect(() => {
    setSolved(props.solved)
  }, props.solved)

  useEffect(() => {
    updateEventHandlerRef.current = updateHandlerEvent
    dashboardEventHandlerRef.current = dashboardHandlerEvent
  })

  useEffect(() => {
    const updateSrc = new EventSource(`/stream/updates/${color}`)
    if (!!updateEventHandlerRef.current) {
      updateSrc.addEventListener('update', (e) => {
        updateEventHandlerRef.current!(e)
      })
    }
    const dashboardSrc = new EventSource(`/stream/dashboard/${color}`)
    if (!!dashboardEventHandlerRef.current) {
      dashboardSrc.addEventListener('dashboard', (e) => {
        dashboardEventHandlerRef.current!(e)
      })
    }
    updateSrc.onerror = (e) => {
      console.log(e)
    }

    dashboardSrc.onerror = (e) => {
      console.log(e)
    }

    return () => {
      console.log('Closing Event Sources')
      updateSrc.close()
      dashboardSrc.close()
    }
  }, [color])

  const updateHints = (hints_diff: number) => {
    setHints((old_hints) => old_hints + hints_diff)
  }

  const updateSolved = (id: number) => {
    setSolved((old_solved) => [...old_solved, id])
  }

  const updateHackScore = (hack_mod: number) => {
    setHackScore((old_score) => old_score + hack_mod)
  }

  const updateBonusScore = (bonus_mod: number) => {
    setBonusScore((old_score) => old_score + bonus_mod)
  }

  const updateTF2Score = (tf2_mod: number) => {
    setTF2Score((old_score) => old_score + tf2_mod)
  }

  const updateHandlerEvent = (e: any) => {
    // TODO FIXME XXX see if this can be made more specific
    let message = JSON.parse(e.data)
    console.log(message)
    switch (message.type) {
      case 'hint':
        // message.quantity is the difference of hints
        updateHints(parseInt(message.quantity))
        break
      case 'solved':
        updateSolved(message.puzzle)
        break
      case 'unlock':
        break
      // unlockPuzzle(message.puzzle_id)
      // break
      default:
        console.log('Recieved unexpected message')
    }
  }

  const dashboardHandlerEvent = (e: any) => {
    //TODO FIXME XXX
    let message = JSON.parse(e.data)
    console.log(message)
    switch (message.type) {
      case 'update_hack_score':
        updateHackScore(message.hack_score_mod)
        break
      case 'update_bonus_score':
        updateBonusScore(message.bonus_score_mod)
        break
      case 'update_tf2_score':
        updateTF2Score(message.tf2_score_mod)
        break
      default:
        console.log('Recieved unexpected message')
    }
  }

  let score = hack_score + bonus_score + tf2_score

  return (
    <Paper elevation={2}>
      <Container>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography
              className={clsx(classes.allTeam, {
                [classes.redTeam]: color == 'red',
                [classes.blueTeam]: color == 'blue',
              })}
              variant="h5"
              align="center"
            >
              {participant.team.name} ({score})
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <HintsControl participant_id={participant.id} hints={hints} />
          </Grid>
          <Grid item xs={12}>
            <BonusControl participant_id={participant.id} />
          </Grid>
        </Grid>
        <Divider />
        <div className={classes.spacer}></div>
        <Grid item xs={12}>
          <PuzzleSubmission
            participant={participant}
            players={players}
            puzzles={props.puzzles}
            solved={solved}
            setLoadingOpen={props.setLoadingOpen}
          />
        </Grid>
      </Container>
    </Paper>
  )
}

TeamControl.propTypes = {
  participant: PropTypes.object.isRequired,
  players: PropTypes.array.isRequired,
  solved: PropTypes.array.isRequired,
  puzzles: PropTypes.object.isRequired,
  setLoadingOpen: PropTypes.func.isRequired,
}

interface JudgePanelPropsInterface {
  consoleData: ConsoleInterface
  fetchData: () => void
}

const useJudgePanelStyles = makeStyles((theme: Theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}))

const JudgePanel = ({ consoleData, fetchData }: JudgePanelPropsInterface) => {
  const [roundName, setRoundName] = useState(consoleData.round.name)
  const [participants, setParticipants] = useState(consoleData.participants)
  const [puzzles, setPuzzles] = useState(consoleData.puzzles)
  const [gameTime, setGameTime] = useState(consoleData.gametime)
  const [loadingOpen, setLoadingOpen] = useState(false)
  const classes = useJudgePanelStyles()

  return (
    <div>
      <Container>
        <Backdrop className={classes.backdrop} open={loadingOpen}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5" align="center">
              {roundName}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TeamControl
              color="red"
              participant={participants[0].participant}
              players={participants[0].players}
              solved={participants[0].solved}
              puzzles={puzzles}
              setLoadingOpen={setLoadingOpen}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TeamControl
              color="blue"
              participant={participants[1].participant}
              players={participants[1].players}
              solved={participants[1].solved}
              puzzles={puzzles}
              setLoadingOpen={setLoadingOpen}
            />
          </Grid>
        </Grid>
      </Container>
    </div>
  )
}

const JudgePanelLoader = ({}) => {
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
        <JudgePanel consoleData={consoleData} fetchData={fetchData} />
      </React.Fragment>
    )
  }
}

export default JudgePanelLoader
