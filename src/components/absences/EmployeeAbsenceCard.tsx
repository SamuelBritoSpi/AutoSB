"use client";

import type { Employee, JustifiedAbsence } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO, isFuture, isPast, isWithinInterval, startOfDay, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User, CalendarRange, CheckCircle, Clock, History, XCircle, Eye, AlertCircle } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface EmployeeAbsenceCardProps {
  employee: Employee;
  absences: JustifiedAbsence[];
  onOpenHistory: () => void;
  onViewDetails?: (absence: JustifiedAbsence) => void;
}

export default function EmployeeAbsenceCard({ employee, absences, onOpenHistory, onViewDetails }: EmployeeAbsenceCardProps) {

  const { relevantAbsence, summaryByMonth } = useMemo(() => {
    const summary: Record<string, number> = {};
    const today = startOfDay(new Date());

    absences.forEach(absence => {
        // O cálculo do resumo de dias por mês continua ignorando os cancelados.
        if (absence.status === 'cancelled') return;
        
        const start = parseISO(absence.startDate);
        const end = parseISO(absence.endDate);
        
        let current = start;
        while (current <= end) {
            const monthName = format(current, 'MMMM', { locale: ptBR });
            const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
            summary[capitalizedMonth] = (summary[capitalizedMonth] || 0) + 1;
            current = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1);
        }
    });

    const summaryByMonthData = Object.entries(summary).map(([month, days]) => ({ month, days }));
    
    if (absences.length === 0) {
      return { relevantAbsence: null, summaryByMonth: summaryByMonthData };
    }
    
    let absenceToShow: JustifiedAbsence | null = null;

    // Prioridade 1: Verificar se há uma falta acontecendo hoje (independente do status).
    const currentAbsence = absences.find(a => 
        isWithinInterval(today, { start: parseISO(a.startDate), end: parseISO(a.endDate) })
    );

    if (currentAbsence) {
        absenceToShow = currentAbsence;
    } else {
        // Prioridade 2: Encontrar a falta futura mais próxima (independente do status).
        const futureAbsences = absences
            .filter(a => isFuture(parseISO(a.startDate)))
            .sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime());
            
        if (futureAbsences.length > 0) {
            absenceToShow = futureAbsences[0];
        } else {
            // Prioridade 3: Fallback para a falta mais recente (passado, independente do status).
             const pastAbsences = absences
                .sort((a,b) => parseISO(b.endDate).getTime() - parseISO(a.endDate).getTime());
             absenceToShow = pastAbsences[0] || null;
        }
    }
    
    return { 
        relevantAbsence: absenceToShow,
        summaryByMonth: summaryByMonthData
    };
  }, [absences]);
  
  const getStatusIcon = (absence: JustifiedAbsence | null) => {
    if (!absence) return null;
    if (absence.status === 'cancelled') {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-xl mb-1 flex items-center">
            <User className="h-5 w-5 mr-2 text-primary" /> {employee.name}
        </CardTitle>
        <CardDescription>
          {summaryByMonth.map(item => (
            <span key={item.month} className="text-sm text-muted-foreground mr-2">
              {item.month}: <span className='font-bold'>{item.days} falta{item.days !== 1 ? 's' : ''}</span>
            </span>
          ))}
          {summaryByMonth.length === 0 && (
             <span className="text-sm text-muted-foreground">Nenhuma falta registrada este ano.</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <Separator />
        <h4 className="text-sm font-semibold text-primary">Última Falta Registrada</h4>
        {relevantAbsence ? (
            <div className='text-sm space-y-2'>
                <div className='flex items-center gap-2'>
                    {getStatusIcon(relevantAbsence)}
                    <span className={cn(relevantAbsence.status === 'cancelled' && 'line-through')}>
                        {format(parseISO(relevantAbsence.startDate), "dd/MM/yy")} a {format(parseISO(relevantAbsence.endDate), "dd/MM/yy")}
                    </span>
                    {onViewDetails && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewDetails(relevantAbsence)}
                            className="h-6 w-6 p-0 hover:bg-primary/10"
                            title="Ver detalhes da falta"
                        >
                            <Eye className="h-3 w-3 text-muted-foreground hover:text-primary" />
                        </Button>
                    )}
                </div>
                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                  {relevantAbsence.reason}
                </div>
                <Badge variant={relevantAbsence.status === 'cancelled' ? 'destructive' : 'default'} className="capitalize">
                  {relevantAbsence.status === 'cancelled' ? 'Cancelada' : 'Ativa'}
                </Badge>
            </div>
        ) : (
            <p className="text-sm text-muted-foreground text-center py-2">Nenhuma falta registrada.</p>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={onOpenHistory} className='w-full'>
            <History className="mr-2 h-4 w-4" /> Ver Histórico de Faltas
        </Button>
      </CardFooter>
    </Card>
  );
}
