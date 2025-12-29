import { useEffect, useRef, useState } from 'react'
import * as Ably from 'ably'

const ABLY_API_KEY = import.meta.env.VITE_ABLY_API_KEY

export const useAbly = (channelName: string) => {
  const [isConnected, setIsConnected] = useState(false)
  const ablyRef = useRef<Ably.Realtime | null>(null)
  const channelRef = useRef<Ably.RealtimeChannel | null>(null)

  useEffect(() => {
    if (!ABLY_API_KEY) {
      console.error('Ably API key is not configured')
      return
    }

    // Ably接続の初期化
    const ably = new Ably.Realtime({
      key: ABLY_API_KEY,
      clientId: `client-${Date.now()}-${Math.random()}`,
    })

    ablyRef.current = ably

    // 接続状態の監視
    ably.connection.on('connected', () => {
      console.log('Ably connected')
      setIsConnected(true)
    })

    ably.connection.on('disconnected', () => {
      console.log('Ably disconnected')
      setIsConnected(false)
    })

    // チャンネルの取得
    const channel = ably.channels.get(channelName)
    channelRef.current = channel

    return () => {
      channel.unsubscribe()
      ably.close()
    }
  }, [channelName])

  const publish = (eventName: string, data: any) => {
    if (channelRef.current) {
      channelRef.current.publish(eventName, data)
    }
  }

  const subscribe = (eventName: string, callback: (message: Ably.Message) => void) => {
    if (channelRef.current) {
      channelRef.current.subscribe(eventName, callback)
    }
  }

  const unsubscribe = (eventName: string, callback?: (message: Ably.Message) => void) => {
    if (channelRef.current) {
      if (callback) {
        channelRef.current.unsubscribe(eventName, callback)
      } else {
        channelRef.current.unsubscribe(eventName)
      }
    }
  }

  return {
    isConnected,
    publish,
    subscribe,
    unsubscribe,
  }
}
