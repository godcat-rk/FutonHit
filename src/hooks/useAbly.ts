import { useEffect, useRef, useState, useCallback } from 'react'
import * as Ably from 'ably'

const ABLY_API_KEY = import.meta.env.VITE_ABLY_API_KEY

export const useAbly = (channelName: string) => {
  const [isConnected, setIsConnected] = useState(false)
  const ablyRef = useRef<Ably.Realtime | null>(null)
  const channelRef = useRef<Ably.RealtimeChannel | null>(null)

  useEffect(() => {
    if (!ABLY_API_KEY) {
      console.error('Ably API key is not configured. Set VITE_ABLY_API_KEY.')
      return
    }

    const ably = new Ably.Realtime({
      key: ABLY_API_KEY,
      clientId: `client-${Date.now()}-${Math.random()}`,
    })

    ablyRef.current = ably

    ably.connection.on('connected', () => {
      console.log('Ably connected')
      setIsConnected(true)
    })

    ably.connection.on('disconnected', () => {
      console.log('Ably disconnected')
      setIsConnected(false)
    })

    const channel = ably.channels.get(channelName)
    channelRef.current = channel

    return () => {
      // チャンネルの購読を解除
      if (channelRef.current) {
        channelRef.current.unsubscribe()
      }
      // Ably接続をクローズ（非同期で安全に）
      if (ablyRef.current && ablyRef.current.connection.state !== 'closed') {
        ablyRef.current.close()
      }
    }
  }, [channelName])

  const publish = useCallback((eventName: string, data: any) => {
    if (channelRef.current) {
      channelRef.current.publish(eventName, data)
    }
  }, [])

  const subscribe = useCallback((eventName: string, callback: (message: Ably.Message) => void) => {
    if (channelRef.current) {
      channelRef.current.subscribe(eventName, callback)
    }
  }, [])

  const unsubscribe = useCallback((eventName: string, callback?: (message: Ably.Message) => void) => {
    if (channelRef.current) {
      if (callback) {
        channelRef.current.unsubscribe(eventName, callback)
      } else {
        channelRef.current.unsubscribe(eventName)
      }
    }
  }, [])

  return {
    isConnected,
    publish,
    subscribe,
    unsubscribe,
  }
}
