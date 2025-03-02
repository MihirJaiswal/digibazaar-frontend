import UserPosts from '@/components/community/UserPost'
import React from 'react'
import Header from '@/components/global/Header'
import Sidebar from '@/components/community/Sidebar'

export default function page() {
  return (
    <>
    <Header/>
    <div className='flex'>
      <Sidebar/>
      <div className='flex-1 p-6'>
        <UserPosts/>
      </div>
    </div>
    </>
  )
}
