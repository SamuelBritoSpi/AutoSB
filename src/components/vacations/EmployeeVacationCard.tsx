
"use client";

import type { Employee, Vacation, AbsenceType, AbsenceStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User, CalendarRange, Edit, Trash2, Plane, Gift, Stethoscope, Baby, MoreVertical, CheckCircle, XCircle, Clock, Undo, Pencil, CalendarCheck, CalendarX } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


interface EmployeeVacationCardProps {
  employee: Employee;
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


export default function EmployeeVacationCard({ employee, vacations, onDelete, onUpdate, onEdit }: EmployeeVacationCardProps) {

  const vacationSummaryByMonth = useMemo(() => {
    const summary: Record<string, number> = {};

    vacations.forEach(vacation => {
        // Only count days from confirmed or planned vacations
        if (vacation.status === 'cancelado') return;
        
        const start = parseISO(vacation.startDate);
        const end = parseISO(vacation.endDate);
        
        let current = start;
        // Loop through each day of the vacation period
        while (current <= end) {
            const monthName = format(current, 'MMMM', { locale: ptBR });
            const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
            summary[capitalizedMonth] = (summary[capitalizedMonth] || 0) + 1;
            // Move to the next day
            current = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1);
        }
    });

    return Object.entries(summary).map(([month, days]) => ({ month, days }));
  }, [vacations]);


  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-xl mb-1 flex items-center">
            <User className="h-5 w-5 mr-2 text-primary" /> {employee.name}
        </CardTitle>
        <CardDescription>
          {vacationSummaryByMonth.map(item => (
            <span key={item.month} className="text-sm text-muted-foreground mr-2">
              {item.month}: <span className='font-bold'>{item.days} dia(s)</span>
            </span>
          ))}
          {vacationSummaryByMonth.length === 0 && (
             <span className="text-sm text-muted-foreground">Nenhum afastamento ativo agendado.</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <Separator />
         <div className="space-y-3">
            <h4 className="text-sm font-semibold text-primary">Períodos Agendados</h4>
            {vacations.length > 0 ? vacations.map(vacation => {
                 const days = differenceInDays(parseISO(vacation.endDate), parseISO(vacation.startDate)) + 1;
                 const typeDetails = absenceTypeDetails[vacation.type] || { label: 'Desconhecido', icon: null, variant: 'secondary' };
                 const statusDetails = absenceStatusDetails[vacation.status] || { label: 'Desconhecido', icon: null, className: '' };

                 return (
                    <div key={vacation.id} className={cn("text-sm flex items-center justify-between group", vacation.status === 'cancelado' && 'text-muted-foreground')}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 flex-grow">
                             <div className={cn("flex items-center", statusDetails.className, "p-1 rounded-md")}>
                                <CalendarRange className="h-4 w-4 mr-2" />
                                <span>
                                    {format(parseISO(vacation.startDate), "dd/MM/yy")} - {format(parseISO(vacation.endDate), "dd/MM/yy")}
                                    <span className="font-medium"> ({days} dias)</span>
                                </span>
                             </div>
                             <Badge variant={typeDetails.variant} className="w-fit mt-1 sm:mt-0 capitalize">
                                {typeDetails.icon}
                                <span className='ml-1'>{typeDetails.label}</span>
                             </Badge>
                        </div>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
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
                 <p className="text-sm text-muted-foreground text-center py-2">Nenhum período de afastamento registrado para este funcionário.</p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
