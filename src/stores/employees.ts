import { defineStore } from 'pinia'
import seed from '@/data/employees.json'
import type { Employee } from '@/types/employee'

const STORAGE_KEY = 'pc.employees.v1'

function loadFromStorage(): Employee[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Employee[]) : null
  } catch {
    return null
  }
}

function saveToStorage(employees: Employee[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees))
  } catch {
    // Storage may be unavailable (private mode, quota); the in-memory state still works.
  }
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter((v) => v && v.trim().length > 0))].sort((a, b) =>
    a.localeCompare(b),
  )
}

export const useEmployeesStore = defineStore('employees', {
  state: () => ({
    employees: (loadFromStorage() ?? (seed as Employee[])) as Employee[],
  }),

  getters: {
    byCode: (state) => {
      return (code: string): Employee | undefined =>
        state.employees.find((e) => e.code === code)
    },
    departments: (state): string[] => uniqueSorted(state.employees.map((e) => e.department)),
    occupations: (state): string[] => uniqueSorted(state.employees.map((e) => e.occupation)),
  },

  actions: {
    add(employee: Employee) {
      this.employees.push(employee)
      this.persist()
    },
    update(code: string, patch: Partial<Omit<Employee, 'code'>>) {
      const index = this.employees.findIndex((e) => e.code === code)
      if (index === -1) return
      this.employees[index] = { ...this.employees[index], ...patch } as Employee
      this.persist()
    },
    remove(code: string) {
      this.employees = this.employees.filter((e) => e.code !== code)
      this.persist()
    },
    replaceAll(employees: Employee[]) {
      this.employees = [...employees]
      this.persist()
    },
    resetToSeed() {
      this.employees = [...(seed as Employee[])]
      this.persist()
    },
    persist() {
      saveToStorage(this.employees)
    },
  },
})
