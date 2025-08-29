import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
})

export const registerSchema = loginSchema.extend({
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  company: z.string().min(2, 'O nome da empresa deve ter no mínimo 2 caracteres'),
  passwordConfirmation: z.string(),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: 'As senhas não conferem',
  path: ['passwordConfirmation'],
})
