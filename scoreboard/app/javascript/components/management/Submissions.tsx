import React, { useState, useEffect } from 'react'
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
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import { makeFetch } from '../../helpers/MakeFetch'

interface SubmissionInterface {
  id: number
  participant_id: number
  puzzle_id: number
  value: number
  player_id: number
  fdr: string
  player: {
    name: string
    team: {
      name: string
    }
  }
  puzzle: {
    name: string
  }
}

type SubmissionsType = Array<SubmissionInterface>

interface SubmissionPropsInterface {
  submission: SubmissionInterface
}

const Submission = (props: SubmissionPropsInterface) => {
  return (
    <TableRow>
      <TableCell>{props.submission.player.team.name}</TableCell>
      <TableCell>{props.submission.puzzle.name}</TableCell>
      <TableCell>{props.submission.value}</TableCell>
      <TableCell>{props.submission.player.name}</TableCell>
    </TableRow>
  )
}

const Submissions = ({}) => {
  const [submissions, setSubmissions] = useState<SubmissionsType>([])

  const fetchSubmissions = async () => {
    await makeFetch({
      url: '/api/mgmt/submissions/',
      successFn: (data) => {
        console.log(data)
        setSubmissions(data as SubmissionsType)
      },
      unexpectedRespFn: (data, response) => console.log(response),
    })
  }

  useEffect(() => {
    fetchSubmissions()
  }, [])

  return (
    <div>
      <Typography variant="h4">Submissions</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Team</TableCell>
              <TableCell>Puzzle</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Player</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.map((submission) => (
              <Submission key={submission.id} submission={submission} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

export default Submissions
