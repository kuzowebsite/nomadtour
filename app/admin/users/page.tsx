"use client"

import { useState } from "react"
import { MoreHorizontal, Search, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export default function AdminUsers() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  // Filter users based on search query and filters
  const filteredUsers = allUsers.filter((user) => {
    // Apply search filter
    const matchesSearch =
      searchQuery === "" ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())

    // Apply role filter
    const matchesRole = roleFilter === "all" || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  const handleAddUser = () => {
    toast({
      title: "Хэрэглэгч нэмэх",
      description: "Шинэ хэрэглэгч нэмэх форм нээгдлээ.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Хэрэглэгчид</h2>
          <p className="text-muted-foreground">Бүх хэрэглэгчдийн жагсаалт болон удирдлага.</p>
        </div>
        <Button onClick={handleAddUser}>
          <UserPlus className="mr-2 h-4 w-4" /> Хэрэглэгч нэмэх
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Хэрэглэгчид</CardTitle>
          <CardDescription>Нийт {filteredUsers.length} хэрэглэгч байна.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Хэрэглэгч хайх..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Бүх үүрэг" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Бүх үүрэг</SelectItem>
                  <SelectItem value="admin">Админ</SelectItem>
                  <SelectItem value="user">Хэрэглэгч</SelectItem>
                  <SelectItem value="guide">Хөтөч</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium">ID</th>
                  <th className="pb-2 font-medium">Нэр</th>
                  <th className="pb-2 font-medium">И-мэйл</th>
                  <th className="pb-2 font-medium">Утас</th>
                  <th className="pb-2 font-medium">Үүрэг</th>
                  <th className="pb-2 font-medium">Бүртгүүлсэн</th>
                  <th className="pb-2 font-medium">Төлөв</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b last:border-0">
                    <td className="py-3 text-sm">{user.id}</td>
                    <td className="py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                          <span className="font-medium text-emerald-700">{user.name.charAt(0)}</span>
                        </div>
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-sm">{user.email}</td>
                    <td className="py-3 text-sm">{user.phone}</td>
                    <td className="py-3 text-sm">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : user.role === "guide"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {user.role === "admin" ? "Админ" : user.role === "guide" ? "Хөтөч" : "Хэрэглэгч"}
                      </span>
                    </td>
                    <td className="py-3 text-sm">{user.registeredDate}</td>
                    <td className="py-3 text-sm">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          user.status === "active" ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></span>
                    </td>
                    <td className="py-3 text-sm">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Цэс</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Дэлгэрэнгүй</DropdownMenuItem>
                          <DropdownMenuItem>Засах</DropdownMenuItem>
                          <DropdownMenuItem>Нууц үг шинэчлэх</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            {user.status === "active" ? "Идэвхгүй болгох" : "Идэвхжүүлэх"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Нийт {filteredUsers.length} хэрэглэгчээс {filteredUsers.length} харуулж байна
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Өмнөх
            </Button>
            <Button variant="outline" size="sm" className="bg-emerald-50">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              Дараах
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

const allUsers = [
  {
    id: "U-1001",
    name: "Батбаяр Д.",
    email: "batbayar@example.com",
    phone: "+976 9911-2233",
    role: "admin",
    registeredDate: "2022-01-15",
    status: "active",
  },
  {
    id: "U-1002",
    name: "Оюунчимэг Б.",
    email: "oyunchimeg@example.com",
    phone: "+976 9922-3344",
    role: "admin",
    registeredDate: "2022-02-20",
    status: "active",
  },
  {
    id: "U-1003",
    name: "Ганбаатар Т.",
    email: "ganbaatar@example.com",
    phone: "+976 9933-4455",
    role: "guide",
    registeredDate: "2022-03-10",
    status: "active",
  },
  {
    id: "U-1004",
    name: "Сарангэрэл Ч.",
    email: "sarangerel@example.com",
    phone: "+976 9944-5566",
    role: "guide",
    registeredDate: "2022-04-05",
    status: "active",
  },
  {
    id: "U-1005",
    name: "Болд Б.",
    email: "bold@example.com",
    phone: "+976 9955-6677",
    role: "user",
    registeredDate: "2022-05-12",
    status: "active",
  },
  {
    id: "U-1006",
    name: "Сараа Д.",
    email: "saraa@example.com",
    phone: "+976 9966-7788",
    role: "user",
    registeredDate: "2022-06-18",
    status: "active",
  },
  {
    id: "U-1007",
    name: "Бат-Эрдэнэ Г.",
    email: "baterdene@example.com",
    phone: "+976 9977-8899",
    role: "user",
    registeredDate: "2022-07-22",
    status: "inactive",
  },
  {
    id: "U-1008",
    name: "Мөнхбаяр Л.",
    email: "munkhbayar@example.com",
    phone: "+976 9988-9900",
    role: "user",
    registeredDate: "2022-08-30",
    status: "active",
  },
]
