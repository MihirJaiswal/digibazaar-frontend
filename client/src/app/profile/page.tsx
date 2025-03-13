"use client"

import { useEffect, useState, type ChangeEvent } from "react"
import { useAuthStore } from "@/store/authStore"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Camera, Wallet, MapPin, Mail, User, Info, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Header from "@/components/global/Header"

// Define the shape of our user profile data
interface UserProfile {
  id: string
  email: string
  username: string
  country?: string
  phone?: string
  bio?: string
  walletBalance: number
  isSeller: boolean
  profilePic: string
  createdAt?: string
  updatedAt?: string
}

export default function ProfilePage() {
  const { user, token } = useAuthStore()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [editing, setEditing] = useState<boolean>(false)
  const [updatedProfile, setUpdatedProfile] = useState<Partial<UserProfile>>({})
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:8800/api/users/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()

        // Process fetched data to ensure proper types
        const processedData: UserProfile = {
          ...data,
          walletBalance: Number.parseFloat(data.walletBalance) || 0,
          isSeller: typeof data.isSeller === "string" ? data.isSeller === "true" : data.isSeller,
        }

        setProfile(processedData)
        setUpdatedProfile(processedData)
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, token])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)

      // Create a preview URL for the selected image
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      // Clean up the preview URL when component unmounts
      return () => URL.revokeObjectURL(objectUrl)
    }
  }

  // Prepares a clean object for submission, converting types as needed and excluding fields
  const prepareDataForSubmission = (): Partial<UserProfile> => {
    // Create a copy of updatedProfile
    const dataToSubmit: Partial<UserProfile> = { ...updatedProfile }

    // Convert walletBalance to a number
    if (dataToSubmit.walletBalance !== undefined) {
      dataToSubmit.walletBalance = Number.parseFloat(dataToSubmit.walletBalance as any) || 0
    }

    // Ensure isSeller is a boolean by checking its type first
    if (dataToSubmit.isSeller !== undefined) {
      if (typeof dataToSubmit.isSeller === "string") {
        dataToSubmit.isSeller = dataToSubmit.isSeller === "true"
      }
    }

    // Remove fields that should not be sent to the API
    const fieldsToExclude = ["id", "createdAt", "updatedAt", "password"]
    fieldsToExclude.forEach((field) => {
      if (field in dataToSubmit) {
        delete dataToSubmit[field as keyof typeof dataToSubmit]
      }
    })

    return dataToSubmit
  }

  const handleUpdate = async () => {
    if (!user) return

    setSaving(true)
    try {
      let response
      const dataToSubmit = prepareDataForSubmission()

      if (selectedFile) {
        // Use FormData if a file is selected
        const formData = new FormData()
        formData.append("profilePic", selectedFile)

        // Append walletBalance separately (ensure it's sent as a number string)
        if (dataToSubmit.walletBalance !== undefined) {
          formData.append("walletBalance", Number(dataToSubmit.walletBalance).toString())
        }

        // Append all other fields
        Object.keys(dataToSubmit).forEach((key) => {
          if (key !== "profilePic" && key !== "walletBalance") {
            const value = dataToSubmit[key as keyof typeof dataToSubmit]
            if (value !== null && value !== undefined) {
              formData.append(key, value.toString())
            }
          }
        })

        response = await fetch(`http://localhost:8800/api/users/${user.id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })
      } else {
        // For JSON submission, ensure walletBalance is a number
        if (dataToSubmit.walletBalance !== undefined) {
          dataToSubmit.walletBalance = Number(dataToSubmit.walletBalance)
        }
        response = await fetch(`http://localhost:8800/api/users/${user.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dataToSubmit),
        })
      }

      const data = await response.json()
      const processedData: UserProfile = {
        ...data,
        walletBalance: Number.parseFloat(data.walletBalance) || 0,
        isSeller: typeof data.isSeller === "string" ? data.isSeller === "true" : data.isSeller,
      }

      setProfile(processedData)
      setEditing(false)
      setSelectedFile(null)
      setPreviewUrl(null)
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Authentication Required</h2>
          <p className="text-muted-foreground">Please log in to view your profile.</p>
          <Button variant="default" size="lg" className="mt-4">
            Log In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
    <Header/>
    <div className="container rounded-md max-w-4xl mx-auto py-8 px-4 md:px-0">
      {loading ? (
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-6">
              <Skeleton className="w-32 h-32 rounded-full" />
              <div className="space-y-4 w-full max-w-md">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-32 mx-auto mt-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="overflow-hidden border-none shadow-md">
            <div className="h-32 bg-gradient-to-r from-purple-500 to-cyan-500"></div>
            <div className="relative px-6 pb-6">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-end -mt-16 md:-mt-12">
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-background shadow-md">
                    <AvatarImage src={previewUrl || profile?.profilePic || ""} alt={profile?.username} className="h-full w-full object-cover "  />
                    <AvatarFallback className="text-4xl">{profile?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {editing && (
                    <div className="absolute bottom-0 right-0">
                      <label
                        htmlFor="profilePic"
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground cursor-pointer shadow-md hover:bg-primary/90 transition-colors"
                      >
                        <Camera className="w-5 h-5" />
                        <span className="sr-only">Update profile picture</span>
                      </label>
                      <input
                        id="profilePic"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center md:items-start space-y-1 pt-2">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold uppercase">{profile?.username}</h1>
                    {profile?.isSeller && (
                      <Badge variant="secondary" className="ml-2">
                        Seller
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Mail className="w-4 h-4 mr-1" />
                    <span>{profile?.email}</span>
                  </div>
                  {profile?.country && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{profile.country}</span>
                    </div>
                  )}
                </div>
                <div className="md:ml-auto flex gap-3 mt-4 md:mt-0">
                  {editing ? (
                    <>
                      <Button onClick={handleUpdate} disabled={saving} className="gap-2">
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditing(false)
                          setUpdatedProfile(profile || {})
                          setSelectedFile(null)
                          setPreviewUrl(null)
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setEditing(true)}>Edit Profile</Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Profile Details</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </h3>
                </CardHeader>
                <CardContent className="space-y-6">
                  {editing ? (
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={updatedProfile.username || ""}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setUpdatedProfile({ ...updatedProfile, username: e.target.value })
                          }
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={updatedProfile.country || ""}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setUpdatedProfile({ ...updatedProfile, country: e.target.value })
                          }
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={updatedProfile.phone || ""}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setUpdatedProfile({ ...updatedProfile, phone: e.target.value })
                          }
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          rows={4}
                          value={updatedProfile.bio || ""}
                          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                            setUpdatedProfile({ ...updatedProfile, bio: e.target.value })
                          }
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Username</h4>
                          <p>{profile?.username}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Email</h4>
                          <p>{profile?.email}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Country</h4>
                          <p>{profile?.country || "Not specified"}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Phone</h4>
                          <p>{profile?.phone || "Not specified"}</p>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                          <Info className="w-4 h-4" />
                          Bio
                        </h4>
                        <p className="text-sm leading-relaxed">
                          {profile?.bio || "No bio available. Edit your profile to add a bio."}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
    </>
  )
}

