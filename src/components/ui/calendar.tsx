
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
      className={cn("p-4 sm:p-6 w-full", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 w-full",
        caption: "flex justify-between items-center pt-1 relative mb-4",
        caption_label: "text-base sm:text-lg font-semibold",
        nav: "flex gap-2",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-10 w-10 bg-transparent p-0 opacity-70 hover:opacity-100 transition-opacity"
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md flex-1 font-semibold text-sm sm:text-base h-10 flex items-center justify-center",
        row: "flex w-full mt-2 gap-1 sm:gap-2",
        cell: "flex-1 aspect-square text-center p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-full w-full p-0 font-normal text-sm sm:text-base aria-selected:opacity-100 rounded-md"
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
        IconLeft: () => <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />,
        IconRight: () => <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
