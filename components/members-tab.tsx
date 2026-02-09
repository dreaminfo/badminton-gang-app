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
import { UserPlus, X, Smartphone, Banknote, Search, Check, Clock } from "lucide-react"
import { toast } from "sonner"
import {
  type AppData,
  generateId,
  getCourtColor,
  calculatePlayerTotal,
} from "@/lib/store"

interface Props {
  data: AppData
  updateData: (updater: (prev: AppData) => AppData) => void
}

export default function MembersTab({ data, updateData }: Props) {
  const [newName, setNewName] = useState("")
  const [search, setSearch] = useState("")

  const addPlayer = () => {
    const name = newName.trim()
    if (!name) {
      toast.error("กรุณากรอกชื่อผู้เล่น")
      return
    }
    if (data.players.some((p) => p.name === name)) {
      toast.error("ชื่อผู้เล่นนี้มีอยู่แล้ว")
      return
    }
    updateData((prev) => ({
      ...prev,
      players: [
        ...prev.players,
        {
          id: generateId(),
          name,
          games: 0,
          shuttlecocks: 0,
          paymentMethod: "mobile",
          paid: false,
          courtId: null,
        },
      ],
    }))
    setNewName("")
    toast.success("เพิ่มผู้เล่นแล้ว")
  }

  const deletePlayer = (playerId: string) => {
    const player = data.players.find((p) => p.id === playerId)
    if (!player) return
    if (player.courtId) {
      toast.error(`ไม่สามารถลบได้ ผู้เล่นกำลังเล่นอยู่ในคอร์ท`)
      return
    }
    updateData((prev) => ({
      ...prev,
      players: prev.players.filter((p) => p.id !== playerId),
    }))
    toast.success("ลบผู้เล่นแล้ว")
  }

  const togglePaymentMethod = (playerId: string) => {
    const player = data.players.find((p) => p.id === playerId)
    if (!player || player.paid) return
    updateData((prev) => ({
      ...prev,
      players: prev.players.map((p) =>
        p.id === playerId
          ? { ...p, paymentMethod: p.paymentMethod === "mobile" ? "cash" : "mobile" }
          : p
      ),
    }))
  }

  const togglePaid = (playerId: string) => {
    const player = data.players.find((p) => p.id === playerId)
    if (!player) return

    if (player.courtId) {
      const court = data.courts.find((c) => c.id === player.courtId)
      toast.error(
        `ไม่สามารถเปลี่ยนสถานะได้ ผู้เล่น ${player.name} กำลังเล่นอยู่ที่คอร์ท ${court?.name || ""}`
      )
      return
    }

    const newPaid = !player.paid
    updateData((prev) => ({
      ...prev,
      players: prev.players.map((p) =>
        p.id === playerId ? { ...p, paid: newPaid } : p
      ),
    }))
    toast.success(newPaid ? "บันทึกการชำระเงินแล้ว" : "ยกเลิกการชำระเงินแล้ว")
  }

  const getPlayerCourt = (player: (typeof data.players)[0]) => {
    if (!player.courtId) return null
    return data.courts.find((c) => c.id === player.courtId)
  }

  const filteredPlayers = data.players.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const isPlayerInCourt = (player: (typeof data.players)[0]) => !!player.courtId
  const hasGames = (player: (typeof data.players)[0]) => player.games > 0

  return (
    <div className="space-y-4">
      {/* Add Player */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <UserPlus className="h-5 w-5 text-primary" />
            เพิ่มผู้เล่น
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="กรอกชื่อผู้เล่น..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPlayer()}
              className="flex-1"
            />
            <Button onClick={addPlayer} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <UserPlus className="mr-1.5 h-4 w-4" />
              เพิ่ม
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Players Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              รายชื่อสมาชิก ({data.players.length} คน)
            </CardTitle>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ค้นหาผู้เล่น..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">ชื่อ</TableHead>
                  <TableHead className="text-center w-[10%]">เกมส์</TableHead>
                  <TableHead className="text-center w-[10%]">ลูก</TableHead>
                  <TableHead className="text-right w-[15%]">รวม</TableHead>
                  <TableHead className="text-center w-[25%]">การชำระ</TableHead>
                  <TableHead className="text-center w-[10%]">ลบ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {data.players.length === 0
                        ? "ยังไม่มีสมาชิก กรุณาเพิ่มผู้เล่น"
                        : "ไม่พบผู้เล่นที่ค้นหา"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPlayers.map((player) => {
                    const court = getPlayerCourt(player)
                    const inCourt = isPlayerInCourt(player)
                    const total = calculatePlayerTotal(player, data.settings)
                    const courtColor = court
                      ? getCourtColor(court.colorIndex)
                      : null

                    return (
                      <TableRow key={player.id}>
                        {/* Name + Court Badge */}
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">{player.name}</span>
                            {court && (
<span
  className="inline-flex items-center rounded-full w-fit text-[10px] px-1.5 py-0.5 font-semibold"
  style={{ backgroundColor: courtColor?.bgColor, color: courtColor?.textColor }}
>
  {court.name}
</span>
                            )}
                          </div>
                        </TableCell>

                        {/* Games */}
                        <TableCell className="text-center font-medium">
                          {player.games}
                        </TableCell>

                        {/* Shuttlecocks */}
                        <TableCell className="text-center font-medium">
                          {player.shuttlecocks}
                        </TableCell>

                        {/* Total */}
                        <TableCell className="text-right font-semibold">
                          {total.toLocaleString()} ฿
                        </TableCell>

                        {/* Payment */}
                        <TableCell>
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Payment method toggle */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-7 w-7 p-0 ${
                                player.paymentMethod === "mobile"
                                  ? "text-sky-600"
                                  : "text-amber-600"
                              }`}
                              onClick={() => togglePaymentMethod(player.id)}
                              disabled={player.paid}
                              title={
                                player.paymentMethod === "mobile"
                                  ? "โอน"
                                  : "เงินสด"
                              }
                            >
                              {player.paymentMethod === "mobile" ? (
                                <Smartphone className="h-4 w-4" />
                              ) : (
                                <Banknote className="h-4 w-4" />
                              )}
                            </Button>

                            {/* Paid toggle */}
                            <Button
                              variant={player.paid ? "default" : "outline"}
                              size="sm"
                              className={`h-7 text-xs px-2 ${
                                player.paid
                                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                  : "text-foreground"
                              }`}
                              onClick={() => togglePaid(player.id)}
                            >
                              {player.paid ? (
                                <>
                                  <Check className="mr-1 h-3 w-3" />
                                  ชำระแล้ว
                                </>
                              ) : (
                                <>
                                  <Clock className="mr-1 h-3 w-3" />
                                  ยังไม่ชำระ
                                </>
                              )}
                            </Button>
                          </div>
                        </TableCell>

                        {/* Delete */}
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => deletePlayer(player.id)}
                            disabled={inCourt || player.paid || hasGames(player)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
