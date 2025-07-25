import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface User {
    id:string
    name:string
    email:string
    status:string
}
interface UserState {
    user: User[]
    loading:boolean
}
const initialState:UserState={
    user: [],
    loading: false
}

export const fetchUser=createAsyncThunk(
    'user/fetchUser',
    async()=>{
        const response= await axios.get('https://6877c810dba809d901f0e45a.mockapi.io/api/user',{
            headers:{
                "Content-Type":"application/json",
            },
        })
        console.log('user data: ',response.data)
        return response.data || [];
    }
)

export const deleteUser=createAsyncThunk(
    'user/deleteUser',
    async(userID:string)=>{
        const response= await axios.delete(`https://6877c810dba809d901f0e45a.mockapi.io/api/user/${userID}`)
        console.log('deleted user: ',response.data)
        return userID;
    }
)

const userSlice= createSlice({
    name:'user',
    initialState,
    reducers:{},
    extraReducers: (builder)=>{
        builder

        .addCase(fetchUser.pending, (state)=>{
            state.loading= true
        })
        .addCase(fetchUser.fulfilled, (state, action)=>{
            state.loading= false
            state.user= action.payload
        })
        .addCase(fetchUser.rejected, (state)=>{
            state.loading= false
        })

        .addCase(deleteUser.pending, (state)=>{
            state.loading= true
        })
        .addCase(deleteUser.fulfilled, (state, action)=>{
            state.loading= false
            state.user= state.user.filter((u)=>u.id!==action.payload)
        })
        .addCase(deleteUser.rejected, (state)=>{
            state.loading= false
        })
    }
})

export default userSlice.reducer;