
"use client";

import type { Employee, Vacation } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO, differenceInDays, getMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User, CalendarRange, Edit, Trash2 } from 'lucide-react';
import { Separator } from '../ui/separator';
import { useMemo } from 'react';

interface EmployeeVacationCardProps {
  employee: Employee;
  vacations: Vacation[];
  onDelete: (id: string) => void;
  onEdit: (vacation: Vacation) => void;
}

export default function EmployeeVacationCard({ employee, vacations, onDelete, onEdit }: EmployeeVacationCardProps) {

  const vacationSummaryByMonth = useMemo(() => {
    const summary: Record<string, number> = {};

    vacations.forEach(vacation => {
      const start = parseISO(vacation.startDate);
      const end = parseISO(vacation.endDate);
      
      let current = start;
      while (current <= end) {
        const monthName = format(current, 'MMMM', { locale: ptBR });
        const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
        summary[capitalizedMonth] = (summary[capitalizedMonth] || 0) + 1;
        current = new Date(current.setDate(current.getDate() + 1));
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
             <span className="text-sm text-muted-foreground">Nenhuma férias agendada.</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <Separator />
         <div className="space-y-2">
            <h4 className="text-sm font-semibold text-primary">Períodos Agendados</h4>
            {vacations.map(vacation => {
                 const days = differenceInDays(parseISO(vacation.endDate), parseISO(vacation.startDate)) + 1;
                 return (
                    <div key={vacation.id} className="text-sm flex items-center justify-between group">
                        <div className="flex items-center">
                            <CalendarRange className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>
                                {format(parseISO(vacation.startDate), "dd/MM/yy", { locale: ptBR })} - {format(parseISO(vacation.endDate), "dd/MM/yy", { locale: ptBR })}
                                <span className="text-muted-foreground"> ({days} dias)</span>
                            </span>
                        </div>
                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(vacation)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                             <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(vacation.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    </div>
                )
            })}
        </div>
      </CardContent>
    </Card>
  );
}
