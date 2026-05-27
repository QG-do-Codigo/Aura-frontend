type BackendErrorEnvelope =
  | {
      statusCode?: number
      path?: string
      message?: unknown
      error?: unknown
    }
  | unknown

function joinDetails(message: string, details?: unknown) {
  if (!Array.isArray(details) || details.length === 0) return message
  const normalized = details.filter(item => typeof item === 'string') as string[]
  if (normalized.length === 0) return message
  return `${message}: ${normalized.join(' • ')}`
}

function joinMessages(messages: unknown) {
  if (!Array.isArray(messages) || messages.length === 0) return undefined
  const normalized = messages.filter(item => typeof item === 'string') as string[]
  if (normalized.length === 0) return undefined
  return normalized.join(' • ')
}

export function extractBackendMessage(data: BackendErrorEnvelope): string | undefined {
  if (typeof data === 'string') return data
  if (!data || typeof data !== 'object') return undefined

  const record = data as Record<string, unknown>
  const message = record.message

  if (typeof message === 'string') return message
  const joinedTopLevel = joinMessages(message)
  if (joinedTopLevel) return joinedTopLevel

  if (message && typeof message === 'object') {
    const nested = message as Record<string, unknown>
    const nestedMessage = nested.message
    if (typeof nestedMessage === 'string') {
      return joinDetails(nestedMessage, nested.details)
    }
    const joinedNested = joinMessages(nestedMessage)
    if (joinedNested) return joinDetails(joinedNested, nested.details)
  }

  if (typeof record.error === 'string') return record.error
  return undefined
}
