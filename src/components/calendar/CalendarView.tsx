"use client";

import React, { useState, useMemo } from 'react';
import type { DayProps } from 'react-day-picker';
import { startOfDay, isWithinInterval, parseISO, format, isValid, set } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Demand, Vacation } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '../ui/badge';
import { Calendar as CalendarIcon, Briefcase, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const isMobile = useIsMobile();

  const eventsByDate = useMemo(() => {
    const eventsMap = new Map<string, CalendarEvent[]>();

    demands.forEach(demand => {
      const demandDate = parseISO(demand.dueDate);
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
    });

    vacations.forEach(vacation => {
        if(vacation.status === 'cancelado') return;
      let currentDate = parseISO(vacation.startDate);
      const endDate = parseISO(vacation.endDate);
      
      while (currentDate <= endDate) {
        const dateKey = startOfDay(currentDate).toISOString();
        if (!eventsMap.has(dateKey)) {
          eventsMap.set(dateKey, []);
        }
        // Evita duplicados se já houver um evento para este afastamento neste dia
        if (!eventsMap.get(dateKey)?.some(e => e.id === vacation.id)) {
            eventsMap.get(dateKey)?.push({
                id: vacation.id,
                title: `${vacation.employeeName} - ${vacation.type}`,
                type: 'vacation',
                date: currentDate,
            });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    return eventsMap;
  }, [demands, vacations]);

  const hoveredEvents = hoveredDate ? eventsByDate.get(hoveredDate.toISOString()) || [] : [];
  
  const goToToday = () => {
    setCurrentMonth(new Date());
  }

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
        <CardContent className="p-2 sm:p-4">
          <Popover open={!isMobile && hoveredEvents.length > 0}>
            <PopoverTrigger asChild>
              <div>
                <Calendar
                  variant="full"
                  locale={ptBR}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  showOutsideDays={false}
                  components={{
                    Day: ({ date, ...props }: DayProps) => {
                      const validDate = date;
                      if (!isValid(validDate)) return <div />;

                      const dateKey = startOfDay(validDate).toISOString();
                      const hasEvents = eventsByDate.has(dateKey);

                      return (
                        <div
                          onMouseEnter={() => !isMobile && hasEvents && setHoveredDate(startOfDay(validDate))}
                          onMouseLeave={() => !isMobile && setHoveredDate(null)}
                          onClick={() => {
                            if (isMobile && hasEvents) {
                              setHoveredDate(h => (h?.getTime() === startOfDay(validDate).getTime() ? null : startOfDay(validDate)))
                            }
                          }}
                          className="h-full w-full flex items-center justify-center relative"
                        >
                          <span className={cn(props.className, "z-10")}>{format(validDate, 'd')}</span>
                          {hasEvents && (
                            <div className="day-deadline-dots">
                              {eventsByDate.get(dateKey)?.some(e => e.type === 'demand') && <div className="day-deadline-dot bg-destructive" />}
                              {eventsByDate.get(dateKey)?.some(e => e.type === 'vacation') && <div className="day-deadline-dot bg-blue-500" />}
                            </div>
                          )}
                        </div>
                      );
                    },
                  }}
                  {...props}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-80" onMouseLeave={() => setHoveredDate(null)}>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">
                    Eventos em {hoveredDate && format(hoveredDate, 'PPP', { locale: ptBR })}
                  </h4>
                  <div className="grid gap-2">
                    {hoveredEvents.map(event => (
                      <div key={event.id} className="text-sm">
                        <Badge variant={event.type === 'demand' ? 'destructive' : 'default'} className="capitalize">
                            {event.type === 'demand' ? <Briefcase className="h-3 w-3 mr-1" /> : <Plane className="h-3 w-3 mr-1" />}
                            {event.title}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          {isMobile && hoveredEvents.length > 0 && (
             <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium leading-none mb-2">
                    Eventos em {hoveredDate && format(hoveredDate, 'PPP', { locale: ptBR })}
                </h4>
                 <div className="grid gap-2">
                    {hoveredEvents.map(event => (
                      <div key={event.id} className="text-sm">
                        <Badge variant={event.type === 'demand' ? 'destructive' : 'default'} className="capitalize">
                             {event.type === 'demand' ? <Briefcase className="h-3 w-3 mr-1" /> : <Plane className="h-3 w-3 mr-1" />}
                            {event.title}
                        </Badge>
                      </div>
                    ))}
                  </div>
             </div>
          )}
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

    