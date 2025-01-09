import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import Typography from '@material-ui/core/Typography'
import { makeFetch } from '../../helpers/MakeFetch'
import { useSession } from '../../helpers/Session'
import Loading from '../../layout/Loading'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'

interface ParticipantInterface {
  id: number
  hack_score: number
  bonus_score: number
  tf2_score: number
  hackcoins: number
  hints: number
  tf2coins: number
  round: {
    name: string
  }
  team: {
    name: string
  }
}

type ParticipantsType = Array<ParticipantInterface>

interface ParticipantPropsInterface {
  roundName: string
  teamName: string
  scores: {
    hack: number
    bonus: number
    tf2: number
  }
  coins: {
    hack: number
    tf2: number
  }
  hints: number
}

const Participant = (props: ParticipantPropsInterface) => {
  const [roundName, setRoundName] = useState(props.roundName)
  const [teamName, setTeamName] = useState(props.teamName)
  const [scores, setScores] = useState(props.scores)
  const [coins, setCoins] = useState(props.coins)
  const [hints, setHints] = useState(props.hints)

  return (
    <TableRow>
      <TableCell> {roundName} </TableCell>
      <TableCell> {teamName} </TableCell>
      <TableCell> {scores.hack} </TableCell>
      <TableCell> {scores.bonus} </TableCell>
      <TableCell> {scores.tf2} </TableCell>
      <TableCell> {coins.hack} </TableCell>
      <TableCell> {coins.tf2} </TableCell>
      <TableCell> {hints} </TableCell>
      <TableCell> {scores.hack + scores.tf2 + scores.bonus} </TableCell>
    </TableRow>
  )
}

Participant.propTypes = {
  roundName: PropTypes.string.isRequired,
  teamName: PropTypes.string.isRequired,
  scores: PropTypes.object.isRequired,
  coins: PropTypes.object.isRequired,
  hints: PropTypes.number.isRequired,
}

const Participants = ({}) => {
  const [participants, setParticipants] = useState<ParticipantsType>([])
  const [loaded, setLoaded] = useState(false)
  const session = useSession()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    await makeFetch({
      url: '/api/mgmt/participants/',
      successFn: (data: any) => {
        setParticipants(data as ParticipantsType)
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
      <Typography variant="h4">Participants</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell> Round </TableCell>
              <TableCell> Team </TableCell>
              <TableCell> Hack Score </TableCell>
              <TableCell> Bonus Score </TableCell>
              <TableCell> TF2 Score </TableCell>
              <TableCell> Hack Coins </TableCell>
              <TableCell> TF2 Coins </TableCell>
              <TableCell> Hints </TableCell>
              <TableCell> Total Score </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {participants.map((participant) => (
              <Participant
                key={participant.id}
                teamName={participant.team ? participant.team.name : ''}
                roundName={participant.round ? participant.round.name : ''}
                scores={{
                  hack: participant.hack_score,
                  tf2: participant.tf2_score,
                  bonus: participant.bonus_score,
                }}
                coins={{
                  hack: participant.hackcoins,
                  tf2: participant.tf2coins,
                }}
                hints={participant.hints}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

Participants.propTypes = {}

export default Participants
