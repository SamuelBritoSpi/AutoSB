
"use client";

import type { Vacation, Employee, AbsenceType } from '@/lib/types';
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
import { CalendarIcon, PlusCircle, X, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Textarea } from '../ui/textarea';

const absenceTypes: Record<AbsenceType, string> = {
  ferias: 'Férias',
  licenca_premio: 'Licença Prêmio',
  licenca_medica: 'Licença Médica',
  licenca_maternidade: 'Licença Maternidade',
};

const vacationSchema = z.object({
  employeeId: z.string().min(1, { message: "Selecione um funcionário." }),
  startDate: z.date({ required_error: "Data de início é obrigatória." }),
  endDate: z.date({ required_error: "Data de término é obrigatória." }),
  type: z.enum(['ferias', 'licenca_premio', 'licenca_medica', 'licenca_maternidade'], { message: "Tipo de afastamento é obrigatório."}),
  notes: z.string().optional(),
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
  const { toast } = useToast();
  const [isEnhancing, setIsEnhancing] = useState(false);

  const form = useForm<VacationFormValues>({
    resolver: zodResolver(vacationSchema),
    defaultValues: existingVacation ? {
      employeeId: existingVacation.employeeId,
      startDate: parseISO(existingVacation.startDate),
      endDate: parseISO(existingVacation.endDate),
      type: existingVacation.type || 'ferias',
      notes: existingVacation.notes || '',
    } : {
      employeeId: '',
      type: 'ferias',
      notes: '',
    },
  });

  const handleEnhanceText = async () => {
    const currentNotes = form.getValues('notes') || '';
    if (!currentNotes) return;

    setIsEnhancing(true);
    try {
      const response = await fetch('/api/enhance-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: currentNotes }),
      });

      if (!response.ok) {
        throw new Error('Falha ao aprimorar o texto');
      }

      const { enhancedText } = await response.json();
      form.setValue('notes', enhancedText, { shouldValidate: true });
      toast({ title: 'Texto Aprimorado!', description: 'As observações foram corrigidas e refinadas pela IA.' });
    } catch (error) {
      console.error('Falha ao aprimorar o texto:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Erro', 
        description: 'Não foi possível aprimorar o texto. Por favor, tente novamente.' 
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const onSubmit = (values: VacationFormValues) => {
    const selectedEmployee = employees.find(e => e.id === values.employeeId);
    if (!selectedEmployee) return;

    if (existingVacation && onUpdateVacation) {
      const vacationData: Vacation = {
        ...existingVacation, // Preserva o status existente
        employeeId: selectedEmployee.id,
        employeeName: selectedEmployee.name,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        type: values.type,
        notes: values.notes || '',
      };
      onUpdateVacation(vacationData);
    } else {
       const vacationData: Omit<Vacation, 'id'> = {
        employeeId: selectedEmployee.id,
        employeeName: selectedEmployee.name,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        type: values.type,
        status: 'planejado', // Sempre define novos afastamentos como 'planejado'
        notes: values.notes || '',
      };
      onAddVacation(vacationData);
      form.reset({ employeeId: '', startDate: undefined, endDate: undefined, type: 'ferias', notes: '' });
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
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!existingVacation}>
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
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Afastamento</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(absenceTypes).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
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
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      locale={ptBR}
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
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
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
                      locale={ptBR}
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
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações (Opcional)</FormLabel>
              <div className="relative">
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Ex: Período aquisitivo 2023/2024..."
                    className="pr-10"
                  />
                </FormControl>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-2 h-7 w-7 text-primary hover:text-primary"
                  onClick={handleEnhanceText}
                  disabled={isEnhancing}
                >
                  {isEnhancing ? <Loader2 className="animate-spin" /> : <Sparkles />}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <Button type="submit" className="w-full md:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> {existingVacation ? 'Atualizar Período' : 'Registrar Afastamento'}
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
