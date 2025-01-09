import React, { useState, useEffect } from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import UpdateIcon from '@material-ui/icons/Update'
import RotateLeftIcon from '@material-ui/icons/RotateLeft'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import { useSnackbar } from 'notistack'
import Loading from '../../layout/Loading'
import { makeFetch } from '../../helpers/MakeFetch'
import { useSession } from '../../helpers/Session'

interface StoreInterface {
  status_red: number
  status_blue: number
  sale_ratio: number
}

const Store = ({}) => {
  const [saleRatio, setSaleRatio] = useState<number | undefined>(100)
  const [redStatus, setRedStatus] = useState(true)
  const [blueStatus, setBlueStatus] = useState(true)
  const [ready, setReady] = useState(false)
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const session = useSession()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    await makeFetch({
      url: '/api/mgmt/stores',
      successFn: (data) => {
        data as StoreInterface
        setSaleRatio(data.sale_ratio)
        setRedStatus(data.status_red == 0)
        setBlueStatus(data.status_blue == 0)
      },
      unauthorizedFn: () => {
        if (session != null) {
          session.clear()
        }
      },
    })

    setReady(true)
  }

  const handleStoreReset = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()

    if (!confirm('Reset Store. Are you sure?')) {
      return
    }

    makeFetch({
      url: '/api/mgmt/stores/reset',
      method: 'POST',
      successFn: () => enqueueSnackbar('Store Reset'),
      unauthorizedFn: () => {
        if (session != null) {
          session.clear()
        }
      },
    })
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    let request_body = {
      store: {
        sale_ratio: saleRatio,
      },
    }

    makeFetch({
      url: '/api/mgmt/stores',
      method: 'PUT',
      body: request_body,
      successFn: () => enqueueSnackbar('Updated'),
      unauthorizedFn: () => {
        if (session != null) {
          session.clear()
        }
      },
    })
  }

  const handleChange = (event: React.FormEvent<HTMLFormElement>) => {
    const target = event.target as HTMLInputElement
    const sale_ratio_num = parseInt(target.value)
    if (isNaN(sale_ratio_num)) {
      setSaleRatio(undefined)
    } else {
      setSaleRatio(sale_ratio_num)
    }
  }

  if (!ready) {
    return <Loading />
  }

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit} onChange={handleChange}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Reset Store</TableCell>
                <TableCell>Red Store</TableCell>
                <TableCell>Blue Store</TableCell>
                <TableCell>Sale Ratio</TableCell>
                <TableCell>&nbsp;</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Button
                    href="#"
                    variant="contained"
                    startIcon={<RotateLeftIcon />}
                    onClick={handleStoreReset}
                  >
                    Reset Store
                  </Button>
                </TableCell>
                <TableCell>{redStatus ? 'Up' : 'Down'}</TableCell>
                <TableCell>{blueStatus ? 'Up' : 'Down'}</TableCell>
                <TableCell>
                  <TextField
                    label="Sale Ratio"
                    name="saleRatio"
                    type="text"
                    placeholder="Sale Ratio"
                    value={saleRatio}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    type="submit"
                    startIcon={<UpdateIcon />}
                  >
                    Update
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </form>
    </React.Fragment>
  )
}

export default Store
