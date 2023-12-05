import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

export interface IUser {
  userId?: string
  username: string
  password: string
  email?: string
}

export const UserSchema: Schema<IUser> = new Schema({
  userId: { type: Schema.Types.UUID, default: () => uuidv4(), unique: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  email: String,
})

export const User = mongoose.model<IUser>('User', UserSchema, 'users')
