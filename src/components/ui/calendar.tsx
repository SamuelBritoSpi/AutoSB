
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { DayPicker, type DayPickerProps } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ptBR } from 'date-fns/locale';

export type CalendarProps = DayPickerProps;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={ptBR}
      showOutsideDays={showOutsideDays}
      className={cn("p-3 sm:p-6", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-between items-center pt-1 relative mb-2 px-2",
        caption_label: "text-base sm:text-lg font-semibold",
        nav: "flex gap-1 sm:gap-2",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 sm:h-10 sm:w-10 bg-transparent p-0 opacity-70 hover:opacity-100 transition-opacity flex items-center justify-center"
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse space-y-1",
        head_row: "flex gap-1 sm:gap-2",
        head_cell:
          "text-muted-foreground rounded-md w-8 sm:w-10 h-8 sm:h-10 font-semibold text-[0.7rem] sm:text-sm flex items-center justify-center flex-shrink-0",
        row: "flex w-full mt-2 gap-1 sm:gap-2",
        cell: "h-8 w-8 sm:h-10 sm:w-10 text-center text-xs sm:text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 flex-shrink-0",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 sm:h-10 sm:w-10 p-0 font-normal aria-selected:opacity-100 rounded-md text-xs sm:text-sm"
        ),
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground font-bold",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />,
        IconRight: () => <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
