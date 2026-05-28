
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
  // Coleta todas as chaves únicas de extraData presentes na lista filtrada
  const extraKeys = Array.from(
    new Set(
      employees.flatMap(emp => emp.extraData ? Object.keys(emp.extraData) : [])
    )
  );

  return (
    <ReportLayout title="Relatório de Funcionários Terceirizados">
      <div style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: '#666' }}>
        <strong>Filtros:</strong> {filters.company === 'all' ? 'Todas Empresas' : `Empresa: ${filters.company}`} 
        {filters.schoolId !== 'all' && ` | Lotação Específica`}
      </div>
      
      <table style={{ fontSize: '0.7rem' }}>
        <thead>
          <tr>
            <th>Lotação</th>
            <th>Nome Completo</th>
            <th>CPF</th>
            <th>Função</th>
            <th>Empresa</th>
            <th>Status</th>
            <th>Admissão</th>
            {/* Renderiza cabeçalhos dinâmicos para colunas extras */}
            {extraKeys.map(key => (
              <th key={key} style={{ backgroundColor: '#FFF9C4', color: '#827717' }}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {employees.length > 0 ? (
            employees.map(emp => (
              <tr key={emp.id}>
                <td style={{ fontWeight: 'bold' }}>{emp.schoolName}</td>
                <td>{emp.name}</td>
                <td>{emp.cpf}</td>
                <td>{emp.role}</td>
                <td>{emp.company}</td>
                <td>{emp.status}</td>
                <td>{format(parseISO(emp.admissionDate), 'dd/MM/yyyy')}</td>
                {/* Preenche os dados extras dinamicamente */}
                {extraKeys.map(key => (
                  <td key={key}>{emp.extraData ? String(emp.extraData[key] || '-') : '-'}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7 + extraKeys.length} style={{ textAlign: 'center', padding: '2rem' }}>
                Nenhum funcionário encontrado com os filtros selecionados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      <div style={{ marginTop: '2rem', fontSize: '0.8rem', fontStyle: 'italic', color: '#888' }}>
        * Colunas em amarelo foram identificadas como dados extras da sua planilha original e foram preservadas.
      </div>
    </ReportLayout>
  );
}
