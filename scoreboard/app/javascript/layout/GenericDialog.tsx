import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Theme, makeStyles } from '@material-ui/core/styles'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import Typography from '@material-ui/core/Typography'
import MuiDialogTitle from '@material-ui/core/DialogTitle'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

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

interface GenericDialogPropsInterface {
  dialogTitle: string
  dialogContent: React.ReactNode
  onClose: () => void
  open: boolean
}

const GenericDialog = (props: GenericDialogPropsInterface) => {
  const [dialogTitle, setDialogTitle] = useState(props.dialogTitle)
  const [dialogContent, setDialogContent] = useState(props.dialogContent)
  const classes = useStyles()

  useEffect(() => {
    setDialogTitle(props.dialogTitle)
  }, [props.dialogTitle])

  useEffect(() => {
    setDialogContent(props.dialogContent)
  }, [props.dialogContent])

  const handleClose = () => {
    props.onClose()
  }

  return (
    <Dialog onClose={handleClose} open={props.open}>
      <MuiDialogTitle disableTypography className={classes.root}>
        <Typography variant="h6">{dialogTitle}</Typography>
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={handleClose}
        >
          <CloseIcon />
        </IconButton>
      </MuiDialogTitle>
      <DialogContent>{dialogContent}</DialogContent>
    </Dialog>
  )
}

GenericDialog.propTypes = {
  dialogTitle: PropTypes.string.isRequired,
  dialogContent: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
}

export default GenericDialog
