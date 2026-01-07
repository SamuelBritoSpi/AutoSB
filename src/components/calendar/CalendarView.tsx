
"use client";

import React, { useMemo, useState, useEffect } from 'react';
import type { Demand, Vacation } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { eachDayOfInterval, isSameDay, parseISO, startOfDay, startOfMonth } from 'date-fns';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, ClipboardCheck, UserCheck, Plane, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';
import type { DayProps } from 'react-day-picker';

interface CalendarViewProps {
  demands: Demand[];
  vacations: Vacation[];
}

export default function CalendarView({ demands, vacations }: CalendarViewProps) {
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [clickedDate, setClickedDate] = useState<Date | null>(null);
  const [month, setMonth] = useState<Date>(startOfMonth(new Date()));
  const isMobile = useIsMobile();


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
    const validDate = props.date instanceof Date && !isNaN(props.date.getTime()) ? props.date : new Date();
    const dateKey = startOfDay(validDate).toISOString();
    const dayEvents = eventsByDate.get(dateKey);
    const hasHighPriorityDemand = dayEvents?.demands?.some(d => d.priority === 'alta');

    return (
      <div className="relative w-full h-full flex flex-col justify-between pt-1">
        <span className="text-sm font-medium md:text-base">{validDate.getDate()}</span>
        <div className="flex justify-center w-full space-x-1">
          {dayEvents && dayEvents.vacations.length > 0 && <Plane className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-500" />}
          {dayEvents && dayEvents.demands.length > 0 && (
             hasHighPriorityDemand 
                ? <AlertTriangle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-destructive" />
                : <ClipboardCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-amber-600" />
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
            <div className="flex-grow flex justify-center">
                <div className="inline-block">
                    <Popover open={!!(isMobile ? clickedDate : hoveredDate)} onOpenChange={() => {
                        setHoveredDate(null);
                        setClickedDate(null);
                    }}>
                        <PopoverTrigger asChild>
                            <div id="calendar-anchor" className="relative" />
                        </PopoverTrigger>
                        <Calendar
                        variant="full"
                        locale={ptBR}
                        month={month}
                        onMonthChange={setMonth}
                        showOutsideDays={false}
                         modifiers={{ 
                           vacation: (date) => {
                            const valid = date instanceof Date && !isNaN(date.getTime());
                            return valid && vacationDays.has(startOfDay(date).toISOString());
                           },
                         }}
                         modifiersClassNames={{
                            vacation: 'bg-accent',
                         }}
                        formatters={{
                            formatWeekdayName: (day) => format(day, 'EEEEEE', { locale: ptBR }),
                        }}
                        components={{
                            Day: ({ date, ...props }: DayProps) => {
                              const validDate = date instanceof Date && !isNaN(date.getTime()) ? date : new Date();
                              const dateKey = startOfDay(validDate).toISOString();
                              const hasEvents = eventsByDate.has(dateKey);

                              return (
                              <button
                                type="button"
                                onMouseEnter={() => !isMobile && hasEvents && setHoveredDate(validDate)}
                                onMouseLeave={() => !isMobile && setHoveredDate(null)}
                                onClick={() => {
                                  if (isMobile && hasEvents) {
                                    if (clickedDate && isSameDay(clickedDate, validDate)) {
                                      setClickedDate(null);
                                    } else {
                                      setClickedDate(validDate);
                                    }
                                  }
                                }}
                                className={cn("h-full w-full flex items-center justify-center relative p-0 border-0 bg-transparent", {
                                  "cursor-pointer": hasEvents,
                                })}
                              >
                                <DayContent date={validDate} />
                              </button>
                              );
                            },
                        }}
                    />
                     <PopoverContent 
                        side={isMobile ? "top" : "right"} 
                        align={isMobile ? "center" : "start"}
                        sideOffset={isMobile ? 5 : 10}
                        alignOffset={isMobile ? 0 : -10}
                        className={cn("z-20", isMobile ? "w-72 mx-4" : "w-80")}
                        onOpenAutoFocus={(e) => e.preventDefault()}
                        onMouseEnter={() => !isMobile && setHoveredDate(hoveredDate)}
                        onMouseLeave={() => !isMobile && setHoveredDate(null)}
                        avoidCollisions={isMobile}
                     >
                        {(() => {
                          const currentDate = isMobile ? clickedDate : hoveredDate;
                          if (!currentDate || !(currentDate instanceof Date && !isNaN(currentDate.getTime()))) {
                            return null;
                          }
                          const dateKey = startOfDay(currentDate).toISOString();
                          if (!eventsByDate.get(dateKey)) {
                            return null;
                          }
                            
                          const dayEvents = eventsByDate.get(dateKey)!;
                            
                            return (
                                <div className="grid gap-2">
                                    <h4 className="font-medium leading-none">{currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</h4>
                                    <div className="grid gap-2 mt-2">
                                       {dayEvents.vacations.map(v => (
                                           <div key={v.id} className="flex items-start gap-2">
                                               <Plane className="h-4 w-4 mt-0.5 text-blue-500" />
                                               <div>
                                                    <p className="text-sm font-medium">{v.type === 'ferias' ? 'Férias' : 'Licença'}</p>
                                                    <p className="text-sm text-muted-foreground">{v.employeeName}</p>
                                               </div>
                                           </div>
                                       ))}
                                       {dayEvents.demands.map(d => (
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
                            );
                        })()}
                    </PopoverContent>
                </Popover>
                </div>
            </div>
            <div className="w-full lg:w-1/4 lg:border-l lg:pl-6">
                <h3 className="font-semibold text-lg text-primary mb-3">Legenda</h3>
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-md bg-accent flex items-center justify-center">
                           <Plane className="h-3 w-3 text-blue-500" />
                        </div>
                        <span className="text-sm">Dia de Afastamento</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-md border flex items-center justify-center">
                           <ClipboardCheck className="h-3 w-3 text-amber-600" />
                        </div>
                        <span className="text-sm">Entrega de Demanda</span>
                    </div>
                     <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-md border flex items-center justify-center">
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
