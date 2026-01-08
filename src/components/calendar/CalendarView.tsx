
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
import { Calendar as CalendarIcon, Briefcase, Plane } from 'lucide-react';
import type { Modifiers } from 'react-day-picker';

type CalendarEventType = 'demand' | 'vacation';

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

  const { eventsByDate, demandDays, vacationDays } = useMemo(() => {
    const eventsMap = new Map<string, CalendarEvent[]>();
    const demandDates: Date[] = [];
    const vacationDates: Date[] = [];

    demands.forEach(demand => {
      const demandDate = parseISO(demand.dueDate);
      if (!isValid(demandDate)) return;

      const dateKey = startOfDay(demandDate).toISOString();
      if (!eventsMap.has(dateKey)) {
        eventsMap.set(dateKey, []);
      }
      eventsMap.get(dateKey)?.push({
        id: demand.id,
        title: demand.title,
        type: 'demand',
        date: demandDate,
      });
      demandDates.push(demandDate);
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
        vacationDates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    return { eventsByDate: eventsMap, demandDays: demandDates, vacationDays: vacationDates };
  }, [demands, vacations]);

  const modifiers: Modifiers = {
    demand: demandDays,
    vacation: vacationDays,
  };

  const modifiersClassNames = {
    demand: 'day-with-demand',
    vacation: 'day-with-vacation',
  };

  const selectedDayEvents = selectedDay ? eventsByDate.get(startOfDay(selectedDay).toISOString()) || [] : [];

  const handleDayClick = (day: Date, modifiers: Modifiers) => {
    if (modifiers.demand || modifiers.vacation) {
      setSelectedDay(day);
    } else {
      setSelectedDay(undefined);
    }
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDay(undefined);
  };
  
  const footer = useMemo(() => {
    if(!selectedDay) return <p className="text-sm text-center text-muted-foreground p-2">Selecione um dia para ver os eventos.</p>;

    return (
      <div className="p-2 space-y-2">
        <h4 className="font-medium text-center">
            Eventos em {format(selectedDay, 'PPP', { locale: ptBR })}
        </h4>
        <div className="grid gap-2">
            {selectedDayEvents.length > 0 ? selectedDayEvents.map(event => (
              <div key={`${event.id}-${event.type}`} className="text-sm">
                <Badge variant={event.type === 'demand' ? 'destructive' : 'default'} className="capitalize w-full justify-start text-left whitespace-normal h-auto">
                    {event.type === 'demand' ? <Briefcase className="h-3 w-3 mr-1 flex-shrink-0" /> : <Plane className="h-3 w-3 mr-1 flex-shrink-0" />}
                    <span>{event.title}</span>
                </Badge>
              </div>
            )) : <p className="text-sm text-muted-foreground text-center">Nenhum evento neste dia.</p>}
        </div>
      </div>
    );
  }, [selectedDay, selectedDayEvents]);

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
              mode="single"
              selected={selectedDay}
              onDayClick={handleDayClick}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              footer={footer}
              className="p-0"
            />
        </CardContent>
      </Card>
      <div className="lg:col-span-1">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Legenda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-destructive mr-2" />
              <span>Prazo de Demanda</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-blue-500 mr-2" />
              <span>Afastamento de Funcionário</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
