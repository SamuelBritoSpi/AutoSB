
"use client";

import React, { useMemo, useState } from 'react';
import type { Demand, Vacation } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { addDays, eachDayOfInterval, isSameDay, parseISO, startOfDay } from 'date-fns';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, ClipboardCheck, UserCheck } from 'lucide-react';


interface CalendarViewProps {
  demands: Demand[];
  vacations: Vacation[];
}

const priorityColors: Record<Demand['priority'], string> = {
  alta: 'bg-destructive', // red
  media: 'bg-[hsl(var(--status-warning))]', // yellow
  baixa: 'bg-[hsl(var(--status-success))]', // green
};

export default function CalendarView({ demands, vacations }: CalendarViewProps) {
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  const eventsByDate = useMemo(() => {
    const events = new Map<string, { demands: Demand[], vacations: Vacation[] }>();

    demands.forEach(demand => {
      if (demand.status === 'finalizado') return;
      const dateKey = startOfDay(parseISO(demand.dueDate)).toISOString();
      if (!events.has(dateKey)) {
        events.set(dateKey, { demands: [], vacations: [] });
      }
      events.get(dateKey)!.demands.push(demand);
    });

    vacations.forEach(vacation => {
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
    const dates: Date[] = [];
    vacations.forEach(v => {
        const interval = eachDayOfInterval({
          start: parseISO(v.startDate),
          end: parseISO(v.endDate)
        });
        dates.push(...interval);
    });
    return dates;
  }, [vacations]);


  const DayContent = (props: { date: Date, displayMonth: Date }) => {
    const dateKey = startOfDay(props.date).toISOString();
    const dayEvents = eventsByDate.get(dateKey);

    return (
      <div className="relative w-full h-full">
        <span>{props.date.getDate()}</span>
        {dayEvents && dayEvents.demands.length > 0 && (
          <div className="day-deadline-dots">
            {dayEvents.demands.slice(0, 3).map(d => (
              <div key={d.id} className={cn("day-deadline-dot", priorityColors[d.priority])} />
            ))}
          </div>
        )}
      </div>
    );
  };
  

  return (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center">
                <CalendarIcon className="mr-2 h-6 w-6"/> Visão Geral do Calendário
            </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col lg:flex-row gap-6">
            <div className="flex-grow">
                <Popover open={!!hoveredDate} onOpenChange={() => setHoveredDate(null)}>
                    <PopoverTrigger asChild>
                        <div id="calendar-anchor" className="relative" />
                    </PopoverTrigger>
                    <Calendar
                        mode="single"
                        className="p-0"
                        classNames={{
                            months: "w-full",
                            month: "w-full space-y-4 border rounded-lg p-4 shadow-sm",
                            caption_label: "text-lg font-bold",
                            table: "w-full border-collapse",
                            head_row: "flex justify-around mb-2",
                            head_cell: "text-muted-foreground rounded-md w-full font-normal text-sm",
                            row: "flex w-full mt-2 justify-around",
                            cell: "h-16 w-full text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                            day: "h-full w-full p-1 aria-selected:opacity-100",
                        }}
                        modifiers={{ vacation: vacationDays }}
                        modifiersClassNames={{ vacation: 'day-vacation' }}
                        components={{
                            DayContent: (dayProps) => {
                                const dateKey = startOfDay(dayProps.date).toISOString();
                                const isVacation = vacationDays.some(d => isSameDay(d, dayProps.date));
                                const hasEvents = eventsByDate.has(dateKey);

                                return (
                                <div
                                    onMouseEnter={() => hasEvents && setHoveredDate(dayProps.date)}
                                    onMouseLeave={() => setHoveredDate(null)}
                                    className={cn("h-full w-full rounded-md flex items-center justify-center flex-col", {
                                        "cursor-pointer": hasEvents,
                                        "bg-accent/50 dark:bg-accent/30": isVacation && hasEvents
                                    })}
                                >
                                    <DayContent {...dayProps} />
                                </div>
                                );
                            },
                        }}
                    />
                     <PopoverContent 
                        side="top" 
                        align="center"
                        className="w-80 z-20"
                        style={{
                            position: 'absolute',
                            // Basic positioning logic, might need refinement
                            top: `${(hoveredDate?.getDay() ?? 0) * 10}px`, 
                            left: '50%',
                        }}
                        onOpenAutoFocus={(e) => e.preventDefault()} // prevent focus stealing
                        onMouseEnter={() => setHoveredDate(hoveredDate)}
                        onMouseLeave={() => setHoveredDate(null)}
                     >
                        {hoveredDate && eventsByDate.get(startOfDay(hoveredDate).toISOString()) && (
                        <div className="grid gap-2">
                            <h4 className="font-medium leading-none">{hoveredDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</h4>
                            <div className="grid gap-2 mt-2">
                               {eventsByDate.get(startOfDay(hoveredDate).toISOString())!.vacations.map(v => (
                                   <div key={v.id} className="flex items-start gap-2">
                                       <UserCheck className="h-4 w-4 mt-0.5 text-blue-500" />
                                       <div>
                                            <p className="text-sm font-medium">Férias</p>
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
                    <div className="flex items-center">
                        <div className="w-5 h-5 rounded-md bg-blue-500/80 mr-3" />
                        <span className="text-sm">Dia de Férias</span>
                    </div>
                    <div className="flex items-center">
                        <div className="day-deadline-dot bg-destructive mr-3" />
                        <span className="text-sm">Demanda (Prioridade Alta)</span>
                    </div>
                     <div className="flex items-center">
                        <div className="day-deadline-dot bg-[hsl(var(--status-warning))] mr-3" />
                        <span className="text-sm">Demanda (Prioridade Média)</span>
                    </div>
                     <div className="flex items-center">
                        <div className="day-deadline-dot bg-[hsl(var(--status-success))] mr-3" />
                        <span className="text-sm">Demanda (Prioridade Baixa)</span>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
  );
}
