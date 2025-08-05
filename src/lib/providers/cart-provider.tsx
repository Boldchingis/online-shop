// ==================== CART PROVIDER ====================
// Client-side cart provider with optimistic updates and persistence

'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { toast } from 'sonner'
import { apiService } from '@/lib/services/api'
import { useAuth } from './auth-provider'
import { Product, Cart, CartItem, CartContextType } from '@/types'

const CartContext = createContext<CartContextType | undefined>(undefined)

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { user, isAuthenticated } = useAuth()

  // Initialize cart
  useEffect(() => {
    initializeCart()
  }, [user, isAuthenticated])

  const initializeCart = useCallback(async () => {
    try {
      setIsLoading(true)
      
      if (isAuthenticated && user) {
        // Load cart from server for authenticated users
        const response = await apiService.get<Cart>('/cart')
        if (response.success && response.data) {
          setCart(response.data)
        } else {
          // Create new cart if none exists
          await createNewCart()
        }
      } else {
        // Load cart from localStorage for guest users
        loadGuestCart()
      }
    } catch (error) {
      console.error('Cart initialization failed:', error)
      // Fallback to empty cart
      createEmptyCart()
    } finally {
      setIsLoading(false)
    }
  }, [user, isAuthenticated])

  const createNewCart = useCallback(async () => {
    const newCart: Cart = {
      id: crypto.randomUUID(),
      userId: user?.id,
      items: [],
      total: 0,
      subtotal: 0,
      tax: 0,
      shipping: 0,
      updatedAt: new Date(),
    }
    
    if (isAuthenticated) {
      try {
        const response = await apiService.post<Cart>('/cart', newCart)
        if (response.success && response.data) {
          setCart(response.data)
          return
        }
      } catch (error) {
        console.error('Failed to create cart on server:', error)
      }
    }
    
    // Fallback to local cart
    setCart(newCart)
    saveGuestCart(newCart)
  }, [user, isAuthenticated])

  const createEmptyCart = useCallback(() => {
    const emptyCart: Cart = {
      id: crypto.randomUUID(),
      userId: user?.id,
      items: [],
      total: 0,
      subtotal: 0,
      tax: 0,
      shipping: 0,
      updatedAt: new Date(),
    }
    setCart(emptyCart)
    if (!isAuthenticated) {
      saveGuestCart(emptyCart)
    }
  }, [user, isAuthenticated])

  const loadGuestCart = useCallback(() => {
    try {
      const savedCart = localStorage.getItem('guestCart')
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        setCart(parsedCart)
      } else {
        createEmptyCart()
      }
    } catch (error) {
      console.error('Failed to load guest cart:', error)
      createEmptyCart()
    }
  }, [createEmptyCart])

  const saveGuestCart = useCallback((cartData: Cart) => {
    try {
      localStorage.setItem('guestCart', JSON.stringify(cartData))
    } catch (error) {
      console.error('Failed to save guest cart:', error)
    }
  }, [])

  const calculateCartTotals = useCallback((items: CartItem[]): Omit<Cart, 'id' | 'userId' | 'items' | 'updatedAt'> => {
    const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    const tax = subtotal * 0.1 // 10% tax
    const shipping = subtotal > 100 ? 0 : 10 // Free shipping over $100
    const total = subtotal + tax + shipping

    return { subtotal, tax, shipping, total }
  }, [])

  const updateCart = useCallback(async (updatedItems: CartItem[]) => {
    if (!cart) return

    const totals = calculateCartTotals(updatedItems)
    const updatedCart: Cart = {
      ...cart,
      items: updatedItems,
      ...totals,
      updatedAt: new Date(),
    }

    // Optimistic update
    setCart(updatedCart)

    try {
      if (isAuthenticated) {
        // Update on server
        await apiService.put(`/cart/${cart.id}`, updatedCart)
      } else {
        // Save to localStorage
        saveGuestCart(updatedCart)
      }
    } catch (error) {
      console.error('Failed to update cart:', error)
      toast.error('Failed to update cart')
      // Revert optimistic update
      setCart(cart)
    }
  }, [cart, isAuthenticated, calculateCartTotals, saveGuestCart])

  const addItem = useCallback(async (product: Product, quantity: number = 1) => {
    if (!cart) {
      await createNewCart()
      return
    }

    const existingItemIndex = cart.items.findIndex(item => item.product.id === product.id)
    let updatedItems: CartItem[]

    if (existingItemIndex >= 0) {
      // Update existing item
      updatedItems = cart.items.map((item, index) =>
        index === existingItemIndex
          ? { ...item, quantity: item.quantity + quantity }
          : item
      )
      toast.success(`Updated ${product.name} quantity`)
    } else {
      // Add new item
      const newItem: CartItem = {
        id: crypto.randomUUID(),
        product,
        quantity,
        addedAt: new Date(),
      }
      updatedItems = [...cart.items, newItem]
      toast.success(`Added ${product.name} to cart`)
    }

    await updateCart(updatedItems)
  }, [cart, createNewCart, updateCart])

  const removeItem = useCallback(async (itemId: string) => {
    if (!cart) return

    const itemToRemove = cart.items.find(item => item.id === itemId)
    const updatedItems = cart.items.filter(item => item.id !== itemId)

    if (itemToRemove) {
      toast.success(`Removed ${itemToRemove.product.name} from cart`)
    }

    await updateCart(updatedItems)
  }, [cart, updateCart])

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (!cart) return

    if (quantity <= 0) {
      await removeItem(itemId)
      return
    }

    const updatedItems = cart.items.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    )

    await updateCart(updatedItems)
  }, [cart, updateCart, removeItem])

  const clearCart = useCallback(async () => {
    if (!cart) return

    try {
      if (isAuthenticated) {
        await apiService.delete(`/cart/${cart.id}`)
      } else {
        localStorage.removeItem('guestCart')
      }
      
      await createNewCart()
      toast.success('Cart cleared')
    } catch (error) {
      console.error('Failed to clear cart:', error)
      toast.error('Failed to clear cart')
    }
  }, [cart, isAuthenticated, createNewCart])

  const totalItems = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0
  const totalPrice = cart?.total || 0

  const contextValue: CartContextType = {
    cart,
    isLoading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  }

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextType {
  const context = useContext(CartContext)
  
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  
  return context
}
