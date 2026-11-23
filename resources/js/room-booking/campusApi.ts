export type CampusBuildingDto = {
  id: string
  name: string
  letter: string
  floors: number
  accent: string
  description: string
}

export type MapShape = {
  type: "building" | "inactive" | "facility" | "field" | "green"
  id?: string
  label: string
  sublabel?: string
  points: [number, number][]
}

export type CampusLayout = {
  buildings: CampusBuildingDto[]
  map: {
    view_box: [number, number]
    road: { y: number; height: number; label: string }
    entrance: { x: number; label: string }
    shapes: MapShape[]
  }
}

export type CampusRoomDto = {
  code: string
  name: string
  building: string
  floor: number
  capacity: number
  facilities: string[]
  mapArea: string
  bookable?: boolean
  floorLayout?: string
  coreLabel?: string
  bottomCenter?: string
}

export const ROOMS_CACHE_KEY = "rpl-custom-rooms"

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: "application/json" } })
  if (!response.ok) throw new Error(`Gagal memuat data kampus (${response.status})`)
  const body = (await response.json()) as { data: T }
  return body.data
}

export const fetchCampusLayout = () => getJson<CampusLayout>("/api/campus/layout")
export const fetchCampusRooms = () => getJson<Record<string, CampusRoomDto[]>>("/api/campus/rooms")
