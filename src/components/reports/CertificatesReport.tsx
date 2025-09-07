
import type { MedicalCertificate, Employee } from '@/lib/types';
import ReportLayout from './ReportLayout';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CertificatesReportProps {
  certificates: MedicalCertificate[];
  employees: Employee[];
  filters: {
    dateRange: { from?: Date; to?: Date };
    employeeId: string;
  };
}

export default function CertificatesReport({ certificates, employees, filters }: CertificatesReportProps) {
  
  const formatDate = (date?: Date) => date ? format(date, "P", { locale: ptBR }) : 'N/A';
  const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name || 'Desconhecido';

  const filterSummary = [
    `Período: De ${formatDate(filters.dateRange.from)} a ${formatDate(filters.dateRange.to)}`,
    `Funcionário: ${filters.employeeId === 'all' ? 'Todos' : getEmployeeName(filters.employeeId)}`
  ].join(' | ');

  const groupedByEmployee = certificates.reduce((acc, cert) => {
    const employeeName = getEmployeeName(cert.employeeId);
    (acc[employeeName] = acc[employeeName] || []).push(cert);
    return acc;
  }, {} as Record<string, MedicalCertificate[]>);

  return (
    <ReportLayout title="Relatório de Atestados">
        <p style={{fontSize: '0.9rem', color: '#555', marginBottom: '1.5rem'}}><strong>Filtros Aplicados:</strong> {filterSummary}</p>
        
        {Object.keys(groupedByEmployee).sort().map(employeeName => (
            <div key={employeeName}>
                <h2>{employeeName}</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Data do Atestado</th>
                            <th>Nº de Dias</th>
                            <th>CID</th>
                            <th>Original Recebido</th>
                            <th>Anexado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groupedByEmployee[employeeName]
                            .sort((a,b) => new Date(a.certificateDate).getTime() - new Date(b.certificateDate).getTime())
                            .map(cert => (
                            <tr key={cert.id}>
                                <td>{format(parseISO(cert.certificateDate), "P", { locale: ptBR })}</td>
                                <td>{cert.isHalfDay ? 'Meio turno' : cert.days}</td>
                                <td>{cert.cid || 'N/A'}</td>
                                <td>{cert.originalReceived ? 'Sim' : 'Não'}</td>
                                <td>{cert.fileURL ? 'Sim' : 'Não'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ))}

        {Object.keys(groupedByEmployee).length === 0 && (
             <table>
                <tbody>
                    <tr>
                        <td style={{textAlign: 'center', padding: '2rem'}}>Nenhum atestado encontrado para os filtros selecionados.</td>
                    </tr>
                </tbody>
            </table>
        )}
    </ReportLayout>
  );
}
