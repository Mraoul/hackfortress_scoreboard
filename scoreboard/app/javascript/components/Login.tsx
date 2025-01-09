import React, { useState, useEffect, useContext } from 'react'
import { Redirect } from 'react-router'
import { useHistory } from 'react-router-dom'
import Cookies from 'js-cookie'

import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import CssBaseline from '@material-ui/core/CssBaseline'
import TextField from '@material-ui/core/TextField'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined'
import Typography from '@material-ui/core/Typography'
import { makeStyles, Theme } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

import { dashboardPath } from '../helpers/PagePaths'
import { useSession, setJwtToken } from '../helpers/Session'
import { makeFetch } from '../helpers/MakeFetch'

const styles = (theme: Theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    // TODO FIXME https://github.com/cssinjs/jss/issues/1344
    flexDirection: 'column' as 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
})

const useStyles = makeStyles(styles)

export const LoginPage = ({}) => {
  const [show, setShow] = useState(false)
  const [formState, setFormState] = useState({
    user: '',
    pass: '',
  })

  let history = useHistory()
  const classes = useStyles()
  const session = useSession()

  useEffect(() => {
    if (session.authenticated) {
      history.push(dashboardPath)
    }
  }, [session.authenticated])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    var request_body = formState

    makeFetch({
      url: '/api/login',
      method: 'POST',
      body: request_body,
      sendToken: false,
      successFn: (data) => {
        setJwtToken(data.token)
        session.refresh()
      },
      unauthorizedFn: () => {
        handleShow()
      },
    })
  }

  const handleChange = (event: React.FormEvent<HTMLFormElement>) => {
    const target = event.target as HTMLInputElement
    setFormState({ ...formState, [target.name]: target.value })
  }

  const handleShow = () => {
    setShow(true)
  }

  const handleClose = () => {
    setShow(false)
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <form
          className={classes.form}
          noValidate
          onSubmit={handleSubmit}
          onChange={handleChange}
        >
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Username"
            name="user"
            autoFocus
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="pass"
            label="Password"
            type="password"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Sign In
          </Button>
        </form>
        <Snackbar
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          open={show}
          autoHideDuration={3000}
          onClose={handleClose}
          message="Unable to Authenticate!"
          action={
            <React.Fragment>
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={handleClose}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </React.Fragment>
          }
        />
      </div>
    </Container>
  )
}

export default LoginPage
