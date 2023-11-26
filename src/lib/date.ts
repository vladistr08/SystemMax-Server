export const toIsoDate = (date: Date): string => {
  return date.toISOString().substring(0, 10)
}

export const toIsoDateTime = (date: Date): string => {
  return date.toISOString()
}
