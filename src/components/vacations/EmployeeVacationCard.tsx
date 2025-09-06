
"use client";

import type { Employee, Vacation, AbsenceType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User, CalendarRange, Plane, Gift, Stethoscope, Baby, CheckCircle, Clock, History } from 'lucide-react';
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


export default function EmployeeVacationCard({ employee, vacations, onOpenHistory }: EmployeeVacationCardProps) {

  const { nextAbsence, summaryByMonth } = useMemo(() => {
    const summary: Record<string, number> = {};
    let nextAbsence: Vacation | null = null;
    
    // Sort vacations: planned future ones first, then others by date
    const sortedVacations = [...vacations].sort((a,b) => {
        const aIsFuturePlanned = a.status === 'planejado' && isFuture(parseISO(a.startDate));
        const bIsFuturePlanned = b.status === 'planejado' && isFuture(parseISO(b.startDate));
        if (aIsFuturePlanned && !bIsFuturePlanned) return -1;
        if (!aIsFuturePlanned && bIsFuturePlanned) return 1;
        return parseISO(b.startDate).getTime() - parseISO(a.startDate).getTime();
    });
    
    nextAbsence = sortedVacations[0] || null;

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

    return { 
        nextAbsence, 
        summaryByMonth: Object.entries(summary).map(([month, days]) => ({ month, days }))
    };
  }, [vacations]);


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
        <h4 className="text-sm font-semibold text-primary">Próximo Afastamento</h4>
        {nextAbsence ? (
            <div className='text-sm space-y-2'>
                <div className='flex items-center gap-2'>
                    {nextAbsence.status === 'planejado' ? <Clock className="h-4 w-4 text-blue-500" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
                    <span>
                        {format(parseISO(nextAbsence.startDate), "dd/MM/yy")} a {format(parseISO(nextAbsence.endDate), "dd/MM/yy")}
                    </span>
                </div>
                 <Badge variant={absenceTypeDetails[nextAbsence.type].variant} className="capitalize">
                    {absenceTypeDetails[nextAbsence.type].icon}
                    <span className='ml-1'>{absenceTypeDetails[nextAbsence.type].label}</span>
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

