"use client";

import type { JustifiedAbsence, Employee } from '@/lib/types';
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
import { CalendarIcon, PlusCircle, X, FileText } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const absenceSchema = z.object({
  employeeId: z.string().min(1, { message: "Selecione um funcionário." }),
  startDate: z.date({ required_error: "Data de início é obrigatória." }),
  endDate: z.date({ required_error: "Data de término é obrigatória." }),
  reason: z.string().min(1, { message: "Motivo da falta é obrigatório." }),
}).refine(data => data.endDate >= data.startDate, {
  message: "Data de término não pode ser anterior à data de início.",
  path: ["endDate"],
});

type AbsenceFormValues = z.infer<typeof absenceSchema>;

interface JustifiedAbsenceFormProps {
  onAddAbsence: (absence: Omit<JustifiedAbsence, 'id'>) => void;
  existingAbsence?: JustifiedAbsence | null;
  onUpdateAbsence?: (absence: JustifiedAbsence) => void;
  onClose?: () => void;
  employees: Employee[];
}

export default function JustifiedAbsenceForm({ onAddAbsence, existingAbsence, onUpdateAbsence, onClose, employees }: JustifiedAbsenceFormProps) {

  const form = useForm<AbsenceFormValues>({
    resolver: zodResolver(absenceSchema),
    defaultValues: existingAbsence ? {
      employeeId: existingAbsence.employeeId,
      startDate: parseISO(existingAbsence.startDate),
      endDate: parseISO(existingAbsence.endDate),
      reason: existingAbsence.reason,
    } : {
      employeeId: '',
      reason: '',
    },
  });

  const onSubmit = (values: AbsenceFormValues) => {
    const selectedEmployee = employees.find(e => e.id === values.employeeId);
    if (!selectedEmployee) return;

    if (existingAbsence && onUpdateAbsence) {
      const absenceData: JustifiedAbsence = {
        ...existingAbsence,
        employeeId: selectedEmployee.id,
        employeeName: selectedEmployee.name,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        reason: values.reason,
      };
      onUpdateAbsence(absenceData);
    } else {
       const absenceData: Omit<JustifiedAbsence, 'id'> = {
        employeeId: selectedEmployee.id,
        employeeName: selectedEmployee.name,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        reason: values.reason,
        status: 'active',
      };
      onAddAbsence(absenceData);
      form.reset({ employeeId: '', startDate: undefined, endDate: undefined, reason: '' });
    }
    if(onClose) onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-lg shadow mb-6">
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
         <FormField
            control={form.control}
            name="employeeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Funcionário</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!existingAbsence}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o funcionário" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {employees.sort((a, b) => a.name.localeCompare(b.name)).map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>{employee.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motivo da Falta</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Ex: Consulta médica, problema familiar, compromisso pessoal, etc."
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <Button type="submit" className="w-full md:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> {existingAbsence ? 'Atualizar Falta' : 'Registrar Falta Justificada'}
          </Button>
          {onClose && !existingAbsence && (
            <Button type="button" variant="outline" onClick={onClose} className="w-full md:w-auto">
               <X className="mr-2 h-4 w-4" /> Cancelar
            </Button>
          )}
          {existingAbsence && onClose && (
            <Button type="button" variant="outline" onClick={onClose} className="w-full md:w-auto">
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
