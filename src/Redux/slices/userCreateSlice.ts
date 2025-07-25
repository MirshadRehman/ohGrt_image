import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";


interface User{
    name:string
    email:string
    status:boolean
}
interface UserState{
    create:User | null
    loading:boolean

}
const initialState:UserState={
    create: null,
    loading: false
}
export const createUser= createAsyncThunk(
    'create/createUser',
    async(payload:User)=>{
        const response= await axios.post('https://6877c810dba809d901f0e45a.mockapi.io/api/user',payload)
        console.log('created user: ',response.data)
        return response.data;
    }
)

const userCreateSlice= createSlice({
    name:"create",
    initialState,
    reducers:{},
    extraReducers: (builder)=>{
        builder
        .addCase(createUser.pending, (state)=>{
            state.loading= true
        })
        .addCase(createUser.fulfilled, (status, action)=>{
            status.loading= false
            status.create= action.payload
        })
        .addCase(createUser.rejected, (status)=>{
            status.loading= false
        })
    }
})

export default userCreateSlice.reducer