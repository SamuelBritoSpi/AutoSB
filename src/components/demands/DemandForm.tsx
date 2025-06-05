"use client";

import type { Demand, DemandPriority, DemandStatus } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const demandSchema = z.object({
  title: z.string().min(1, { message: "Título é obrigatório." }),
  description: z.string().min(1, { message: "Descrição é obrigatória." }),
  priority: z.enum(['alta', 'media', 'baixa'], { message: "Prioridade é obrigatória." }),
  dueDate: z.date({ required_error: "Data de entrega é obrigatória." }),
});

type DemandFormValues = z.infer<typeof demandSchema>;

interface DemandFormProps {
  onAddDemand: (demand: Demand) => void;
  existingDemand?: Demand | null; // For editing
  onUpdateDemand?: (demand: Demand) => void;
  onClose?: () => void; // For closing a dialog if used for editing
}

export default function DemandForm({ onAddDemand, existingDemand, onUpdateDemand, onClose }: DemandFormProps) {
  const { toast } = useToast();
  const form = useForm<DemandFormValues>({
    resolver: zodResolver(demandSchema),
    defaultValues: existingDemand ? {
      title: existingDemand.title,
      description: existingDemand.description,
      priority: existingDemand.priority,
      dueDate: parseISO(existingDemand.dueDate),
    } : {
      title: '',
      description: '',
      priority: 'media',
      dueDate: new Date(),
    },
  });

  const onSubmit = (values: DemandFormValues) => {
    const demandData = {
      id: existingDemand ? existingDemand.id : crypto.randomUUID(),
      title: values.title,
      description: values.description,
      priority: values.priority as DemandPriority,
      dueDate: values.dueDate.toISOString(),
      status: existingDemand ? existingDemand.status : ('a-fazer' as DemandStatus),
    };

    if (existingDemand && onUpdateDemand) {
      onUpdateDemand(demandData);
      toast({ title: "Demanda Atualizada", description: "A demanda foi atualizada com sucesso." });
    } else {
      onAddDemand(demandData);
      toast({ title: "Demanda Adicionada", description: "Nova demanda registrada com sucesso." });
      form.reset({ title: '', description: '', priority: 'media', dueDate: new Date() });
    }
    if (onClose) onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-lg shadow">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título da Demanda</FormLabel>
              <FormControl>
                <Input placeholder="Digite o título da demanda" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição da Demanda</FormLabel>
              <FormControl>
                <Textarea placeholder="Detalhe a demanda..." {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridade</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Entrega</FormLabel>
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
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} // Disable past dates
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full md:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> {existingDemand ? 'Atualizar Demanda' : 'Adicionar Demanda'}
        </Button>
         {existingDemand && onClose && (
          <Button type="button" variant="outline" onClick={onClose} className="w-full md:w-auto ml-2">
            Cancelar
          </Button>
        )}
      </form>
    </Form>
  );
}
