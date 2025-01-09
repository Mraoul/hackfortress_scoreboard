import React, { Component, useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'

import { Theme, makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Typography from '@material-ui/core/Typography'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import MuiDialogTitle from '@material-ui/core/DialogTitle'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import CloudDownloadIcon from '@material-ui/icons/CloudDownload'

import { Link } from 'react-router-dom'

import PuzzleForm from './PuzzleForm'
import type { PlayersInterface, PuzzleInterface, SolvedInterface } from './def'
import { downloadFile, makeFetch } from '../../helpers/MakeFetch'
import { useSnackbar } from 'notistack'
import { LinearProgress } from '@material-ui/core'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  dialogAction: {
    display: 'blocK',
  },
}))

interface PuzzleCardPropsInterface {
  data: PuzzleInterface
  solved: string | false
  players: PlayersInterface
  team_id: number
  isJudge: boolean
  show: boolean
  judgeView: boolean
  hideCard: () => void
}

const PuzzleCard = (props: PuzzleCardPropsInterface) => {
  const [data, setData] = useState(props.data)
  const [solved, setSolved] = useState(props.solved)
  const [show, setShow] = useState(props.show)
  const classes = useStyles()
  const [downloading, setDownloading] = useState(false)
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const handleDownload = async (data_url: string) => {
    downloadFile({
      fileUrl: data_url,
      forbiddenFn(data) {
        enqueueSnackbar('Not authorized to download file')
      },
      statusFns: {
        '503': (data) =>
          enqueueSnackbar(`Unable to download file: ${data.error}`),
      },
      onError(error) {
        enqueueSnackbar('Unexpected error, Please refresh and try again')
      },
      setDownloading,
    })
  }

  useEffect(() => {
    setData(props.data)
  }, [props.data])

  useEffect(() => {
    setSolved(props.solved)
  }, [props.solved])

  useEffect(() => {
    setShow(props.show)
  }, [props.show])

  let puzzle_name
  let puzzle_form
  let puzzle_data

  if (data.status == 'unlocked' || props.judgeView) {
    let data_location: React.ReactNode = data.data
    if (
      data.hasOwnProperty('data_source') &&
      ['gcloud', 'local'].includes(data.data_source)
    ) {
      const data_url = `/api/puzzle/download/${data.id}`
      data_location = (
        <React.Fragment>
          <Button
            size="small"
            variant="outlined"
            startIcon={<CloudDownloadIcon />}
            onClick={() => handleDownload(data_url)}
          >
            Download
          </Button>
          {downloading ? <LinearProgress /> : <React.Fragment />}
        </React.Fragment>
      )
    }

    puzzle_name = data.name
    puzzle_data = (
      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Name:</TableCell>
              <TableCell>{data.name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Location:</TableCell>
              <TableCell>{data_location}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Points:</TableCell>
              <TableCell>{data.points}</TableCell>
            </TableRow>
            {data.hasOwnProperty('author') && (
              <TableRow>
                <TableCell>Author:</TableCell>
                <TableCell>{data.author}</TableCell>
              </TableRow>
            )}
            {data.hasOwnProperty('hints') && (
              <TableRow>
                <TableCell>Hints:</TableCell>
                <TableCell>{data.hints}</TableCell>
              </TableRow>
            )}
            {data.hasOwnProperty('solution') && (
              <TableRow>
                <TableCell>Solution:</TableCell>
                <TableCell>{data.solution}</TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell>Description:</TableCell>
              <TableCell>{data.description}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    )

    if (!props.judgeView) {
      if (!!solved) {
        puzzle_form = <div>Solved by {solved}</div>
      } else {
        puzzle_form = (
          <PuzzleForm
            data={data}
            players={props.players}
            team_id={props.team_id}
            hideCard={props.hideCard}
            isJudge={props.isJudge}
          />
        )
      }
    }
  }

  return (
    <Dialog maxWidth="md" onClose={props.hideCard} open={show}>
      <MuiDialogTitle disableTypography className={classes.root}>
        <Typography variant="h6">{puzzle_name}</Typography>
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={props.hideCard}
        >
          <CloseIcon />
        </IconButton>
      </MuiDialogTitle>

      <DialogContent>
        {puzzle_data}
        <DialogActions className={classes.dialogAction}>
          {puzzle_form}
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

//PropTypes
PuzzleCard.propTypes = {
  data: PropTypes.object.isRequired,
  solved: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
  players: PropTypes.array.isRequired,
  team_id: PropTypes.number.isRequired,
  show: PropTypes.bool.isRequired,
  hideCard: PropTypes.func.isRequired,
  isJudge: PropTypes.bool.isRequired,
  judgeView: PropTypes.bool.isRequired,
}

export default PuzzleCard
