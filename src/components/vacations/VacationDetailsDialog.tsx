"use client";

import type { Vacation } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plane, Gift, Stethoscope, Baby, CheckCircle, XCircle, Clock, CalendarCheck, CalendarX, Pencil, Save, X } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

interface VacationDetailsDialogProps {
  vacation: Vacation;
  onUpdate: (vacation: Vacation) => void;
  onClose: () => void;
}

const absenceTypeDetails: Record<string, { label: string, icon: React.ReactNode, variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  ferias: { label: 'Férias', icon: <Plane className="h-4 w-4" />, variant: 'default' },
  licenca_premio: { label: 'Licença Prêmio', icon: <Gift className="h-4 w-4" />, variant: 'secondary' },
  licenca_medica: { label: 'Licença Médica', icon: <Stethoscope className="h-4 w-4" />, variant: 'outline' },
  licenca_maternidade: { label: 'Licença Maternidade', icon: <Baby className="h-4 w-4" />, variant: 'outline' },
};

const absenceStatusDetails: Record<string, { label: string, icon: React.ReactNode, className: string }> = {
  planejado: { label: 'Planejado', icon: <Clock className="h-4 w-4" />, className: 'text-blue-600 bg-blue-100 dark:text-blue-200 dark:bg-blue-900/50' },
  confirmado: { label: 'Usufruído', icon: <CalendarCheck className="h-4 w-4" />, className: 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/50' },
  cancelado: { label: 'Não Usufruído', icon: <CalendarX className="h-4 w-4" />, className: 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900/50' },
};

export default function VacationDetailsDialog({ vacation, onUpdate, onClose }: VacationDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(vacation.notes || '');

  const days = differenceInDays(parseISO(vacation.endDate), parseISO(vacation.startDate)) + 1;
  const typeDetails = absenceTypeDetails[vacation.type] || { label: 'Desconhecido', icon: null, variant: 'secondary' };
  const statusDetails = absenceStatusDetails[vacation.status] || { label: 'Desconhecido', icon: null, className: '' };

  const handleSave = () => {
    onUpdate({ ...vacation, notes });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setNotes(vacation.notes || '');
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho com informações básicas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Detalhes do Agendamento</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2"
          >
            <Pencil className="h-4 w-4" />
            {isEditing ? 'Cancelar' : 'Editar'}
          </Button>
        </div>

        {/* Informações do período */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Período</Label>
            <p className="text-lg font-semibold">
              {format(parseISO(vacation.startDate), "dd/MM/yyyy", { locale: ptBR })} a {format(parseISO(vacation.endDate), "dd/MM/yyyy", { locale: ptBR })}
            </p>
            <p className="text-sm text-muted-foreground">({days} dias)</p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Status</Label>
            <div className={cn("flex items-center text-sm p-2 rounded-md font-medium w-fit", statusDetails.className, vacation.status === 'cancelado' && 'line-through')}>
              <span className="flex items-center gap-2">
                {statusDetails.icon} {statusDetails.label}
              </span>
            </div>
          </div>
        </div>

        {/* Tipo de afastamento */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Tipo de Afastamento</Label>
          <Badge variant={typeDetails.variant} className="w-fit capitalize">
            {typeDetails.icon}
            <span className='ml-2'>{typeDetails.label}</span>
          </Badge>
        </div>
      </div>

      {/* Observações */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-muted-foreground">Observações</Label>
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Período aquisitivo 2023/2024, funcionário ganhou um dia de folga, etc."
              className="min-h-[100px]"
            />
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm" className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Salvar
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm" className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="min-h-[100px] p-3 bg-muted/50 rounded-md">
            {vacation.notes ? (
              <p className="text-sm whitespace-pre-wrap">{vacation.notes}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">Nenhuma observação adicionada</p>
            )}
          </div>
        )}
      </div>

      {/* Botões de ação */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button onClick={onClose} variant="outline">
          Fechar
        </Button>
      </div>
    </div>
  );
}
