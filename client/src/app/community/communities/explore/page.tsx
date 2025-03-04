import { CommunityList } from '@/components/community/community-list'
import Sidebar from '@/components/community/Sidebar'
import Header from '@/components/global/Header'
import Footer from '@/components/global/Footer'
import React from 'react'

export default function page() {
  return (
    <>
      <Header />
      <div className='flex'>
        <Sidebar/>
        <div className='flex-1 mx-auto px-12'>
            <CommunityList/>
        </div>
      </div>
      <Footer/>
    </>
  )
}
