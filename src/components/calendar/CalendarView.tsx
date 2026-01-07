
"use client";

import React, { useMemo, useState } from 'react';
import type { Demand, Vacation } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { eachDayOfInterval, isSameDay, parseISO, startOfDay, startOfMonth, isValid, format } from 'date-fns';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, ClipboardCheck, Plane, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
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
      if (demand.status === finalStatus || !demand.dueDate) return;
      
      const parsedDate = parseISO(demand.dueDate);
      if (!isValid(parsedDate)) return;

      const dateKey = startOfDay(parsedDate).toISOString();
      if (!events.has(dateKey)) {
        events.set(dateKey, { demands: [], vacations: [] });
      }
      events.get(dateKey)!.demands.push(demand);
    });

    vacations.forEach(vacation => {
      if (vacation.status === 'cancelado') return;
      const start = parseISO(vacation.startDate);
      const end = parseISO(vacation.endDate);
      
      if (!isValid(start) || !isValid(end)) return;
      
      try {
        const interval = eachDayOfInterval({ start, end });
        interval.forEach(day => {
          const dateKey = startOfDay(day).toISOString();
          if (!events.has(dateKey)) {
            events.set(dateKey, { demands: [], vacations: [] });
          }
          events.get(dateKey)!.vacations.push(vacation);
        });
      } catch (e) {
        console.error("Error creating date interval for vacation:", e);
      }
    });

    return events;
  }, [demands, vacations]);

  const DayContent = ({ date }: { date: Date }) => {
    const dateKey = startOfDay(date).toISOString();
    const dayEvents = eventsByDate.get(dateKey);
    const hasHighPriorityDemand = dayEvents?.demands?.some(d => d.priority === 'alta');

    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center p-1">
        <span className="text-sm">{format(date, 'd')}</span>
        <div className="day-deadline-dots">
          {dayEvents?.vacations.length > 0 && <div className="day-deadline-dot bg-blue-500" />}
          {dayEvents?.demands.length > 0 && (
            <div className={cn("day-deadline-dot", hasHighPriorityDemand ? "bg-destructive" : "bg-amber-500")} />
          )}
        </div>
      </div>
    );
  };
  
  const CustomDay = (props: DayProps) => {
    const { date } = props;
    const validDate = date instanceof Date && !isNaN(date.getTime()) ? date : new Date();
    const dateKey = startOfDay(validDate).toISOString();
    const hasEvents = eventsByDate.has(dateKey);

    return (
      <td {...props} className={cn(props.className, 'p-0')}>
        <button
          type="button"
          onMouseEnter={() => !isMobile && hasEvents && setHoveredDate(validDate)}
          onMouseLeave={() => !isMobile && setHoveredDate(null)}
          onClick={() => {
            if (isMobile && hasEvents) {
              setClickedDate(current => (current && isSameDay(current, validDate) ? null : validDate));
            }
          }}
          className={cn(
            "h-full w-full flex items-center justify-center relative p-0 border-0 bg-transparent focus:z-10",
            { "cursor-pointer": hasEvents }
          )}
        >
          <DayContent date={validDate} />
        </button>
      </td>
    );
  };

  const currentDate = isMobile ? clickedDate : hoveredDate;
  const dayEvents = currentDate ? eventsByDate.get(startOfDay(currentDate).toISOString()) : null;

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
          <Popover open={!!currentDate} onOpenChange={() => { setHoveredDate(null); setClickedDate(null); }}>
            <PopoverTrigger asChild>
              <div id="calendar-anchor" className="relative" />
            </PopoverTrigger>
            <Calendar
              variant="full"
              month={month}
              onMonthChange={setMonth}
              showOutsideDays
              components={{ Day: CustomDay }}
              modifiers={{ 
                vacation: (date) => {
                  const dateKey = startOfDay(date).toISOString();
                  return !!eventsByDate.get(dateKey)?.vacations.length;
                }
              }}
              modifiersClassNames={{
                vacation: 'bg-accent/50',
              }}
            />
            <PopoverContent 
              side="right" 
              align="start"
              sideOffset={10}
              className="w-80 z-20"
              onOpenAutoFocus={(e) => e.preventDefault()}
              onMouseEnter={() => !isMobile && setHoveredDate(hoveredDate)}
              onMouseLeave={() => !isMobile && setHoveredDate(null)}
            >
              {currentDate && dayEvents && (
                <div className="grid gap-2">
                  <h4 className="font-medium leading-none">{format(currentDate, "PPPP", { locale: ptBR })}</h4>
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
              )}
            </PopoverContent>
          </Popover>
        </div>
        <div className="w-full lg:w-1/4 lg:border-l lg:pl-6">
          <h3 className="font-semibold text-lg text-primary mb-3">Legenda</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-md bg-accent flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              </div>
              <span className="text-sm">Dia de Afastamento</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-md border flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
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
