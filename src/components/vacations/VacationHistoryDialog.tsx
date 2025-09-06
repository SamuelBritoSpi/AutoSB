
"use client";

import type { Vacation, AbsenceType, AbsenceStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plane, Gift, Stethoscope, Baby, MoreVertical, CheckCircle, XCircle, Clock, Undo, Pencil, CalendarCheck, CalendarX, Trash2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from '../ui/scroll-area';


interface VacationHistoryDialogProps {
  vacations: Vacation[];
  onDelete: (id: string) => void;
  onUpdate: (vacation: Vacation) => void;
  onEdit: (vacation: Vacation) => void;
}

const absenceTypeDetails: Record<AbsenceType, { label: string, icon: React.ReactNode, variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    ferias: { label: 'Férias', icon: <Plane className="h-3 w-3" />, variant: 'default' },
    licenca_premio: { label: 'Licença Prêmio', icon: <Gift className="h-3 w-3" />, variant: 'secondary' },
    licenca_medica: { label: 'Licença Médica', icon: <Stethoscope className="h-3 w-3" />, variant: 'outline' },
    licenca_maternidade: { label: 'Licença Maternidade', icon: <Baby className="h-3 w-3" />, variant: 'outline' },
};

const absenceStatusDetails: Record<AbsenceStatus, { label: string, icon: React.ReactNode, className: string }> = {
    planejado: { label: 'Planejado', icon: <Clock className="h-3 w-3" />, className: 'text-blue-600 bg-blue-100 dark:text-blue-200 dark:bg-blue-900/50' },
    confirmado: { label: 'Usufruído', icon: <CalendarCheck className="h-3 w-3" />, className: 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/50' },
    cancelado: { label: 'Não Usufruído', icon: <CalendarX className="h-3 w-3" />, className: 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900/50 line-through' },
};


export default function VacationHistoryDialog({ vacations, onDelete, onUpdate, onEdit }: VacationHistoryDialogProps) {

  const sortedVacations = useMemo(() => {
     return [...vacations].sort((a,b) => parseISO(b.startDate).getTime() - parseISO(a.startDate).getTime());
  }, [vacations]);


  return (
    <ScrollArea className="max-h-[60vh] pr-4">
        <div className="space-y-4">
            {sortedVacations.length > 0 ? sortedVacations.map(vacation => {
                    const days = differenceInDays(parseISO(vacation.endDate), parseISO(vacation.startDate)) + 1;
                    const typeDetails = absenceTypeDetails[vacation.type] || { label: 'Desconhecido', icon: null, variant: 'secondary' };
                    const statusDetails = absenceStatusDetails[vacation.status] || { label: 'Desconhecido', icon: null, className: '' };

                    return (
                        <div key={vacation.id} className={cn("p-3 border rounded-lg flex items-center justify-between group", vacation.status === 'cancelado' && 'bg-muted/50')}>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 flex-grow">
                                <div className={cn("flex items-center text-sm", statusDetails.className, "p-2 rounded-md font-medium")}>
                                    <span className="flex items-center gap-2">
                                        {statusDetails.icon} {statusDetails.label}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-semibold">{format(parseISO(vacation.startDate), "dd/MM/yyyy")} a {format(parseISO(vacation.endDate), "dd/MM/yyyy")} ({days} dias)</p>
                                    <Badge variant={typeDetails.variant} className="w-fit mt-1 capitalize">
                                        {typeDetails.icon}
                                        <span className='ml-1'>{typeDetails.label}</span>
                                    </Badge>
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {vacation.status === 'planejado' && (
                                    <>
                                        <DropdownMenuItem onClick={() => onUpdate({ ...vacation, status: 'confirmado' })}>
                                            <CalendarCheck className="mr-2 h-4 w-4 text-green-500" /> Marcar como Usufruído
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onEdit(vacation)}>
                                            <Pencil className="mr-2 h-4 w-4 text-blue-500" /> Ajustar e Marcar como Usufruído
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onUpdate({ ...vacation, status: 'cancelado' })} className='text-amber-600 focus:text-amber-700'>
                                            <CalendarX className="mr-2 h-4 w-4" /> Marcar como Não Usufruído
                                        </DropdownMenuItem>
                                    </>
                                    )}
                                    {(vacation.status === 'confirmado' || vacation.status === 'cancelado') && (
                                        <DropdownMenuItem onClick={() => onUpdate({ ...vacation, status: 'planejado' })}>
                                            <Undo className="mr-2 h-4 w-4" /> Reverter para Planejado
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => onDelete(vacation.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                        <Trash2 className="mr-2 h-4 w-4" /> Excluir Registro
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )
                }) : (
                    <p className="text-sm text-muted-foreground text-center py-10">Nenhum período de afastamento registrado para este funcionário.</p>
                )}
        </div>
    </ScrollArea>
  );
}
