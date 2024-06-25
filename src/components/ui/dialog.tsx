import React, { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, children }) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  if (!isMounted) return null

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>
        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
          &#8203;
        </span>
        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

interface DialogTriggerProps {
  onClick: () => void
  children: React.ReactNode
}

export const DialogTrigger: React.FC<DialogTriggerProps> = ({ onClick, children }) => {
  return (
    <button onClick={onClick} className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
      {children}
    </button>
  )
}

interface DialogContentProps {
  children: React.ReactNode
}

export const DialogContent: React.FC<DialogContentProps> = ({ children }) => {
  return <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">{children}</div>
}

interface DialogHeaderProps {
  children: React.ReactNode
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ children }) => {
  return <div className="mb-4">{children}</div>
}

interface DialogTitleProps {
  children: React.ReactNode
}

export const DialogTitle: React.FC<DialogTitleProps> = ({ children }) => {
  return <h3 className="text-lg font-medium leading-6 text-gray-900">{children}</h3>
}

interface DialogDescriptionProps {
  children: React.ReactNode
}

export const DialogDescription: React.FC<DialogDescriptionProps> = ({ children }) => {
  return <div className="mt-2 text-sm text-gray-500">{children}</div>
}

interface DialogFooterProps {
  children: React.ReactNode
}

export const DialogFooter: React.FC<DialogFooterProps> = ({ children }) => {
  return (
    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
      {children}
    </div>
  )
}