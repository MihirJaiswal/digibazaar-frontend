import StoresPage from '@/components/store/AllStore'
import React from 'react'

import { StoreLayout } from "@/components/store/StoreSidebar"
import Header from "@/components/global/Header"

function page() {
  return (
    <div>
      <Header />
      <StoreLayout>
        <StoresPage />
      </StoreLayout>
    </div>
  )
}

export default page