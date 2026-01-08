
"use client";

import React, { useState, useMemo } from 'react';
import { startOfDay, parseISO, isSameDay } from 'date-fns';
import type { Demand, Vacation } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Plane, AlertTriangle, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarViewProps {
  demands: Demand[];
  vacations: Vacation[];
}

export default function CalendarView({ demands, vacations }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const modifiers = useMemo(() => {
    const demandDays: Date[] = [];
    const highPriorityDemandDays: Date[] = [];
    const vacationDays: Date[] = [];

    demands.forEach(demand => {
      const demandDate = startOfDay(parseISO(demand.dueDate));
      if (demand.priority === 'alta') {
        highPriorityDemandDays.push(demandDate);
      } else {
        demandDays.push(demandDate);
      }
    });

    vacations.forEach(vacation => {
      if (vacation.status === 'cancelado') return;
      let currentDate = parseISO(vacation.startDate);
      const endDate = parseISO(vacation.endDate);

      while (currentDate <= endDate) {
        const day = startOfDay(currentDate);
        if (!vacationDays.some(d => isSameDay(d, day))) {
            vacationDays.push(day);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    
    return {
        demand: demandDays,
        highPriorityDemand: highPriorityDemandDays,
        vacation: vacationDays,
    };
  }, [demands, vacations]);

  const goToToday = () => {
    setCurrentMonth(new Date());
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
      <Card className="lg:col-span-3 shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
          <div className="space-y-1 flex-1">
            <CardTitle className="font-headline text-xl sm:text-2xl text-primary flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6"/>
              Visão Geral do Calendário
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Prazos de demandas e afastamentos de funcionários.
            </CardDescription>
          </div>
          <Button onClick={goToToday} variant="outline" className="text-sm sm:text-base">Hoje</Button>
        </CardHeader>
        <CardContent className="p-2 sm:p-4 flex justify-center overflow-x-auto">
            <div className="w-full">
              <Calendar
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  className="p-0"
                  modifiers={modifiers}
                  modifiersClassNames={{
                      demand: 'day-with-demand',
                      highPriorityDemand: 'day-with-high-priority-demand',
                      vacation: 'day-with-vacation'
                  }}
              />
            </div>
        </CardContent>
      </Card>
      <div className="lg:col-span-1">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Legenda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 rounded-full flex-shrink-0 flex items-center justify-center">
                <Plane className="h-4 w-4 text-blue-500" />
              </div>
              <span className="text-sm">Dia de Afastamento</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 rounded-full flex-shrink-0 flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-orange-500" />
              </div>
              <span className="text-sm">Entrega de Demanda</span>
            </div>
             <div className="flex items-center gap-3">
              <div className="h-4 w-4 rounded-full flex-shrink-0 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
              <span className="text-sm">Demanda (Alta Prioridade)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
