
"use client";

import React, { useState, useMemo } from 'react';
import { startOfDay, parseISO, format, isValid, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Demand, Vacation } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '../ui/badge';
import { Calendar as CalendarIcon, Briefcase, Plane, AlertTriangle } from 'lucide-react';
import type { DayProps, Modifiers } from 'react-day-picker';
import { cn } from '@/lib/utils';

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
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  const { eventsByDate } = useMemo(() => {
    const eventsMap = new Map<string, CalendarEvent[]>();

    demands.forEach(demand => {
      const demandDate = parseISO(demand.dueDate);
      if (!isValid(demandDate)) return;

      const dateKey = startOfDay(demandDate).toISOString();
      if (!eventsMap.has(dateKey)) {
        eventsMap.set(dateKey, []);
      }
      
      const eventType: CalendarEventType = demand.priority === 'alta' ? 'highPriorityDemand' : 'demand';
      
      eventsMap.get(dateKey)?.push({
        id: demand.id,
        title: demand.title,
        type: eventType,
        date: demandDate,
      });
    });

    vacations.forEach(vacation => {
      if (vacation.status === 'cancelado') return;
      let currentDate = parseISO(vacation.startDate);
      const endDate = parseISO(vacation.endDate);
      
      if (!isValid(currentDate) || !isValid(endDate)) return;

      while (currentDate <= endDate) {
        const dateKey = startOfDay(currentDate).toISOString();
        if (!eventsMap.has(dateKey)) {
          eventsMap.set(dateKey, []);
        }
        if (!eventsMap.get(dateKey)?.some(e => e.id === vacation.id)) {
          eventsMap.get(dateKey)?.push({
            id: vacation.id,
            title: `${vacation.employeeName} - ${vacation.type}`,
            type: 'vacation',
            date: new Date(currentDate),
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    return { eventsByDate: eventsMap };
  }, [demands, vacations]);

  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDay(undefined);
  };
  
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  function Day({ date, displayMonth }: DayProps) {
    if (date.getMonth() !== displayMonth.getMonth()) {
      return <div />;
    }
  
    const dateKey = startOfDay(date).toISOString();
    const dayEvents = eventsByDate.get(dateKey) || [];
    const eventTypes = new Set(dayEvents.map(e => e.type));
  
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        <span className="z-10">{format(date, 'd')}</span>
        {eventTypes.size > 0 && (
          <div className="absolute bottom-1 flex items-center justify-center gap-1">
            {eventTypes.has('highPriorityDemand') && <AlertTriangle className="h-3 w-3 text-destructive" />}
            {eventTypes.has('demand') && <Briefcase className="h-3 w-3 text-orange-500" />}
            {eventTypes.has('vacation') && <Plane className="h-3 w-3 text-blue-500" />}
          </div>
        )}
      </div>
    );
  }

  const PopoverDay = (dayProps: DayProps) => {
    const { date } = dayProps;
    const validDate = date;
    if (!isValid(validDate)) return <div />;

    const dateKey = startOfDay(validDate).toISOString();
    const hasEvents = eventsByDate.has(dateKey);

    return (
      <Popover open={!isMobile && hoveredDate ? isSameDay(hoveredDate, validDate) : undefined}>
        <PopoverTrigger asChild>
          <div
            onMouseEnter={() => !isMobile && hasEvents && setHoveredDate(validDate)}
            onMouseLeave={() => !isMobile && setHoveredDate(null)}
            onClick={() => {
              if (isMobile && hasEvents) {
                setSelectedDay(selectedDay && isSameDay(selectedDay, validDate) ? undefined : validDate);
              } else if (!isMobile) {
                setSelectedDay(validDate);
              }
            }}
            className="h-full w-full flex items-center justify-center relative cursor-pointer"
          >
            <Day {...dayProps} />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2 space-y-2" align="center">
          <h4 className="font-medium text-center text-sm">
            Eventos em {format(validDate, 'PPP', { locale: ptBR })}
          </h4>
          <div className="grid gap-1">
            {(eventsByDate.get(dateKey) || []).map(event => (
              <div key={event.id} className="text-xs">
                {event.type === 'vacation' && <Badge variant="default" className="bg-blue-500 hover:bg-blue-600"><Plane className="h-3 w-3 mr-1" />{event.title}</Badge>}
                {event.type === 'highPriorityDemand' && <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />{event.title}</Badge>}
                {event.type === 'demand' && <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600"><Briefcase className="h-3 w-3 mr-1" />{event.title}</Badge>}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  };
  
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
            <Calendar
              variant="full"
              mode="single"
              selected={selectedDay}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="p-0"
              components={{ Day: PopoverDay }}
            />
        </CardContent>
      </Card>
      <div className="lg:col-span-1">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Legenda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Plane className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <span className="text-sm">Dia de Afastamento</span>
            </div>
            <div className="flex items-center gap-3">
              <Briefcase className="h-4 w-4 text-orange-500 flex-shrink-0" />
              <span className="text-sm">Entrega de Demanda</span>
            </div>
             <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
              <span className="text-sm">Demanda (Alta Prioridade)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
