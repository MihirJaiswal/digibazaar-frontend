import React from 'react'
import Header from '@/components/global/Header'
import Sidebar from '@/components/community/Sidebar'
import Posts from '@/components/community/AllPost'

export default function page() {
  return (
    <>
    <Header/>
    <div className='flex bg-white dark:bg-zinc-900 min-h-screen'>
      <Sidebar/>
      <div className='flex-1 p-6 min-h-screen'>
        <Posts/>
      </div>
    </div>
    </>
  )
}
