
import type { Uniform } from '@/lib/types';
import ReportLayout from './ReportLayout';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UniformsReportProps {
  uniforms: Uniform[];
}

export default function UniformsReport({ uniforms }: UniformsReportProps) {
  const statusMap = {
    pending: 'Pendente',
    delivered: 'Entregue',
  };

  return (
    <ReportLayout title="Relatório de Fardamento">
      <table>
        <thead>
          <tr>
            <th>Funcionário</th>
            <th>Colégio</th>
            <th>Itens Recebidos</th>
            <th>Status</th>
            <th>Data Registro</th>
          </tr>
        </thead>
        <tbody>
          {uniforms.length > 0 ? (
            uniforms.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 'bold' }}>{u.employeeName}</td>
                <td>{u.schoolName}</td>
                <td>
                  <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.8rem' }}>
                    {u.items.map((item, i) => (
                      <li key={i}>{item.quantity}x {item.name} (Tam: {item.size})</li>
                    ))}
                  </ul>
                </td>
                <td>{statusMap[u.status]}</td>
                <td>{format(parseISO(u.arrivalDate), 'P', { locale: ptBR })}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                Nenhum registro encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </ReportLayout>
  );
}
