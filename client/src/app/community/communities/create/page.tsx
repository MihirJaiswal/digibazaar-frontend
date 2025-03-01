"use client"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import axios from "axios"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuthStore } from "@/store/authStore"

const formSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Community name must be at least 3 characters." })
    .max(50, { message: "Community name must be less than 50 characters." }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters." })
    .max(500, { message: "Description must be less than 500 characters." }),
  image: z.string().optional(),
  isPublic: z.boolean().optional().default(true),
})

export default function CreateCommunityPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token) // Retrieve token from auth store
  const hasHydrated = useAuthStore.persist.hasHydrated

  // Initialize form state
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      image: "",
      isPublic: true,
    },
  })

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [hasHydrated, user, router])

  // Conditionally render the UI after hydration
  if (!user) {
    return <div>Loading...</div>
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Append creatorId from the authenticated user
      const payload = { ...values, creatorId: user?.id }

      // Send the token in the Authorization header along with the request
      const response = await axios.post(
        "http://localhost:8800/api/communities",
        payload,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      const community = response.data

      toast.success(
        `The community r/${values.name} has been created successfully.`
      )
      router.push(`/communities/${community.id}`)
    } catch (error) {
      toast.error("Failed to create community")
      console.error("Error creating community:", error)
    }
  }

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create a Community</CardTitle>
          <CardDescription>
            Create a new community to share and discuss topics with others.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Community Name</FormLabel>
                    <FormControl>
                      <Input placeholder="programming" {...field} />
                    </FormControl>
                    <FormDescription>
                      This will be displayed as r/{field.value || "community"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell people what this community is about..."
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Community Image URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/image.png"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      (Optional) This image will be used as the community icon.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    </FormControl>
                    <FormLabel>Public Community</FormLabel>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Create Community
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
