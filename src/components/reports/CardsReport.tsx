
import type { Card } from '@/lib/types';
import ReportLayout from './ReportLayout';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CardsReportProps {
  cards: Card[];
}

export default function CardsReport({ cards }: CardsReportProps) {
  const statusMap = {
    pending: 'Pendente',
    delivered: 'Entregue',
  };

  return (
    <ReportLayout title="Relatório de Cartões">
      <table>
        <thead>
          <tr>
            <th>Destinatário</th>
            <th>Colégio</th>
            <th>Status</th>
            <th>Data de Chegada</th>
            <th>Data de Entrega</th>
          </tr>
        </thead>
        <tbody>
          {cards.length > 0 ? (
            cards.map(card => (
              <tr key={card.id}>
                <td style={{ fontWeight: 'bold' }}>{card.recipientName}</td>
                <td>{card.schoolName || 'Não Informado'}</td>
                <td>{statusMap[card.status]}</td>
                <td>{format(parseISO(card.arrivalDate), 'P', { locale: ptBR })}</td>
                <td>{card.deliveryDate ? format(parseISO(card.deliveryDate), "P 'às' HH:mm", { locale: ptBR }) : 'N/A'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                Nenhum cartão encontrado para os filtros selecionados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </ReportLayout>
  );
}
