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
import { Camera, Clock, MapPin, Mail, User, Info, Loader2, Calendar, Phone, ShieldCheck } from "lucide-react"
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()

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

      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      return () => URL.revokeObjectURL(objectUrl)
    }
  }

  const prepareDataForSubmission = (): Partial<UserProfile> => {
    const dataToSubmit: Partial<UserProfile> = { ...updatedProfile }

    if (dataToSubmit.walletBalance !== undefined) {
      dataToSubmit.walletBalance = Number.parseFloat(dataToSubmit.walletBalance as any) || 0
    }

    if (dataToSubmit.isSeller !== undefined) {
      if (typeof dataToSubmit.isSeller === "string") {
        dataToSubmit.isSeller = dataToSubmit.isSeller === "true"
      }
    }

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
        const formData = new FormData()
        formData.append("profilePic", selectedFile)

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

        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })
      } else {
        if (dataToSubmit.walletBalance !== undefined) {
          dataToSubmit.walletBalance = Number(dataToSubmit.walletBalance)
        }
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`, {
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

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not available"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-zinc-900 p-6">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center space-y-6 transition-all">
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Authentication Required</h2>
          <p className="text-muted-foreground">Please log in to view your profile.</p>
          <Button variant="default" size="lg" className="mt-4 w-full">
            Log In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex flex-col">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="container max-w-5xl mx-auto">
          {loading ? (
            <div className="space-y-6">
              <Card className="overflow-hidden border shadow-lg">
                <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/10"></div>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <Skeleton className="w-32 h-32 rounded-full -mt-16 md:-mt-12 border-4 border-background" />
                    <div className="space-y-4 w-full max-w-lg">
                      <Skeleton className="h-8 w-48" />
                      <Skeleton className="h-5 w-64" />
                      <div className="flex gap-2">
                        <Skeleton className="h-9 w-28" />
                        <Skeleton className="h-9 w-28" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-lg">
                <CardHeader>
                  <Skeleton className="h-7 w-40" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Skeleton className="h-24 rounded-lg" />
                      <Skeleton className="h-24 rounded-lg" />
                      <Skeleton className="h-24 rounded-lg" />
                      <Skeleton className="h-24 rounded-lg" />
                    </div>
                    <Separator />
                    <Skeleton className="h-28 rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              <Card className="overflow-hidden border-0 shadow-lg">
                <div className="h-48 relative">
                  <div className="absolute inset-0 bg-[url('/digi.jpeg')] bg-cover bg-center"></div>
                </div>
                <CardContent className="p-6 relative">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="relative -mt-24 md:-mt-20">
                      <Avatar className="w-36 h-36 border-4 border-background shadow-xl rounded-full">
                        <AvatarImage
                          src={previewUrl || profile?.profilePic || ""}
                          alt={profile?.username}
                          className="h-full w-full object-cover"
                        />
                        <AvatarFallback className="text-5xl bg-primary/10">
                          {profile?.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {editing && (
                        <div className="absolute bottom-1 right-1">
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
                    <div className="flex flex-col space-y-3 pt-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-3xl font-bold">{profile?.username}</h1>
                        {profile?.isSeller && (
                          <Badge className="ml-2 text-xs px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                            <ShieldCheck className="w-3 h-3 mr-1" /> Verified Seller
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-col space-y-1.5 text-muted-foreground">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          <span>{profile?.email}</span>
                        </div>
                        {profile?.country && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{profile.country}</span>
                          </div>
                        )}
                        {profile?.phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2" />
                            <span>{profile.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>Member since {formatDate(profile?.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="md:ml-auto flex gap-3 mt-4 md:mt-0">
                      {editing ? (
                        <>
                          <Button onClick={handleUpdate} disabled={saving} className="gap-2 rounded-full px-6">
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
                            className="rounded-full"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => setEditing(true)}
                          className="rounded-full px-6 transition-all hover:shadow-md"
                        >
                          Edit Profile
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="details" className="w-full">
                <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 rounded-full h-12 p-1 bg-muted/80">
                  <TabsTrigger value="details" className="rounded-full data-[state=active]:shadow-md transition-all">
                    Profile Details
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="rounded-full data-[state=active]:shadow-md transition-all">
                    Activity
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-6">
                  <Card className="border-0 shadow-lg overflow-hidden">
                    <CardHeader className="bg-muted/40 border-b py-4">
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Personal Information
                      </h3>
                    </CardHeader>
                    <CardContent className="p-6">
                      {editing ? (
                        <div className="space-y-6 max-w-2xl">
                          <div className="grid gap-5">
                            <div className="grid gap-2">
                              <Label htmlFor="username" className="text-sm font-medium">
                                Username
                              </Label>
                              <Input
                                id="username"
                                value={updatedProfile.username || ""}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                  setUpdatedProfile({ ...updatedProfile, username: e.target.value })
                                }
                                className="rounded-lg border-muted"
                              />
                            </div>

                            <div className="grid gap-2">
                              <Label htmlFor="country" className="text-sm font-medium">
                                Country
                              </Label>
                              <Input
                                id="country"
                                value={updatedProfile.country || ""}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                  setUpdatedProfile({ ...updatedProfile, country: e.target.value })
                                }
                                className="rounded-lg border-muted"
                              />
                            </div>

                            <div className="grid gap-2">
                              <Label htmlFor="phone" className="text-sm font-medium">
                                Phone
                              </Label>
                              <Input
                                id="phone"
                                value={updatedProfile.phone || ""}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                  setUpdatedProfile({ ...updatedProfile, phone: e.target.value })
                                }
                                className="rounded-lg border-muted"
                              />
                            </div>

                            <div className="grid gap-2">
                              <Label htmlFor="bio" className="text-sm font-medium">
                                Bio
                              </Label>
                              <Textarea
                                id="bio"
                                rows={4}
                                value={updatedProfile.bio || ""}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                                  setUpdatedProfile({ ...updatedProfile, bio: e.target.value })
                                }
                                placeholder="Tell us about yourself..."
                                className="rounded-lg border-muted resize-none"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="bg-muted/30 p-4 rounded-xl">
                              <h4 className="text-sm font-medium text-primary mb-2 flex items-center gap-1">
                                <User className="w-4 h-4" />
                                Username
                              </h4>
                              <p className="text-lg font-medium">{profile?.username}</p>
                            </div>

                            <div className="bg-muted/30 p-4 rounded-xl">
                              <h4 className="text-sm font-medium text-primary mb-2 flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                Email
                              </h4>
                              <p className="text-lg font-medium">{profile?.email}</p>
                            </div>

                            <div className="bg-muted/30 p-4 rounded-xl">
                              <h4 className="text-sm font-medium text-primary mb-2 flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                Country
                              </h4>
                              <p className="text-lg font-medium">{profile?.country || "Not specified"}</p>
                            </div>

                            <div className="bg-muted/30 p-4 rounded-xl">
                              <h4 className="text-sm font-medium text-primary mb-2 flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                Phone
                              </h4>
                              <p className="text-lg font-medium">{profile?.phone || "Not specified"}</p>
                            </div>
                          </div>

                          <Separator className="my-6" />

                          <div className="bg-muted/30 p-5 rounded-xl">
                            <h4 className="text-sm font-medium text-primary mb-3 flex items-center gap-1">
                              <Info className="w-4 h-4" />
                              Bio
                            </h4>
                            <p className="text-base leading-relaxed">
                              {profile?.bio || "No bio available. Edit your profile to add a bio."}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="mt-6">
                  <Card className="border-0 shadow-lg overflow-hidden">
                    <CardHeader className="bg-muted/40 border-b py-4">
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Recent Activity
                      </h3>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                          <Clock className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No Recent Activity</h3>
                        <p className="text-muted-foreground max-w-md">
                          Your recent activity will appear here. Start exploring the platform to see your activity.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

