import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Route } from 'react-router'
import { useRouteMatch } from 'react-router-dom'
import update from 'immutability-helper'

import Loading from '../../../layout/Loading'
import Categories from './Category'
import Puzzles from './Puzzle'
import { CategoriesListType, CategoryInterface } from './def'
import { makeFetch } from '../../../helpers/MakeFetch'

export const PuzzleCatalog = ({ catalogPath }: { catalogPath: string }) => {
  const [loaded, setLoaded] = useState<boolean>(false)
  const [categories, setCategories] = useState<CategoriesListType>([])
  const match = useRouteMatch()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    await makeFetch({
      url: '/api/mgmt/categories/',
      successFn: (data) => {
        setCategories(data.categories)
      },
      unexpectedRespFn: (data) => console.log(data),
      always: () => {
        setLoaded(true)
      },
    })
  }

  const addCategory = (category: CategoryInterface) => {
    const new_categories: CategoriesListType = update(categories, {
      $push: [category],
    })
    setCategories(new_categories)
  }

  const removeCategory = (category: CategoryInterface) => {
    const new_categories: CategoriesListType = update(categories, {
      $splice: [[categories.findIndex((item) => item.id == category.id), 1]],
    })
    setCategories(categories)
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
            <Categories
              categories={categories}
              catalogPath={catalogPath}
              fetchCategories={fetchCategories}
            />
          )
        }}
      />
      <Route
        path={`${match.path}/:catId`}
        render={() => {
          return <Puzzles categories={categories} catalogPath={catalogPath} />
        }}
      />
    </div>
  )
}

PuzzleCatalog.propTypes = {
  catalogPath: PropTypes.string.isRequired,
}

export default PuzzleCatalog
