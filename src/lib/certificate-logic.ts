import { addDays, differenceInDays, parseISO } from 'date-fns';
import type { MedicalCertificate, ContractType } from './types';

export interface CertificateAnalysis {
  totalDaysInWindow: number;
  status: 'Normal' | 'Encaminhar ao INSS' | 'Encaminhar ao SEI';
  limit: number;
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
  if (certificates.length === 0) {
    return { totalDaysInWindow: 0, status: 'Normal', limit: contractType === 'efetivo' ? 10 : 15 };
  }

  // Sort certificates by date, ascending
  const sortedCerts = [...certificates].sort(
    (a, b) => parseISO(a.certificateDate).getTime() - parseISO(b.certificateDate).getTime()
  );

  const today = new Date();
  const sixtyDaysAgo = addDays(today, -60);

  // Filter for certificates within the last 60 days
  const certsInWindow = sortedCerts.filter(cert => {
    const certDate = parseISO(cert.certificateDate);
    return certDate >= sixtyDaysAgo && certDate <= today;
  });

  // Sum the days from the filtered certificates
  const totalDaysInWindow = certsInWindow.reduce((sum, cert) => {
    // Half day certificates count as 0.5
    return sum + (cert.isHalfDay ? 0.5 : cert.days);
  }, 0);

  const limit = contractType === 'efetivo' ? 10 : 15;
  let status: CertificateAnalysis['status'] = 'Normal';

  if (totalDaysInWindow >= limit) {
    status = contractType === 'efetivo' ? 'Encaminhar ao SEI' : 'Encaminhar ao INSS';
  }

  return {
    totalDaysInWindow: Math.round(totalDaysInWindow * 10) / 10, // Round to one decimal place for half days
    status,
    limit,
  };
}
