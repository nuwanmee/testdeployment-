'use client'

import { useEffect, useState } from 'react'

type FlashMessageProps = {
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
  onClose?: () => void
}

export default function FlashMessage({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}: FlashMessageProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!visible) return null

  const bgColor = {
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  }[type]

  return (
    <div className={`fixed top-4 right-4 p-4 rounded shadow-lg ${bgColor}`}>
      {message}
    </div>
  )
}