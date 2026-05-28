
import type { ThirdPartyEmployee } from '@/lib/types';
import ReportLayout from './ReportLayout';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ThirdPartyReportProps {
  employees: ThirdPartyEmployee[];
  filters: {
    company: string;
    schoolId: string;
  };
}

export default function ThirdPartyReport({ employees, filters }: ThirdPartyReportProps) {
  return (
    <ReportLayout title="Relatório de Funcionários Terceirizados">
      <div style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: '#666' }}>
        <strong>Filtros:</strong> {filters.company === 'all' ? 'Todas Empresas' : `Empresa: ${filters.company}`} 
        {filters.schoolId !== 'all' && ` | Lotação Específica`}
      </div>
      
      <table style={{ fontSize: '0.75rem' }}>
        <thead>
          <tr>
            <th>NTE</th>
            <th>Município</th>
            <th>Lotação</th>
            <th>COD.sec</th>
            <th>Nome Completo</th>
            <th>CPF</th>
            <th>Função</th>
            <th>Contato</th>
            <th>Empresa</th>
            <th>Status</th>
            <th>Admissão</th>
          </tr>
        </thead>
        <tbody>
          {employees.length > 0 ? (
            employees.map(emp => (
              <tr key={emp.id}>
                <td>{emp.nte}</td>
                <td>{emp.municipio}</td>
                <td style={{ fontWeight: 'bold' }}>{emp.schoolName}</td>
                <td>{emp.codSec}</td>
                <td>{emp.name}</td>
                <td>{emp.cpf}</td>
                <td>{emp.role}</td>
                <td>{emp.contact}</td>
                <td>{emp.company}</td>
                <td>{emp.status}</td>
                <td>{format(parseISO(emp.admissionDate), 'dd/MM/yyyy')}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={11} style={{ textAlign: 'center', padding: '2rem' }}>
                Nenhum funcionário encontrado com os filtros selecionados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      <div style={{ marginTop: '2rem', fontSize: '0.8rem', fontStyle: 'italic', color: '#888' }}>
        * Este relatório pode ser copiado e colado diretamente em uma planilha Excel para manter a sincronização com o OneDrive.
      </div>
    </ReportLayout>
  );
}
