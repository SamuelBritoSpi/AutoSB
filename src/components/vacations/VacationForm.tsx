
"use client";

import type { Vacation, Employee } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, PlusCircle, X } from 'lucide-react';

const vacationSchema = z.object({
  employeeId: z.string().min(1, { message: "Selecione um funcionário." }),
  startDate: z.date({ required_error: "Data de início é obrigatória." }),
  endDate: z.date({ required_error: "Data de término é obrigatória." }),
}).refine(data => data.endDate >= data.startDate, {
  message: "Data de término não pode ser anterior à data de início.",
  path: ["endDate"],
});

type VacationFormValues = z.infer<typeof vacationSchema>;

interface VacationFormProps {
  onAddVacation: (vacation: Omit<Vacation, 'id'>) => void;
  existingVacation?: Vacation | null;
  onUpdateVacation?: (vacation: Vacation) => void;
  onClose?: () => void;
  employees: Employee[];
}

export default function VacationForm({ onAddVacation, existingVacation, onUpdateVacation, onClose, employees }: VacationFormProps) {

  const form = useForm<VacationFormValues>({
    resolver: zodResolver(vacationSchema),
    defaultValues: existingVacation ? {
      employeeId: existingVacation.employeeId,
      startDate: parseISO(existingVacation.startDate),
      endDate: parseISO(existingVacation.endDate),
    } : {
      employeeId: '',
    },
  });

  const onSubmit = (values: VacationFormValues) => {
    const selectedEmployee = employees.find(e => e.id === values.employeeId);
    if (!selectedEmployee) return;

    if (existingVacation && onUpdateVacation) {
      const vacationData: Vacation = {
        id: existingVacation.id,
        employeeId: selectedEmployee.id,
        employeeName: selectedEmployee.name,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
      };
      onUpdateVacation(vacationData);
    } else {
       const vacationData: Omit<Vacation, 'id'> = {
        employeeId: selectedEmployee.id,
        employeeName: selectedEmployee.name,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
      };
      onAddVacation(vacationData);
      form.reset({ employeeId: '', startDate: undefined, endDate: undefined });
    }
    if(onClose) onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-lg shadow mb-6">
         <FormField
            control={form.control}
            name="employeeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Funcionário</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!existingVacation}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o funcionário" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {employees.map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>{employee.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Início</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      locale={ptBR}
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Término</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      locale={ptBR}
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < (form.getValues("startDate") || new Date(new Date().setHours(0,0,0,0)))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" className="w-full md:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> {existingVacation ? 'Atualizar Período' : 'Registrar Férias'}
          </Button>
          {onClose && !existingVacation && (
            <Button type="button" variant="outline" onClick={onClose} className="w-full md:w-auto">
               <X className="mr-2 h-4 w-4" /> Cancelar
            </Button>
          )}
          {existingVacation && onClose && (
            <Button type="button" variant="outline" onClick={onClose} className="w-full md:w-auto">
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
