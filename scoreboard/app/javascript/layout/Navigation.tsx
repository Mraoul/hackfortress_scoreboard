import React, { useState, useEffect, useContext, createContext } from 'react'
import PropTypes from 'prop-types'
import { useRouteMatch, useHistory } from 'react-router-dom'
import { Route } from 'react-router'
import update from 'immutability-helper'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import IconButton from '@material-ui/core/IconButton'
import DeleteForeverIcon from '@material-ui/icons/DeleteForever'
import Typography from '@material-ui/core/Typography'
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import Link from '@material-ui/core/Link'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'

interface childPathsInterface {
  id: number
  name: string
}

interface GenericNavigationPropInterface {
  parentPath: string
  parentString: string
  childPaths: Array<childPathsInterface>
  childString: string
  selectedChildPathId: number
}

export const GenericNavigation = (props: GenericNavigationPropInterface) => {
  const [parentPath, setParentPath] = useState(props.parentPath)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [childPaths, setChildPaths] = useState([
    { id: 0, name: `Select ${props.childString}` },
    ...props.childPaths,
  ])
  const [anchorEl, setAnchorEl] = useState<Element | null>(null)
  const match = useRouteMatch()
  let history = useHistory()

  useEffect(() => {
    if (props.selectedChildPathId > 0 && childPaths.length > 1) {
      let itemIndex = childPaths.findIndex((item) => {
        return item.id == props.selectedChildPathId
      })
      setSelectedIndex(itemIndex)
    }
  }, [props.selectedChildPathId, childPaths])

  useEffect(() => {
    setChildPaths([
      { id: 0, name: `Select ${props.childString}` },
      ...props.childPaths,
    ])
  }, [props.childPaths])

  useEffect(() => {
    setParentPath(props.parentPath)
  }, [props.parentPath])

  const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLElement>,
    index: number
  ) => {
    setSelectedIndex(index)
    setAnchorEl(null)
    const newPath = `${parentPath}/${childPaths[index].id}`
    history.push(newPath)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleRedirectCatalog = () => {
    history.push(parentPath)
  }

  if (childPaths.length == 1) {
    return <div></div>
  }

  return (
    <React.Fragment>
      <Grid container item xs={12}>
        <Breadcrumbs>
          <Button onClick={handleRedirectCatalog}>{props.parentString}</Button>
          <Button onClick={handleClickListItem} endIcon={<ArrowDropDownIcon />}>
            {childPaths[selectedIndex].name}
          </Button>
        </Breadcrumbs>
      </Grid>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {childPaths.map((childPath, index) => (
          <MenuItem
            key={index}
            disabled={index === 0}
            selected={index === selectedIndex}
            onClick={(event) => handleMenuItemClick(event, index)}
          >
            {childPath.name}
          </MenuItem>
        ))}
      </Menu>
    </React.Fragment>
  )
}

GenericNavigation.propTypes = {
  parentPath: PropTypes.string.isRequired,
  parentString: PropTypes.string.isRequired,
  childPaths: PropTypes.array.isRequired,
  childString: PropTypes.string.isRequired,
  selectedChildPathId: PropTypes.number,
}

GenericNavigation.defaultProps = {
  childString: '',
  selectedChildPathId: 0,
}

export default GenericNavigation

// export const PuzzleNavigation = (props) => {
//   const [catalogPath, setCatalogPath] = useState(props.catalogPath)
//   const [selectedIndex, setSelectedIndex] = useState(0)
//   const [categories, setCategories] = useState(
//     [{id: 0, name: "Select Category"}, ...props.categories])
//   const [anchorEl, setAnchorEl] = useState(null)
//   const match = useRouteMatch()
//   let history = useHistory()

//   useEffect(() => {
//     if (props.selectedCategoryId > 0 && categories.length > 1) {
//       let itemIndex = categories.findIndex((item) => { return item.id == props.selectedCategoryId })
//       setSelectedIndex(itemIndex)
//     }
//   }, [props.selectedCategoryId, categories])

//   useEffect(() => {
//     setCategories([{id: 0, name: "Select Category"}, ...props.categories])
//   }, [props.categories])

//   useEffect(() => {
//     setCatalogPath(props.catalogPath)
//   }, [props.catalogPath])

//   const handleClickListItem = event => {
//     setAnchorEl(event.currentTarget);
//   }

//   const handleMenuItemClick = (event, index) => {
//     setSelectedIndex(index)
//     setAnchorEl(null)
//     const newPath = (`${catalogPath}/${categories[index].id}`)
//     history.push(newPath)
//   }

//   const handleClose = () => {
//     setAnchorEl(null);
//   }

//   const handleRedirectCatalog = () => {
//     history.push(catalogPath)
//   }

//   if (categories.length == 1) {
//     return (
//       <div></div>
//     )
//   }

//   return (
//     <React.Fragment>
//       <Grid container item xs={12}>
//         <Breadcrumbs>
//           <Button onClick={handleRedirectCatalog}>
//             Categories
//           </Button>
//           <Button onClick={handleClickListItem} endIcon={<ArrowDropDownIcon />}>
//             {categories[selectedIndex].name}
//           </Button>
//         </Breadcrumbs>
//       </Grid>
//       <Menu
//         anchorEl={anchorEl}
//         keepMounted
//         open={Boolean(anchorEl)}
//         onClose={handleClose}
//       >
//         {categories.map((category, index) => (
//           <MenuItem
//             key={index}
//             disabled={index === 0}
//             selected={index === selectedIndex}
//             onClick={event => handleMenuItemClick(event, index)}
//           >
//             {category.name}
//           </MenuItem>
//         ))}
//       </Menu>
//     </React.Fragment>
//   )
// }

// PuzzleNavigation.propTypes = {
//   catalogPath: PropTypes.string.isRequired,
//   categories: PropTypes.array.isRequired,
//   selectedCategoryId: PropTypes.number
// }

// PuzzleNavigation.defaultProps = {
//   selectedCategoryId: 0
// }

// export default PuzzleNavigation
