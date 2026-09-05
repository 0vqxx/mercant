// In-memory resilient storage for procurements when SQL database is disconnected
export interface MemoryProcurement {
  id: string
  userId: string
  name: string
  budget: number | null
  currency: string
  priorityMode: string
  status: string
  rawInput?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
  items: Array<{
    id: string
    procurementId: string
    name: string
    brand?: string | null
    model?: string | null
    sku?: string | null
    quantity: number
    currency: string
    specifications?: string | null
    maxBudget?: number | null
    status: string
    offers: Array<any>
  }>
}

const memoryStore = new Map<string, MemoryProcurement>()

export function saveProcurementMemory(proc: MemoryProcurement) {
  memoryStore.set(proc.id, proc)
}

export function getProcurementMemory(id: string): MemoryProcurement | undefined {
  return memoryStore.get(id)
}

export function getAllProcurementsMemory(): MemoryProcurement[] {
  return Array.from(memoryStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function updateProcurementMemory(id: string, updates: Partial<MemoryProcurement>) {
  const existing = memoryStore.get(id)
  if (!existing) return undefined
  const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() }
  memoryStore.set(id, updated)
  return updated
}

export function deleteProcurementMemory(id: string) {
  memoryStore.delete(id)
}
