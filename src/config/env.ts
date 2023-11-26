let ENV_JSON = {}
try {
  ENV_JSON = require('../../env.json')
} catch (error) {
  // ignore error
}

interface IEnv {
  [key: string]: string | number | boolean | null | undefined

  // Node Environment
  NODE_ENV: string

  // API Port
  PORT: number
}

const defaults: IEnv = {
  // Node Environment
  NODE_ENV: 'development',

  // API Port
  PORT: 9330,
}

const env: IEnv = {
  ...defaults,
  ...ENV_JSON,

  // all env vars
  ...process.env,
}

process.env.NODE_ENV = env.NODE_ENV

/**
 * Check for mandatory environment variables
 */
export const checkEnv = (): void => {
  Object.keys(defaults).forEach((key) => {
    if (!env[key]) {
      throw new Error(`${key} environment variable is mandatory`)
    }
  })
}

/**
 * Check the environment in runtime also
 */
checkEnv()

/*
 * Export environment variables and 'checkEnv' function
 */
export default env
