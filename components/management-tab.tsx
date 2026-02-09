"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RotateCcw, AlertTriangle, Info } from "lucide-react"
import { toast } from "sonner"
import type { AppData } from "@/lib/store"

interface Props {
  data: AppData
  updateData: (updater: (prev: AppData) => AppData) => void
}

export default function ManagementTab({ data, updateData }: Props) {
  const [playerOption, setPlayerOption] = useState("deleteAll")
  const [courtOption, setCourtOption] = useState("deleteAll")
  const [showConfirm, setShowConfirm] = useState(false)

  const handleReset = () => {
    updateData((prev) => {
      let newPlayers = prev.players
      let newCourts = prev.courts

      // Player data handling
      if (playerOption === "deleteAll") {
        newPlayers = []
      } else {
        // Reset player stats only
        newPlayers = prev.players.map((p) => ({
          ...p,
          games: 0,
          shuttlecocks: 0,
          paid: false,
          paymentMethod: "mobile" as const,
          courtId: null,
        }))
      }

      // Court data handling
      if (courtOption === "deleteAll") {
        newCourts = []
      } else {
        // Keep courts but clear players from them
        newCourts = prev.courts.map((c) => ({
          ...c,
          players: [],
          shuttlecocks: 0,
          isPlaying: false,
        }))
      }

      return {
        ...prev,
        players: newPlayers,
        courts: newCourts,
        totalShuttlecocksUsed: 0,
        // Don't reset settings
      }
    })

    setShowConfirm(false)
    toast.success("เริ่มจัดก๊วนใหม่เรียบร้อยแล้ว")
  }

  return (
    <div className="space-y-4">
      {/* Reset Button */}
      <Card className="border-destructive/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <RotateCcw className="h-5 w-5" />
            เริ่มจัดก๊วนใหม่
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Player data option */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">ลบข้อมูลรายชื่อผู้เล่นทั้งหมด</span>
            </div>
            <RadioGroup
              value={playerOption}
              onValueChange={setPlayerOption}
              className="ml-6 space-y-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="deleteAll" id="p-delete" />
                <Label htmlFor="p-delete" className="text-sm">
                  ลบข้อมูลผู้เล่นทั้งหมด (จะลบสมาชิกทั้งหมด)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="resetStats" id="p-reset" />
                <Label htmlFor="p-reset" className="text-sm">
                  ลบข้อมูลการเล่นของผู้เล่นทั้งหมด (reset เกมส์ ลูก รวม การชำระ)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Court data option */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">ลบข้อมูลคอร์ททั้งหมด</span>
            </div>
            <RadioGroup
              value={courtOption}
              onValueChange={setCourtOption}
              className="ml-6 space-y-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="deleteAll" id="c-delete" />
                <Label htmlFor="c-delete" className="text-sm">
                  ลบข้อมูลคอร์ททั้งหมด (จะลบคอร์ททั้งหมด)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="keep" id="c-keep" />
                <Label htmlFor="c-keep" className="text-sm">
                  ไม่ลบข้อมูลคอร์ท (จะไม่ลบข้อมูลคอร์ทที่ทำการเพิ่มไว้)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Income data */}
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium">ลบข้อมูลรายได้ทั้งหมด</span>
          </div>

          <Separator />

          {/* Info */}
          <div className="flex items-start gap-2 rounded-lg bg-muted/60 p-3">
            <Info className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              จัดก๊วนใหม่ ใช้สำหรับเมื่อเล่นก๊วนจบ และต้องการเริ่มเล่นใหม่อีกครั้ง
              <br />
              ไม่ reset ค่าที่ตั้งไว้ใน tab ตั้งค่า
            </p>
          </div>

          <Button
            variant="destructive"
            className="w-full"
            size="lg"
            onClick={() => setShowConfirm(true)}
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            เริ่มจัดก๊วนใหม่
          </Button>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันเริ่มก๊วนใหม่</DialogTitle>
            <DialogDescription>
              ต้องการเริ่มก๊วนใหม่ ข้อมูลจะถูกลบตามตัวเลือกที่เลือกไว้
              ค่าที่ตั้งไว้ใน tab ตั้งค่าจะไม่ถูก reset
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              ยกเลิก
            </Button>
            <Button variant="destructive" onClick={handleReset}>
              ตกลง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
