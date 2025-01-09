import React, { useState, useEffect } from 'react'
import { useRouteMatch } from 'react-router'
import PropTypes from 'prop-types'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import DeleteForeverIcon from '@material-ui/icons/DeleteForever'
import Typography from '@material-ui/core/Typography'

import GenericDialog from '../../../layout/GenericDialog'
import GenericNavigation from '../../../layout/Navigation'
import { useSnackbar } from 'notistack'
import { CategoriesListType, CategoryInterface } from './def'
import { downloadFile, makeFetch } from '../../../helpers/MakeFetch'

const ExportCategoryContent = ({}) => {
  const downloadCategories = async () => {
    downloadFile({
      fileUrl: '/api/mgmt/categories/export',
    })
  }

  // TODO FIXME XXX commented out target="_blank" to satisfiy typescripting, but it should work
  // Doesn't seem to be an issue, so need to look into it in the future.
  return (
    <div>
      <Button
        onClick={() => downloadCategories()}
        component="button"
        variant="contained"
      >
        Export Categories
      </Button>
    </div>
  )
}

interface UploadCategoryContentPropsInterface {
  fetchCategories: () => void
  contentType: string
}

const UploadCategoryContent = (props: UploadCategoryContentPropsInterface) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [dialogTitle, setDialogTitle] = useState<string>('')
  const [dialogContent, setDialogContent] = useState<React.ReactNode>(undefined)
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const handleClose = () => {
    setDialogOpen(false)
    props.fetchCategories()
  }

  const handleChange = (event: React.FormEvent<HTMLFormElement>) => {
    const target = event.target as HTMLInputElement
    if (target.files != null) {
      setSelectedFile(target.files[0])
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form_data = new FormData()
    if (selectedFile != null) {
      form_data.append('category_data', selectedFile)
    }

    await makeFetch({
      url: `/api/mgmt/categories/upload_${props.contentType}`,
      method: 'POST',
      formData: form_data,
      successFn: (data) => {
        enqueueSnackbar('Success')
        props.fetchCategories()
      },
      unauthorizedFn: (data) => {
        enqueueSnackbar('Unauthorized')
      },
      statusFns: {
        '400': (data) => {
          console.log(data.errors)
          setDialogTitle('Errors During Processing')
          setDialogContent(
            <List>
              {data.errors.map((error: string, index: number) => (
                <ListItem key={index}> {error} </ListItem>
              ))}
            </List>
          )
          setDialogOpen(true)
        },
      },
      unexpectedRespFn: (data) => console.log('Unexpected response' + data),
    })
  }

  return (
    <div>
      <form onChange={handleChange} onSubmit={handleSubmit}>
        <input type="file" name="file" />
        <Button variant="contained" type="submit">
          Upload Categories {props.contentType.toUpperCase()}
        </Button>
      </form>
      <GenericDialog
        dialogTitle={dialogTitle}
        dialogContent={dialogContent}
        open={dialogOpen}
        onClose={handleClose}
      />
    </div>
  )
}

UploadCategoryContent.propTypes = {
  contentType: PropTypes.string.isRequired,
  fetchCategories: PropTypes.func.isRequired,
}

interface NewCategoryPropsInterface {
  fetchCategories: () => void
}

const NewCategory = (props: NewCategoryPropsInterface) => {
  const [categoryName, setCategoryName] = useState('')
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const handleChange = (event: React.FormEvent<HTMLFormElement>) => {
    const target = event.target as HTMLInputElement
    setCategoryName(target.value)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    let request_body = {
      category: {
        name: categoryName,
      },
    }

    await makeFetch({
      url: `/api/mgmt/categories/`,
      method: 'POST',
      body: request_body,
      successFn: (data) => {
        enqueueSnackbar('Success')
        setCategoryName('')
        props.fetchCategories()
      },
      unauthorizedFn: (data) => {
        enqueueSnackbar('Unauthorized')
      },
      unexpectedRespFn: (data) => console.log('Unexpected response' + data),
    })
  }

  return (
    <div>
      <form onChange={handleChange} onSubmit={handleSubmit}>
        <TextField
          type="text"
          label="Category Name"
          name="categoryName"
          value={categoryName}
          placeholder="Category Name"
        />
        <Button variant="contained" type="submit">
          Create Category
        </Button>
      </form>
    </div>
  )
}

NewCategory.propTypes = {
  fetchCategories: PropTypes.func.isRequired,
}

interface CategoryPropsInterface {
  category: CategoryInterface
  fetchCategories: () => void
}

const Category = (props: CategoryPropsInterface) => {
  const [categoryName, setCategoryName] = useState(props.category.name)
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  useEffect(() => {
    setCategoryName(props.category.name)
  }, [props.category])

  const deleteCategory = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!confirm('This action cannot be reversed? Are you sure?')) {
      return
    }

    await makeFetch({
      url: `/api/mgmt/categories/${props.category.id}`,
      method: 'DELETE',
      successFn: (data) => {
        enqueueSnackbar('Success')
        props.fetchCategories()
      },
      unauthorizedFn: (data) => {
        enqueueSnackbar('Unauthorized')
      },
      unexpectedRespFn: (data) => console.log('Unexpected response' + data),
    })
  }

  const handleChange = (event: React.FormEvent<HTMLFormElement>) => {
    const target = event.target as HTMLInputElement
    setCategoryName(target.value)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    let request_body = {
      category: {
        name: categoryName,
      },
    }

    await makeFetch({
      url: `/api/mgmt/categories/${props.category.id}`,
      method: 'PUT',
      body: request_body,
      successFn: (data) => {
        enqueueSnackbar('Success')
      },
      unauthorizedFn: (data) => {
        enqueueSnackbar('Unauthorized')
      },
      unexpectedRespFn: (data) => console.log('Unexpected response' + data),
    })
  }

  return (
    <ListItem>
      <ListItemIcon>
        <IconButton onClick={deleteCategory} edge="start">
          <DeleteForeverIcon />
        </IconButton>
      </ListItemIcon>
      <form onChange={handleChange} onSubmit={handleSubmit}>
        <TextField
          type="text"
          label="Category Name"
          name="categoryName"
          value={categoryName}
        />
        <Button variant="contained" type="submit">
          Update
        </Button>
      </form>
    </ListItem>
  )
}

Category.propTypes = {
  category: PropTypes.object.isRequired,
}

interface CategoriesPropsInterface {
  categories: CategoriesListType
  catalogPath: string
  fetchCategories: () => void
}

const Categories = (props: CategoriesPropsInterface) => {
  const [categories, setCategories] = useState(props.categories)
  const match = useRouteMatch()

  useEffect(() => {
    setCategories(props.categories)
  }, [props.categories])

  return (
    <div>
      <GenericNavigation
        parentPath={props.catalogPath}
        parentString="Categories"
        childPaths={categories}
        childString="Category"
      />
      <Typography variant="h4">Categories</Typography>
      <List>
        {categories.map((category: CategoryInterface) => (
          <Category
            key={category.id}
            category={category}
            fetchCategories={props.fetchCategories}
          />
        ))}
      </List>

      <List>
        <ListItem>
          <NewCategory fetchCategories={props.fetchCategories} />
        </ListItem>
      </List>

      <List>
        <ListItem>
          <UploadCategoryContent
            contentType="csv"
            fetchCategories={props.fetchCategories}
          />
        </ListItem>
        <ListItem>
          <UploadCategoryContent
            contentType="json"
            fetchCategories={props.fetchCategories}
          />
        </ListItem>
      </List>
      <List>
        <ListItem>
          <ExportCategoryContent />
        </ListItem>
      </List>
    </div>
  )
}

Categories.propTypes = {
  categories: PropTypes.array.isRequired,
  catalogPath: PropTypes.string.isRequired,
  fetchCategories: PropTypes.func.isRequired,
}

export default Categories
