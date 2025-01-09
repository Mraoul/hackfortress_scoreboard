import React, { useState, useEffect } from 'react'

import Typography from '@material-ui/core/Typography'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import { makeFetch } from '../../helpers/MakeFetch'

interface SubmissionAttemptInterface {
  id: number
  puzzle_id: number
  participant_id: number
  player_id: number
  solution: string
  player: {
    name: string
    team: { name: string }
  }
  puzzle: {
    name: string
  }
}

type SubmissionAttemptsType = Array<SubmissionAttemptInterface>

interface SubmissionAttemptPropsInterface {
  attempt: SubmissionAttemptInterface
}

const SubmissionAttempt = (props: SubmissionAttemptPropsInterface) => {
  return (
    <TableRow>
      <TableCell>{props.attempt.player.team.name}</TableCell>
      <TableCell>{props.attempt.puzzle.name}</TableCell>
      <TableCell>{props.attempt.player.name}</TableCell>
    </TableRow>
  )
}

const SubmissionAttempts = ({}) => {
  const [attempts, setAttempts] = useState<SubmissionAttemptsType>([])

  const fetchSubmissionAttempts = async () => {
    await makeFetch({
      url: '/api/mgmt/submission_attempts/',
      successFn: (data) => {
        console.log(data)
        setAttempts(data as SubmissionAttemptsType)
      },
      unexpectedRespFn: (data, response) => console.log(response),
    })
  }

  useEffect(() => {
    fetchSubmissionAttempts()
  }, [])

  return (
    <div>
      <Typography variant="h4">Submission Attempts</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Team</TableCell>
              <TableCell>Puzzle</TableCell>
              <TableCell>Player</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attempts.map((attempt) => (
              <SubmissionAttempt key={attempt.id} attempt={attempt} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

export default SubmissionAttempts
