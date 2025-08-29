export type Company = {
  id: string
  name: string
  cnpj: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip_code: string
  created_at: string
  updated_at: string
}

export type UpdateCompanyData = Partial<Omit<Company, 'id' | 'created_at' | 'updated_at'>>
