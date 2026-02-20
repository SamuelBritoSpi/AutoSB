
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
import type { Uniform } from '@/lib/types';
import { renderReport } from '@/lib/print-utils';
import UniformDeliveryTerm from '../reports/UniformDeliveryTerm';

interface DeliveryTermDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uniforms: Uniform[];
  onConfirmDelivery: (ids: string[]) => void;
}

export default function UniformDeliveryTermDialog({ open, onOpenChange, uniforms, onConfirmDelivery }: DeliveryTermDialogProps) {

  const handleGenerateAndPrint = () => {
    const termElement = <UniformDeliveryTerm uniforms={uniforms} />;
    renderReport(termElement, 'Termo de Entrega de Fardamento');
  };

  const handleConfirmAndClose = () => {
    const ids = uniforms.map(u => u.id);
    onConfirmDelivery(ids);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerar Termo de Entrega</DialogTitle>
          <DialogDescription>
            Será gerado um termo formal para {uniforms.length} registro(s) de fardamento.
            Confirme após a assinatura física.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <h4 className="font-semibold mb-2 text-sm text-primary">Funcionários Selecionados:</h4>
          <div className="bg-muted p-3 rounded-md max-h-40 overflow-y-auto space-y-1">
            {uniforms.map(u => (
              <div key={u.id} className="text-xs flex justify-between">
                <span>{u.employeeName}</span>
                <span className="text-muted-foreground italic">{u.schoolName}</span>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter className="sm:justify-between flex-col-reverse sm:flex-row gap-2">
          <Button onClick={handleGenerateAndPrint} variant="outline" className="w-full sm:w-auto">
            <Printer className="mr-2 h-4 w-4" /> Imprimir Termo
          </Button>
          <Button onClick={handleConfirmAndClose} className="w-full sm:w-auto">
            <Send className="mr-2 h-4 w-4" /> Confirmar Entrega
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
