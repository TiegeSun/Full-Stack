import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import taskService from './taskService'

const initialState = {
  tasks: [],
  filters: {
    search: '',
    status: '',
    priority: '',
    assignee: '',
    due: '',
  },
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

export const getTasks = createAsyncThunk(
  'tasks/getAll',
  async (params, thunkAPI) => {
    try {
      return await taskService.getTasks(params, getToken(thunkAPI))
    } catch (error) {
      return thunkAPI.rejectWithValue(getMessage(error))
    }
  }
)

export const createTask = createAsyncThunk(
  'tasks/create',
  async (taskData, thunkAPI) => {
    try {
      return await taskService.createTask(taskData, getToken(thunkAPI))
    } catch (error) {
      return thunkAPI.rejectWithValue(getMessage(error))
    }
  }
)

export const updateTask = createAsyncThunk(
  'tasks/update',
  async (payload, thunkAPI) => {
    try {
      return await taskService.updateTask(payload, getToken(thunkAPI))
    } catch (error) {
      return thunkAPI.rejectWithValue(getMessage(error))
    }
  }
)

export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (id, thunkAPI) => {
    try {
      return await taskService.deleteTask(id, getToken(thunkAPI))
    } catch (error) {
      return thunkAPI.rejectWithValue(getMessage(error))
    }
  }
)

export const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTaskFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetTaskFilters: (state) => {
      state.filters = initialState.filters
    },
    resetTaskState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTasks.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getTasks.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.tasks = action.payload
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload)
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.map((task) =>
          task._id === action.payload._id ? action.payload : task
        )
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((task) => task._id !== action.payload.id)
      })
      .addMatcher(
        (action) =>
          action.type.startsWith('tasks/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.isLoading = false
          state.isError = true
          state.message = action.payload
        }
      )
  },
})

export const { setTaskFilters, resetTaskFilters, resetTaskState } =
  taskSlice.actions
export default taskSlice.reducer
