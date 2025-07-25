'use client'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/Redux/store'
import { deleteUser, fetchUser } from '@/Redux/slices/userSlice'
import { createUser } from '@/Redux/slices/userCreateSlice'

export default function UserRedux() {
    const dispatch: AppDispatch = useDispatch()
    const { user, loading } = useSelector((state: RootState) => state.user)
    const [openForm, setopenForm] = useState(false)
    const [create_User, setcreate_User] = useState({
        name: '',
        email: '',
        status: false
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setcreate_User((prev) => ({
            ...prev, [name]: value
        }))
    }
    const handleSwitchChange = (value: boolean) => {
        setcreate_User((prev) => ({
            ...prev,
            status: value
        }))
    }

    useEffect(() => {
        dispatch(fetchUser())
    }, [dispatch]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...create_User
        }
        await dispatch(createUser(payload))
        dispatch(fetchUser())
        setcreate_User({
            name: '',
            email: '',
            status: false
        })
        setopenForm(false)
    }

    const handleDelete=async(userID:string)=>{
        if(confirm('are you sure you want to delete ?')){
            await dispatch(deleteUser(userID))
            dispatch(fetchUser())
        }
    }
    return (
        <div>
            {loading ? (
                <div className='font-bold text-3xl'>Loading...</div>
            ) : (
                <div className='flex flex-col gap-4'>
                    <button
                        onClick={() => setopenForm(true)}
                        className='px-6 py-3 bg-blue-600 rounded-xl text-white w-1/2 my-4 mx-auto'>
                        Create User
                    </button>
                    {openForm && (
                        <form onSubmit={handleCreate} className='flex text-neutral-600 flex-col gap-3 text-left w-1/2 mx-auto rounded-xl shadow-lg p-5'>
                            <div className='flex items-center gap-4'>
                                <label htmlFor="name">Name</label>
                                <input
                                    type="text"
                                    name='name'
                                    value={create_User.name}
                                    onChange={handleChange}
                                    className='border border-gray-200 rounded-xl w-full p-2'
                                    placeholder='name' />
                            </div>
                            <div className='flex items-center gap-4'>
                                <label htmlFor="email">Email</label>
                                <input
                                    type="text"
                                    name='email'
                                    value={create_User.email}
                                    onChange={handleChange}
                                    className='border border-gray-200 rounded-xl w-full p-2'
                                    placeholder='email' />
                            </div>
                            <div className='flex items-center gap-4'>
                                <label>Status</label>
                                <label>
                                    <input
                                        type="checkbox"
                                        name='status'
                                        checked={create_User.status}
                                        onChange={(e) => handleSwitchChange(e.target.checked)}
                                        className='w-5 h-5'
                                    />
                                </label>
                            </div>
                            <div className='flex items-center gap-4'>
                                <button className='border border-gray-300 w-1/2 py-2 cursor-pointer rounded-xl' type='submit'>
                                    Create
                                </button>
                                <button
                                    className='py-2 cursor-pointer w-1/2 rounded-xl bg-red-100'
                                    onClick={() => setopenForm(false)} >
                                    Close
                                </button>
                            </div>
                        </form>
                    )}
                    <div className='grid grid-cols-5 gap-2 mt-6'>
                        {user.map((u) => (
                            <div key={u.id} className='flex flex-col gap-4 border border-gray-200 p-4 rounded-xl'>
                                <h2>Name: {u.name}</h2>
                                <p>email: {u.email}</p>
                                <p>status: {String(u.status)}</p>
                                <button
                                    onClick={()=>handleDelete(u.id)}
                                    className='py-2 px-4 bg-red-100 cursor-pointer rounded-xl' >
                                    delete
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}