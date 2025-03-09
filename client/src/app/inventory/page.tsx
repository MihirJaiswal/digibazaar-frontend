'use client'
import React from 'react'
import Dashboard from '@/components/inventory/Dashboard'
import { useAuthStore } from '@/store/authStore'
import Landing from '@/components/inventoryLanding/Landing'

export default function Page() { 
  const { user } = useAuthStore()
  
  if (!user) {
    return <Landing/>
  }
  return (
    <div>
      <Dashboard/>
    </div>
  )
}
