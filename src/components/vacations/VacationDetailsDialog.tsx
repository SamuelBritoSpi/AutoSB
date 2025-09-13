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
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="text-2xl font-bold text-foreground">Detalhes do Agendamento</h3>
            <p className="text-sm text-muted-foreground mt-1">Informações completas do período de afastamento</p>
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
              <CalendarCheck className="h-5 w-5 text-blue-600" />
              <Label className="text-sm font-semibold text-blue-900 dark:text-blue-100">Período</Label>
            </div>
            <p className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-1">
              {format(parseISO(vacation.startDate), "dd/MM/yyyy", { locale: ptBR })} a {format(parseISO(vacation.endDate), "dd/MM/yyyy", { locale: ptBR })}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">({days} dias úteis)</p>
          </div>

          {/* Card do Status */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <Label className="text-sm font-semibold text-green-900 dark:text-green-100">Status</Label>
            </div>
            <div className={cn("flex items-center text-sm p-2 rounded-md font-medium w-fit", statusDetails.className, vacation.status === 'cancelado' && 'line-through')}>
              <span className="flex items-center gap-2">
                {statusDetails.icon} {statusDetails.label}
              </span>
            </div>
          </div>
        </div>

        {/* Card do Tipo de Afastamento */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-3">
            <Plane className="h-5 w-5 text-purple-600" />
            <Label className="text-sm font-semibold text-purple-900 dark:text-purple-100">Tipo de Afastamento</Label>
          </div>
          <Badge variant={typeDetails.variant} className="w-fit capitalize text-sm px-3 py-1">
            {typeDetails.icon}
            <span className='ml-2 font-medium'>{typeDetails.label}</span>
          </Badge>
        </div>
      </div>

      {/* Seção de Observações */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-2">
          <Pencil className="h-5 w-5 text-foreground" />
          <Label className="text-lg font-semibold text-foreground">Observações</Label>
        </div>
        
        {isEditing ? (
          <div className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg border-2 border-dashed border-muted-foreground/20">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Período aquisitivo 2023/2024, funcionário ganhou um dia de folga, etc."
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
            {vacation.notes ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Observações adicionadas:</p>
                <p className="text-sm whitespace-pre-wrap text-slate-900 dark:text-slate-100 leading-relaxed">{vacation.notes}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Pencil className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground italic">Nenhuma observação adicionada</p>
                <p className="text-xs text-muted-foreground mt-1">Clique em "Editar" para adicionar observações</p>
              </div>
            )}
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
