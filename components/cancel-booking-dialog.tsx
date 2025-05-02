"use client"

import type React from "react"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface CancelBookingDialogProps {
  bookingId: string
  userId: string
  isPaid: boolean
  onCancelled: () => void
  children: React.ReactNode
}

export default function CancelBookingDialog({
  bookingId,
  userId,
  isPaid,
  onCancelled,
  children,
}: CancelBookingDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleCancel = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "cancelled",
          userId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Захиалга цуцлахад алдаа гарлаа")
      }

      toast({
        title: "Амжилттай",
        description: "Захиалга амжилттай цуцлагдлаа",
      })

      setIsOpen(false)
      onCancelled()
    } catch (error) {
      console.error("Error cancelling booking:", error)
      toast({
        title: "Алдаа гарлаа",
        description: error instanceof Error ? error.message : "Захиалга цуцлахад алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Захиалга цуцлах</DialogTitle>
          <DialogDescription>
            Та энэ захиалгыг цуцлахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isPaid ? (
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-800 font-medium">Анхааруулга</p>
                <p className="text-amber-700 text-sm">
                  Энэ захиалгын төлбөр төлөгдсөн байна. Цуцлах тохиолдолд буцаан олголт хийгдэхгүй. Буцаан олголт
                  хийлгэх бол манай үйлчилгээний ажилтантай холбогдоно уу.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">
              Захиалгыг цуцалснаар таны захиалга "Цуцлагдсан" төлөвт шилжих болно. Та дахин захиалга хийх боломжтой.
            </p>
          )}
        </div>

        <DialogFooter className="flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Болих
          </Button>
          <Button variant="destructive" onClick={handleCancel} disabled={isLoading}>
            {isLoading ? "Цуцалж байна..." : "Цуцлах"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
