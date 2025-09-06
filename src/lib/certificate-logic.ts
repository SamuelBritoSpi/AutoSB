import { addDays, parseISO } from 'date-fns';
import type { MedicalCertificate, ContractType } from './types';

export interface CertificateAnalysis {
  totalDaysInWindow: number;
  status: 'Normal' | 'Encaminhar ao INSS' | 'Encaminhar ao SEI';
  limit: number;
}

/**
 * Normaliza um código CID para sua categoria principal.
 * Exemplos: 'J06.9' -> 'J06', 'M54' -> 'M54', 'F32.10' -> 'F32'
 * @param cid O código CID completo.
 * @returns A categoria principal do CID.
 */
function getCidGroup(cid: string): string {
  if (!cid) return 'sem-cid'; // Agrupa atestados sem CID
  // Pega a primeira letra e os dois números seguintes.
  const match = cid.toUpperCase().match(/^[A-Z]\d{2}/);
  return match ? match[0] : cid.toUpperCase();
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
  const sixtyDaysAgo = addDays(today, -60);

  // Filtra por atestados nos últimos 60 dias
  const certsInWindow = certificates.filter(cert => {
    const certDate = parseISO(cert.certificateDate);
    return certDate >= sixtyDaysAgo && certDate <= today;
  });

  if (certsInWindow.length === 0) {
     return { totalDaysInWindow: 0, status: 'Normal', limit };
  }

  // Agrupa os atestados pelo seu grupo de CID
  const daysByCidGroup = new Map<string, number>();

  certsInWindow.forEach(cert => {
    const group = getCidGroup(cert.cid || '');
    const currentDays = daysByCidGroup.get(group) || 0;
    const certDays = cert.isHalfDay ? 0.5 : cert.days;
    daysByCidGroup.set(group, currentDays + certDays);
  });

  // Encontra o número máximo de dias de qualquer grupo de CID
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
