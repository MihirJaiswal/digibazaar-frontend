import React from 'react'
import Header from '@/components/global/Header'
import Sidebar from '@/components/community/Sidebar'
import UserCommunities from '@/components/community/UserCommunities'
export default function page() {
  return (
    <>
    <Header/>
    <div className='flex'>
      <Sidebar/>
      <div className='flex-1 p-6'>
        <UserCommunities/>
      </div>
    </div>
    </>
  )
}
