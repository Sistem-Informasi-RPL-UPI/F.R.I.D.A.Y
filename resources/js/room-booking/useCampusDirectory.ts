import { useCallback, useEffect, useState } from "react"
import {
  fetchCampusLayout,
  fetchCampusRooms,
  ROOMS_CACHE_KEY,
  type CampusLayout,
  type CampusRoomDto,
} from "./campusApi"

type Status = "loading" | "ready" | "error"

/**
 * Memuat gedung dan data ruangan per lantai dari backend Laravel.
 */
export function useCampusDirectory() {
  const [layout, setLayout] = useState<CampusLayout | null>(null)
  const [rooms, setRooms] = useState<Record<string, CampusRoomDto[]> | null>(null)
  const [status, setStatus] = useState<Status>("loading")

  const load = useCallback(() => {
    setStatus("loading")
    Promise.all([fetchCampusLayout(), fetchCampusRooms()])
      .then(([nextLayout, nextRooms]) => {
        localStorage.setItem(ROOMS_CACHE_KEY, JSON.stringify(nextRooms))
        setLayout(nextLayout)
        setRooms(nextRooms)
        setStatus("ready")
      })
      .catch(() => setStatus("error"))
  }, [])

  useEffect(load, [load])

  return { layout, rooms, status, reload: load }
}
