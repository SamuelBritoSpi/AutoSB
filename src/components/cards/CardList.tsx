
"use client";

import React, { useMemo, useState } from 'react';
import type { Card } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, Search, FileText, Send, XCircle, Trash2, CheckCircle, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { renderReport } from '@/lib/print-utils';
import CardsReport from '../reports/CardsReport';
import DeliveryTermDialog from './DeliveryTermDialog';

interface CardListProps {
  cards: Card[];
  onUpdateCard: (card: Card) => void;
  onDeleteCard: (id: string) => void;
}

export default function CardList({ cards, onUpdateCard, onDeleteCard }: CardListProps) {
  const { toast } = useToast();
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isTermDialogOpen, setIsTermDialogOpen] = useState(false);

  const filteredCards = useMemo(() => {
    return cards
      .filter(card => {
        const matchesFilter = filter === 'all' || card.status === filter;
        const matchesSearch = card.recipientName.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => new Date(a.arrivalDate).getTime() - new Date(b.arrivalDate).getTime());
  }, [cards, filter, searchTerm]);

  const handleMarkAsDelivered = (card: Card) => {
    onUpdateCard({ ...card, status: 'delivered', deliveryDate: new Date().toISOString() });
    toast({ title: 'Status Atualizado', description: `Cartão de ${card.recipientName} marcado como entregue.` });
  };

  const handleMarkAsPending = (card: Card) => {
    onUpdateCard({ ...card, status: 'pending', deliveryDate: null });
    toast({ title: 'Status Atualizado', description: `Cartão de ${card.recipientName} marcado como pendente.` });
  };
  
  const handleGenerateReport = (cardIds: string[]) => {
    const reportCards = cardIds.length > 0 ? cards.filter(c => cardIds.includes(c.id)) : filteredCards;
    if (reportCards.length === 0) {
      toast({ variant: 'destructive', title: 'Nenhum cartão', description: 'Nenhum cartão selecionado ou visível para gerar o relatório.' });
      return;
    }
    const reportElement = <CardsReport cards={reportCards} />;
    renderReport(reportElement, 'Relatório de Cartões');
    setSelectedCards([]);
  };

  const handleGenerateDeliveryTerm = () => {
    if (selectedCards.length === 0) {
        toast({ variant: 'destructive', title: 'Nenhum cartão selecionado', description: 'Selecione os cartões para gerar o termo de entrega.' });
        return;
    }
    const cardsWithWrongStatus = cards.filter(c => selectedCards.includes(c.id) && c.status !== 'pending');
    if (cardsWithWrongStatus.length > 0) {
        toast({ variant: 'destructive', title: 'Status Inválido', description: 'Apenas cartões com status "Pendente" podem ser incluídos no termo.' });
        return;
    }
    setIsTermDialogOpen(true);
  };

  const handleConfirmDelivery = (ids: string[]) => {
    const cardsToUpdate = cards.filter(c => ids.includes(c.id));
    cardsToUpdate.forEach(card => {
        onUpdateCard({ ...card, status: 'delivered', deliveryDate: new Date().toISOString() });
    });
    setSelectedCards([]);
    toast({ title: 'Entrega Registrada', description: `${ids.length} cartão(ões) marcados como entregues.`});
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-card rounded-lg shadow">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Filtros e Ações</h3>
          </div>
          <div className="relative w-full sm:w-auto flex-grow sm:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button variant={filter === 'pending' ? 'default' : 'outline'} onClick={() => setFilter('pending')}>Pendentes</Button>
            <Button variant={filter === 'delivered' ? 'default' : 'outline'} onClick={() => setFilter('delivered')}>Entregues</Button>
            <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>Todos</Button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => handleGenerateReport(selectedCards)} className="w-full sm:w-auto">
                <FileText className="mr-2 h-4 w-4" /> Gerar Relatório
            </Button>
            <Button onClick={handleGenerateDeliveryTerm} className="w-full sm:w-auto">
                <Send className="mr-2 h-4 w-4" /> Gerar Termo de Entrega
            </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedCards.length === filteredCards.length && filteredCards.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCards(filteredCards.map(c => c.id));
                      } else {
                        setSelectedCards([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Destinatário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Chegada</TableHead>
                <TableHead>Data de Entrega</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCards.length > 0 ? (
                filteredCards.map((card) => (
                  <TableRow key={card.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedCards.includes(card.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCards(prev => [...prev, card.id]);
                          } else {
                            setSelectedCards(prev => prev.filter(id => id !== card.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{card.recipientName}</TableCell>
                    <TableCell>
                      {card.status === 'pending' ? (
                        <span className="flex items-center gap-2 text-yellow-600"><Clock className="h-4 w-4" /> Pendente</span>
                      ) : (
                        <span className="flex items-center gap-2 text-green-600"><CheckCircle className="h-4 w-4" /> Entregue</span>
                      )}
                    </TableCell>
                    <TableCell>{format(parseISO(card.arrivalDate), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      {card.deliveryDate ? format(parseISO(card.deliveryDate), 'dd/MM/yyyy HH:mm') : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {card.status === 'pending' ? (
                            <DropdownMenuItem onClick={() => handleMarkAsDelivered(card)}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Marcar como Entregue
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleMarkAsPending(card)}>
                              <XCircle className="mr-2 h-4 w-4 text-yellow-500" /> Marcar como Pendente
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => onDeleteCard(card.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhum cartão encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <DeliveryTermDialog 
        open={isTermDialogOpen}
        onOpenChange={setIsTermDialogOpen}
        cards={cards.filter(c => selectedCards.includes(c.id))}
        onConfirmDelivery={handleConfirmDelivery}
      />
    </>
  );
}
