export interface Employee {
  code: string
  fullName: string
  occupation: string
  department: string
  dateOfEmployment: string | null
  terminationDate: string | null
}

export type EmploymentStatus = 'Currently employed' | 'Employed soon'
export type TerminationStatus = 'Terminated' | 'To be terminated'
