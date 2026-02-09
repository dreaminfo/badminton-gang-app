// localStorage-based data store for Badminton Gang Management

export interface Player {
  id: string
  name: string
  games: number
  shuttlecocks: number
  paymentMethod: 'mobile' | 'cash'
  paid: boolean
  courtId: string | null // null means not in any court
}

export interface Court {
  id: string
  name: string
  players: string[] // player ids (max 4)
  shuttlecocks: number
  isPlaying: boolean
  colorIndex: number
}

export interface Settings {
  playerCourtFee: number      // ค่าคอร์ท (เหมารวม) per player
  playerShuttlecockFee: number // ค่าลูกแบด (บาท/ลูก) per player
  organizerCourtFee: number    // ค่าคอร์ท (เหมารวม) for organizer
  organizerShuttlecockFee: number // ค่าลูกแบด (บาท/ลูก) actual price per shuttlecock
}

export interface AppData {
  players: Player[]
  courts: Court[]
  settings: Settings
  totalShuttlecocksUsed: number // Track total shuttlecocks from completed games
}

const STORAGE_KEY = 'bgm-badminton-data'

const defaultSettings: Settings = {
  playerCourtFee: 0,
  playerShuttlecockFee: 0,
  organizerCourtFee: 0,
  organizerShuttlecockFee: 0,
}

const defaultData: AppData = {
  players: [],
  courts: [],
  settings: defaultSettings,
  totalShuttlecocksUsed: 0,
}

export function loadData(): AppData {
  if (typeof window === 'undefined') return defaultData
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        ...defaultData,
        ...parsed,
        settings: { ...defaultSettings, ...parsed.settings },
      }
    }
  } catch {
    // ignore
  }
  return defaultData
}

export function saveData(data: AppData): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

// Court color palette — uses inline styles to avoid Tailwind JIT purge issues
export const COURT_COLORS = [
  { bgColor: '#d1fae5', textColor: '#065f46', hex: '#059669' },  // emerald
  { bgColor: '#e0f2fe', textColor: '#075985', hex: '#0284c7' },  // sky
  { bgColor: '#fef3c7', textColor: '#92400e', hex: '#d97706' },  // amber
  { bgColor: '#ffe4e6', textColor: '#9f1239', hex: '#e11d48' },  // rose
  { bgColor: '#e0e7ff', textColor: '#3730a3', hex: '#4f46e5' },  // indigo
  { bgColor: '#ffedd5', textColor: '#9a3412', hex: '#ea580c' },  // orange
  { bgColor: '#ccfbf1', textColor: '#134e4a', hex: '#0d9488' },  // teal
  { bgColor: '#fae8ff', textColor: '#86198f', hex: '#c026d3' },  // fuchsia
  { bgColor: '#dbeafe', textColor: '#1e40af', hex: '#2563eb' },  // blue
  { bgColor: '#fce7f3', textColor: '#9d174d', hex: '#db2777' },  // pink
]

export function getCourtColor(colorIndex: number) {
  return COURT_COLORS[colorIndex % COURT_COLORS.length]
}

// Calculate player total cost
export function calculatePlayerTotal(player: Player, settings: Settings): number {
  const courtFeePerPlayer = settings.playerCourtFee
  const shuttlecockCost = player.shuttlecocks * settings.playerShuttlecockFee
  return courtFeePerPlayer + shuttlecockCost
}
