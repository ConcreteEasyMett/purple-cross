import type { EmploymentStatus, TerminationStatus } from '@/types/employee'

function startOfToday(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function startOfDate(value: string): number | null {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function employmentStatus(dateOfEmployment: string | null): EmploymentStatus | null {
  if (!dateOfEmployment) return null
  const ts = startOfDate(dateOfEmployment)
  if (ts === null) return null
  return ts <= startOfToday() ? 'Currently employed' : 'Employed soon'
}

export function terminationStatus(terminationDate: string | null): TerminationStatus | null {
  if (!terminationDate) return null
  const ts = startOfDate(terminationDate)
  if (ts === null) return null
  return ts <= startOfToday() ? 'Terminated' : 'To be terminated'
}
