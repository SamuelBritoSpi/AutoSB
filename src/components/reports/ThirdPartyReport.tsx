
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
    <ReportLayout title="Base de Dados de Funcionários Terceirizados">
      <div style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: '#666' }}>
        <strong>Filtros:</strong> {filters.company === 'all' ? 'Todas Empresas' : `Empresa: ${filters.company}`} 
        {filters.schoolId !== 'all' && ` | Lotação Específica`}
        <br />
        <strong>Total de Registros:</strong> {employees.length}
      </div>
      
      <table style={{ fontSize: '0.65rem' }}>
        <thead>
          <tr>
            <th>NTE</th>
            <th>MUNICÍPIO</th>
            <th>LOTAÇÃO</th>
            <th>COD SEC</th>
            <th>NOME</th>
            <th>CPF</th>
            <th>FUNÇÃO</th>
            <th>CONTATO</th>
            <th>CONTRATO ATUAL</th>
            <th>EMPRESA</th>
            <th>STATUS</th>
            <th>ADMISSÃO</th>
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
                <td>{emp.contractType || '—'}</td>
                <td>{emp.company}</td>
                <td>{emp.status}</td>
                <td>{format(parseISO(emp.admissionDate), 'dd/MM/yyyy')}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={12} style={{ textAlign: 'center', padding: '2rem' }}>
                Nenhum funcionário encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      <div style={{ marginTop: '2rem', fontSize: '0.75rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
        <p><strong>Nota:</strong> Este relatório exibe as informações mais atualizadas de cada colaborador. Históricos detalhados de mudanças de lotação ou contato podem ser consultados diretamente no perfil individual do funcionário no sistema.</p>
      </div>
    </ReportLayout>
  );
}
