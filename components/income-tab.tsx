"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Download, TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react"
import { toast } from "sonner"
import { type AppData, calculatePlayerTotal } from "@/lib/store"

interface Props {
  data: AppData
}

export default function IncomeTab({ data }: Props) {
  const { settings, players } = data

  // Section 1: Costs
  // Total shuttlecocks: sum from completed games + currently playing courts
  const completedShuttlecocks = data.totalShuttlecocksUsed
  const activeShuttlecocks = data.courts
    .filter((c) => c.isPlaying)
    .reduce((sum, c) => sum + c.shuttlecocks, 0)
  const totalShuttlecocks = completedShuttlecocks + activeShuttlecocks

  const pricePerShuttlecock = settings.organizerShuttlecockFee
  const shuttlecockCost = totalShuttlecocks * pricePerShuttlecock
  const courtFee = settings.organizerCourtFee
  const totalCost = shuttlecockCost + courtFee

  // Section 2: Income
  const paidCashPlayers = players.filter(
    (p) => p.paid && p.paymentMethod === "cash"
  )
  const paidMobilePlayers = players.filter(
    (p) => p.paid && p.paymentMethod === "mobile"
  )
  const cashIncome = paidCashPlayers.reduce(
    (sum, p) => sum + calculatePlayerTotal(p, settings),
    0
  )
  const mobileIncome = paidMobilePlayers.reduce(
    (sum, p) => sum + calculatePlayerTotal(p, settings),
    0
  )
  const totalIncome = cashIncome + mobileIncome
  const profitLoss = totalIncome - totalCost
  const isProfit = profitLoss >= 0

  // Check if all players have paid
  const allPaid = players.length > 0 && players.every((p) => p.paid)

  const exportExcel = () => {
    if (!allPaid) {
      toast.error("สมาชิกทุกคนยังไม่ชำระเงิน")
      return
    }

    // Build CSV content (Excel-compatible)
    let csv = "\uFEFF" // BOM for UTF-8
    csv += "สรุปรายได้การจัดก๊วนแบดมินตัน\n\n"

    // Income summary
    csv += "--- ต้นทุน ---\n"
    csv += `จำนวนลูกทั้งหมด,${totalShuttlecocks} ลูก\n`
    csv += `ราคาลูกละ,${pricePerShuttlecock} บาท\n`
    csv += `ราคาต้นทุนค่าลูก,${shuttlecockCost} บาท\n`
    csv += `ค่าคอร์ท,${courtFee} บาท\n`
    csv += `ต้นทุนรวมผู้จัด,${totalCost} บาท\n\n`

    csv += "--- กำไร/ขาดทุน ---\n"
    csv += `รายรับเงินสด,${cashIncome} บาท\n`
    csv += `รายรับเงินโอน,${mobileIncome} บาท\n`
    csv += `รายรับทั้งหมด,${totalIncome} บาท\n`
    csv += `${isProfit ? "กำไร" : "ขาดทุน"},${Math.abs(profitLoss)} บาท\n\n`

    // Player details
    csv += "--- ข้อมูลผู้เล่น ---\n"
    csv += "ชื่อ,เกมส์,ลูก,รวม (บาท),วิธีชำระ,สถานะ\n"
    for (const p of players) {
      const total = calculatePlayerTotal(p, settings)
      csv += `${p.name},${p.games},${p.shuttlecocks},${total},${p.paymentMethod === "mobile" ? "โอน" : "เงินสด"},${p.paid ? "ชำระแล้ว" : "ยังไม่ชำระ"}\n`
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `BGM-Summary-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success("ดาวน์โหลดไฟล์เรียบร้อยแล้ว")
  }

  return (
    <div className="space-y-4">
      {/* Section 1: Costs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-5 w-5 text-primary" />
            ต้นทุน
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">จำนวนลูกทั้งหมด</span>
            <span className="font-semibold">{totalShuttlecocks} ลูก</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">ราคาลูกละ</span>
            <span className="font-semibold">{pricePerShuttlecock.toLocaleString()} บาท</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">ราคาต้นทุนค่าลูก</span>
            <span className="font-semibold">{shuttlecockCost.toLocaleString()} บาท</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">ค่าคอร์ท</span>
            <span className="font-semibold">{courtFee.toLocaleString()} บาท</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="font-medium">ต้นทุนรวมผู้จัด</span>
            <span className="text-lg font-bold text-foreground">{totalCost.toLocaleString()} บาท</span>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Profit/Loss */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-5 w-5 text-primary" />
            กำไร/ขาดทุน
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">รายรับเงินสด</span>
            <span className="font-semibold">{cashIncome.toLocaleString()} บาท</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">รายรับเงินโอน</span>
            <span className="font-semibold">{mobileIncome.toLocaleString()} บาท</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">รายรับทั้งหมด</span>
            <span className="text-lg font-bold">{totalIncome.toLocaleString()} บาท</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {isProfit ? "กำไร" : "ขาดทุน"}
            </span>
            <Badge
              className={`text-sm px-3 py-1 ${
                isProfit
                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                  : "bg-red-100 text-red-800 hover:bg-red-100"
              }`}
            >
              {isProfit ? (
                <TrendingUp className="mr-1.5 h-4 w-4" />
              ) : (
                <TrendingDown className="mr-1.5 h-4 w-4" />
              )}
              {isProfit ? "กำไร" : "ขาดทุน"}: {Math.abs(profitLoss).toLocaleString()} บาท
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Export */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={exportExcel}
            disabled={!allPaid}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            size="lg"
          >
            <Download className="mr-2 h-5 w-5" />
            Export Summary (CSV/Excel)
          </Button>
          {!allPaid && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              สมาชิกทุกคนต้องชำระเงินก่อนจึงจะ Export ได้
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
