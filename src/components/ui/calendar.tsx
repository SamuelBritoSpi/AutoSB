
"use client";

import React, { useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import 'react-datepicker/dist/react-datepicker.css';

interface CalendarProps {
  selected?: Date | null;
  onSelect?: (date: Date) => void;
  disabled?: (date: Date) => boolean;
  mode?: 'single' | 'range';
  startDate?: Date | null;
  endDate?: Date | null;
  onChange?: (dates: [Date | null | undefined, Date | null | undefined]) => void;
  className?: string;
  month?: Date;
  onMonthChange?: (date: Date) => void;
  modifiers?: Record<string, Date[]>;
  modifiersClassNames?: Record<string, string>;
  initialFocus?: boolean;
}

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  (
    {
      selected,
      onSelect,
      disabled,
      mode = 'single',
      startDate,
      endDate,
      onChange,
      className,
      month,
      onMonthChange,
      modifiers,
      modifiersClassNames,
      initialFocus,
      ...props
    },
    ref
  ) => {
    const [internalMonth, setInternalMonth] = useState(month || new Date());

    const handleMonthChange = (date: Date) => {
      setInternalMonth(date);
      onMonthChange?.(date);
    };

    const filterDate = (date: Date) => {
      if (disabled) {
        return !disabled(date);
      }
      return true;
    };

    const modifierClasses = (date: Date) => {
      let classes = '';
      if (modifiers && modifiersClassNames) {
        Object.entries(modifiers).forEach(([key, dates]) => {
          if (dates.some(d => d.toDateString() === date.toDateString())) {
            classes += ` ${modifiersClassNames[key] || ''}`;
          }
        });
      }
      return classes;
    };

    const calendarContainerClassName = cn(
      'react-datepicker-wrapper',
      className
    );

    if (mode === 'range') {
      return (
        <div
          ref={ref}
          className={cn('calendar-container p-3 sm:p-6 flex justify-center', className)}
        >
          <ReactDatePicker
            selected={startDate}
            onChange={onChange}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            inline
            locale={ptBR}
            filterDate={filterDate}
            monthsShown={1}
            className={cn(
              'w-full bg-card text-foreground rounded-lg',
              'focus:outline-none focus:ring-2 focus:ring-primary'
            )}
          />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn('calendar-container p-3 sm:p-6 flex justify-center', className)}
      >
        <ReactDatePicker
          selected={selected}
          onChange={(date: Date | null) => {
            if (date) onSelect?.(date);
          }}
          inline
          locale={ptBR}
          filterDate={filterDate}
          minDate={disabled ? new Date(new Date().setHours(0, 0, 0, 0)) : undefined}
          className={cn(
            'w-full bg-card text-foreground rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-primary'
          )}
        />
      </div>
    );
  }
);

Calendar.displayName = 'Calendar';

export { Calendar };
export type { CalendarProps };
