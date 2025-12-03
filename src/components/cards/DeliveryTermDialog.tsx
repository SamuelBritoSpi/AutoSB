
"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Send, Printer } from 'lucide-react';
import type { Card } from '@/lib/types';
import { renderReport } from '@/lib/print-utils';
import DeliveryTerm from '../reports/DeliveryTerm';

interface DeliveryTermDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cards: Card[];
  onConfirmDelivery: (ids: string[]) => void;
}

export default function DeliveryTermDialog({ open, onOpenChange, cards, onConfirmDelivery }: DeliveryTermDialogProps) {

  const handleGenerateAndPrint = () => {
    const termElement = <DeliveryTerm cards={cards} />;
    renderReport(termElement, 'Termo de Entrega de Cartões');
  };

  const handleConfirmAndClose = () => {
    const cardIds = cards.map(c => c.id);
    onConfirmDelivery(cardIds);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerar Termo de Entrega</DialogTitle>
          <DialogDescription>
            Você está prestes a gerar um termo de entrega para {cards.length} cartão(ões).
            Após a impressão e assinatura, clique em "Confirmar Entrega" para atualizar o status.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <h4 className="font-semibold mb-2">Cartões Selecionados:</h4>
          <ul className="list-disc list-inside bg-muted p-4 rounded-md text-sm max-h-40 overflow-y-auto">
            {cards.map(card => (
              <li key={card.id}>{card.recipientName}</li>
            ))}
          </ul>
        </div>
        <DialogFooter className="sm:justify-between flex-col-reverse sm:flex-row gap-2">
          <Button onClick={handleGenerateAndPrint} variant="outline">
            <Printer className="mr-2 h-4 w-4" /> Imprimir Termo
          </Button>
          <Button onClick={handleConfirmAndClose}>
            <Send className="mr-2 h-4 w-4" /> Confirmar Entrega e Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
