"use client"

import { useState } from "react"
import Image from "next/image"
import { Check } from "lucide-react"

import { type PaymentProvider, paymentProviders } from "@/lib/payment-providers"
import { cn } from "@/lib/utils"

interface PaymentMethodSelectorProps {
  onSelect: (provider: string) => void
  selectedProvider?: string
}

export function PaymentMethodSelector({ onSelect, selectedProvider }: PaymentMethodSelectorProps) {
  const [selected, setSelected] = useState<string>(selectedProvider || "")

  const handleSelect = (provider: string) => {
    setSelected(provider)
    onSelect(provider)
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">Төлбөрийн хэлбэр сонгох</div>
      <div className="grid grid-cols-1 gap-3">
        {paymentProviders
          .filter((provider) => provider.isActive)
          .map((provider) => (
            <PaymentMethodCard
              key={provider.name}
              provider={provider}
              isSelected={selected === provider.name}
              onSelect={() => handleSelect(provider.name)}
            />
          ))}
      </div>
    </div>
  )
}

interface PaymentMethodCardProps {
  provider: PaymentProvider
  isSelected: boolean
  onSelect: () => void
}

function PaymentMethodCard({ provider, isSelected, onSelect }: PaymentMethodCardProps) {
  return (
    <div
      className={cn(
        "relative flex items-center p-4 rounded-lg border cursor-pointer transition-all",
        isSelected ? "border-emerald-500 bg-emerald-50" : "border-gray-200 bg-white hover:border-gray-300",
      )}
      onClick={onSelect}
    >
      <div className="mr-4 w-12 h-12 relative flex-shrink-0">
        <Image src={provider.logo || "/placeholder.svg"} alt={provider.name} fill className="object-contain" />
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-gray-900 capitalize">{provider.name}</h3>
        <p className="text-sm text-gray-500">{provider.description}</p>
        {provider.processingFee !== "0%" && (
          <p className="text-xs text-gray-400 mt-1">Шимтгэл: {provider.processingFee}</p>
        )}
      </div>
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
          <Check className="h-3 w-3 text-white" />
        </div>
      )}
    </div>
  )
}
