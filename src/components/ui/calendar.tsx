
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { DayPicker, type DayPickerProps, type DayProps } from "react-day-picker";
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';

const calendarVariants = cva(
  "p-3",
  {
    variants: {
      variant: {
        default: "",
        full: "w-full",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export type CalendarProps = DayPickerProps & VariantProps<typeof calendarVariants>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  variant,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={ptBR}
      showOutsideDays={showOutsideDays}
      className={cn(calendarVariants({ variant }), className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex w-full",
        head_cell: cn(
          "text-muted-foreground rounded-md font-normal text-[0.8rem]",
          variant === "full" ? "w-14 sm:w-16 md:w-20 lg:w-24 xl:w-28" : "w-9"
        ),
        row: "flex w-full mt-2",
        cell: cn(
          "text-center text-sm p-0 relative first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          variant === "full" ? "h-11 w-14 sm:w-16 md:w-20 lg:w-24 xl:w-28" : "size-9"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "p-0 font-normal aria-selected:opacity-100",
          variant === "full" ? "h-11 w-14 sm:w-16 md:w-20 lg:w-24 xl:w-28" : "h-9 w-9"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
        Day: (dayProps: DayProps) => {
          const { components } = props;
          if (components?.Day) {
            return <components.Day {...dayProps} />;
          }
          return <DayPicker.defaultProps.components.Day {...dayProps} />;
        },
      }}
      formatters={{
          formatWeekdayName: (day) => format(day, 'EEEEEE', { locale: ptBR }),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
