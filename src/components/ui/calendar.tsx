
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
  locale = ptBR,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={locale}
      showOutsideDays={showOutsideDays}
      className={cn("p-3 sm:p-6", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
        month: "space-y-4 relative w-full",
        caption: "flex justify-center items-center pt-1 relative mb-4",
        caption_label: "text-sm sm:text-base font-semibold",
        nav: "absolute top-0 w-full flex justify-between px-1 sm:px-2",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 sm:h-9 sm:w-9 bg-transparent p-0 opacity-70 hover:opacity-100 transition-opacity flex items-center justify-center flex-shrink-0"
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse space-y-1",
        head_row: "flex gap-0.5 sm:gap-1 mb-2 sm:mb-3 px-1 sm:px-2",
        head_cell:
          "text-muted-foreground font-semibold text-xs h-8 w-9 sm:h-9 sm:w-11 flex items-center justify-center flex-1 min-w-0",
        row: "flex w-full gap-0.5 sm:gap-1 px-1 sm:px-2",
        cell: "h-8 w-9 sm:h-9 sm:w-11 text-center text-xs sm:text-sm p-0 relative flex-1 min-w-0 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-9 sm:h-9 sm:w-11 p-0 font-normal aria-selected:opacity-100 rounded-md text-xs sm:text-sm flex-1"
        ),
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground font-bold",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
