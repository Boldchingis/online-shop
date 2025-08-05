import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IProduct extends Document {
  name: string
  description: string
  price: number
  images: string[]
  category: Types.ObjectId
  inStock: boolean
  rating: number
  reviews: number
  salesCount: number
  createdAt: Date
  updatedAt: Date
  // Methods
  updateStock(count: number): Promise<void>
  calculateRating(newRating: number): Promise<void>
}

const ProductSchema: Schema<IProduct> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [3, 'Product name must be at least 3 characters'],
      maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    images: [{ type: String }],
    category: {
      type: Types.ObjectId,
      required: [true, 'Category is required'],
      ref: 'Category'
    },
    inStock: {
      type: Boolean,
      default: true
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    reviews: {
      type: Number,
      default: 0,
      min: [0, 'Reviews cannot be negative']
    },
    salesCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// Indexes for optimization
ProductSchema.index({ name: 1 })
ProductSchema.index({ category: 1 })
ProductSchema.index({ price: 1 })
ProductSchema.index({ salesCount: -1 })
ProductSchema.index({ createdAt: -1 })

// Instance method to update stock
ProductSchema.methods.updateStock = async function (count: number): Promise<void> {
  this.inStock = count > 0
  await this.save()
}

// Instance method to calculate new average rating
ProductSchema.methods.calculateRating = async function (newRating: number): Promise<void> {
  const totalRating = this.rating * this.reviews
  this.reviews += 1
  this.rating = (totalRating + newRating) / this.reviews
  await this.save()
}

export default (mongoose.models.Product as Model<IProduct>) || mongoose.model<IProduct>('Product', ProductSchema)
