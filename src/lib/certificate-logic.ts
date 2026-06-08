import type { MedicalCertificate, ContractType } from './types';

function parseLocalDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts.map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(dateStr);
}

export interface CertificateAnalysis {
  totalDaysInWindow: number;
  status: 'Normal' | 'Encaminhar ao INSS' | 'Encaminhar ao SEI';
  limit: number;
}

/**
 * Normaliza um código CID para sua categoria principal ou grupo correlato.
 * Exemplos: 'J06.9' -> 'J06', 'O0.3' -> 'O03', 'O20.0' -> 'O20'
 * 
 * Regra de Negócio: CIDs relacionados a complicações iniciais da gravidez (Capítulo O, 00-29)
 * são agrupados para permitir o acúmulo correto, conforme diretrizes médicas de 
 * "doenças correlatas" (ex: Ameaça de Aborto e Aborto Espontâneo).
 * 
 * @param cid O código CID informado pelo usuário.
 * @returns A chave de agrupamento para o cálculo de acúmulo.
 */
function getCidGroup(cid: string): string {
  if (!cid) return 'sem-cid';

  // 1. Normalização: Remove pontos, espaços e caracteres especiais
  const clean = cid.toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (clean.length < 2) return clean;

  // 2. Extração da Categoria (Letra + 2 Números)
  // Lida com entradas como "O3" -> "O03" ou "O03.9" -> "O03"
  const letter = clean[0];
  const numbersPart = clean.substring(1);
  let categoryDigits = '';

  if (numbersPart.length === 1) {
    categoryDigits = '0' + numbersPart; // Caso o usuário digite O3 em vez de O03
  } else {
    categoryDigits = numbersPart.substring(0, 2); // Pega os dois dígitos principais
  }

  const category = letter + categoryDigits;

  // 3. Agrupamento de Doenças Correlatas (Regras de Inteligência de Saúde)
  
  // Capítulo XV: Gravidez, parto e puerpério (O00-O99)
  if (letter === 'O') {
    const num = parseInt(categoryDigits);
    // Agrupa condições de complicações iniciais da gravidez (00-29)
    // Isso une CIDs como O03 (Aborto) e O20 (Ameaça de Aborto) que são a mesma jornada clínica
    if (!isNaN(num) && num >= 0 && num <= 29) {
      return 'GRP-O-PREGNANCY-COMPLICATIONS-EARLY';
    }
  }

  // Agrupamento Padrão por Categoria CID-10 (3 dígitos)
  return category;
}


/**
 * Analisa os atestados médicos de um funcionário com base no seu tipo de contrato.
 * @param certificates - Uma matriz de atestados médicos do funcionário.
 * @param contractType - O tipo de contrato do funcionário.
 * @returns Um objeto de análise com o total de dias na janela e o status.
 */
export function analyzeCertificates(
  certificates: MedicalCertificate[],
  contractType: ContractType
): CertificateAnalysis {
  const limit = contractType === 'efetivo' ? 10 : 15;

  if (certificates.length === 0) {
    return { totalDaysInWindow: 0, status: 'Normal', limit };
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const sixtyDaysAgo = new Date(today);
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  sixtyDaysAgo.setHours(0, 0, 0, 0);

  // Filtra por atestados nos últimos 60 dias
  const certsInWindow = certificates.filter(cert => {
    const certDate = parseLocalDate(cert.certificateDate);
    return certDate >= sixtyDaysAgo && certDate <= today;
  });

  if (certsInWindow.length === 0) {
     return { totalDaysInWindow: 0, status: 'Normal', limit };
  }

  // Agrupa os atestados pelo seu grupo de CID normalizado
  const daysByCidGroup = new Map<string, number>();

  certsInWindow.forEach(cert => {
    const group = getCidGroup(cert.cid || '');
    const currentDays = daysByCidGroup.get(group) || 0;
    const certDays = cert.isHalfDay ? 0.5 : cert.days;
    daysByCidGroup.set(group, currentDays + certDays);
  });

  // Encontra o número máximo de dias de qualquer grupo de CID correlato
  let maxDays = 0;
  if (daysByCidGroup.size > 0) {
    maxDays = Math.max(...Array.from(daysByCidGroup.values()));
  }

  let status: CertificateAnalysis['status'] = 'Normal';
  if (maxDays >= limit) {
    status = contractType === 'efetivo' ? 'Encaminhar ao SEI' : 'Encaminhar ao INSS';
  }

  return {
    totalDaysInWindow: Math.round(maxDays * 10) / 10, // Arredonda para uma casa decimal para meios dias
    status,
    limit,
  };
}
