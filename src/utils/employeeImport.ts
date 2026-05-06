import type { Employee } from '@/types/employee'

export interface ParseResult {
  valid: Employee[]
  invalidCount: number
}

export interface MergePreview {
  added: number
  updated: number
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0
}

function isNullableString(v: unknown): v is string | null | undefined {
  return v === null || v === undefined || typeof v === 'string'
}

function validateEmployee(input: unknown): Employee | null {
  if (!input || typeof input !== 'object') return null
  const obj = input as Record<string, unknown>
  if (!isNonEmptyString(obj.code) || !/^EMP\d{3,}$/.test(obj.code)) return null
  if (!isNonEmptyString(obj.fullName)) return null
  if (!isNonEmptyString(obj.occupation)) return null
  if (!isNonEmptyString(obj.department)) return null
  if (!isNullableString(obj.dateOfEmployment)) return null
  if (!isNullableString(obj.terminationDate)) return null
  return {
    code: obj.code.trim(),
    fullName: obj.fullName.trim(),
    occupation: obj.occupation.trim(),
    department: obj.department.trim(),
    dateOfEmployment: obj.dateOfEmployment ? String(obj.dateOfEmployment) : null,
    terminationDate: obj.terminationDate ? String(obj.terminationDate) : null,
  }
}

export function parseEmployeesJson(text: string): ParseResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('File is not valid JSON.')
  }
  if (!Array.isArray(parsed)) {
    throw new Error('Expected a JSON array of employees.')
  }
  const valid: Employee[] = []
  let invalidCount = 0
  for (const entry of parsed) {
    const emp = validateEmployee(entry)
    if (emp) valid.push(emp)
    else invalidCount++
  }
  return { valid, invalidCount }
}

export function previewMerge(current: Employee[], incoming: Employee[]): MergePreview {
  const codes = new Set(current.map((e) => e.code))
  let added = 0
  let updated = 0
  for (const emp of incoming) {
    if (codes.has(emp.code)) updated++
    else added++
  }
  return { added, updated }
}

export function mergeEmployees(current: Employee[], incoming: Employee[]): Employee[] {
  const map = new Map(current.map((e) => [e.code, e]))
  for (const emp of incoming) map.set(emp.code, emp)
  return [...map.values()]
}

export function downloadEmployeesJson(employees: Employee[]): void {
  const today = new Date().toISOString().slice(0, 10)
  const filename = `purple-cross-employees-${today}.json`
  const blob = new Blob([JSON.stringify(employees, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
