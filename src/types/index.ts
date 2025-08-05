// ==================== CORE TYPES ====================

export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  avatar?: string
  phone?: string
  address?: Address
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  subcategory?: string
  inStock: boolean
  stockQuantity: number
  rating: number
  reviews: number
  tags: string[]
  specifications?: Record<string, string>
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  description: string
  image: string
  productCount: number
  subcategories?: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  id: string
  product: Product
  quantity: number
  selectedVariant?: string
  addedAt: Date
}

export interface Cart {
  id: string
  userId?: string
  items: CartItem[]
  total: number
  subtotal: number
  tax: number
  shipping: number
  updatedAt: Date
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  total: number
  subtotal: number
  tax: number
  shipping: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  shippingAddress: Address
  billingAddress?: Address
  trackingNumber?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded'

// ==================== API TYPES ====================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  pagination?: PaginationInfo
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface SearchParams {
  query?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  sortBy?: 'name' | 'price' | 'rating' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// ==================== AUTH TYPES ====================

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

// ==================== COMPONENT TYPES ====================

export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface LoadingState {
  isLoading: boolean
  error?: string | null
}

export interface FormState<T = any> extends LoadingState {
  data?: T
  isDirty: boolean
  isValid: boolean
}

// ==================== UTILITY TYPES ====================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// ==================== CONTEXT TYPES ====================

export interface AuthContextType {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials, redirectUrl?: string) => Promise<void>
  register: (data: RegisterData, redirectUrl?: string) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  updateUser: (data: Partial<User>) => Promise<void>
}

export interface CartContextType {
  cart: Cart | null
  isLoading: boolean
  addItem: (product: Product, quantity?: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  totalItems: number
  totalPrice: number
} 