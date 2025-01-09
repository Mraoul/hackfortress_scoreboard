import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import List from '@material-ui/core/List'
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

interface PlayerScoresInterface {
  [round_id: string]: number // TODO FIXME need to double check if this is correct key
}

interface PlayerPointsInterface {
  name: string
  scores: PlayerScoresInterface
}

interface PlayerPointsTeamInterface {
  [team_name: string]: Array<PlayerPointsInterface>
}

interface PlayerScorePropsInterface {
  name: string
  scores: PlayerScoresInterface
  maxRounds: number
}

const PlayerScore = (props: PlayerScorePropsInterface) => {
  const [name, setName] = useState(props.name)
  const [scores, setScores] = useState(props.scores)
  const [maxRounds, setMaxRounds] = useState(props.maxRounds)

  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  useEffect(() => {
    setName(props.name)
    setScores(props.scores)
    setMaxRounds(props.maxRounds)
  }, [props.name, props.scores, props.maxRounds])

  let columns = []
  let total = 0
  for (let i = 1; i <= maxRounds; i++) {
    if (Object.keys(scores).includes(i.toString())) {
      let value = scores[i.toString()]
      total += value
      columns.push(<TableCell key={i}>{value}</TableCell>)
    } else {
      columns.push(<TableCell key={i}> &nbsp; </TableCell>)
    }
  }

  return (
    <TableRow>
      <TableCell>{name}</TableCell>
      {columns.map((cell) => cell)}
      <TableCell>{total}</TableCell>
    </TableRow>
  )
}

PlayerScore.propTypes = {
  name: PropTypes.string.isRequired,
  scores: PropTypes.object.isRequired,
  maxRounds: PropTypes.number.isRequired,
}

interface TeamPropsInterface {
  scores: Array<PlayerPointsInterface>
  teamName: string
  maxRounds: number
}

const Team = (props: TeamPropsInterface) => {
  const [scores, setScores] = useState(props.scores)
  const [teamName, setTeamName] = useState(props.teamName)
  const [maxRounds, setMaxRounds] = useState(props.maxRounds)

  useEffect(() => {
    setScores(props.scores)
    setTeamName(props.teamName)
    setMaxRounds(props.maxRounds)
  }, [props.scores, props.teamName, props.maxRounds])

  let columns = []
  for (let i = 1; i <= maxRounds; i++) {
    columns.push(<TableCell key={i}> Round {i} </TableCell>)
  }

  return (
    <React.Fragment>
      <Typography variant="h6">{teamName}</Typography>
      <List>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell> Player </TableCell>
                {columns.map((cell) => cell)}
                <TableCell> Total </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scores.map((player) => (
                <PlayerScore
                  key={player.name}
                  name={player.name}
                  scores={player.scores}
                  maxRounds={maxRounds}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </List>
    </React.Fragment>
  )
}

Team.propTypes = {
  scores: PropTypes.array.isRequired,
  teamName: PropTypes.string.isRequired,
  maxRounds: PropTypes.number.isRequired,
}

const PlayerScores = ({}) => {
  const [teams, setTeams] = useState<PlayerPointsTeamInterface>({})
  const [maxRounds, setMaxRounds] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const session = useSession()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    await makeFetch({
      url: '/api/mgmt/player_points/',
      successFn: (data) => {
        setTeams(data.teams)
        setMaxRounds(data.max_rounds)
      },
      unauthorizedFn: () => {
        if (session != null) {
          session.clear()
        }
      },
    })

    setLoaded(true)
  }

  if (!loaded) {
    return <Loading />
  }

  return (
    <div>
      <Typography variant="h4">Player Scores</Typography>
      {Object.entries(teams).map(([name, scores]) => (
        <Team
          key={name}
          teamName={name}
          scores={scores}
          maxRounds={maxRounds}
        />
      ))}
    </div>
  )
}

PlayerScores.propTypes = {}

export default PlayerScores
