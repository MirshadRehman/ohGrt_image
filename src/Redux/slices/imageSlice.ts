import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

// Types
export interface GeneratedImage {
  base64: string | null
  url: string
  seed: string
  finish_reason: string
}

export interface FoocusState {
  isLoading: boolean
  images: GeneratedImage[]
  error: string | null
  lastRequestConfig: any | null
  history: {
    id: string
    timestamp: number
    config: any
    results: GeneratedImage[]
  }[]
}

export interface GenerateImageRequest {
  prompt: string
  negative_prompt: string
  style_selections: string[]
  performance_selection: string
  aspect_ratios_selection: string
  image_number: number
  image_seed: number
  sharpness: number
  guidance_scale: number
  base_model_name: string
  refiner_model_name: string
  refiner_switch: number
  loras: Array<{
    enabled: boolean
    model_name: string
    weight: number
  }>
  advanced_params: Record<string, any>
  save_meta: boolean
  meta_scheme: string
  save_extension: string
  save_name: string
  read_wildcards_in_order: boolean
  require_base64: boolean
  async_process: boolean
  webhook_url: string
  input_image: string
  input_mask: string
  inpaint_additional_prompt: string
  outpaint_selections: string[]
  outpaint_distance_left: number
  outpaint_distance_right: number
  outpaint_distance_top: number
  outpaint_distance_bottom: number
  image_prompts: Array<{
    cn_img: string
    cn_stop: number
    cn_weight: number
    cn_type: string
  }>
}

// API endpoint
const API_BASE_URL = "http://103.99.186.164:8888"
const GENERATE_ENDPOINT = `${API_BASE_URL}/v2/generation/image-prompt`

// Async thunk for generating images
export const generateImages = createAsyncThunk<GeneratedImage[], GenerateImageRequest, { rejectValue: string }>(
  "fooocus/generateImages",
  async (config, { rejectWithValue }) => {
    try {
      const response = await fetch(GENERATE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorData}`)
      }

      const data: GeneratedImage[] = await response.json()
      return data
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message)
      }
      return rejectWithValue("An unknown error occurred")
    }
  },
)

// Initial state
const initialState: FoocusState = {
  isLoading: false,
  images: [],
  error: null,
  lastRequestConfig: null,
  history: [],
}

// Create slice
const foocusSlice = createSlice({
  name: "fooocus",
  initialState,
  reducers: {
    clearImages: (state) => {
      state.images = []
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    },
    removeImageFromHistory: (state, action: PayloadAction<string>) => {
      state.history = state.history.filter((item) => item.id !== action.payload)
    },
    clearHistory: (state) => {
      state.history = []
    },
    setLastRequestConfig: (state, action: PayloadAction<any>) => {
      state.lastRequestConfig = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Generate images pending
      .addCase(generateImages.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      // Generate images fulfilled
      .addCase(generateImages.fulfilled, (state, action) => {
        state.isLoading = false
        state.images = action.payload
        state.error = null

        // Add to history
        const historyItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          config: state.lastRequestConfig,
          results: action.payload,
        }
        state.history.unshift(historyItem)

        // Keep only last 50 items in history
        if (state.history.length > 50) {
          state.history = state.history.slice(0, 50)
        }
      })
      // Generate images rejected
      .addCase(generateImages.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || "Failed to generate images"
        state.images = []
      })
  },
})

// Export actions
export const { clearImages, clearError, removeImageFromHistory, clearHistory, setLastRequestConfig } =
  foocusSlice.actions

// Selectors
export const selectFoocusState = (state: { fooocus: FoocusState }) => state.fooocus
export const selectIsLoading = (state: { fooocus: FoocusState }) => state.fooocus.isLoading
export const selectImages = (state: { fooocus: FoocusState }) => state.fooocus.images
export const selectError = (state: { fooocus: FoocusState }) => state.fooocus.error
export const selectHistory = (state: { fooocus: FoocusState }) => state.fooocus.history
export const selectLastRequestConfig = (state: { fooocus: FoocusState }) => state.fooocus.lastRequestConfig

// Export reducer
export default foocusSlice.reducer
