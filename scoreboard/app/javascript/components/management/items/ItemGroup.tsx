import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import DeleteForeverIcon from '@material-ui/icons/DeleteForever'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import UpdateIcon from '@material-ui/icons/Update'
import AddIcon from '@material-ui/icons/Add'

import GenericNavigation from '../../../layout/Navigation'
import { useSnackbar } from 'notistack'
import { ItemGroupInterface, ItemGroupsType } from './def'
import { makeFetch } from '../../../helpers/MakeFetch'

interface NewGroupPropsInterface {
  addGroup: (item_group: ItemGroupInterface) => void
}

const NewGroup = (props: NewGroupPropsInterface) => {
  const [itemGroup, setItemGroup] = useState({
    name: '',
    description: '',
    picture_location: '',
    discountable: false,
    hack_item: false,
  })

  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const handleChange = (event: React.FormEvent<HTMLFormElement>) => {
    const target = event.target as HTMLInputElement
    const value = target.type == 'checkbox' ? target.checked : target.value

    setItemGroup({
      ...itemGroup,
      [target.name]: target.value,
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    let request_body = {
      item_group: itemGroup,
    }

    await makeFetch({
      url: `/api/mgmt/item_groups/`,
      method: 'POST',
      body: request_body,
      successFn: (data) => enqueueSnackbar('Success'),
      unauthorizedFn: (data) => enqueueSnackbar('Unauthorized'),
    })
  }

  return (
    <React.Fragment>
      <Card>
        <CardHeader title={'New Item Group'} />
        <CardContent>
          <form onChange={handleChange} onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="text"
                  label="Name"
                  name="name"
                  value={itemGroup.name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="text"
                  label="Picture Location"
                  name="picture_location"
                  value={itemGroup.picture_location}
                />
              </Grid>
              <Grid item xs={3}>
                <FormControlLabel
                  label="Discountable"
                  labelPlacement="start"
                  control={
                    <Checkbox
                      checked={itemGroup.discountable}
                      name="discountable"
                    />
                  }
                />
              </Grid>
              <Grid item xs={3}>
                <FormControlLabel
                  label="Hack Item"
                  labelPlacement="start"
                  control={
                    <Checkbox checked={itemGroup.hack_item} name="hack_item" />
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="text"
                  label="Description"
                  name="description"
                  multiline
                  minRows={6}
                  value={itemGroup.description}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  type="submit"
                  fullWidth
                  startIcon={<AddIcon />}
                >
                  Create Item Group
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </React.Fragment>
  )
}

interface ItemGroupPropsInterface {
  item_group: ItemGroupInterface
  removeGroup: (item_group: ItemGroupInterface) => void
}

const ItemGroup = (props: ItemGroupPropsInterface) => {
  const [state, setState] = useState({ ...props.item_group })
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  useEffect(() => {
    setState({ ...props.item_group })
  }, [JSON.stringify(props.item_group)])

  const deleteGroup = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!confirm('Confirm Item Group Deletion')) {
      return
    }

    await makeFetch({
      url: `/api/mgmt/item_groups/${props.item_group.id}`,
      method: 'DELETE',
      successFn: (data) => {
        enqueueSnackbar('Success')
        props.removeGroup(props.item_group)
      },
      unauthorizedFn: (data) => enqueueSnackbar('Unauthorized'),
    })
  }

  const handleChange = (event: React.FormEvent<HTMLFormElement>) => {
    const target = event.target as HTMLInputElement
    const value = target.type == 'checkbox' ? target.checked : target.value

    setState({
      ...state,
      [target.name]: target.value,
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    let request_body = {
      item_group: state,
    }

    await makeFetch({
      url: `/api/mgmt/item_groups/${props.item_group.id}`,
      method: 'PUT',
      body: request_body,
      successFn: (data) => enqueueSnackbar('Success'),
      unauthorizedFn: (data) => enqueueSnackbar('Unauthorized'),
      unexpectedRespFn: (data) => console.log('Unexpected response' + data),
    })
  }

  return (
    <React.Fragment>
      <Card>
        <CardHeader
          title={state.name}
          action={
            <IconButton onClick={deleteGroup}>
              <DeleteForeverIcon />
            </IconButton>
          }
        ></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} onChange={handleChange}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Name"
                  name="name"
                  type="text"
                  placeholder="Group Name"
                  value={state.name}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Picture"
                  name="picture"
                  type="text"
                  placeholder="Group Picture"
                  value={state.picture_location}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <FormControlLabel
                  label="Discountable"
                  labelPlacement="start"
                  control={
                    <Checkbox
                      checked={state.discountable}
                      name="discountable"
                    />
                  }
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <FormControlLabel
                  label="Hack Item"
                  labelPlacement="start"
                  control={
                    <Checkbox checked={state.hack_item} name="hack_item" />
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Description"
                  name="description"
                  type="text"
                  multiline={true}
                  placeholder="Group Description"
                  minRows={6}
                  value={state.description}
                  fullWidth
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

ItemGroup.propTypes = {
  item_group: PropTypes.object.isRequired,
  removeGroup: PropTypes.func.isRequired,
}

interface ItemGroupsPropsInterface {
  groups: ItemGroupsType
  catalogPath: string
  addGroup: (item_group: ItemGroupInterface) => void
  removeGroup: (item_group: ItemGroupInterface) => void
}

export const ItemGroups = (props: ItemGroupsPropsInterface) => {
  const [groups, setGroups] = useState(props.groups)

  useEffect(() => {
    setGroups(props.groups)
  }, [props.groups])

  return (
    <div>
      <GenericNavigation
        parentPath={props.catalogPath}
        parentString="Item Groups"
        childPaths={groups}
        childString="Items"
      />
      {/* <Typography variant="h4">
        Item Groups
      </Typography> */}
      <Grid container spacing={2}>
        <Grid container item spacing={2}>
          {groups.map((item_group) => (
            <Grid item key={item_group.id} xs={12} lg={6}>
              <ItemGroup
                key={item_group.id}
                item_group={item_group}
                removeGroup={props.removeGroup}
              />
            </Grid>
          ))}
        </Grid>
        <Grid item>
          <NewGroup addGroup={props.addGroup} />
        </Grid>
      </Grid>
    </div>
  )
}

ItemGroups.propTypes = {
  groups: PropTypes.array.isRequired,
  addGroup: PropTypes.func.isRequired,
  removeGroup: PropTypes.func.isRequired,
  catalogPath: PropTypes.string.isRequired,
  fetchItems: PropTypes.func.isRequired,
}

export default ItemGroups
