import type { CSSProperties } from 'react';
import type { ThirdPartyEmployee } from '@/lib/types';
import ReportLayout from './ReportLayout';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCPF } from '@/lib/utils';
import { isThirdPartyActive, normalizeThirdPartyStatus } from '@/lib/third-party-status';

export interface ThirdPartyReportFilters {
  company: string;
  schoolId: string;
  schoolName?: string;
  status?: string;
  role?: string;
  search?: string;
  scope?: 'filtered' | 'selected';
}

interface ThirdPartyReportProps {
  employees: ThirdPartyEmployee[];
  filters: ThirdPartyReportFilters;
}

const getStatusStyle = (status: string): CSSProperties => {
  return normalizeThirdPartyStatus(status) === 'Inativo'
    ? { color: '#c62828', fontWeight: 700 }
    : { color: '#2e7d32', fontWeight: 700 };
};

const formatDate = (value?: string) => {
  if (!value) return '—';
  try {
    return format(parseISO(value), 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return '—';
  }
};

export default function ThirdPartyReport({ employees, filters }: ThirdPartyReportProps) {
  // Identificar todas as colunas extras presentes em pelo menos um funcionário
  const allExtraKeys = Array.from(
    new Set(
      employees.flatMap(emp => emp.extraData ? Object.keys(emp.extraData) : [])
    )
  );

  const sortedEmployees = [...employees].sort((a, b) =>
    (a.name || '').localeCompare(b.name || '', 'pt-BR')
  );

  const companies = Array.from(
    new Set(sortedEmployees.map(emp => emp.company).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, 'pt-BR'));

  const totalActive = sortedEmployees.filter(emp => isThirdPartyActive(emp.status)).length;
  const totalSchools = new Set(
    sortedEmployees.map(emp => emp.schoolId || emp.schoolName || '').filter(Boolean)
  ).size;

  const companyLabel = filters.company === 'all' ? 'Todas' : filters.company;
  const schoolLabel = filters.schoolId === 'all'
    ? 'Todas'
    : (filters.schoolName || 'Selecionada');
  const statusLabel = !filters.status || filters.status === 'all' ? 'Todos' : filters.status;
  const roleLabel = !filters.role || filters.role === 'all' ? 'Todas' : filters.role;
  const searchLabel = filters.search?.trim() ? `"${filters.search.trim()}"` : 'Não aplicada';

  return (
    <ReportLayout title="Funcionários Terceirizados" orientation="landscape">
      <div className="report-filters">
        <span><strong>Empresa:</strong> {companyLabel}</span>
        <span><strong>Lotação:</strong> {schoolLabel}</span>
        <span><strong>Status:</strong> {statusLabel}</span>
        <span><strong>Função:</strong> {roleLabel}</span>
        <span><strong>Busca:</strong> {searchLabel}</span>
        <span><strong>Abrangência:</strong> {filters.scope === 'selected' ? 'Somente selecionados' : 'Todos os registros filtrados'}</span>
      </div>

      <div className="report-summary">
        <div className="report-summary-item">
          <span>Total de Registros</span>
          <strong>{sortedEmployees.length}</strong>
        </div>
        <div className="report-summary-item">
          <span>Ativos</span>
          <strong>{totalActive}</strong>
        </div>
        <div className="report-summary-item">
          <span>Inativos</span>
          <strong>{sortedEmployees.length - totalActive}</strong>
        </div>
        <div className="report-summary-item">
          <span>Lotações</span>
          <strong>{totalSchools}</strong>
        </div>
        {companies.map(company => (
          <div className="report-summary-item" key={company}>
            <span>Empresa {company}</span>
            <strong>{sortedEmployees.filter(emp => emp.company === company).length}</strong>
          </div>
        ))}
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
            {/* Colunas Dinâmicas */}
            {allExtraKeys.map(key => (
              <th key={key} style={{ backgroundColor: '#fff9c4', color: '#827717' }}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedEmployees.length > 0 ? (
            sortedEmployees.map(emp => (
              <tr key={emp.id} style={{ pageBreakInside: 'avoid' }}>
                <td>{emp.nte}</td>
                <td>{emp.municipio}</td>
                <td style={{ fontWeight: 'bold' }}>{emp.schoolName}</td>
                <td>{emp.codSec}</td>
                <td>{emp.name}</td>
                <td style={{ fontFamily: 'monospace' }}>{formatCPF(emp.cpf)}</td>
                <td>{emp.role}</td>
                <td>{emp.contact}</td>
                <td>{emp.contractType || '—'}</td>
                <td>{emp.company}</td>
                <td style={getStatusStyle(emp.status)}>{normalizeThirdPartyStatus(emp.status)}</td>
                <td>{formatDate(emp.admissionDate)}</td>
                {/* Dados Dinâmicos */}
                {allExtraKeys.map(key => (
                  <td key={key} style={{ fontStyle: 'italic' }}>
                    {emp.extraData?.[key] || '—'}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={12 + allExtraKeys.length} style={{ textAlign: 'center', padding: '2rem' }}>
                Nenhum funcionário encontrado para os filtros selecionados.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ marginTop: '2rem', fontSize: '0.75rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
        <p><strong>Nota:</strong> Este relatório exibe as informações mais atualizadas de cada colaborador. Colunas destacadas em amarelo foram detectadas automaticamente na planilha de origem.</p>
        <p><strong>Total de registros impressos:</strong> {sortedEmployees.length}</p>
      </div>
    </ReportLayout>
  );
}
