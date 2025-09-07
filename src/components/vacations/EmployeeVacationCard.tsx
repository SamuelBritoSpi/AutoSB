
"use client";

import type { Employee, Vacation, AbsenceType, AbsenceStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO, isFuture, isPast, isWithinInterval, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User, CalendarRange, Plane, Gift, Stethoscope, Baby, CheckCircle, Clock, History, XCircle, CalendarCheck, CalendarX } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';


interface EmployeeVacationCardProps {
  employee: Employee;
  vacations: Vacation[];
  onOpenHistory: () => void;
}

const absenceTypeDetails: Record<AbsenceType, { label: string, icon: React.ReactNode, variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    ferias: { label: 'Férias', icon: <Plane className="h-3 w-3" />, variant: 'default' },
    licenca_premio: { label: 'Licença Prêmio', icon: <Gift className="h-3 w-3" />, variant: 'secondary' },
    licenca_medica: { label: 'Licença Médica', icon: <Stethoscope className="h-3 w-3" />, variant: 'outline' },
    licenca_maternidade: { label: 'Licença Maternidade', icon: <Baby className="h-3 w-3" />, variant: 'outline' },
};

const absenceStatusDetails: Record<AbsenceStatus, { label: string, icon: React.ReactNode, className: string }> = {
    planejado: { label: 'Planejado', icon: <Clock className="h-4 w-4 text-blue-500" />, className: 'text-blue-600' },
    confirmado: { label: 'Usufruído', icon: <CalendarCheck className="h-4 w-4 text-green-500" />, className: 'text-green-600' },
    cancelado: { label: 'Não Usufruído', icon: <CalendarX className="h-4 w-4 text-red-500" />, className: 'text-red-600' },
};


export default function EmployeeVacationCard({ employee, vacations, onOpenHistory }: EmployeeVacationCardProps) {

  const { nextAbsence, summaryByMonth } = useMemo(() => {
    const summary: Record<string, number> = {};
    const today = startOfDay(new Date());

    vacations.forEach(vacation => {
        if (vacation.status === 'cancelado') return;
        
        const start = parseISO(vacation.startDate);
        const end = parseISO(vacation.endDate);
        
        let current = start;
        while (current <= end) {
            const monthName = format(current, 'MMMM', { locale: ptBR });
            const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
            summary[capitalizedMonth] = (summary[capitalizedMonth] || 0) + 1;
            current = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1);
        }
    });

    const summaryByMonthData = Object.entries(summary).map(([month, days]) => ({ month, days }));
    
    // 1. Filtra apenas os afastamentos que não foram cancelados
    const activeVacations = vacations.filter(v => v.status !== 'cancelado');

    if (activeVacations.length === 0) {
      return { nextAbsence: null, summaryByMonth: summaryByMonthData };
    }
    
    let relevantAbsence: Vacation | null = null;

    // Prioridade 1: Verificar se há um afastamento acontecendo hoje.
    const currentAbsence = activeVacations.find(v => 
        isWithinInterval(today, { start: parseISO(v.startDate), end: parseISO(v.endDate) })
    );

    if (currentAbsence) {
        relevantAbsence = currentAbsence;
    } else {
        // Prioridade 2: Encontrar o afastamento futuro mais próximo.
        const futureAbsences = activeVacations
            .filter(v => isFuture(parseISO(v.startDate)))
            .sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime());
            
        if (futureAbsences.length > 0) {
            relevantAbsence = futureAbsences[0];
        } else {
            // Prioridade 3: Fallback para o afastamento mais recente (passado).
             const pastAbsences = activeVacations
                .filter(v => isPast(parseISO(v.endDate)))
                .sort((a,b) => parseISO(b.endDate).getTime() - parseISO(a.endDate).getTime());
             relevantAbsence = pastAbsences[0] || null;
        }
    }
    
    return { 
        nextAbsence: relevantAbsence,
        summaryByMonth: summaryByMonthData
    };
  }, [vacations]);
  
  const getStatusIcon = (absence: Vacation | null) => {
    if (!absence) return null;
    const details = absenceStatusDetails[absence.status];
    return details ? details.icon : null;
  }
  
  // Lógica defensiva para obter os detalhes do tipo de ausência
  const typeDetails = nextAbsence ? (absenceTypeDetails[nextAbsence.type] || { label: 'Desconhecido', icon: null, variant: 'secondary' }) : null;


  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-xl mb-1 flex items-center">
            <User className="h-5 w-5 mr-2 text-primary" /> {employee.name}
        </CardTitle>
        <CardDescription>
          {summaryByMonth.map(item => (
            <span key={item.month} className="text-sm text-muted-foreground mr-2">
              {item.month}: <span className='font-bold'>{item.days} dia(s)</span>
            </span>
          ))}
          {summaryByMonth.length === 0 && (
             <span className="text-sm text-muted-foreground">Nenhum afastamento agendado.</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <Separator />
        <h4 className="text-sm font-semibold text-primary">Afastamento Relevante</h4>
        {nextAbsence && typeDetails ? (
            <div className='text-sm space-y-2'>
                <div className='flex items-center gap-2'>
                    {getStatusIcon(nextAbsence)}
                    <span className={cn(nextAbsence.status === 'cancelado' && 'line-through')}>
                        {format(parseISO(nextAbsence.startDate), "dd/MM/yy")} a {format(parseISO(nextAbsence.endDate), "dd/MM/yy")}
                    </span>
                </div>
                 <Badge variant={typeDetails.variant} className="capitalize">
                    {typeDetails.icon}
                    <span className='ml-1'>{typeDetails.label}</span>
                </Badge>
            </div>
        ) : (
            <p className="text-sm text-muted-foreground text-center py-2">Nenhum afastamento registrado.</p>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={onOpenHistory} className='w-full'>
            <History className="mr-2 h-4 w-4" /> Ver Histórico de Afastamentos
        </Button>
      </CardFooter>
    </Card>
  );
}
