import React, { Component, useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import { Theme, withStyles, makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import Badge from '@material-ui/core/Badge'
import Tooltip from '@material-ui/core/Tooltip'
import AttachMoneyIcon from '@material-ui/icons/AttachMoney'

import type { ColorType } from '../def'
import type { WalletInterface } from './def'

const CustomTooltip = withStyles(({ palette }) => ({
  tooltipArrow: {
    fontSize: '1rem',
    backgroundColor: palette.info.light,
  },
  arrow: {
    color: palette.info.light,
  },
}))(Tooltip)

const useStyles = makeStyles((theme: Theme) => ({
  sale: {
    marginRight: theme.spacing(2),
  },
  walletIcon: {
    marginRight: theme.spacing(1),
  },
  grow: {
    flexGrow: 1,
  },
  appBar: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}))

interface StatusBarPropsInterface {
  sale_ratio: number
  wallet: WalletInterface
  color: ColorType
  highlight: string // TODO FIXME XXX this can be further constrained
}

type BadgeColorType = 'secondary' | 'default'

export const StatusBar = (props: StatusBarPropsInterface) => {
  const [tf2Color, setTf2Color] = useState<BadgeColorType>(
    props.highlight == 'tf2' ? 'secondary' : 'default'
  )
  const [hackColor, setHackColor] = useState<BadgeColorType>(
    props.highlight == 'hack' ? 'secondary' : 'default'
  )
  const [hackWallet, setHackWallet] = useState(props.wallet.hack)
  const [tf2Wallet, setTf2Wallet] = useState(props.wallet.tf2)
  const [saleRatio, setSaleRatio] = useState(props.sale_ratio)

  useEffect(() => {
    setTf2Color(props.highlight == 'tf2' ? 'secondary' : 'default')
    setHackColor(props.highlight == 'hack' ? 'secondary' : 'default')
  }, [props.highlight])

  useEffect(() => {
    setHackWallet(props.wallet.hack)
    setTf2Wallet(props.wallet.tf2)
  }, [props.wallet])

  useEffect(() => {
    setSaleRatio(props.sale_ratio)
  }, [props.sale_ratio])

  const classes = useStyles()

  let prices = 'Retail'
  if (saleRatio < 100) {
    prices = 100 - saleRatio + '% Discount'
  }

  return (
    <AppBar position="sticky" className={classes.appBar}>
      <Toolbar>
        <Typography className={classes.sale}>{prices}</Typography>
        <div className={classes.grow} />
        <CustomTooltip title="TF2 Coins" placement="left" arrow>
          <IconButton className={classes.walletIcon} color="inherit">
            <Badge
              badgeContent={tf2Wallet}
              max={9999}
              color={tf2Color}
              overlap="rectangular"
            >
              <AttachMoneyIcon />
            </Badge>
          </IconButton>
        </CustomTooltip>
        <CustomTooltip title="Hack Coins" placement="left" arrow>
          <IconButton className={classes.walletIcon} color="inherit">
            <Badge
              badgeContent={hackWallet}
              max={9999}
              color={hackColor}
              overlap="rectangular"
            >
              <AttachMoneyIcon />
            </Badge>
          </IconButton>
        </CustomTooltip>
      </Toolbar>
    </AppBar>
  )
}

//PropTypes
StatusBar.propTypes = {
  sale_ratio: PropTypes.number.isRequired,
  wallet: PropTypes.object.isRequired,
  color: PropTypes.string.isRequired,
  highlight: PropTypes.string.isRequired,
}

StatusBar.defaultProps = {
  highlight: 'tf2',
}

// export default withStyles(styles)(StatusBar)
export default StatusBar
