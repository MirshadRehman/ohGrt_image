'use client'
import React, { useState } from 'react'
import UserRedux from './userRedux'


function page() {
    const [map, setMap] = useState('')
    return (
        <div>
            <div className='flex items-center justify-around w-1/2 mx-auto mt-6'>
                <div className='bg-green-100 px-6 py-3 rounded-2xl' onClick={() => { setMap('direct') }}>
                    Fetch User Directly
                </div>
                <div className='bg-blue-100 px-6 py-3 rounded-2xl' onClick={() => (setMap('redux'))}>
                    Fetch User using React Redux
                </div>
            </div>

            {map === 'redux' ? (
                <UserRedux/>
            ) : (
                <>
                    {map === 'direct' && (
                        <div>
                            <p>Direct</p>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default page