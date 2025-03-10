'use client'
import React, { useState, useEffect } from 'react'
import Details from '@/components/store/Details'
import Header from '@/components/global/Header'
import StoresPage from '@/components/store/AllStore'
import { useAuthStore } from '@/store/authStore'


export default function Store() {
  const { user, token } = useAuthStore()
  // null indicates a loading state; true means a store exists, false means no store.
  const [storeExists, setStoreExists] = useState<boolean | null>(null)

  useEffect(() => {
    if (!token) {
      setStoreExists(false)
      return
    }

    const fetchStore = async () => {
      try {
        const res = await fetch('http://localhost:8800/api/stores', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (res.ok) {
          const storeData = await res.json()
          console.log(storeData)
          // Check if storeData is an array or an object with an id.
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

  // While loading the store data, display a loading state.
  if (storeExists === null) {
    return <div>Loading...</div>
  }

  // If a user is logged in and a store exists, show the Details component;
  // otherwise, show the StoresPage.
  return (
    <div>
      <Header />
      {user && storeExists ? <Details /> : <StoresPage />}
    </div>
  )
}