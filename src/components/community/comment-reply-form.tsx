"use client"

import { useState } from "react"

import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation";

interface CommentReplyFormProps {
  onSubmit: (content: string) => void
  onCancel: () => void
  initialContent?: string
  user: any
}

export function CommentReplyForm({ onSubmit, onCancel, initialContent = "", user }: CommentReplyFormProps) {
  const [content, setContent] = useState(initialContent)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter();

  useEffect(() => {
    // Focus the textarea when the component mounts
    textareaRef.current?.focus()
  }, [])

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content)
      setContent("")
    }
  }

  const takeToLogin = () => {
    router.push("/auth/login");
  }

  return (
    <div className="mt-4 ml-14 space-y-2">
      <Textarea
        ref={textareaRef}
        placeholder="Write a reply..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-20"
      />
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={user ? handleSubmit : takeToLogin}>
          Reply
        </Button>
      </div>
    </div>
  )
}

