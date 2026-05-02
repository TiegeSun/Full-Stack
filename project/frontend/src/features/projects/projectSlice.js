import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import projectService from './projectService'

const initialState = {
  projects: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
}

const getToken = (thunkAPI) => thunkAPI.getState().auth.user.token
const getMessage = (error) =>
  (error.response && error.response.data && error.response.data.message) ||
  error.message ||
  error.toString()

export const getProjects = createAsyncThunk(
  'projects/getAll',
  async (workspaceId, thunkAPI) => {
    try {
      return await projectService.getProjects(workspaceId, getToken(thunkAPI))
    } catch (error) {
      return thunkAPI.rejectWithValue(getMessage(error))
    }
  }
)

export const createProject = createAsyncThunk(
  'projects/create',
  async (projectData, thunkAPI) => {
    try {
      return await projectService.createProject(projectData, getToken(thunkAPI))
    } catch (error) {
      return thunkAPI.rejectWithValue(getMessage(error))
    }
  }
)

export const updateProject = createAsyncThunk(
  'projects/update',
  async (payload, thunkAPI) => {
    try {
      return await projectService.updateProject(payload, getToken(thunkAPI))
    } catch (error) {
      return thunkAPI.rejectWithValue(getMessage(error))
    }
  }
)

export const deleteProject = createAsyncThunk(
  'projects/delete',
  async (id, thunkAPI) => {
    try {
      return await projectService.deleteProject(id, getToken(thunkAPI))
    } catch (error) {
      return thunkAPI.rejectWithValue(getMessage(error))
    }
  }
)

export const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    resetProjectState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProjects.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getProjects.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.projects = action.payload
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.unshift(action.payload)
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.projects = state.projects.map((project) =>
          project._id === action.payload._id ? action.payload : project
        )
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(
          (project) => project._id !== action.payload.id
        )
      })
      .addMatcher(
        (action) =>
          action.type.startsWith('projects/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.isLoading = false
          state.isError = true
          state.message = action.payload
        }
      )
  },
})

export const { resetProjectState } = projectSlice.actions
export default projectSlice.reducer
