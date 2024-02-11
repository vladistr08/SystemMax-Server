import { createClient, RedisClientType } from 'redis'
import log from '../log'
import env from '../../config/env'

class RedisBlacklist {
  private static client: RedisClientType
  private static instance: RedisBlacklist

  private constructor() {
    RedisBlacklist.client = createClient({ url: env.REDIS_CONNECTION_URL })
    RedisBlacklist.client.connect().catch((error) => {
      log.error(`Redis connect error: ${error}`)
    })
  }

  public static getInstance(): RedisBlacklist {
    if (!RedisBlacklist.instance) {
      RedisBlacklist.instance = new RedisBlacklist()
    }
    return RedisBlacklist.instance
  }

  public async addToBlacklist(jti: string): Promise<void> {
    try {
      await RedisBlacklist.client.set(jti, 'blacklisted', { EX: 3600 })
    } catch (error) {
      log.error(`Error adding token to blacklist: ${error}`)
      throw error // Rethrow to allow further handling if necessary
    }
  }

  public async isBlacklisted(jti: string): Promise<boolean> {
    try {
      const result = await RedisBlacklist.client.get(jti)
      return result === 'blacklisted'
    } catch (error) {
      log.error(`Error checking if token is blacklisted: ${error}`)
      throw error
    }
  }

  public async removeFromBlacklist(jti: string): Promise<void> {
    try {
      await RedisBlacklist.client.del(jti)
    } catch (error) {
      log.error(`Error removing token from blacklist: ${error}`)
      throw error // Rethrow to allow further handling if necessary
    }
  }
}

export default RedisBlacklist
