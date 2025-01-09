import React, { Component, useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import { makeFetch } from '../../helpers/MakeFetch'

interface PuzzleStatsListInterface {
  name: string
}

interface PuzzleStatsNameCountInterface {
  name: string
  count: number
}

interface PuzzleStatsNumTimeSolvedInterface {
  name: string
  count: number
  puzzleset: string
}

interface PuzzleStatsSolvedByTeamInterface {
  puzzle: string
  team: string
}

interface PuzzleStatsAttemptsByTeamInterface {
  puzzle: string
  team: string
  attempts: number
}

type PuzzleStatsListType = Array<PuzzleStatsListInterface>

interface PuzzleStatsInterface {
  solved: Array<PuzzleStatsListInterface>
  unsolved: Array<PuzzleStatsListInterface>
  unattempted: Array<PuzzleStatsListInterface>
  solvedByCategory: Array<PuzzleStatsNameCountInterface>
  unsolvedByCategory: Array<PuzzleStatsNameCountInterface>
  unattemptedByCategory: Array<PuzzleStatsNameCountInterface>
  numTimeSolved: Array<PuzzleStatsNumTimeSolvedInterface>
  attemptsByPuzzle: Array<PuzzleStatsNameCountInterface>
  solvedByTeam: Array<PuzzleStatsSolvedByTeamInterface>
  attemptsByTeam: Array<PuzzleStatsAttemptsByTeamInterface>
}

interface ListBuilderPropsInterface {
  dataHeader: string
  dataList: Array<any>
}

const ListBuilder = (props: ListBuilderPropsInterface) => {
  return (
    <div>
      <Typography variant="h5"> {props.dataHeader}</Typography>
      <List>
        {props.dataList.map((item, index) => (
          <ListItem key={index}>{item.name}</ListItem>
        ))}
      </List>
    </div>
  )
}

ListBuilder.propTypes = {
  dataList: PropTypes.array.isRequired,
  dataHeader: PropTypes.string.isRequired,
}

interface ByCategoryBuilderPropsInterface {
  dataHeader: string
  dataList: Array<PuzzleStatsNameCountInterface>
}

const ByCategoryBuilder = (props: ByCategoryBuilderPropsInterface) => {
  return (
    <div>
      <Typography variant="h5">{props.dataHeader}</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Category</TableCell>
              <TableCell>Count</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.dataList.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

ByCategoryBuilder.propTypes = {
  dataHeader: PropTypes.string.isRequired,
  dataList: PropTypes.array.isRequired,
}

const PuzzleStats = ({}) => {
  const [stats, setStats] = useState<PuzzleStatsInterface | undefined>(
    undefined
  )

  const fetchPuzzleStats = async () => {
    await makeFetch({
      url: '/api/mgmt/puzzles/stats',
      successFn: (data) => setStats(data as PuzzleStatsInterface),
      unexpectedRespFn: (data, response) => console.log(response),
    })
  }

  useEffect(() => {
    fetchPuzzleStats()
  }, [])

  if (stats == undefined) {
    return <div> Loading </div>
  }

  return (
    <div>
      <ListBuilder dataHeader="Solved Puzzles" dataList={stats.solved} />
      <ListBuilder dataHeader="UnSolved Puzzles" dataList={stats.unsolved} />
      <ListBuilder
        dataHeader="UnAttempted Puzzles"
        dataList={stats.unattempted}
      />
      <ByCategoryBuilder
        dataHeader="Solved By Category"
        dataList={stats.solvedByCategory}
      />
      <ByCategoryBuilder
        dataHeader="UnSolved By Category"
        dataList={stats.unsolvedByCategory}
      />
      <ByCategoryBuilder
        dataHeader="UnAttempted By Category"
        dataList={stats.unattemptedByCategory}
      />
      <Typography variant="h5">Number of Times Puzzle Solved</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Puzzle</TableCell>
              <TableCell>Count</TableCell>
              <TableCell>PuzzleSet</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stats.numTimeSolved.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.count}</TableCell>
                <TableCell>{item.puzzleset}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <ByCategoryBuilder
        dataHeader="Attempts by Puzzle"
        dataList={stats.attemptsByPuzzle}
      />
      <Typography variant="h5">Solved By Team</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Puzzle</TableCell>
              <TableCell>Team</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stats.solvedByTeam.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.puzzle}</TableCell>
                <TableCell>{item.team}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="h5">Attempts By Team</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Puzzle</TableCell>
              <TableCell>Team</TableCell>
              <TableCell>Attempts</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stats.attemptsByTeam.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.puzzle}</TableCell>
                <TableCell>{item.team}</TableCell>
                <TableCell>{item.attempts}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

export default PuzzleStats
