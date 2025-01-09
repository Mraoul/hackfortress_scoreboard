import React, { useState, useEffect } from 'react'

import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'

import Loading from '../../layout/Loading'
import { makeFetch } from '../../helpers/MakeFetch'

interface PurchaseInterface {
  id: number
  sale_ratio: number
  item: {
    name: string
    cost: number
    discountable: boolean
  }
  participant: {
    round: {
      id: number
      name: string
    }
    team: {
      name: string
    }
  }
}

type PurchasesType = Array<PurchaseInterface>

const Purchases = ({}) => {
  const [purchases, setPurchases] = useState<PurchasesType>([])

  const fetchPurchase = async () => {
    await makeFetch({
      url: `/api/mgmt/purchases/`,
      successFn: (data) => {
        setPurchases(data.current_purchases)
      },
    })
  }

  useEffect(() => {
    fetchPurchase()
  }, [])

  if (purchases == undefined) {
    return <Loading />
  }

  const calcCost = (purchase: PurchaseInterface) => {
    if (purchase.item.discountable) {
      let cost = Math.floor((purchase.item.cost * purchase.sale_ratio) / 100.0)
      if (cost == 0) {
        cost = 1
      }
      return cost
    } else {
      return purchase.item.cost
    }
  }

  return (
    <div>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Round</TableCell>
              <TableCell>Team</TableCell>
              <TableCell>Item</TableCell>
              <TableCell>Sale</TableCell>
              <TableCell>Cost</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {purchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell>{purchase.participant.round.name}</TableCell>
                <TableCell>{purchase.participant.team.name}</TableCell>
                <TableCell>{purchase.item.name}</TableCell>
                <TableCell>{purchase.sale_ratio}</TableCell>
                <TableCell>{calcCost(purchase)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

Purchases.propTypes = {}

export default Purchases
