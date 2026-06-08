
"use client";

import type { Demand, DemandPriority, Employee } from '@/lib/types';
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
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, PlusCircle, X, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const demandSchema = z.object({
  title: z.string().min(1, { message: "Título é obrigatório." }),
  description: z.string().min(1, { message: "Descrição é obrigatória." }),
  priority: z.enum(['alta', 'media', 'baixa'], { message: "Prioridade é obrigatória." }),
  dueDate: z.date({ required_error: "Data de entrega é obrigatória." }),
  ownerId: z.string().optional(),
});

type DemandFormValues = z.infer<typeof demandSchema>;

interface DemandFormProps {
  onAddDemand: (demand: Omit<Demand, 'id'>) => void;
  existingDemand?: Demand | null; 
  onUpdateDemand?: (demand: Demand) => void;
  onClose?: () => void;
  employees: Employee[];
}

export default function DemandForm({ onAddDemand, existingDemand, onUpdateDemand, onClose, employees }: DemandFormProps) {
  const { toast } = useToast();
  const [isEnhancing, setIsEnhancing] = useState<null | 'title' | 'description'>(null);
  
  const form = useForm<DemandFormValues>({
    resolver: zodResolver(demandSchema),
    defaultValues: existingDemand ? {
      title: existingDemand.title,
      description: existingDemand.description,
      priority: existingDemand.priority,
      dueDate: parseISO(existingDemand.dueDate),
      ownerId: existingDemand.ownerId || undefined,
    } : {
      title: '',
      description: '',
      priority: 'media',
      dueDate: new Date(),
      ownerId: employees?.[0]?.id || '',
    },
  });

  const handleEnhanceText = async (field: 'title' | 'description') => {
    const originalText = form.getValues(field);
    if (!originalText) return;

    setIsEnhancing(field);
    try {
      const response = await fetch('/api/enhance-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: originalText }),
      });

      if (!response.ok) {
        throw new Error('Falha ao aprimorar o texto');
      }

      const { enhancedText } = await response.json();
      form.setValue(field, enhancedText, { shouldValidate: true });
      toast({ title: 'Texto Aprimorado!', description: 'O texto foi corrigido e refinado pela IA.' });
    } catch (error) {
      console.error('Falha ao aprimorar o texto:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Erro', 
        description: 'Não foi possível aprimorar o texto. Por favor, tente novamente.' 
      });
    } finally {
      setIsEnhancing(null);
    }
  };

  const onSubmit = (values: DemandFormValues) => {
    if (existingDemand && onUpdateDemand) {
      const demandData = {
        ...existingDemand,
        ...values,
        priority: values.priority as DemandPriority,
        dueDate: values.dueDate.toISOString(),
        ownerId: values.ownerId || null, // Garante que ownerId seja nulo em vez de indefinido
      };
      onUpdateDemand(demandData as Demand);
      toast({ title: "Demanda Atualizada", description: "A demanda foi atualizada com sucesso." });
    } else {
       const demandData: Omit<Demand, 'id'> = {
        title: values.title,
        description: values.description,
        priority: values.priority as DemandPriority,
        dueDate: values.dueDate.toISOString(),
        status: 'Aberto',
        ownerId: values.ownerId || null, // Garante que ownerId seja nulo em vez de indefinido
      };
      onAddDemand(demandData);
      form.reset({ title: '', description: '', priority: 'media', dueDate: new Date(), ownerId: employees?.[0]?.id || '' });
    }
    if (onClose) onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-lg shadow mb-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título da Demanda</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input placeholder="Digite o título da demanda" {...field} className="pr-10" />
                </FormControl>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-primary hover:text-primary"
                  onClick={() => handleEnhanceText('title')}
                  disabled={isEnhancing === 'title'}
                >
                  {isEnhancing === 'title' ? <Loader2 className="animate-spin" /> : <Sparkles />}
                </Button>
              </div>
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
              <div className="relative">
                <FormControl>
                  <Textarea placeholder="Detalhe a demanda..." {...field} rows={4} className="pr-10" />
                </FormControl>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-2 h-7 w-7 text-primary hover:text-primary"
                  onClick={() => handleEnhanceText('description')}
                  disabled={isEnhancing === 'description'}
                >
                  {isEnhancing === 'description' ? <Loader2 className="animate-spin" /> : <Sparkles />}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            name="ownerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsável</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o responsável" />
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
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} 
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
        <div className="flex gap-2">
          <Button type="submit" className="w-full md:w-auto" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Adicionando...' : <><PlusCircle className="mr-2 h-4 w-4" /> {existingDemand ? 'Atualizar Demanda' : 'Adicionar Demanda'}</> }
          </Button>
          {onClose && !existingDemand && ( // Mostra 'Cancelar' apenas para o formulário de adicionar novo, não para editar em dialog
            <Button type="button" variant="outline" onClick={onClose} className="w-full md:w-auto">
              <X className="mr-2 h-4 w-4" /> Cancelar
            </Button>
          )}
           {existingDemand && onClose && ( // Botão de cancelar para modo de edição (em dialog)
            <Button type="button" variant="outline" onClick={onClose} className="w-full md:w-auto">
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
