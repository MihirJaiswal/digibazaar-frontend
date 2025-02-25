"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore" // Import auth store

interface InputFieldProps {
  label: string;
  value: string;
  setValue: (value: string) => void;
  type?: string;
}

interface TextAreaFieldProps {
  label: string;
  value: string;
  setValue: (value: string) => void;
}

export default function CreateGig() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [cover, setCover] = useState("")
  const [images, setImages] = useState("")
  const [shortTitle, setShortTitle] = useState("")
  const [shortDesc, setShortDesc] = useState("")
  const [deliveryTime, setDeliveryTime] = useState("")
  const [revisionNumber, setRevisionNumber] = useState("")
  const [features, setFeatures] = useState("")
  const router = useRouter()

  

  const { token } = useAuthStore() // Get token from auth store

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      console.error("User is not authenticated")
      return
    }

    const gigData = {
      title,
      desc: description,
      price: Number(price),
      cover,
      images: images.split(",").map((img) => img.trim()),
      shortTitle,
      shortDesc,
      deliveryTime: Number(deliveryTime),
      revisionNumber: Number(revisionNumber),
      features: features.split(",").map((feat) => feat.trim()),
    }

    try {
      const res = await fetch("http://localhost:8800/api/gigs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Send token in headers
        },
        body: JSON.stringify(gigData),
      })

      if (res.ok) {
        router.push("/")
      } else {
        console.error("Failed to create gig")
      }
    } catch (error) {
      console.error("Error submitting gig:", error)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Create New Gig</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField label="Title" value={title} setValue={setTitle} />
        <TextAreaField label="Description" value={description} setValue={setDescription} />
        <InputField label="Price ($)" type="number" value={price} setValue={setPrice} />
        <InputField label="Cover Image URL" value={cover} setValue={setCover} />
        <InputField label="Image URLs (comma-separated)" value={images} setValue={setImages} />
        <InputField label="Short Title" value={shortTitle} setValue={setShortTitle} />
        <TextAreaField label="Short Description" value={shortDesc} setValue={setShortDesc} />
        <InputField label="Delivery Time (days)" type="number" value={deliveryTime} setValue={setDeliveryTime} />
        <InputField label="Revisions" type="number" value={revisionNumber} setValue={setRevisionNumber} />
        <InputField label="Features (comma-separated)" value={features} setValue={setFeatures} />

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Create Gig
        </button>
      </form>
    </div>
  )
}

const InputField = ({ label, value, setValue, type = "text" }: InputFieldProps) => (
  <div>
    <label className="block mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="w-full p-2 border rounded"
      required
    />
  </div>
)

const TextAreaField = ({ label, value, setValue }: TextAreaFieldProps) => (
  <div>
    <label className="block mb-2">{label}</label>
    <textarea
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="w-full p-2 border rounded"
      rows={4}
      required
    />
  </div>
)
