import React, {
  Component,
  useState,
  useEffect,
  useRef,
  useContext,
  ChangeEvent,
} from 'react'
import PropTypes from 'prop-types'
import update from 'immutability-helper'

import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import Container from '@material-ui/core/Container'

import { useSession } from '../../helpers/Session'
import Loading from '../../layout/Loading'
import NavBar from '../../layout/NavBar'
import { makeFetch } from '../../helpers/MakeFetch'

import StatusBar from './StatusBar'
import TypeItem from './TypeItem'

import type { ColorType } from '../def'
import {
  StorefrontInterface,
  ParticipantIdType,
  WalletInterface,
  StoreInterface,
  ItemsInterface,
} from './def'
import { useSnackbar } from 'notistack'

type TabPanelType = 'tf2' | 'hack'
type handleEventFunctionType = (e: any) => void // TODO FIXME XXX

interface TabPanelArgsInterface {
  children: React.ReactNode
  value: TabPanelType
  index: TabPanelType
  other?: any
}

const TabPanel = ({
  children,
  value,
  index,
  ...other
}: TabPanelArgsInterface) => {
  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`wrapped-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </Typography>
  )
}

const StorePageLoader = ({}) => {
  const [storeData, setStoreData] = useState<StorefrontInterface | undefined>(
    undefined
  )
  const [eventUrl, setEventUrl] = useState<string | undefined>(undefined)

  const session = useSession()
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  useEffect(() => {
    if (session.user !== undefined) {
      instantiateData()
    }
  }, [session.user])

  const instantiateData = async () => {
    let fetchColor = ''
    if (!!session.user!.color) {
      fetchColor = session.user!.color
    }
    await makeFetch({
      url: `/api/storefront/${fetchColor}`,
      successFn: (data) => {
        setStoreData(data as StorefrontInterface)

        if (
          session.user!.color &&
          ['red', 'blue'].includes(session.user!.color)
        ) {
          setEventUrl(`/stream/wallet/updates/${session.user!.color}`)
        }
      },
      statusFns: {
        '400': (data) => enqueueSnackbar(`Unable to load store: ${data.error}`),
      },
      onError: (error: any) => {
        console.error(error)
      },
    })
  }

  if (session.user === undefined) {
    return <Loading />
  }

  let storeContent = <Loading />
  if (storeData !== undefined) {
    storeContent = <StorePage storeData={storeData} eventUrl={eventUrl} />
  }

  return (
    <>
      <NavBar
        color={session.user!.color as ColorType | undefined}
        changeColorCb={instantiateData}
      />
      {storeContent}
    </>
  )
}

interface StorePagePropsInterface {
  storeData: StorefrontInterface
  eventUrl: string | undefined
}

const StorePage = ({ storeData, eventUrl }: StorePagePropsInterface) => {
  const [items, setItems] = useState<ItemsInterface>(storeData.items)
  const [store, setStore] = useState<StoreInterface>(storeData.store)
  const [wallet, setWallet] = useState<WalletInterface>(storeData.wallet)
  const [participantId, setParticipantId] = useState<ParticipantIdType>(
    storeData.participant.id
  )
  const [color, setColor] = useState<ColorType>(storeData.color)
  const [tab, setTab] = useState<TabPanelType>('tf2')
  const [localEventUrl, setLocalEventUrl] = useState<string | undefined>(
    eventUrl
  )
  const eventHandlerRef = useRef<handleEventFunctionType | undefined>(undefined)

  const session = useSession()

  useEffect(() => {
    eventHandlerRef.current = handleEvent
  })

  useEffect(() => {
    setItems(storeData.items)
    setStore(storeData.store)
    setWallet(storeData.wallet)
    setParticipantId(storeData.participant.id)
    setColor(storeData.color)
  }, [storeData])

  useEffect(() => {
    setLocalEventUrl(eventUrl)
  }, [eventUrl])

  useEffect(() => {
    if (localEventUrl != undefined && eventHandlerRef.current != undefined) {
      const updateSrc = new EventSource(localEventUrl)
      updateSrc.addEventListener(
        'wallet',
        (e) => {
          eventHandlerRef.current!(e)
        },
        false
      )

      updateSrc.onerror = (e) => {
        console.log('Server Event Error')
        console.log(e)
      }
      return () => {
        console.log('Closing Event Source')
        updateSrc.close()
      }
    }
  }, [localEventUrl])

  const updateWallet = (hack_coins: number, tf2_coins: number) => {
    const new_wallet = update(wallet, {
      tf2: { $set: tf2_coins },
      hack: { $set: hack_coins },
    })

    setWallet(new_wallet)
  }

  const handleHackPurchase = (
    group_id: number,
    item_id: number,
    stock_status: number
  ) => {
    const groupIndex = items.hack.findIndex((groupItem) => {
      return groupItem.id == group_id
    })
    const itemIndex = items.hack[groupIndex].items.findIndex((item) => {
      return item.id == item_id
    })
    const newItems = update(items, {
      hack: {
        [groupIndex]: {
          items: { [itemIndex]: { inventory: { $set: stock_status } } },
        },
      },
    })

    setItems(newItems)
  }

  const handleTf2Purchase = (
    group_id: number,
    item_id: number,
    stock_status: number
  ) => {
    const groupIndex = items.tf2.findIndex((groupItem) => {
      return groupItem.id == group_id
    })
    const itemIndex = items.tf2[groupIndex].items.findIndex((item) => {
      return item.id == item_id
    })
    const newItems = update(items, {
      tf2: {
        [groupIndex]: {
          items: { [itemIndex]: { inventory: { $set: stock_status } } },
        },
      },
    })

    setItems(newItems)
  }

  const handleEvent = (e: any) => {
    // TODO FIXME XXX
    let message = JSON.parse(e.data)
    console.log(message)
    updateWallet(message.hack, message.tf2)
  }

  const handleChangeTab = (event: ChangeEvent<{}>, value: TabPanelType) =>
    setTab(value)

  return (
    <div id="store-page">
      {store.status == 'up' ? (
        <Container>
          {localEventUrl != undefined && (
            <StatusBar
              sale_ratio={store.sale_ratio}
              wallet={wallet as WalletInterface}
              color={color as ColorType}
              highlight={tab}
            />
          )}
          <Tabs
            value={tab}
            id="store-tabs"
            indicatorColor="primary"
            textColor="primary"
            onChange={handleChangeTab}
          >
            <Tab value="tf2" label="TF2 Items" />
            <Tab value="hack" label="Hack Items" />
          </Tabs>
          <TabPanel value={tab} index="tf2">
            <TypeItem
              color={color as ColorType}
              itemgroups={items.tf2}
              team_id={participantId}
              handlePurchase={handleTf2Purchase}
              sale_ratio={store.sale_ratio}
            />
          </TabPanel>
          <TabPanel value={tab} index="hack">
            <TypeItem
              color={color as ColorType}
              itemgroups={items.hack}
              team_id={participantId}
              handlePurchase={handleHackPurchase}
              sale_ratio={store.sale_ratio}
            />
          </TabPanel>
        </Container>
      ) : (
        <Typography variant="h5" align="center">
          Store is Down :( Check Back Later (Other team has brought your store
          down)
        </Typography>
      )}
    </div>
  )
}

StorePage.propTypes = {
  storeData: PropTypes.object.isRequired,
  eventUrl: PropTypes.string,
}

export default StorePageLoader
