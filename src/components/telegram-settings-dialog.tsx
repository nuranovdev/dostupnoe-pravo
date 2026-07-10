"use client"

import { useState, useTransition } from "react"
import { Loader2, Send } from "lucide-react"
import { toast } from "sonner"

import { sendTestNotificationAction } from "@/app/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TelegramSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  chatId: string
  onSave: (chatId: string) => void
}

export function TelegramSettingsDialog({
  open,
  onOpenChange,
  chatId,
  onSave,
}: TelegramSettingsDialogProps) {
  // Seeded from the stored chat id on mount; the parent remounts this dialog
  // (via `key`) whenever it opens, so the draft always reflects the saved value.
  const [draft, setDraft] = useState(chatId)
  const [testing, startTest] = useTransition()

  function handleTest() {
    startTest(async () => {
      const result = await sendTestNotificationAction(draft)
      if (!result.ok) {
        toast.error("Test message failed", { description: result.error })
        return
      }
      // Persist as soon as we know the id works.
      onSave(draft.trim())
      toast.success("Test message sent", {
        description: "Check your Telegram — the chat id is saved.",
      })
    })
  }

  function handleSave() {
    onSave(draft.trim())
    toast.success(draft.trim() ? "Chat id saved" : "Chat id cleared")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Telegram notifications</DialogTitle>
          <DialogDescription>
            Enter your Telegram chat id to receive a message here whenever a new
            client is created. Saved in this browser only.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="tg-chat-id">Chat ID</Label>
            <Input
              id="tg-chat-id"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="e.g. 6041139368"
              inputMode="numeric"
              autoComplete="off"
            />
          </div>

          <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
            <li>
              Open{" "}
              <a
                href="https://t.me/nuranovdevDailybot"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline underline-offset-2"
              >
                @nuranovdevDailybot
              </a>{" "}
              and press <span className="font-medium">Start</span>.
            </li>
            <li>
              Get your numeric chat id from{" "}
              <a
                href="https://t.me/userinfobot"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline underline-offset-2"
              >
                @userinfobot
              </a>
              .
            </li>
            <li>Paste it above and send a test message.</li>
          </ol>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleTest}
            disabled={testing || !draft.trim()}
          >
            {testing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Send test
          </Button>
          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
