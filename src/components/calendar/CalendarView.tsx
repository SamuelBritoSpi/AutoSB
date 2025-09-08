
"use client";

import React, { useMemo, useState } from 'react';
import type { Demand, Vacation } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { eachDayOfInterval, isSameDay, parseISO, startOfDay, startOfMonth } from 'date-fns';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, ClipboardCheck, UserCheck, Plane, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';


interface CalendarViewProps {
  demands: Demand[];
  vacations: Vacation[];
}

export default function CalendarView({ demands, vacations }: CalendarViewProps) {
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [month, setMonth] = useState<Date>(startOfMonth(new Date()));


  const eventsByDate = useMemo(() => {
    const events = new Map<string, { demands: Demand[], vacations: Vacation[] }>();
    const finalStatus = 'Finalizado'; 

    demands.forEach(demand => {
      if (demand.status === finalStatus) return;
      const dateKey = startOfDay(parseISO(demand.dueDate)).toISOString();
      if (!events.has(dateKey)) {
        events.set(dateKey, { demands: [], vacations: [] });
      }
      events.get(dateKey)!.demands.push(demand);
    });

    vacations.forEach(vacation => {
      if (vacation.status === 'cancelado') return;
      const interval = eachDayOfInterval({
        start: parseISO(vacation.startDate),
        end: parseISO(vacation.endDate)
      });
      interval.forEach(day => {
        const dateKey = startOfDay(day).toISOString();
        if (!events.has(dateKey)) {
          events.set(dateKey, { demands: [], vacations: [] });
        }
        events.get(dateKey)!.vacations.push(vacation);
      });
    });

    return events;
  }, [demands, vacations]);
  
  const vacationDays = useMemo(() => {
    const dates = new Set<string>();
    vacations.forEach(v => {
        if (v.status === 'cancelado') return;
        const interval = eachDayOfInterval({
          start: parseISO(v.startDate),
          end: parseISO(v.endDate)
        });
        interval.forEach(day => dates.add(startOfDay(day).toISOString()));
    });
    return dates;
  }, [vacations]);


  const DayContent = (props: { date: Date }) => {
    const dateKey = startOfDay(props.date).toISOString();
    const dayEvents = eventsByDate.get(dateKey);
    const hasHighPriorityDemand = dayEvents?.demands.some(d => d.priority === 'alta');

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <span>{props.date.getDate()}</span>
        <div className="absolute bottom-0.5 flex space-x-1">
          {dayEvents && dayEvents.vacations.length > 0 && <Plane className="h-3 w-3 text-blue-500" />}
          {dayEvents && dayEvents.demands.length > 0 && (
             hasHighPriorityDemand 
                ? <AlertTriangle className="h-3 w-3 text-destructive" />
                : <ClipboardCheck className="h-3 w-3 text-amber-600" />
          )}
        </div>
      </div>
    );
  };
  

  return (
    <Card>
        <CardHeader>
             <div className="flex flex-col sm:flex-row justify-between items-center">
                <CardTitle className="flex items-center mb-4 sm:mb-0">
                    <CalendarIcon className="mr-2 h-6 w-6"/> Visão Geral do Calendário
                </CardTitle>
                <Button variant="outline" onClick={() => setMonth(startOfMonth(new Date()))}>
                  Hoje
                </Button>
            </div>
        </CardHeader>
        <CardContent className="flex flex-col lg:flex-row gap-6">
            <div className="flex-grow">
                <Popover open={!!hoveredDate} onOpenChange={() => setHoveredDate(null)}>
                    <PopoverTrigger asChild>
                        <div id="calendar-anchor" className="relative" />
                    </PopoverTrigger>
                    <Calendar
                        month={month}
                        onMonthChange={setMonth}
                        showOutsideDays={false}
                        className="p-0"
                        classNames={{
                            months: "w-full",
                            month: "w-full space-y-4 border rounded-lg p-4 shadow-sm",
                            caption_label: "text-lg font-bold",
                            table: "w-full border-collapse",
                            head_row: "flex justify-around mb-2",
                            head_cell: "text-muted-foreground rounded-md w-full font-normal text-sm",
                            row: "flex w-full mt-2 justify-around",
                            cell: "h-12 w-12 text-center text-sm p-0 relative first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                            day: "h-12 w-12 p-0 font-normal aria-selected:opacity-100",
                            day_today: "bg-accent text-accent-foreground rounded-full",
                            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full",
                            day_outside: "day-outside text-muted-foreground opacity-90",
                            day_disabled: "text-muted-foreground opacity-50",
                            day_hidden: "invisible",
                        }}
                         modifiers={{ 
                            vacation: (date) => vacationDays.has(startOfDay(date).toISOString()),
                         }}
                         modifiersClassNames={{
                            vacation: 'bg-accent',
                         }}
                        components={{
                            Day: ({ date }) => {
                                const dateKey = startOfDay(date).toISOString();
                                const hasEvents = eventsByDate.has(dateKey);

                                return (
                                <div
                                    onMouseEnter={() => hasEvents && setHoveredDate(date)}
                                    onMouseLeave={() => setHoveredDate(null)}
                                    className={cn("h-full w-full flex items-center justify-center relative", {
                                        "cursor-pointer": hasEvents,
                                    })}
                                >
                                    <DayContent date={date} />
                                </div>
                                );
                            },
                        }}
                    />
                     <PopoverContent 
                        side="top" 
                        align="center"
                        className="w-80 z-20"
                        onOpenAutoFocus={(e) => e.preventDefault()}
                        onMouseEnter={() => setHoveredDate(hoveredDate)}
                        onMouseLeave={() => setHoveredDate(null)}
                     >
                        {hoveredDate && eventsByDate.get(startOfDay(hoveredDate).toISOString()) && (
                        <div className="grid gap-2">
                            <h4 className="font-medium leading-none">{hoveredDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</h4>
                            <div className="grid gap-2 mt-2">
                               {eventsByDate.get(startOfDay(hoveredDate).toISOString())!.vacations.map(v => (
                                   <div key={v.id} className="flex items-start gap-2">
                                       <Plane className="h-4 w-4 mt-0.5 text-blue-500" />
                                       <div>
                                            <p className="text-sm font-medium">{v.type === 'ferias' ? 'Férias' : 'Licença'}</p>
                                            <p className="text-sm text-muted-foreground">{v.employeeName}</p>
                                       </div>
                                   </div>
                               ))}
                               {eventsByDate.get(startOfDay(hoveredDate).toISOString())!.demands.map(d => (
                                   <div key={d.id} className="flex items-start gap-2">
                                       <ClipboardCheck className="h-4 w-4 mt-0.5 text-amber-600" />
                                       <div>
                                            <p className="text-sm font-medium">Entrega de Demanda</p>
                                            <p className="text-sm text-muted-foreground">{d.title}</p>
                                            <Badge variant={d.priority === 'alta' ? 'destructive' : d.priority === 'media' ? 'secondary' : 'outline'} className="mt-1">
                                                Prioridade {d.priority}
                                            </Badge>
                                       </div>
                                   </div>
                               ))}
                            </div>
                        </div>
                        )}
                    </PopoverContent>
                </Popover>

            </div>
            <div className="lg:w-1/4 space-y-4">
                <h3 className="font-semibold text-lg text-primary">Legenda</h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-md bg-accent flex items-center justify-center">
                           <Plane className="h-3 w-3 text-blue-500" />
                        </div>
                        <span className="text-sm">Dia de Afastamento</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center">
                           <ClipboardCheck className="h-3 w-3 text-amber-600" />
                        </div>
                        <span className="text-sm">Entrega de Demanda</span>
                    </div>
                     <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center">
                           <AlertTriangle className="h-3 w-3 text-destructive" />
                        </div>
                        <span className="text-sm">Demanda (Prioridade Alta)</span>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
  );
}
