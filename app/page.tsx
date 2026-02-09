"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, LayoutGrid, TrendingUp, Settings, Wrench } from "lucide-react"
import { type AppData, loadData, saveData } from "@/lib/store"
import MembersTab from "@/components/members-tab"
import CourtsTab from "@/components/courts-tab"
import IncomeTab from "@/components/income-tab"
import SettingsTab from "@/components/settings-tab"
import ManagementTab from "@/components/management-tab"

export default function Page() {
  const [data, setData] = useState<AppData | null>(null)
  const [activeTab, setActiveTab] = useState("members")

  useEffect(() => {
    setData(loadData())
  }, [])

  const updateData = useCallback((updater: (prev: AppData) => AppData) => {
    setData((prev) => {
      if (!prev) return prev
      const next = updater(prev)
      saveData(next)
      return next
    })
  }, [])

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <Image
            src="/zz-logo.png"
            alt="BGM Logo"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <div>
            <h1 className="text-lg font-bold text-foreground leading-tight">
              BGM
            </h1>
            <p className="text-xs text-muted-foreground leading-tight">
              Badminton Gang Management
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-5">
            <TabsTrigger value="members" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">สมาชิก</span>
            </TabsTrigger>
            <TabsTrigger value="courts" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">จัดคอร์ท</span>
            </TabsTrigger>
            <TabsTrigger value="income" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">รายได้</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">ตั้งค่า</span>
            </TabsTrigger>
            <TabsTrigger value="management" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Wrench className="h-4 w-4" />
              <span className="hidden sm:inline">จัดการ</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <MembersTab data={data} updateData={updateData} />
          </TabsContent>
          <TabsContent value="courts">
            <CourtsTab data={data} updateData={updateData} />
          </TabsContent>
          <TabsContent value="income">
            <IncomeTab data={data} />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsTab data={data} updateData={updateData} />
          </TabsContent>
          <TabsContent value="management">
            <ManagementTab data={data} updateData={updateData} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-3">
        <p className="text-center text-[10px] leading-relaxed text-muted-foreground px-4">
          {"Copyright \u00A9 2026 BGM - Badminton Gang Management \u0E41\u0E2D\u0E1B\u0E1E\u0E25\u0E34\u0E40\u0E04\u0E0A\u0E31\u0E19\u0E08\u0E31\u0E14\u0E01\u0E4A\u0E27\u0E19\u0E41\u0E1A\u0E14\u0E21\u0E34\u0E19\u0E15\u0E31\u0E19 By \u0E1E\u0E35\u0E48\u0E14\u0E23\u0E35\u0E21 @\u0E01\u0E4A\u0E27\u0E19\u0E02\u0E49\u0E32\u0E27\u0E15\u0E49\u0E21\u0E23\u0E2D\u0E1A\u0E14\u0E36\u0E01, Team ZZ Badminton. All rights reserved."}
        </p>
      </footer>
    </div>
  )
}
