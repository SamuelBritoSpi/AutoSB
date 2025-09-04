import { addDays, parseISO } from 'date-fns';
import type { MedicalCertificate, ContractType } from './types';

export interface CertificateAnalysis {
  totalDaysInWindow: number;
  status: 'Normal' | 'Encaminhar ao INSS' | 'Encaminhar ao SEI';
  limit: number;
}

/**
 * Normalizes a CID code to its main category.
 * Examples: 'J06.9' -> 'J06', 'M54' -> 'M54', 'F32.10' -> 'F32'
 * @param cid The full CID code.
 * @returns The main category of the CID.
 */
function getCidGroup(cid: string): string {
  if (!cid) return 'sem-cid'; // Group for certificates without a CID
  // Takes the first letter and the two following numbers.
  const match = cid.toUpperCase().match(/^[A-Z]\d{2}/);
  return match ? match[0] : cid.toUpperCase();
}


/**
 * Analyzes medical certificates for an employee based on their contract type.
 * @param certificates - An array of the employee's medical certificates.
 * @param contractType - The employee's contract type.
 * @returns An analysis object with the total days in the window and the status.
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

  // Filter for certificates within the last 60 days
  const certsInWindow = certificates.filter(cert => {
    const certDate = parseISO(cert.certificateDate);
    return certDate >= sixtyDaysAgo && certDate <= today;
  });

  if (certsInWindow.length === 0) {
     return { totalDaysInWindow: 0, status: 'Normal', limit };
  }

  // Group certificates by their CID group
  const daysByCidGroup = new Map<string, number>();

  certsInWindow.forEach(cert => {
    const group = getCidGroup(cert.cid || '');
    const currentDays = daysByCidGroup.get(group) || 0;
    const certDays = cert.isHalfDay ? 0.5 : cert.days;
    daysByCidGroup.set(group, currentDays + certDays);
  });

  // Find the maximum number of days from any single CID group
  let maxDays = 0;
  if (daysByCidGroup.size > 0) {
    maxDays = Math.max(...Array.from(daysByCidGroup.values()));
  }

  let status: CertificateAnalysis['status'] = 'Normal';
  if (maxDays >= limit) {
    status = contractType === 'efetivo' ? 'Encaminhar ao SEI' : 'Encaminhar ao INSS';
  }

  return {
    totalDaysInWindow: Math.round(maxDays * 10) / 10, // Round to one decimal place for half days
    status,
    limit,
  };
}
