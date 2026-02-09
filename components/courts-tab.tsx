"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Plus,
  Play,
  Square,
  RefreshCw,
  Minus,
  XCircle,
  UserPlus,
} from "lucide-react"
import { toast } from "sonner"
import {
  type AppData,
  generateId,
  getCourtColor,
  COURT_COLORS,
} from "@/lib/store"

interface Props {
  data: AppData
  updateData: (updater: (prev: AppData) => AppData) => void
}

export default function CourtsTab({ data, updateData }: Props) {
  const [courtName, setCourtName] = useState("")
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([])
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    type: "endGame" | "removePlayers" | "closeCourt"
    courtId: string
  }>({ open: false, type: "endGame", courtId: "" })

  // Players not in any court
  const availablePlayers = data.players.filter((p) => !p.courtId)

  const addCourt = () => {
    const name = courtName.trim()
    if (!name) {
      toast.error("กรุณากรอกชื่อคอร์ท")
      return
    }
    if (data.courts.some((c) => c.name === name)) {
      toast.error("ชื่อคอร์ทนี้มีอยู่แล้ว")
      return
    }
    // Use max existing colorIndex + 1 to avoid duplicate colors after court deletion
    const maxColorIndex = data.courts.length > 0
      ? Math.max(...data.courts.map((c) => c.colorIndex))
      : -1
    const colorIndex = (maxColorIndex + 1) % COURT_COLORS.length
    updateData((prev) => ({
      ...prev,
      courts: [
        ...prev.courts,
        {
          id: generateId(),
          name,
          players: [],
          shuttlecocks: 0,
          isPlaying: false,
          colorIndex,
        },
      ],
    }))
    setCourtName("")
    toast.success(`เพิ่มคอร์ท "${name}" แล้ว`)
  }

  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayerIds((prev) => {
      if (prev.includes(playerId)) {
        return prev.filter((id) => id !== playerId)
      }
      if (prev.length >= 4) {
        toast.error("เลือกผู้เล่นได้สูงสุด 4 คน")
        return prev
      }
      return [...prev, playerId]
    })
  }

  const addPlayersToCourt = (courtId: string) => {
    const court = data.courts.find((c) => c.id === courtId)
    if (!court) return

    if (selectedPlayerIds.length === 0) {
      toast.error("กรุณาเลือกผู้เล่นก่อน")
      return
    }

    const totalAfterAdd = court.players.length + selectedPlayerIds.length
    if (totalAfterAdd > 4) {
      toast.error("ไม่สามารถเพิ่มผู้เล่นเกิน 4 คนในคอร์ทเดียวกันได้")
      return
    }

    updateData((prev) => ({
      ...prev,
      courts: prev.courts.map((c) =>
        c.id === courtId
          ? { ...c, players: [...c.players, ...selectedPlayerIds] }
          : c
      ),
      players: prev.players.map((p) =>
        selectedPlayerIds.includes(p.id) ? { ...p, courtId } : p
      ),
    }))
    setSelectedPlayerIds([])
    toast.success("เพิ่มผู้เล่นลงคอร์ทแล้ว")
  }

  const startGame = (courtId: string) => {
    const court = data.courts.find((c) => c.id === courtId)
    if (!court || court.players.length !== 4) return

    updateData((prev) => ({
      ...prev,
      courts: prev.courts.map((c) =>
        c.id === courtId
          ? { ...c, isPlaying: true, shuttlecocks: c.shuttlecocks === 0 ? 1 : c.shuttlecocks }
          : c
      ),
    }))
    toast.success("เริ่มเกมส์แล้ว!")
  }

  const confirmEndGame = (courtId: string) => {
    setConfirmDialog({ open: true, type: "endGame", courtId })
  }

  const endGame = (courtId: string) => {
    const court = data.courts.find((c) => c.id === courtId)
    if (!court) return

    const shuttlecocksUsed = court.shuttlecocks

    updateData((prev) => ({
      ...prev,
      courts: prev.courts.map((c) =>
        c.id === courtId
          ? { ...c, players: [], isPlaying: false, shuttlecocks: 0 }
          : c
      ),
      players: prev.players.map((p) =>
        court.players.includes(p.id)
          ? {
              ...p,
              courtId: null,
              games: p.games + 1,
              shuttlecocks: p.shuttlecocks + shuttlecocksUsed,
            }
          : p
      ),
      totalShuttlecocksUsed: prev.totalShuttlecocksUsed + shuttlecocksUsed,
    }))
    toast.success("จบเกมส์แล้ว อัพเดตข้อมูลผู้เล่นเรียบร้อย")
  }

  const confirmRemovePlayers = (courtId: string) => {
    setConfirmDialog({ open: true, type: "removePlayers", courtId })
  }

  const removePlayers = (courtId: string) => {
    const court = data.courts.find((c) => c.id === courtId)
    if (!court) return

    updateData((prev) => ({
      ...prev,
      courts: prev.courts.map((c) =>
        c.id === courtId
          ? { ...c, players: [], isPlaying: false, shuttlecocks: 0 }
          : c
      ),
      players: prev.players.map((p) =>
        court.players.includes(p.id) ? { ...p, courtId: null } : p
      ),
    }))
    toast.success("ถอนผู้เล่นออกจากคอร์ทแล้ว")
  }

  const confirmCloseCourt = (courtId: string) => {
    const court = data.courts.find((c) => c.id === courtId)
    if (!court) return
    if (court.players.length > 0) {
      toast.error("ไม่สามารถปิดคอร์ทได้ มีผู้เล่นอยู่ในคอร์ท")
      return
    }
    setConfirmDialog({ open: true, type: "closeCourt", courtId })
  }

  const closeCourt = (courtId: string) => {
    updateData((prev) => ({
      ...prev,
      courts: prev.courts.filter((c) => c.id !== courtId),
    }))
    toast.success("ปิดคอร์ทแล้ว")
  }

  const handleDialogConfirm = () => {
    const { type, courtId } = confirmDialog
    if (type === "endGame") endGame(courtId)
    else if (type === "removePlayers") removePlayers(courtId)
    else if (type === "closeCourt") closeCourt(courtId)
    setConfirmDialog({ open: false, type: "endGame", courtId: "" })
  }

  const increaseShuttlecocks = (courtId: string) => {
    updateData((prev) => ({
      ...prev,
      courts: prev.courts.map((c) =>
        c.id === courtId ? { ...c, shuttlecocks: c.shuttlecocks + 1 } : c
      ),
    }))
  }

  const decreaseShuttlecocks = (courtId: string) => {
    const court = data.courts.find((c) => c.id === courtId)
    if (!court || court.shuttlecocks <= 1) return
    updateData((prev) => ({
      ...prev,
      courts: prev.courts.map((c) =>
        c.id === courtId ? { ...c, shuttlecocks: c.shuttlecocks - 1 } : c
      ),
    }))
  }

  const getDialogText = () => {
    switch (confirmDialog.type) {
      case "endGame":
        return {
          title: "ยืนยันจบเกมส์",
          desc: "ต้องการยืนยันการเล่นเสร็จสิ้น?",
        }
      case "removePlayers":
        return {
          title: "ถอนผู้เล่น",
          desc: "ต้องการถอนผู้เล่นออกจากคอร์ทนี้?",
        }
      case "closeCourt":
        return {
          title: "ปิดคอร์ท",
          desc: "ต้องการปิดคอร์ทนี้?",
        }
    }
  }

  return (
    <div className="space-y-4">
      {/* Section 1: Add Court */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-5 w-5 text-primary" />
            เพิ่มคอร์ท
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="กรอกชื่อคอร์ท เช่น C1..."
              value={courtName}
              onChange={(e) => setCourtName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCourt()}
              className="flex-1"
            />
            <Button onClick={addCourt} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-1.5 h-4 w-4" />
              เพิ่มคอร์ท
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Select Players */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            เลือกผู้เล่น (สูงสุด 4 คน)
          </CardTitle>
          {selectedPlayerIds.length > 0 && (
            <p className="text-sm text-muted-foreground">
              เลือกแล้ว {selectedPlayerIds.length} คน
            </p>
          )}
        </CardHeader>
        <CardContent>
          {availablePlayers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              ไม่มีผู้เล่นที่พร้อม กรุณาเพิ่มผู้เล่นที่ tab สมาชิก
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availablePlayers.map((player) => {
                const isSelected = selectedPlayerIds.includes(player.id)
                return (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => togglePlayerSelection(player.id)}
                    className={`
                      rounded-full border px-3 py-1.5 text-sm font-medium transition-all cursor-pointer
                      ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-foreground border-border hover:border-primary/50"
                      }
                    `}
                  >
                    {player.name}
                  </button>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Courts Table */}
      {data.courts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              รายการคอร์ท ({data.courts.length} คอร์ท)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[15%]">คอร์ท</TableHead>
                    <TableHead className="w-[35%]">ผู้เล่น</TableHead>
                    <TableHead className="text-center w-[20%]">ลูก</TableHead>
                    <TableHead className="text-center w-[30%]">ดำเนินการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.courts.map((court) => {
                    const courtColor = getCourtColor(court.colorIndex)
                    const courtPlayers = court.players
                      .map((pid) => data.players.find((p) => p.id === pid))
                      .filter(Boolean)
                    const isFull = court.players.length >= 4
                    const hasPlayers = court.players.length > 0

                    // Build VS display
                    const renderPlayers = () => {
                      if (courtPlayers.length === 0) {
                        return (
                          <span className="text-muted-foreground text-sm">
                            {"_ - _ VS _ - _"}
                          </span>
                        )
                      }
                      const names = courtPlayers.map((p) => p!.name)
                      const team1 = names.slice(0, 2).join("-") || "_"
                      const team2 = names.slice(2, 4).join("-") || "_"
                      return (
                        <span className="text-sm font-medium">
                          {team1}{" "}
                          <span className="text-primary font-bold">VS</span>{" "}
                          {team2}
                        </span>
                      )
                    }

                    return (
                      <TableRow key={court.id}>
                        {/* Court Name Badge */}
                        <TableCell>
                          <span
                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                            style={{ backgroundColor: courtColor.bgColor, color: courtColor.textColor }}
                          >
                            {court.name}
                          </span>
                        </TableCell>

                        {/* Players */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex-1">{renderPlayers()}</div>
                            {hasPlayers && !court.isPlaying && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                onClick={() => confirmRemovePlayers(court.id)}
                                title="ถอนผู้เล่น"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>

                        {/* Shuttlecocks */}
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0 bg-transparent"
                              onClick={() => decreaseShuttlecocks(court.id)}
                              disabled={
                                !court.isPlaying || court.shuttlecocks <= 1
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center font-semibold text-sm">
                              {court.shuttlecocks}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0 bg-transparent"
                              onClick={() => increaseShuttlecocks(court.id)}
                              disabled={!court.isPlaying}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell>
                          <div className="flex items-center justify-center gap-1 flex-wrap">
                            {/* Add Players button */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs px-2 bg-transparent"
                              onClick={() => addPlayersToCourt(court.id)}
                              disabled={isFull || court.isPlaying}
                              title="เพิ่มผู้เล่น"
                            >
                              <UserPlus className="h-3.5 w-3.5" />
                            </Button>

                            {/* Start/End Game button */}
                            {court.isPlaying ? (
                              <Button
                                size="sm"
                                className="h-7 text-xs px-2 bg-amber-500 text-white hover:bg-amber-600"
                                onClick={() => confirmEndGame(court.id)}
                              >
                                <Square className="mr-1 h-3 w-3" />
                                จบเกมส์
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                className="h-7 text-xs px-2 bg-primary text-primary-foreground hover:bg-primary/90"
                                onClick={() => startGame(court.id)}
                                disabled={!isFull}
                              >
                                <Play className="mr-1 h-3 w-3" />
                                เริ่มเล่น
                              </Button>
                            )}

                            {/* Close Court */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs px-2 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive bg-transparent"
                              onClick={() => confirmCloseCourt(court.id)}
                              disabled={hasPlayers}
                              title="ปิดคอร์ท"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getDialogText().title}</DialogTitle>
            <DialogDescription>{getDialogText().desc}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog((prev) => ({ ...prev, open: false }))
              }
            >
              ยกเลิก
            </Button>
            <Button onClick={handleDialogConfirm} className="bg-primary text-primary-foreground hover:bg-primary/90">
              ตกลง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
