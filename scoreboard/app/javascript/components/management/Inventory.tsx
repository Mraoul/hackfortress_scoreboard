import React, { useState, useEffect } from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import UpdateIcon from '@material-ui/icons/Update'

import { Route } from 'react-router'
import { useRouteMatch } from 'react-router-dom'
import GenericNavigation from '../../layout/Navigation'
import Loading from '../../layout/Loading'
import { Grid } from '@material-ui/core'
import { useSnackbar } from 'notistack'
import { makeFetch } from '../../helpers/MakeFetch'
import { useSession } from '../../helpers/Session'

interface RoundParticipant {
  id: number
  team_id: number
}

interface RoundInterface {
  id: number
  name: string
  live: boolean
  puzzleset_id: number
  prepped: boolean
  participants: Array<RoundParticipant>
}

type RoundsListType = Array<RoundInterface>

interface InventoryItemColorInterface {
  id: number
  participant_id: number
  item_id: number
  quantity: number
  created_at: string
  updated_at: string
}

interface InventoryItemInterface {
  name: string
  status: {
    red: InventoryItemColorInterface
    blue: InventoryItemColorInterface
  }
}

type InventoryListType = Array<InventoryItemInterface>

interface RoundInventory {
  name: string
  inventory: InventoryListType
}

interface InventoryItemStockPropsInterface {
  color: string
  status: InventoryItemColorInterface
}

export const InventoryItemStock = (props: InventoryItemStockPropsInterface) => {
  const [quantity, setQuantity] = useState<number>(props.status.quantity)
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const session = useSession()

  const handleOnSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    let request_body = {
      id: props.status.id,
      inventory: {
        quantity: quantity,
      },
    }

    makeFetch({
      url: `/api/mgmt/inventories/${props.status.id}`,
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

  const handleOnChange = (event: React.FormEvent<HTMLFormElement>) => {
    const target = event.target as HTMLInputElement
    setQuantity(parseInt(target.value))
  }

  let label
  if (props.color == 'red') {
    label = 'Red Stock'
  } else {
    label = 'Blue Stock'
  }

  return (
    <React.Fragment>
      <form onSubmit={handleOnSubmit} onChange={handleOnChange}>
        <Grid container spacing={1}>
          <Grid item>
            <TextField
              label={label}
              name="quantity"
              type="text"
              placeholder={label}
              value={quantity}
            />
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              type="submit"
              startIcon={<UpdateIcon />}
            >
              Update
            </Button>
          </Grid>
        </Grid>
      </form>
    </React.Fragment>
  )
}

interface InventoryPropsInterface {
  catalogPath: string
  rounds: RoundsListType
}

export const Inventory = (props: InventoryPropsInterface) => {
  const [loaded, setLoaded] = useState(false)
  const [inventory, setInventory] = useState<InventoryListType>([])
  const match = useRouteMatch<{ roundId: string }>()
  const session = useSession()

  useEffect(() => {
    fetchInventory()
  }, [match.params.roundId])

  const fetchInventory = async () => {
    await makeFetch({
      url: `/api/mgmt/inventories/round/${match.params.roundId}`,
      successFn: (data) => {
        setInventory(data.inventory)
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
      <GenericNavigation
        parentPath={props.catalogPath}
        parentString="Inventory"
        childPaths={props.rounds}
        childString="Round"
        selectedChildPathId={parseInt(match.params.roundId)}
      />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item Name</TableCell>
              <TableCell>Red Stock</TableCell>
              <TableCell>Blue Stock</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.name}>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  <InventoryItemStock color="red" status={item.status.red} />
                </TableCell>
                <TableCell>
                  <InventoryItemStock color="blue" status={item.status.blue} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

interface InventoryCatalogPropsInterface {
  catalogPath: string
}

export const InventoryCatalog = (props: InventoryCatalogPropsInterface) => {
  const [loaded, setLoaded] = useState(false)
  const [rounds, setRounds] = useState<RoundsListType>([])
  const match = useRouteMatch()
  const session = useSession()

  useEffect(() => {
    fetchInventories()
  }, [])

  const fetchInventories = async () => {
    await makeFetch({
      url: '/api/mgmt/rounds',
      successFn: (data) => {
        setRounds(data.rounds)
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
      <Route
        exact
        path={`${match.path}/`}
        render={() => {
          return (
            <div>
              <GenericNavigation
                parentPath={props.catalogPath}
                parentString="Inventory"
                childPaths={rounds}
                childString="Round"
              />
            </div>
          )
        }}
      />
      <Route
        path={`${match.path}/:roundId`}
        render={() => {
          return <Inventory rounds={rounds} catalogPath={props.catalogPath} />
        }}
      />
    </div>
  )
}

export default InventoryCatalog
