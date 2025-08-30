
import { z } from "zod";

export const patientSchema = z.object({
  cns: z.string().optional(),
  cpf: z.string().optional(),
  nomeCompleto: z.string().min(1, "Nome completo é obrigatório"),
  dataNascimento: z.date({
    required_error: "Data de nascimento é obrigatória",
  }),
  sexo: z.enum(['Masculino', 'Feminino'], {
    required_error: "Sexo é obrigatório",
  }),
  telefoneContato: z.string().optional(),
  endereco: z.object({
    rua: z.string().optional(),
    numero: z.string().optional(),
    bairro: z.string().optional(),
    cidade: z.string().optional(),
    cep: z.string().optional(),
  }).optional(),
  nivelAtencao: z.enum(['AD I', 'AD II', 'AD III']).optional(),
  status: z.enum([
    'Análise de Elegibilidade',
    'Ativo',
    'Alta por Melhora',
    'Alta Administrativa com Encaminhamento',
    'Óbito',
    'Inelegível'
  ], {
    required_error: "Status é obrigatório",
  }),
  tipoCuidado: z.enum([
    'Paliativo',
    'Medicação',
    'Curativo',
    'Reabilitação',
    'Anticoagulação'
  ]).optional(),
}).refine((data) => data.cns || data.cpf, {
  message: "Pelo menos CNS ou CPF deve ser preenchido",
  path: ["cns"], // Mostra erro no campo CNS
});

export type PatientFormData = z.infer<typeof patientSchema>;

export const statusOptions = [
  'Análise de Elegibilidade',
  'Ativo',
  'Alta por Melhora',
  'Alta Administrativa com Encaminhamento',
  'Óbito',
  'Inelegível'
] as const;

export const nivelAtencaoOptions = ['AD I', 'AD II', 'AD III'] as const;

export const tipoCuidadoOptions = [
  'Paliativo',
  'Medicação',
  'Curativo',
  'Reabilitação',
  'Anticoagulação'
] as const;
