import React, { useState, useEffect } from 'react'
import update from 'immutability-helper'
import { Route } from 'react-router'
import { useRouteMatch } from 'react-router-dom'

import ItemGroups from './ItemGroup'
import Items from './Item'
import { ItemGroupInterface, ItemGroupsType } from './def'
import { makeFetch } from '../../../helpers/MakeFetch'

interface StoreCatalogPropsInterface {
  catalogPath: string
}

export const StoreCatalog = (props: StoreCatalogPropsInterface) => {
  const [loaded, setLoaded] = useState(false)
  const [groups, setGroups] = useState<ItemGroupsType>([])
  const match = useRouteMatch()

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    await makeFetch({
      url: '/api/mgmt/item_groups/',
      successFn: (data) => {
        setGroups(data as ItemGroupsType)
      },
      unauthorizedFn: (data) => {
        console.log(data)
      },
      always: () => setLoaded(true),
    })
  }

  const addGroup = (item_group: ItemGroupInterface) => {
    const new_groups = update(groups, { $push: [item_group] })
    setGroups(new_groups)
  }

  const removeGroup = (item_group: ItemGroupInterface) => {
    const new_groups = update(groups, {
      $splice: [[groups.findIndex((item) => item.id == item_group.id), 1]],
    })
    setGroups(new_groups)
  }
  return (
    <div>
      <Route
        exact
        path={`${match.path}/`}
        render={() => {
          return (
            <ItemGroups
              groups={groups}
              addGroup={addGroup}
              removeGroup={removeGroup}
              catalogPath={props.catalogPath}
              fetchItems={fetchItems}
            />
          )
        }}
      />
      <Route
        path={`${match.path}/:groupId`}
        render={() => {
          return <Items groups={groups} catalogPath={props.catalogPath} />
        }}
      />
    </div>
  )
}

StoreCatalog.propTypes = {}

export default StoreCatalog
