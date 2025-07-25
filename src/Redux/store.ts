import { configureStore } from "@reduxjs/toolkit";
import userReducer from './slices/userSlice'
import userCreateSlice from './slices/userCreateSlice'
import updateReducer from './slices/updateSlice'
import imageReducer from './slices/imageSlice'


export const store= configureStore({
    reducer:{
        user: userReducer,
        create: userCreateSlice,
        update: updateReducer,
        fooocus: imageReducer
    }
})

export type RootState= ReturnType<typeof store.getState>
export type AppDispatch= typeof store.dispatch