"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, User, Crown } from "lucide-react"
import { toast } from "sonner"
import type { AppData } from "@/lib/store"

interface Props {
  data: AppData
  updateData: (updater: (prev: AppData) => AppData) => void
}

export default function SettingsTab({ data, updateData }: Props) {
  const [playerCourtFee, setPlayerCourtFee] = useState(
    data.settings.playerCourtFee.toString()
  )
  const [playerShuttlecockFee, setPlayerShuttlecockFee] = useState(
    data.settings.playerShuttlecockFee.toString()
  )
  const [organizerCourtFee, setOrganizerCourtFee] = useState(
    data.settings.organizerCourtFee.toString()
  )
  const [organizerShuttlecockFee, setOrganizerShuttlecockFee] = useState(
    data.settings.organizerShuttlecockFee.toString()
  )

  useEffect(() => {
    setPlayerCourtFee(data.settings.playerCourtFee.toString())
    setPlayerShuttlecockFee(data.settings.playerShuttlecockFee.toString())
    setOrganizerCourtFee(data.settings.organizerCourtFee.toString())
    setOrganizerShuttlecockFee(data.settings.organizerShuttlecockFee.toString())
  }, [data.settings])

  const savePlayerSettings = () => {
    const courtFee = Number(playerCourtFee) || 0
    const shuttleFee = Number(playerShuttlecockFee) || 0
    updateData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        playerCourtFee: courtFee,
        playerShuttlecockFee: shuttleFee,
      },
    }))
    toast.success("บันทึกการตั้งค่า (ผู้เล่น) แล้ว")
  }

  const saveOrganizerSettings = () => {
    const courtFee = Number(organizerCourtFee) || 0
    const shuttleFee = Number(organizerShuttlecockFee) || 0
    updateData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        organizerCourtFee: courtFee,
        organizerShuttlecockFee: shuttleFee,
      },
    }))
    toast.success("บันทึกการตั้งค่า (ผู้จัด) แล้ว")
  }

  return (
    <div className="space-y-4">
      {/* Player Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-5 w-5 text-primary" />
            สำหรับผู้เล่น
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="player-court-fee">ค่าคอร์ท (เหมารวม) - บาท</Label>
            <Input
              id="player-court-fee"
              type="number"
              min="0"
              value={playerCourtFee}
              onChange={(e) => setPlayerCourtFee(e.target.value)}
              placeholder="เช่น 100"
            />
            <p className="text-xs text-muted-foreground">
              ค่าคอร์ทต่อหัวผู้เล่น จะนำไปบวกรวมกับค่าลูก
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="player-shuttle-fee">ค่าลูกแบด (บาท/ลูก) - ต่อคน</Label>
            <Input
              id="player-shuttle-fee"
              type="number"
              min="0"
              value={playerShuttlecockFee}
              onChange={(e) => setPlayerShuttlecockFee(e.target.value)}
              placeholder="เช่น 20"
            />
            <p className="text-xs text-muted-foreground">
              ราคาลูกแบดต่อคน เช่น ลูกละ 80 บาท หาร 4 คน = 20 บาท/คน
            </p>
          </div>
          <Button onClick={savePlayerSettings} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            <Save className="mr-2 h-4 w-4" />
            บันทึกการตั้งค่า (ผู้เล่น)
          </Button>
        </CardContent>
      </Card>

      {/* Organizer Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Crown className="h-5 w-5 text-primary" />
            สำหรับผู้จัด
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-court-fee">ค่าคอร์ท (เหมารวม) - บาท</Label>
            <Input
              id="org-court-fee"
              type="number"
              min="0"
              value={organizerCourtFee}
              onChange={(e) => setOrganizerCourtFee(e.target.value)}
              placeholder="เช่น 1200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-shuttle-fee">ค่าลูกแบด (บาท/ลูก) - ราคาต่อลูก</Label>
            <Input
              id="org-shuttle-fee"
              type="number"
              min="0"
              value={organizerShuttlecockFee}
              onChange={(e) => setOrganizerShuttlecockFee(e.target.value)}
              placeholder="เช่น 80"
            />
            <p className="text-xs text-muted-foreground">
              ราคาจริง 1 ลูก (ไม่หาร 4 ตามจำนวนผู้เล่น)
            </p>
          </div>
          <Button onClick={saveOrganizerSettings} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            <Save className="mr-2 h-4 w-4" />
            บันทึกการตั้งค่า (ผู้จัด)
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
