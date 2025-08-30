
import { z } from 'zod';

export const userSchema = z.object({
  matricula: z.string().regex(/^[0-9]+$/, 'Matrícula deve conter apenas números').min(1, 'Matrícula é obrigatória'),
  nomeCompleto: z.string().min(1, 'Nome completo é obrigatório'),
  cargo: z.enum([
    'Enfermeiro',
    'Médico', 
    'Técnico de Enfermagem',
    'Assistente Administrativo',
    'Nutricionista',
    'Fisioterapeuta',
    'Psicólogo',
    'Assistente Social',
    'Farmacêutico',
    'Coordenador',
    'Gerente',
    'TI'
  ]),
  username: z.string().min(1, 'Nome de usuário é obrigatório').toLowerCase(),
  tipoDeAcesso: z.enum(['ADMIN', 'Comum']),
  paginasAcessiveis: z.array(z.string()).optional()
});

export type UserFormData = z.infer<typeof userSchema>;

export const availablePages = [
  'Home',
  'Pacientes', 
  'Atendimentos',
  'Dashboard',
  'Relatórios'
];
