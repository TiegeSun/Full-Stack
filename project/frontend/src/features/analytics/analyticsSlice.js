import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import analyticsService from './analyticsService'

const initialState = {
  overview: {
    summary: {
      totalProjects: 0,
      activeProjects: 0,
      totalTasks: 0,
      completedTasks: 0,
      openTasks: 0,
      completionRate: 0,
    },
    byStatus: [],
    byPriority: [],
    overdueCount: 0,
    dueThisWeekCount: 0,
    upcomingTasks: [],
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

export const getOverview = createAsyncThunk(
  'analytics/getOverview',
  async (params, thunkAPI) => {
    try {
      return await analyticsService.getOverview(params, getToken(thunkAPI))
    } catch (error) {
      return thunkAPI.rejectWithValue(getMessage(error))
    }
  }
)

export const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    resetAnalyticsState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getOverview.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getOverview.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.overview = action.payload
      })
      .addCase(getOverview.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
  },
})

export const { resetAnalyticsState } = analyticsSlice.actions
export default analyticsSlice.reducer
