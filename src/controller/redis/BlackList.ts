import RedisBlacklist from '../../components/redis/BlackList'
import log from '../../components/log'

export const addToBlacklist = async (jti: string): Promise<void> => {
  const redisBlacklist = RedisBlacklist.getInstance()
  try {
    await redisBlacklist.addToBlacklist(jti)
  } catch (error) {
    log.error(`Failed to add token to blacklist: ${error}`)
    throw error
  }
}

export const isBlacklisted = async (jti: string): Promise<boolean> => {
  const redisBlacklist = RedisBlacklist.getInstance()
  try {
    return await redisBlacklist.isBlacklisted(jti)
  } catch (error) {
    log.error(`Failed to check if token is blacklisted: ${error}`)
    throw error
  }
}

export const removeFromBlacklist = async (jti: string): Promise<void> => {
  const redisBlacklist = RedisBlacklist.getInstance()
  try {
    await redisBlacklist.removeFromBlacklist(jti)
  } catch (error) {
    log.error(`Failed to remove token from blacklist: ${error}`)
    throw error
  }
}
