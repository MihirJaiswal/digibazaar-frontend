'use client'
import Hero from '@/components/inventory/Hero'
import React from 'react'
import { useRouter } from 'next/navigation'


export default function page() {
  const router = useRouter()
  return (
    <div>
    <Hero/>
    <button onClick={()=>{
      router.push('/inventory/your-inventory')
    }}>Your Inventory</button>
    </div>
  )
}
