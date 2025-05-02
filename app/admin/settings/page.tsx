"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Bell, Globe, Lock, Save, User, Trash2, AlertCircle, CreditCard } from "lucide-react"
import { ref, get, set } from "firebase/database"
import { database } from "@/lib/firebase"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import ImageUpload from "@/components/image-upload"

export default function AdminSettings() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "NomadTour",
    logoUrl: "",
    siteDescription: "Монгол орны үзэсгэлэнт газруудаар аялах хамгийн шилдэг сонголт",
    contactEmail: "info@nomadtour.mn",
    contactPhone: "+976 9911-2233",
    address: "Улаанбаатар хот, Сүхбаатар дүүрэг, 8-р хороо, Бага тойруу 14",
    socialLinks: {
      facebook: "https://facebook.com",
      instagram: "https://instagram.com",
      twitter: "https://twitter.com",
      youtube: "https://youtube.com",
    },
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    newBookingAlert: true,
    bookingCancellationAlert: true,
    paymentAlert: true,
    systemUpdates: false,
  })

  const [paymentSettings, setPaymentSettings] = useState({
    currency: "MNT",
    paymentMethods: {
      creditCard: true,
      bankTransfer: true,
      cash: true,
    },
    bankDetails: {
      bankName: "Хаан Банк",
      accountNumber: "5001234567",
      accountName: "НомадТур ХХК",
    },
    taxRate: 10,
  })

  // Load settings from Firebase on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true)
        const settingsRef = ref(database, "settings")
        const snapshot = await get(settingsRef)

        if (snapshot.exists()) {
          const data = snapshot.val()
          if (data.general) setGeneralSettings(data.general)
          if (data.notifications) setNotificationSettings(data.notifications)
          if (data.payment) setPaymentSettings(data.payment)

          toast({
            title: "Тохиргоо ачаалагдлаа",
            description: "Системийн тохиргоо амжилттай ачаалагдлаа.",
          })
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
        toast({
          title: "Алдаа гарлаа",
          description: "Тохиргоо ачаалахад алдаа гарлаа. Дахин оролдоно уу.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [toast])

  const handleGeneralSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setGeneralSettings((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSocialLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setGeneralSettings((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [name]: value,
      },
    }))
  }

  const handleNotificationSettingsChange = (name: string, checked: boolean) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handlePaymentSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setPaymentSettings((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
        },
      }))
    } else {
      setPaymentSettings((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handlePaymentMethodChange = (method: string, checked: boolean) => {
    setPaymentSettings((prev) => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        [method]: checked,
      },
    }))
  }

  const handleLogoUpload = (url: string) => {
    setGeneralSettings((prev) => ({
      ...prev,
      logoUrl: url,
    }))
  }

  const handleSaveSettings = async () => {
    try {
      setIsLoading(true)
      const settingsRef = ref(database, "settings")

      await set(settingsRef, {
        general: generalSettings,
        notifications: notificationSettings,
        payment: paymentSettings,
      })

      toast({
        title: "Тохиргоо хадгалагдлаа",
        description: "Системийн тохиргоо амжилттай хадгалагдлаа.",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Тохиргоо хадгалахад алдаа гарлаа. Дахин оролдоно уу.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Тохиргоо</h2>
        <p className="text-muted-foreground">Системийн тохиргоо болон хувийн мэдээлэл.</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">
            <Globe className="mr-2 h-4 w-4" /> Ерөнхий
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" /> Мэдэгдэл
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="mr-2 h-4 w-4" /> Төлбөр
          </TabsTrigger>
          <TabsTrigger value="account">
            <User className="mr-2 h-4 w-4" /> Хувийн мэдээлэл
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ерөнхий тохиргоо</CardTitle>
              <CardDescription>Системийн ерөнхий тохиргоо.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Сайтын нэр</Label>
                  <Input
                    id="siteName"
                    name="siteName"
                    value={generalSettings.siteName}
                    onChange={handleGeneralSettingsChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Холбоо барих и-мэйл</Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={generalSettings.contactEmail}
                    onChange={handleGeneralSettingsChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Сайтын лого</Label>
                <div className="flex items-center gap-4">
                  {generalSettings.logoUrl && (
                    <div className="relative w-16 h-16 border rounded-md overflow-hidden">
                      <img
                        src={generalSettings.logoUrl || "/placeholder.svg"}
                        alt="Site Logo"
                        className="object-contain w-full h-full"
                      />
                    </div>
                  )}
                  <ImageUpload
                    folder="logos"
                    onUploadComplete={handleLogoUpload}
                    existingUrl={generalSettings.logoUrl}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Сайтын тайлбар</Label>
                <Textarea
                  id="siteDescription"
                  name="siteDescription"
                  value={generalSettings.siteDescription}
                  onChange={handleGeneralSettingsChange}
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Холбоо барих утас</Label>
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    value={generalSettings.contactPhone}
                    onChange={handleGeneralSettingsChange}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Хаяг</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={generalSettings.address}
                  onChange={handleGeneralSettingsChange}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label>Сошиал холбоосууд</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      name="facebook"
                      value={generalSettings.socialLinks?.facebook || ""}
                      onChange={handleSocialLinkChange}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      name="instagram"
                      value={generalSettings.socialLinks?.instagram || ""}
                      onChange={handleSocialLinkChange}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      name="twitter"
                      value={generalSettings.socialLinks?.twitter || ""}
                      onChange={handleSocialLinkChange}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtube">YouTube</Label>
                    <Input
                      id="youtube"
                      name="youtube"
                      value={generalSettings.socialLinks?.youtube || ""}
                      onChange={handleSocialLinkChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isLoading}>
                {isLoading ? (
                  <>Хадгалж байна...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Хадгалах
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Мэдэгдлийн тохиргоо</CardTitle>
              <CardDescription>Системийн мэдэгдлийн тохиргоо.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">И-мэйл мэдэгдэл</p>
                  <p className="text-sm text-muted-foreground">И-мэйлээр мэдэгдэл хүлээн авах</p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => handleNotificationSettingsChange("emailNotifications", checked)}
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS мэдэгдэл</p>
                  <p className="text-sm text-muted-foreground">SMS-ээр мэдэгдэл хүлээн авах</p>
                </div>
                <Switch
                  checked={notificationSettings.smsNotifications}
                  onCheckedChange={(checked) => handleNotificationSettingsChange("smsNotifications", checked)}
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Шинэ захиалга</p>
                  <p className="text-sm text-muted-foreground">Шинэ захиалга орж ирэхэд мэдэгдэл хүлээн авах</p>
                </div>
                <Switch
                  checked={notificationSettings.newBookingAlert}
                  onCheckedChange={(checked) => handleNotificationSettingsChange("newBookingAlert", checked)}
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Захиалга цуцлагдсан</p>
                  <p className="text-sm text-muted-foreground">Захиалга цуцлагдахад мэдэгдэл хүлээн авах</p>
                </div>
                <Switch
                  checked={notificationSettings.bookingCancellationAlert}
                  onCheckedChange={(checked) => handleNotificationSettingsChange("bookingCancellationAlert", checked)}
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Төлбөр</p>
                  <p className="text-sm text-muted-foreground">Төлбөр хийгдэхэд мэдэгдэл хүлээн авах</p>
                </div>
                <Switch
                  checked={notificationSettings.paymentAlert}
                  onCheckedChange={(checked) => handleNotificationSettingsChange("paymentAlert", checked)}
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Системийн шинэчлэл</p>
                  <p className="text-sm text-muted-foreground">Системийн шинэчлэлийн талаар мэдэгдэл хүлээн авах</p>
                </div>
                <Switch
                  checked={notificationSettings.systemUpdates}
                  onCheckedChange={(checked) => handleNotificationSettingsChange("systemUpdates", checked)}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isLoading}>
                {isLoading ? (
                  <>Хадгалж байна...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Хадгалах
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Төлбөрийн тохиргоо</CardTitle>
              <CardDescription>Төлбөрийн системийн тохиргоо.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Мөнгөн тэмдэгт</Label>
                  <Select
                    value={paymentSettings.currency}
                    onValueChange={(value) => setPaymentSettings((prev) => ({ ...prev, currency: value }))}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Мөнгөн тэмдэгт сонгох" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MNT">Төгрөг (₮)</SelectItem>
                      <SelectItem value="USD">Доллар ($)</SelectItem>
                      <SelectItem value="EUR">Евро (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Татварын хувь (%)</Label>
                  <Input
                    id="taxRate"
                    name="taxRate"
                    type="number"
                    value={paymentSettings.taxRate}
                    onChange={(e) => setPaymentSettings((prev) => ({ ...prev, taxRate: Number(e.target.value) }))}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Төлбөрийн хэлбэрүүд</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                      <span>Кредит карт</span>
                    </div>
                    <Switch
                      checked={paymentSettings.paymentMethods.creditCard}
                      onCheckedChange={(checked) => handlePaymentMethodChange("creditCard", checked)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bank className="h-4 w-4 text-gray-500" />
                      <span>Банк шилжүүлэг</span>
                    </div>
                    <Switch
                      checked={paymentSettings.paymentMethods.bankTransfer}
                      onCheckedChange={(checked) => handlePaymentMethodChange("bankTransfer", checked)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-gray-500" />
                      <span>Бэлэн мөнгө</span>
                    </div>
                    <Switch
                      checked={paymentSettings.paymentMethods.cash}
                      onCheckedChange={(checked) => handlePaymentMethodChange("cash", checked)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Банкны мэдээлэл</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Банкны нэр</Label>
                    <Input
                      id="bankName"
                      name="bankDetails.bankName"
                      value={paymentSettings.bankDetails.bankName}
                      onChange={handlePaymentSettingsChange}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Дансны дугаар</Label>
                    <Input
                      id="accountNumber"
                      name="bankDetails.accountNumber"
                      value={paymentSettings.bankDetails.accountNumber}
                      onChange={handlePaymentSettingsChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountName">Данс эзэмшигчийн нэр</Label>
                  <Input
                    id="accountName"
                    name="bankDetails.accountName"
                    value={paymentSettings.bankDetails.accountName}
                    onChange={handlePaymentSettingsChange}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isLoading}>
                {isLoading ? (
                  <>Хадгалж байна...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Хадгалах
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Хувийн мэдээлэл</CardTitle>
              <CardDescription>Таны хувийн мэдээлэл.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Нэр</Label>
                  <Input id="name" defaultValue="Админ Нэр" disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">И-мэйл</Label>
                  <Input id="email" type="email" defaultValue="admin@nomadtour.mn" disabled={isLoading} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Утас</Label>
                  <Input id="phone" defaultValue="+976 9911-2233" disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Үүрэг</Label>
                  <Input id="role" defaultValue="Админ" disabled />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isLoading}>
                {isLoading ? (
                  <>Хадгалж байна...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Хадгалах
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Нууц үг солих</CardTitle>
              <CardDescription>Таны нууц үгийг солих.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Одоогийн нууц үг</Label>
                <Input id="currentPassword" type="password" disabled={isLoading} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Шинэ нууц үг</Label>
                  <Input id="newPassword" type="password" disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Нууц үг баталгаажуулах</Label>
                  <Input id="confirmPassword" type="password" disabled={isLoading} />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button disabled={isLoading}>
                {isLoading ? (
                  <>Хадгалж байна...</>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" /> Нууц үг солих
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Анхааруулга</AlertTitle>
            <AlertDescription>
              Дараах үйлдлийг хийснээр таны бүх мэдээлэл устах болно. Энэ үйлдлийг буцаах боломжгүй.
            </AlertDescription>
            <div className="mt-4">
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Миний бүртгэлийг устгах
              </Button>
            </div>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Missing components
const Bank = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="9" width="18" height="12" rx="1" />
    <path d="M4 4h16a1 1 0 0 1 1 1v4H3V5a1 1 0 0 1 1-1z" />
    <path d="M7 15h.01" />
    <path d="M11 15h.01" />
    <path d="M15 15h.01" />
  </svg>
)

const Wallet = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
)
