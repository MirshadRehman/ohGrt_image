"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import FoocusConfigForm from '@/components/fooocus';

function page() {
  const router=useRouter();
  const [isHere, setisHere]= useState(false)
  useEffect(()=>{
    setisHere(false)
  },[])
  return (
    <div className='flex flex-col gap-10 items-center justify-center w-full '>
      <h1 className='font-extrabold text-4xl'>Demo Project</h1>
      <button
        onClick={()=>setisHere(true)}
        className='bg-blue-100 px-6 py-3 rounded-2xl text-neutral-600 cursor-pointer'>
          Click here to continue
      </button>

      {isHere&&(
        <FoocusConfigForm/>
      )}
    </div>
  )
}

export default page