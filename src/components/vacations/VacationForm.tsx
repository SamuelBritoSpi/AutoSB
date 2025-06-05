"use client";

import type { Vacation } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, PlusCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const vacationSchema = z.object({
  employeeName: z.string().min(1, { message: "Nome do funcionário é obrigatório." }),
  startDate: z.date({ required_error: "Data de início é obrigatória." }),
  endDate: z.date({ required_error: "Data de término é obrigatória." }),
}).refine(data => data.endDate >= data.startDate, {
  message: "Data de término não pode ser anterior à data de início.",
  path: ["endDate"],
});

type VacationFormValues = z.infer<typeof vacationSchema>;

interface VacationFormProps {
  onAddVacation: (vacation: Vacation) => void;
  existingVacation?: Vacation | null;
  onUpdateVacation?: (vacation: Vacation) => void;
  onClose?: () => void;
}

export default function VacationForm({ onAddVacation, existingVacation, onUpdateVacation, onClose }: VacationFormProps) {
  const { toast } = useToast();
  const form = useForm<VacationFormValues>({
    resolver: zodResolver(vacationSchema),
    defaultValues: existingVacation ? {
      employeeName: existingVacation.employeeName,
      startDate: parseISO(existingVacation.startDate),
      endDate: parseISO(existingVacation.endDate),
    } : {
      employeeName: '',
    },
  });

  const onSubmit = (values: VacationFormValues) => {
    const vacationData: Vacation = {
      id: existingVacation ? existingVacation.id : crypto.randomUUID(),
      employeeName: values.employeeName,
      startDate: values.startDate.toISOString(),
      endDate: values.endDate.toISOString(),
    };

    if (existingVacation && onUpdateVacation) {
      onUpdateVacation(vacationData);
      toast({ title: "Férias Atualizadas", description: "Registro de férias atualizado com sucesso." });
    } else {
      onAddVacation(vacationData);
      toast({ title: "Férias Registradas", description: "Novas férias registradas com sucesso." });
      form.reset({ employeeName: '' });
    }
    if(onClose) onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-lg shadow mb-6">
        <FormField
          control={form.control}
          name="employeeName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Funcionário</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome do funcionário" {...field} />
              </FormControl>
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
                        {field.value ? format(field.value, "PPP") : <span>Escolha uma data</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
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
                        {field.value ? format(field.value, "PPP") : <span>Escolha uma data</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
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
            <PlusCircle className="mr-2 h-4 w-4" /> {existingVacation ? 'Atualizar Férias' : 'Registrar Férias'}
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
