
"use client";

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, PlusCircle, X, Search, Check, Plus, Loader2 } from 'lucide-react';
import type { ThirdPartyEmployee, School, ThirdPartyHistoryEntry } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const employeeSchema = z.object({
  nte: z.string().min(1, "NTE é obrigatório"),
  municipio: z.string().min(1, "Município é obrigatório"),
  schoolId: z.string().min(1, "Lotação é obrigatória"),
  codSec: z.string().min(1, "COD.sec é obrigatório"),
  name: z.string().min(3, "Nome completo é obrigatório"),
  cpf: z.string().min(11, "CPF deve ter 11 dígitos"),
  role: z.string().min(1, "Função é obrigatória"),
  contact: z.string().min(1, "Contato é obrigatório"),
  company: z.enum(['CONFIANÇA', 'CSH']),
  status: z.string().default("Ativo"),
  admissionDate: z.date({ required_error: "Data de admissão é obrigatória" }),
  observation: z.string().optional(),
  contractType: z.string().optional(),
});

type FormValues = z.infer<typeof employeeSchema>;

interface ThirdPartyEmployeeFormProps {
  schools: School[];
  onAddEmployee: (emp: Omit<ThirdPartyEmployee, 'id'>) => void;
  onAddSchool: (name: string) => Promise<School>;
  onClose?: () => void;
  existingEmployee?: ThirdPartyEmployee | null;
  onUpdateEmployee?: (emp: ThirdPartyEmployee) => void;
}

export default function ThirdPartyEmployeeForm({ 
  schools, 
  onAddEmployee, 
  onAddSchool, 
  onClose,
  existingEmployee,
  onUpdateEmployee 
}: ThirdPartyEmployeeFormProps) {
  const { toast } = useToast();
  const [isSchoolPopoverOpen, setIsSchoolPopoverOpen] = useState(false);
  const [isAddingSchool, setIsAddingSchool] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: existingEmployee ? {
      ...existingEmployee,
      admissionDate: parseISO(existingEmployee.admissionDate),
    } : {
      nte: 'NTE 20',
      company: 'CONFIANÇA',
      status: 'Ativo',
    },
  });

  const handleCreateSchool = async () => {
    const trimmedName = newSchoolName.trim();
    if (!trimmedName) return;
    setIsAddingSchool(true);
    try {
      const created = await onAddSchool(trimmedName);
      form.setValue('schoolId', created.id);
      setIsSchoolPopoverOpen(false);
      setNewSchoolName("");
    } finally {
      setIsAddingSchool(false);
    }
  };

  const onSubmit = (values: FormValues) => {
    const school = schools.find(s => s.id === values.schoolId);
    const now = new Date().toISOString();
    
    // Gerar Histórico se estiver editando
    let history: ThirdPartyHistoryEntry[] = existingEmployee?.history || [];
    
    if (existingEmployee) {
      if (values.contact !== existingEmployee.contact) {
        history = [{ date: now, field: 'Contato', oldValue: existingEmployee.contact, newValue: values.contact }, ...history].slice(0, 5);
      }
      if (school?.name !== existingEmployee.schoolName) {
        history = [{ date: now, field: 'Lotação', oldValue: existingEmployee.schoolName, newValue: school?.name || 'Não Informado' }, ...history].slice(0, 5);
      }
      if (values.codSec !== existingEmployee.codSec) {
        history = [{ date: now, field: 'COD SEC', oldValue: existingEmployee.codSec, newValue: values.codSec }, ...history].slice(0, 5);
      }
    }

    const empData: Omit<ThirdPartyEmployee, 'id'> = {
      ...values,
      cpf: values.cpf.padStart(11, '0'),
      schoolName: school?.name || 'Não Informado',
      admissionDate: values.admissionDate.toISOString(),
      observation: values.observation || '',
      history: history,
    };

    if (existingEmployee && onUpdateEmployee) {
      onUpdateEmployee({ ...empData, id: existingEmployee.id } as ThirdPartyEmployee);
    } else {
      onAddEmployee(empData);
    }
    if (onClose) onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Linha 1: NTE, Município, COD.sec, Admissão */}
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="nte"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NTE</FormLabel>
                  <Input placeholder="NTE 20" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="md:col-span-4">
            <FormField
              control={form.control}
              name="municipio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Município</FormLabel>
                  <Input placeholder="Cidade" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="codSec"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>COD.sec</FormLabel>
                  <Input placeholder="Código Secretaria" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="md:col-span-4">
            <FormField
              control={form.control}
              name="admissionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admissão</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "dd/MM/yyyy") : "Escolher data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} locale={ptBR} />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Linha 2: Nome Completo, CPF, Contato */}
          <div className="md:col-span-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <Input placeholder="Nome do funcionário" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="md:col-span-3">
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <Input placeholder="00000000000" maxLength={11} {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="md:col-span-3">
            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contato Atual</FormLabel>
                  <Input placeholder="(00) 00000-0000" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Linha 3: Lotação Atual, Função */}
          <div className="md:col-span-6">
            <FormField
              control={form.control}
              name="schoolId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lotação Atual</FormLabel>
                  <Popover open={isSchoolPopoverOpen} onOpenChange={setIsSchoolPopoverOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                          {field.value ? schools.find(s => s.id === field.value)?.name : "Selecionar escola..."}
                          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar ou cadastrar..." value={newSchoolName} onValueChange={setNewSchoolName} />
                        <CommandList>
                          <CommandEmpty>
                            <Button size="sm" className="w-full" onClick={handleCreateSchool} disabled={isAddingSchool}>
                              {isAddingSchool ? <Loader2 className="animate-spin h-3 w-3 mr-2" /> : <Plus className="h-3 w-3 mr-2" />}
                              Cadastrar "{newSchoolName}"
                            </Button>
                          </CommandEmpty>
                          <CommandGroup>
                            {schools.sort((a,b) => a.name.localeCompare(b.name)).map(s => (
                              <CommandItem key={s.id} onSelect={() => { form.setValue('schoolId', s.id); setIsSchoolPopoverOpen(false); }}>
                                <Check className={cn("mr-2 h-4 w-4", s.id === field.value ? "opacity-100" : "opacity-0")} />
                                {s.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="md:col-span-6">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Função</FormLabel>
                  <Input placeholder="Ex: Auxiliar de Serviços Gerais" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Linha 4: Empresa, Contrato Atual, Status */}
          <div className="md:col-span-4">
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CONFIANÇA">CONFIANÇA</SelectItem>
                      <SelectItem value="CSH">CSH</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="md:col-span-4">
            <FormField
              control={form.control}
              name="contractType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contrato Atual</FormLabel>
                  <Input placeholder="Ex: 001/2023" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="md:col-span-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Linha 5: Observações */}
          <div className="md:col-span-12">
            <FormField
              control={form.control}
              name="observation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <Textarea placeholder="Detalhes adicionais..." {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-2 border-t mt-4">
          {onClose && <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>}
          <Button type="submit">
            <PlusCircle className="mr-2 h-4 w-4" />
            {existingEmployee ? "Salvar Alterações" : "Cadastrar Funcionário"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
