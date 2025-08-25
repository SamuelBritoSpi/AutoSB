"use client";

import type { Employee, ContractType } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const employeeSchema = z.object({
  name: z.string().min(1, { message: "Nome é obrigatório." }),
  contractType: z.enum(['efetivo', 'reda', 'terceirizado'], { message: "Tipo de contrato é obrigatório." }),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  onAddEmployee: (employee: Employee) => void;
  existingEmployee?: Employee | null;
  onUpdateEmployee?: (employee: Employee) => void;
  onClose?: () => void;
}

export default function EmployeeForm({ onAddEmployee, existingEmployee, onUpdateEmployee, onClose }: EmployeeFormProps) {
  const { toast } = useToast();
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: existingEmployee ? {
      name: existingEmployee.name,
      contractType: existingEmployee.contractType,
    } : {
      name: '',
      contractType: 'efetivo',
    },
  });

  const onSubmit = (values: EmployeeFormValues) => {
    const employeeData: Employee = {
      id: existingEmployee ? existingEmployee.id : crypto.randomUUID(),
      name: values.name,
      contractType: values.contractType as ContractType,
    };

    if (existingEmployee && onUpdateEmployee) {
      onUpdateEmployee(employeeData);
      toast({ title: "Funcionário Atualizado", description: "O registro foi atualizado com sucesso." });
    } else {
      onAddEmployee(employeeData);
      toast({ title: "Funcionário Adicionado", description: "Novo funcionário registrado com sucesso." });
      form.reset({ name: '', contractType: 'efetivo' });
    }
    if (onClose) onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-lg shadow mb-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome completo do funcionário" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contractType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Contrato</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de contrato" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="efetivo">Efetivo</SelectItem>
                  <SelectItem value="reda">REDA</SelectItem>
                  <SelectItem value="terceirizado">Terceirizado</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <Button type="submit" className="w-full md:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> {existingEmployee ? 'Atualizar' : 'Adicionar Funcionário'}
          </Button>
          {onClose && (
            <Button type="button" variant="outline" onClick={onClose} className="w-full md:w-auto">
              <X className="mr-2 h-4 w-4" /> Cancelar
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
