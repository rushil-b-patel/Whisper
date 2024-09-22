import React, { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

function Profile() {

    const {user} = useAuth();

  return (
    <div className='bg-gray-100 flex flex-col h-[calc(100vh-4em)] justify-center items-center p-12 sm:px-6 lg:px-8'>
        <h1 className='text-3xl font-bold'>Profile</h1>
        <div className='mt-4'>
            <p className='text-lg'>Name: {user.name}</p>
            <p className='text-lg'>username: {user.userName}</p>
            <p className='text-lg'>Email: {user.email}</p>
        </div>    
    </div>
    
  )
}

export default Profile