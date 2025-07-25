import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface User{
    name:string
    email:string
    status:boolean
}

interface UserState{
    update: User | null
    loading: boolean
}
const initialState:UserState={
    update:null,
    loading:false
}

export const updateUser=createAsyncThunk(
    'update/updateUser',
    async({payload, userID}:{payload:User, userID:string})=>{
        const response= await axios.put(`https://6877c810dba809d901f0e45a.mockapi.io/api/user/${userID}`,payload)
        console.log('updated user', response.data)
        return response.data
    }
)

const updateSlice=createSlice({
    name:'update',
    initialState,
    reducers:{},
    extraReducers:(builder)=>{
        builder
        .addCase(updateUser.pending, (state)=>{
            state.loading= true
        })
        .addCase(updateUser.fulfilled, (state,action)=>{
            state.loading= false
            state.update= action.payload
        })
        .addCase(updateUser.rejected, (state)=>{
            state.loading= false
        })
    }
})

export default updateSlice.reducer