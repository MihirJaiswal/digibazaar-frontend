//page for uploading deliveries for gigs
"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, FileUp, LinkIcon, Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"

export default function SellerDeliveryUpload() {
  const router = useRouter()
  const params = useParams()
  const { id: gigOrderId } = params || {}

  const [fileUrl, setFileUrl] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { token } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!gigOrderId) {
      setError("Gig Order ID is missing in URL parameters.")
      return
    }

    setLoading(true)
    setError("")
    try {
      const res = await fetch("http://localhost:8800/api/gig-deliveries/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ gigOrderId, fileUrl, message }),
        credentials: "include",
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || "Failed to upload delivery")
      }
      await res.json()
      alert("Delivery uploaded successfully!")
      router.push("/gigs/orders")
    } catch (err: any) {
      console.error("Error uploading delivery:", err)
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <Card className="shadow-lg ">
        <CardHeader className="space-y-1 bg-muted/30">
          <CardTitle className="text-2xl font-bold text-center">
            <div className="flex items-center justify-center gap-2">
              <FileUp className="h-6 w-6 text-primary" />
              <span>Upload Delivery</span>
            </div>
          </CardTitle>
          <CardDescription className="text-center">
            Provide your completed work for order #{gigOrderId?.toString().slice(0, 8)}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fileUrl" className="text-sm font-medium">
                File URL <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id="fileUrl"
                  type="url"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://example.com/your-file.zip"
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">Provide a link to your work (Google Drive, Dropbox, etc.)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium">
                Message to Buyer
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Include any instructions or notes for the buyer..."
                rows={5}
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between border-t bg-muted/20 p-6">
          <Button variant="outline" onClick={() => router.back()} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="min-w-[120px]">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Submit Delivery"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

