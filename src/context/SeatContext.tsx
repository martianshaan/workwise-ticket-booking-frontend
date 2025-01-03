import React, { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

interface Seat {
  id: number
  isReserved: boolean
  reservedBy: string | null
}

interface SeatContextType {
  seats: Seat[]
  reserveSeats: (seatIds: number[], username: string) => void
  cancelReservation: (seatIds: number[]) => void
}

const SeatContext = createContext<SeatContextType | undefined>(undefined)

export const SeatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [seats, setSeats] = useState<Seat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSeats()
  }, [])

  const fetchSeats = async () => {
    try {
      const response = await axios.get('https://workwise-ticket-booking-backend.onrender.com/api/seats')
      console.log('resoponse of seats:', response.data);
      if (response.data.length === 0) {
        const response = await axios.get('https://workwise-ticket-booking-backend.onrender.com/api/seats/initialize')
        console.log('resoponse of initilize seats:', response.data);
        setSeats(response.data)
      } else {
        setSeats(response.data)
      }
    } catch (error) {
      console.error('Error fetching seats:', error)
    } finally {
      setLoading(false)
    }
  }

  const reserveSeats = async (seatIds: number[], username: string) => {
    console.log('reserving seats');
    console.log('seatIds:', seatIds);
    console.log('username:', username);
    try {
      const response = await axios.post('https://workwise-ticket-booking-backend.onrender.com/api/seats/reserve', {
        seatIds,
        username
      })
      setSeats(response.data)
    } catch (error) {
      console.error('Error reserving seats:', error)
      throw error
    }
  }

  const cancelReservation = async (seatIds: number[]) => {
    try {
      const response = await axios.post('https://workwise-ticket-booking-backend.onrender.com/api/seats/cancel', {
        seatIds
      })
      setSeats(response.data)
    } catch (error) {
      console.error('Error canceling reservation:', error)
      throw error
    }
  }

  return (
    <SeatContext.Provider value={{ seats, reserveSeats, cancelReservation }}>
      {!loading && children}
    </SeatContext.Provider>
  )
}

export const useSeats = () => {
  const context = useContext(SeatContext)
  if (context === undefined) {
    throw new Error('useSeats must be used within a SeatProvider')
  }
  return context
}

