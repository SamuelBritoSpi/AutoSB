import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata um CPF para o padrão 000.000.000-00
 */
export function formatCPF(cpf: string) {
  const digits = cpf.replace(/\D/g, '').padStart(11, '0');
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

/**
 * Normaliza strings para comparação (remove acentos, espaços e termos comuns)
 */
export function normalizeForComparison(str: string) {
  const noiseWords = [
    'colegio', 'escola', 'estadual', 'municipal', 'tempo', 'integral', 
    'ceti', 'de', 'da', 'do', 'das', 'dos', 'e', 'centro', 'educacional'
  ];
  
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .split(/\s+/)
    .filter(word => !noiseWords.includes(word) && word.length > 1)
    .join('');
}
