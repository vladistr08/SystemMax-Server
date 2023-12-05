import mongoose from 'mongoose'
import env from '../config/env'
import { log } from '../components/log'

export const connectToDatabase = async (): Promise<void> => {
  try {
    if (env.MONGO_CONNECTION_URL === '') {
      throw new Error('No mongo connection url provided!')
    }
    await mongoose.connect(env.MONGO_CONNECTION_URL)
    log.info('Connected to the db...')
  } catch (e) {
    log.error(`Error connecting to db... ${e?.message}`)
  }
}
