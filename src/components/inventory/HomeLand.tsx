'use client'
import React, { useState, useEffect } from 'react'
import Dashboard from '@/components/inventory/Dashboard'
import { useAuthStore } from '@/store/authStore'
import Landing from '@/components/inventoryLanding/Landing'
import Header from '@/components/global/Header'
import { DashboardLayout } from './dashboard-layout'

export default function HomeLand() {
  const { user, token } = useAuthStore()
  // null indicates a loading state; true means store exists, false means no store
  const [storeExists, setStoreExists] = useState<boolean | null>(null)

  useEffect(() => {
    // If there's no token, assume no store exists.
    if (!token) {
      setStoreExists(false)
      return
    }

    const fetchStore = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stores`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (res.ok) {
          const storeData = await res.json()
          console.log(storeData)
          // Check if storeData is an array or an object with an id property.
          if (Array.isArray(storeData)) {
            setStoreExists(storeData.length > 0)
          } else if (storeData && storeData.id) {
            setStoreExists(true)
          } else {
            setStoreExists(false)
          }
        } else {
          setStoreExists(false)
        }
      } catch (error) {
        console.error('Error fetching store:', error)
        setStoreExists(false)
      }
    }

    fetchStore()
  }, [token])

  // Show loading state while store data is being fetched.
  if (storeExists === null) {
    return <div>Loading...</div>
  }

  // If there's no logged in user or no store found, show the Landing component.
  if (!user || !storeExists) {
    return <Landing />
  }

  return (
    <div>
      <Header/>
      <DashboardLayout>
      <Dashboard />
      </DashboardLayout>
    </div>
  )
}
