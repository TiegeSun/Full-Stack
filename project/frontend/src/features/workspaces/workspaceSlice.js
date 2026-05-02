import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import workspaceService from './workspaceService'

const initialState = {
  workspaces: [],
  activeWorkspaceId: localStorage.getItem('activeWorkspaceId') || '',
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

export const getWorkspaces = createAsyncThunk(
  'workspaces/getAll',
  async (_, thunkAPI) => {
    try {
      return await workspaceService.getWorkspaces(getToken(thunkAPI))
    } catch (error) {
      return thunkAPI.rejectWithValue(getMessage(error))
    }
  }
)

export const createWorkspace = createAsyncThunk(
  'workspaces/create',
  async (workspaceData, thunkAPI) => {
    try {
      return await workspaceService.createWorkspace(
        workspaceData,
        getToken(thunkAPI)
      )
    } catch (error) {
      return thunkAPI.rejectWithValue(getMessage(error))
    }
  }
)

export const updateWorkspace = createAsyncThunk(
  'workspaces/update',
  async (payload, thunkAPI) => {
    try {
      return await workspaceService.updateWorkspace(payload, getToken(thunkAPI))
    } catch (error) {
      return thunkAPI.rejectWithValue(getMessage(error))
    }
  }
)

export const deleteWorkspace = createAsyncThunk(
  'workspaces/delete',
  async (id, thunkAPI) => {
    try {
      return await workspaceService.deleteWorkspace(id, getToken(thunkAPI))
    } catch (error) {
      return thunkAPI.rejectWithValue(getMessage(error))
    }
  }
)

export const addMember = createAsyncThunk(
  'workspaces/addMember',
  async (payload, thunkAPI) => {
    try {
      return await workspaceService.addMember(payload, getToken(thunkAPI))
    } catch (error) {
      return thunkAPI.rejectWithValue(getMessage(error))
    }
  }
)

export const removeMember = createAsyncThunk(
  'workspaces/removeMember',
  async (payload, thunkAPI) => {
    try {
      return await workspaceService.removeMember(payload, getToken(thunkAPI))
    } catch (error) {
      return thunkAPI.rejectWithValue(getMessage(error))
    }
  }
)

export const workspaceSlice = createSlice({
  name: 'workspaces',
  initialState,
  reducers: {
    setActiveWorkspace: (state, action) => {
      state.activeWorkspaceId = action.payload
      localStorage.setItem('activeWorkspaceId', action.payload)
    },
    resetWorkspaceState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getWorkspaces.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getWorkspaces.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.workspaces = action.payload
        const hasActive = action.payload.some(
          (workspace) => workspace._id === state.activeWorkspaceId
        )
        if (!hasActive && action.payload.length) {
          state.activeWorkspaceId = action.payload[0]._id
          localStorage.setItem('activeWorkspaceId', action.payload[0]._id)
        }
      })
      .addCase(createWorkspace.fulfilled, (state, action) => {
        state.workspaces.unshift(action.payload)
        state.activeWorkspaceId = action.payload._id
        localStorage.setItem('activeWorkspaceId', action.payload._id)
      })
      .addCase(updateWorkspace.fulfilled, (state, action) => {
        state.workspaces = state.workspaces.map((workspace) =>
          workspace._id === action.payload._id ? action.payload : workspace
        )
      })
      .addCase(deleteWorkspace.fulfilled, (state, action) => {
        state.workspaces = state.workspaces.filter(
          (workspace) => workspace._id !== action.payload.id
        )
        if (state.activeWorkspaceId === action.payload.id) {
          state.activeWorkspaceId = state.workspaces[0]?._id || ''
          localStorage.setItem('activeWorkspaceId', state.activeWorkspaceId)
        }
      })
      .addCase(addMember.fulfilled, (state, action) => {
        state.workspaces = state.workspaces.map((workspace) =>
          workspace._id === action.payload._id ? action.payload : workspace
        )
      })
      .addCase(removeMember.fulfilled, (state, action) => {
        state.workspaces = state.workspaces.map((workspace) =>
          workspace._id === action.payload._id ? action.payload : workspace
        )
      })
      .addMatcher(
        (action) =>
          action.type.startsWith('workspaces/') &&
          action.type.endsWith('/rejected'),
        (state, action) => {
          state.isLoading = false
          state.isError = true
          state.message = action.payload
        }
      )
  },
})

export const { setActiveWorkspace, resetWorkspaceState } = workspaceSlice.actions
export default workspaceSlice.reducer
