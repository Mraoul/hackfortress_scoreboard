import React, { useState, useEffect, ReactText } from 'react'
import { useRouteMatch } from 'react-router'

import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import DeleteForeverIcon from '@material-ui/icons/DeleteForever'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import FileCopyIcon from '@material-ui/icons/FileCopy'
import UpdateIcon from '@material-ui/icons/Update'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'

import GenericNavigation from '../../../layout/Navigation'
import { ItemGroupInterface, ItemGroupsType, ItemInterface } from './def'
import { makeFetch } from '../../../helpers/MakeFetch'

interface NewItemPropsInterface {
  item_group_id: number
  groupName: string
}

const NewItem = (props: NewItemPropsInterface) => {
  const [item, setItem] = useState({
    name: '',
    cost: '',
    modifier: 0,
    players: 0,
    argument: 0,
    starting_quantity: 0,
    discountable: false,
    description: '',
    friendly_text: '',
    effect_iden: '',
    is_buff: false
  })

  const handleChange = (event: React.FormEvent<HTMLFormElement>) => {
    const target = event.target as HTMLInputElement
    const value = target.type == 'checkbox' ? target.checked : target.value

    setItem({
      ...item,
      [target.name]: target.value,
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    let request_body = {
      item: item,
    }

    await makeFetch({
      url: `/api/mgmt/item_groups/${props.item_group_id}/items/`,
      method: 'POST',
      body: request_body,
      successFn: (data) => {
        // TODO FIXME
        console.log(data)
      },
    })
  }

  return (
    <Card>
      <CardHeader title={`New '${props.groupName}' Item`} />
      <CardContent>
        <form onSubmit={handleSubmit} onChange={handleChange}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Name"
                name="name"
                type="text"
                placeholder="Item Name"
                value={item.name}
                fullWidth
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                label="Cost"
                name="cost"
                type="text"
                placeholder="Item Cost"
                value={item.cost}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                label="Modifier"
                name="modifier"
                type="text"
                placeholder="TF2 Modifier"
                value={item.modifier}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                label="Players"
                name="players"
                type="text"
                placeholder="TF2 Players"
                value={item.players}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                label="Argument"
                name="argument"
                type="text"
                placeholder="TF2 Argument"
                value={item.argument}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                label="Starting Quanity"
                name="starting_quantity"
                type="text"
                placeholder="Starting Quantity"
                value={item.starting_quantity}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                label="Friendly Text"
                name="friendly_text"
                type="text"
                placeholder="Friendly Text"
                value={item.friendly_text}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                label="Effect Identifier"
                name="effect_iden"
                type="text"
                placeholder="Effect Identifier"
                value={item.effect_iden}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                label="Description"
                name="description"
                type="text"
                multiline={true}
                placeholder="Item Description"
                minRows={6}
                value={item.description}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                label="Discountable"
                labelPlacement="start"
                control={
                  <Checkbox checked={item.discountable} name="discountable" />
                }
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                label="Buff?"
                labelPlacement="start"
                control={
                  <Checkbox checked={item.is_buff} name="is_buff" />
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" type="submit" fullWidth>
                Add Item
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

interface ItemPropsInterface {
  itemGroupId: number
  item: ItemInterface
  deleteItem: (item_id: number) => void
}

const Item = (props: ItemPropsInterface) => {
  const [item, setItem] = useState({ ...props.item })
  const [menuEl, setMenuEl] = useState<Element | null>(null)

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuEl(event.currentTarget)
  }
  const handleCloseMenu = () => setMenuEl(null)

  const handleChange = (event: React.FormEvent<HTMLFormElement>) => {
    const target = event.target as HTMLInputElement
    const value = target.type == 'checkbox' ? target.checked : target.value

    setItem({
      ...item,
      [target.name]: target.value,
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    let request_body = {
      item: item,
    }

    await makeFetch({
      url: `/api/mgmt/item_groups/${props.itemGroupId}/items/${props.item.id}`,
      method: 'PATCH',
      body: request_body,
      successFn: (data) => {
        console.log(data)
      },
    })
  }

  const cloneItem = async () => {
    let request_body = {
      id: props.item.id,
    }

    handleCloseMenu()

    await makeFetch({
      url: `/api/mgmt/items/`,
      method: 'POST',
      body: request_body,
      successFn: (data) => {
        console.log(data)
      },
    })
  }

  const deleteItem = () => {
    handleCloseMenu()
    props.deleteItem(item.id)
  }

  return (
    <React.Fragment>
      <Menu
        anchorEl={menuEl}
        keepMounted
        open={Boolean(menuEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={cloneItem}>
          <ListItemIcon>
            <FileCopyIcon />
          </ListItemIcon>
          <ListItemText primary="Clone" />
        </MenuItem>
        <MenuItem onClick={deleteItem}>
          <ListItemIcon>
            <DeleteForeverIcon />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>
      <Card>
        <CardHeader
          title={item.name}
          action={
            <IconButton onClick={handleOpenMenu}>
              <MoreVertIcon />
            </IconButton>
          }
        ></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} onChange={handleChange}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Name"
                  name="name"
                  type="text"
                  placeholder="Item Name"
                  value={item.name}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Cost"
                  name="cost"
                  type="text"
                  placeholder="Item Cost"
                  value={item.cost}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Modifier"
                  name="modifier"
                  type="text"
                  placeholder="TF2 Modifier"
                  value={item.modifier}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Players"
                  name="players"
                  type="text"
                  placeholder="TF2 Players"
                  value={item.players}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Argument"
                  name="argument"
                  type="text"
                  placeholder="TF2 Argument"
                  value={item.argument}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Starting Quanity"
                  name="starting_quantity"
                  type="text"
                  placeholder="Starting Quantity"
                  value={item.starting_quantity}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
              <TextField
                label="Friendly Text"
                name="friendly_text"
                type="text"
                placeholder="Friendly Text"
                value={item.friendly_text}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Effect Identifier"
                name="effect_iden"
                type="text"
                placeholder="Effect Identifier"
                value={item.effect_iden}
              />
            </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Description"
                  name="description"
                  type="text"
                  multiline={true}
                  placeholder="Item Description"
                  minRows={6}
                  value={item.description}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  label="Discountable"
                  labelPlacement="start"
                  control={
                    <Checkbox checked={item.discountable} name="discountable" />
                  }
                />
              </Grid>
              <Grid item xs={6}>
              <FormControlLabel
                label="Buff?"
                labelPlacement="start"
                control={
                  <Checkbox checked={item.is_buff} name="is_buff" />
                }
              />
            </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  type="submit"
                  fullWidth
                  startIcon={<UpdateIcon />}
                >
                  Update
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </React.Fragment>
  )
}

interface ItemsPropsInterface {
  catalogPath: string
  groups: ItemGroupsType
}

export const Items = (props: ItemsPropsInterface) => {
  const [itemGroup, setItemGroup] = useState<ItemGroupInterface | null>(null)
  const match = useRouteMatch<{ groupId: string }>()

  const fetchItems = async (groupId: string) => {
    await makeFetch({
      url: `/api/mgmt/item_groups/${groupId}`,
      successFn: (data) => {
        setItemGroup(data as ItemGroupInterface)
      },
    })
  }

  useEffect(() => {
    setItemGroup(null)

    let groupId = match.params.groupId
    fetchItems(groupId)
  }, [match.params.groupId])

  const addItem = (item: number) => {}

  const deleteItem = (item: number) => {}

  if (itemGroup == null) {
    return <div>Loading</div>
  } else {
    return (
      <React.Fragment>
        <GenericNavigation
          parentPath={props.catalogPath}
          parentString="Item Groups"
          childPaths={props.groups}
          childString="Items"
          selectedChildPathId={itemGroup.id}
        />
        <Grid container spacing={2}>
          <Grid container item spacing={2}>
            {itemGroup.items.map((item_) => (
              <Grid item key={item_.id} xs={12} lg={6}>
                <Item
                  itemGroupId={itemGroup.id}
                  item={item_}
                  // addItem={addItem}
                  deleteItem={deleteItem}
                />
              </Grid>
            ))}
          </Grid>
          <Grid item>
            <NewItem
              // addItem={addItem}
              groupName={itemGroup.name}
              item_group_id={itemGroup.id}
            />
          </Grid>
        </Grid>
      </React.Fragment>
    )
  }
}

Items.propTypes = {}

export default Items
