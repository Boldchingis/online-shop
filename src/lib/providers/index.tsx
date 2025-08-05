// ==================== PROVIDERS INDEX ====================
// Combined providers with proper nesting and error boundaries

'use client'

import React, { ReactNode } from 'react'
import { AuthProvider } from './auth-provider'
import { CartProvider } from './cart-provider'
import { Toaster } from '@/components/ui/sonner'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
        <Toaster />
      </CartProvider>
    </AuthProvider>
  )
}

export { AuthProvider, useAuth } from './auth-provider'
export { CartProvider, useCart } from './cart-provider'
