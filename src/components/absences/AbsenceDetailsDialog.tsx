"use client";

import type { JustifiedAbsence } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, XCircle, CalendarRange, FileText, Pencil, Save, X } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

interface AbsenceDetailsDialogProps {
  absence: JustifiedAbsence;
  onUpdate: (absence: JustifiedAbsence) => void;
  onClose: () => void;
}

export default function AbsenceDetailsDialog({ absence, onUpdate, onClose }: AbsenceDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [reason, setReason] = useState(absence.reason);

  const days = differenceInDays(parseISO(absence.endDate), parseISO(absence.startDate)) + 1;

  const handleSave = () => {
    onUpdate({ ...absence, reason });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setReason(absence.reason);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho com informações básicas */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="text-2xl font-bold text-foreground">Detalhes da Falta Justificada</h3>
            <p className="text-sm text-muted-foreground mt-1">Informações completas do período de falta</p>
          </div>
          <Button
            variant={isEditing ? "destructive" : "outline"}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 transition-colors"
          >
            <Pencil className="h-4 w-4" />
            {isEditing ? 'Cancelar' : 'Editar'}
          </Button>
        </div>

        {/* Cards de informações principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card do Período */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-3">
              <CalendarRange className="h-5 w-5 text-blue-600" />
              <Label className="text-sm font-semibold text-blue-900 dark:text-blue-100">Período</Label>
            </div>
            <p className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-1">
              {format(parseISO(absence.startDate), "dd/MM/yyyy", { locale: ptBR })} a {format(parseISO(absence.endDate), "dd/MM/yyyy", { locale: ptBR })}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">({days} dias)</p>
          </div>

          {/* Card do Status */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-3">
              {absence.status === 'cancelled' ? (
                <XCircle className="h-5 w-5 text-red-600" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              <Label className="text-sm font-semibold text-green-900 dark:text-green-100">Status</Label>
            </div>
            <Badge 
              variant={absence.status === 'cancelled' ? 'destructive' : 'default'} 
              className="text-sm px-3 py-1 font-medium"
            >
              {absence.status === 'cancelled' ? 'Cancelada' : 'Ativa'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Seção de Motivo */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-2">
          <FileText className="h-5 w-5 text-foreground" />
          <Label className="text-lg font-semibold text-foreground">Motivo da Falta</Label>
        </div>
        
        {isEditing ? (
          <div className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg border-2 border-dashed border-muted-foreground/20">
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Consulta médica, problema familiar, compromisso pessoal, etc."
                className="min-h-[120px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button onClick={handleCancel} variant="outline" size="sm" className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Cancelar
              </Button>
              <Button onClick={handleSave} size="sm" className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4" />
                Salvar Alterações
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 min-h-[120px] p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Motivo registrado:</p>
              <p className="text-sm whitespace-pre-wrap text-slate-900 dark:text-slate-100 leading-relaxed">{absence.reason}</p>
            </div>
          </div>
        )}
      </div>

      {/* Botões de ação */}
      <div className="flex justify-between items-center pt-6 border-t bg-muted/20 -mx-6 px-6 py-4 rounded-b-lg">
        <div className="text-xs text-muted-foreground">
          Última atualização: {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </div>
        <div className="flex gap-3">
          <Button onClick={onClose} variant="outline" className="flex items-center gap-2">
            <X className="h-4 w-4" />
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}

