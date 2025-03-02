"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/store/authStore"
import { Switch } from "@/components/ui/switch"
import { motion } from "framer-motion"

// Define form schema
const formSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().min(10).max(500),
  image: z.string().optional(),
  coverImage: z.string().optional(),
  isPublic: z.boolean().default(true),
  allowNSFW: z.boolean().default(false),
  tags: z.string().optional(),
  rules: z.string().optional(),
})

export default function CreateCommunityPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)

  const [step, setStep] = useState(1)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      image: "",
      coverImage: "",
      isPublic: true,
      allowNSFW: false,
      tags: "",
      rules: "",
    },
  })

  if (!user) return <div>Loading...</div>

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const payload = { ...values, creatorId: user?.id }
      const response = await axios.post(
        "http://localhost:8800/api/communities",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      const community = response.data
      toast.success(`Community r/${values.name} created successfully!`)
      router.push(`/communities/${community.id}`)
    } catch (error) {
      toast.error("Failed to create community")
      console.error(error)
    }
  }

  return (
    <div className="container max-w-lg py-10">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Create a Community</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Community Name</FormLabel>
                        <FormControl>
                          <Input placeholder="programming" {...field} />
                        </FormControl>
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
                          <Textarea placeholder="What is your community about?" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button onClick={() => setStep(2)} className="w-full">
                    Next
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Community Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/icon.png" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="coverImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/cover.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <FormLabel>Public Community</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="allowNSFW"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <FormLabel>Allow NSFW Content</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags (comma-separated)</FormLabel>
                        <FormControl>
                          <Input placeholder="tech, coding, javascript" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rules"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Community Rules</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Specify rules for your community" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button type="submit">Create Community</Button>
                  </div>
                </motion.div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
