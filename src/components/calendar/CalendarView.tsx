
"use client";

import React, { useState, useMemo } from 'react';
import { startOfDay, parseISO, format, isValid, isSameDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Demand, Vacation } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '../ui/badge';
import { Calendar as CalendarIcon, Briefcase, Plane, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DayPicker } from 'react-day-picker';

type CalendarEventType = 'demand' | 'vacation' | 'highPriorityDemand';

interface CalendarEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  date: Date;
}

interface CalendarViewProps {
  demands: Demand[];
  vacations: Vacation[];
}

export default function CalendarView({ demands, vacations }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [popoverDate, setPopoverDate] = useState<Date | null>(null);

  const { eventsByDate, modifiers } = useMemo(() => {
    const eventsMap = new Map<string, CalendarEvent[]>();
    const demandDays: Date[] = [];
    const highPriorityDemandDays: Date[] = [];
    const vacationDays: Date[] = [];

    demands.forEach(demand => {
      const demandDate = startOfDay(parseISO(demand.dueDate));
      if (!isValid(demandDate)) return;

      const dateKey = demandDate.toISOString();
      if (!eventsMap.has(dateKey)) eventsMap.set(dateKey, []);
      
      const eventType: CalendarEventType = demand.priority === 'alta' ? 'highPriorityDemand' : 'demand';
      eventsMap.get(dateKey)?.push({
        id: demand.id,
        title: demand.title,
        type: eventType,
        date: demandDate,
      });

      if (eventType === 'highPriorityDemand') {
        highPriorityDemandDays.push(demandDate);
      } else {
        demandDays.push(demandDate);
      }
    });

    vacations.forEach(vacation => {
      if (vacation.status === 'cancelado') return;
      let currentDate = parseISO(vacation.startDate);
      const endDate = parseISO(vacation.endDate);
      
      if (!isValid(currentDate) || !isValid(endDate)) return;

      while (currentDate <= endDate) {
        const day = startOfDay(currentDate);
        const dateKey = day.toISOString();
        if (!eventsMap.has(dateKey)) eventsMap.set(dateKey, []);
        
        if (!eventsMap.get(dateKey)?.some(e => e.id === vacation.id)) {
          eventsMap.get(dateKey)?.push({
            id: vacation.id,
            title: `${vacation.employeeName} - ${vacation.type}`,
            type: 'vacation',
            date: new Date(day),
          });
        }
        
        if (!vacationDays.some(d => isSameDay(d, day))) {
            vacationDays.push(day);
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    
    const allModifiers = {
        demand: demandDays,
        highPriorityDemand: highPriorityDemandDays,
        vacation: vacationDays,
    };

    return { eventsByDate: eventsMap, modifiers: allModifiers };
  }, [demands, vacations]);

  const goToToday = () => {
    setCurrentMonth(new Date());
    setPopoverDate(null);
  };
  
  const handleDayInteraction = (day: Date, modifiers: any) => {
    const dayKey = startOfDay(day).toISOString();
    if (eventsByDate.has(dayKey)) {
        setPopoverDate(day);
    } else {
        setPopoverDate(null);
    }
  };

  const dayEvents = popoverDate ? eventsByDate.get(startOfDay(popoverDate).toISOString()) || [] : [];
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <Card className="lg:col-span-3 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
              <CalendarIcon/>
              Visão Geral do Calendário
            </CardTitle>
            <CardDescription>
              Prazos de demandas e afastamentos de funcionários.
            </CardDescription>
          </div>
          <Button onClick={goToToday} variant="outline">Hoje</Button>
        </CardHeader>
        <CardContent className="p-0 sm:p-0 flex justify-center">
             <Popover open={!!popoverDate} onOpenChange={(isOpen) => !isOpen && setPopoverDate(null)}>
                <PopoverTrigger asChild>
                    <div />
                </PopoverTrigger>
                <Calendar
                    variant="full"
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    onDayClick={handleDayInteraction}
                    onDayMouseEnter={handleDayInteraction}
                    className="p-0"
                    modifiers={modifiers}
                    modifiersClassNames={{
                        demand: 'day-with-demand',
                        highPriorityDemand: 'day-with-high-priority-demand',
                        vacation: 'day-with-vacation'
                    }}
                />
                <PopoverContent className="w-auto p-2 space-y-2 z-10" align="start">
                  <h4 className="font-medium text-center text-sm">
                    Eventos em {popoverDate ? format(popoverDate, 'PPP', { locale: ptBR }) : ''}
                  </h4>
                  <div className="grid gap-1">
                    {dayEvents.map(event => (
                      <div key={event.id} className="text-xs">
                        {event.type === 'vacation' && <Badge variant="default" className="bg-blue-500 hover:bg-blue-600"><Plane className="h-3 w-3 mr-1" />{event.title}</Badge>}
                        {event.type === 'highPriorityDemand' && <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />{event.title}</Badge>}
                        {event.type === 'demand' && <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600"><Briefcase className="h-3 w-3 mr-1" />{event.title}</Badge>}
                      </div>
                    ))}
                  </div>
                </PopoverContent>
             </Popover>
        </CardContent>
      </Card>
      <div className="lg:col-span-1">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Legenda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
              <span className="text-sm">Dia de Afastamento</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-orange-500 flex-shrink-0" />
              <span className="text-sm">Entrega de Demanda</span>
            </div>
             <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-destructive flex-shrink-0" />
              <span className="text-sm">Demanda (Alta Prioridade)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
