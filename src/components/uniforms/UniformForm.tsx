
"use client";

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlusCircle, X, Search, Check, Plus, Loader2 } from 'lucide-react';
import type { Uniform, School, UniformItem } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

const itemSchema = z.object({
  name: z.string().min(1, "Nome do item é obrigatório"),
  quantity: z.coerce.number().min(1, "Qtd mín 1"),
  size: z.string().min(1, "Tamanho obrigatório"),
});

const uniformSchema = z.object({
  employeeName: z.string().min(3, "Nome do funcionário é obrigatório"),
  schoolId: z.string().min(1, "Selecione um colégio"),
  camisaQtd: z.coerce.number().min(0),
  camisaTamanho: z.string().optional(),
  calcaQtd: z.coerce.number().min(0),
  calcaTamanho: z.string().optional(),
  sapatoQtd: z.coerce.number().min(0),
  sapatoTamanho: z.string().optional(),
  otherItems: z.array(itemSchema),
});

type UniformFormValues = z.infer<typeof uniformSchema>;

interface UniformFormProps {
  schools: School[];
  onAddUniform: (uniform: Omit<Uniform, 'id'>) => void;
  onAddSchool: (name: string) => Promise<School>;
  onClose?: () => void;
}

export default function UniformForm({ schools, onAddUniform, onAddSchool, onClose }: UniformFormProps) {
  const [isSchoolPopoverOpen, setIsSchoolPopoverOpen] = useState(false);
  const [isAddingSchool, setIsAddingSchool] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState("");

  const form = useForm<UniformFormValues>({
    resolver: zodResolver(uniformSchema),
    defaultValues: {
      employeeName: '',
      schoolId: '',
      camisaQtd: 0,
      camisaTamanho: '',
      calcaQtd: 0,
      calcaTamanho: '',
      sapatoQtd: 0,
      sapatoTamanho: '',
      otherItems: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "otherItems",
  });

  const handleCreateSchool = async () => {
    if (!newSchoolName.trim()) return;
    setIsAddingSchool(true);
    try {
      const created = await onAddSchool(newSchoolName.trim());
      form.setValue('schoolId', created.id);
      setIsSchoolPopoverOpen(false);
      setNewSchoolName("");
    } finally {
      setIsAddingSchool(false);
    }
  };

  const onSubmit = (values: UniformFormValues) => {
    const selectedSchool = schools.find(s => s.id === values.schoolId);
    
    const items: UniformItem[] = [];
    if (values.camisaQtd > 0) items.push({ name: 'Camisa', quantity: values.camisaQtd, size: values.camisaTamanho || 'N/A' });
    if (values.calcaQtd > 0) items.push({ name: 'Calça', quantity: values.calcaQtd, size: values.calcaTamanho || 'N/A' });
    if (values.sapatoQtd > 0) items.push({ name: 'Sapato', quantity: values.sapatoQtd, size: values.sapatoTamanho || 'N/A' });
    
    items.push(...values.otherItems);

    const uniformData: Omit<Uniform, 'id'> = {
      employeeName: values.employeeName,
      schoolId: values.schoolId,
      schoolName: selectedSchool?.name || 'Não Informado',
      arrivalDate: new Date().toISOString(),
      status: 'pending',
      items,
    };

    onAddUniform(uniformData);
    form.reset();
    if (onClose) onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="employeeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Funcionário</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: João da Silva" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="schoolId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Colégio</FormLabel>
                <Popover open={isSchoolPopoverOpen} onOpenChange={setIsSchoolPopoverOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? schools.find((school) => school.id === field.value)?.name
                          : "Selecionar colégio..."}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Buscar colégio..." 
                        value={newSchoolName}
                        onValueChange={setNewSchoolName}
                      />
                      <CommandList>
                        <CommandEmpty>
                          <div className="p-2 space-y-2">
                            <p className="text-xs text-muted-foreground">Nenhum colégio encontrado.</p>
                            <Button 
                              type="button" 
                              size="sm" 
                              className="w-full" 
                              onClick={handleCreateSchool}
                              disabled={isAddingSchool || !newSchoolName.trim()}
                            >
                              {isAddingSchool ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                              Adicionar "{newSchoolName}"
                            </Button>
                          </div>
                        </CommandEmpty>
                        <CommandGroup>
                          {schools.map((school) => (
                            <CommandItem
                              key={school.id}
                              value={school.name}
                              onSelect={() => {
                                form.setValue("schoolId", school.id);
                                setIsSchoolPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  school.id === field.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {school.name}
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

        <Separator />
        <h3 className="text-sm font-semibold text-primary">Itens Padrão</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-4 border p-3 rounded-md">
            <p className="text-xs font-bold uppercase text-muted-foreground">Camisa</p>
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="camisaQtd"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-xs">Qtd</FormLabel>
                    <Input type="number" {...field} />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="camisaTamanho"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-xs">Tamanho</FormLabel>
                    <Input placeholder="P, M, G..." {...field} />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-4 border p-3 rounded-md">
            <p className="text-xs font-bold uppercase text-muted-foreground">Calça</p>
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="calcaQtd"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-xs">Qtd</FormLabel>
                    <Input type="number" {...field} />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="calcaTamanho"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-xs">Tamanho</FormLabel>
                    <Input placeholder="38, 40..." {...field} />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-4 border p-3 rounded-md">
            <p className="text-xs font-bold uppercase text-muted-foreground">Sapato</p>
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="sapatoQtd"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-xs">Qtd</FormLabel>
                    <Input type="number" {...field} />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sapatoTamanho"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-xs">Tamanho</FormLabel>
                    <Input placeholder="37, 38..." {...field} />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <Separator />
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-primary">Outros Itens / EPIs</h3>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => append({ name: '', quantity: 1, size: 'Único' })}
          >
            <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Outro
          </Button>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-col sm:flex-row gap-4 items-end bg-muted/30 p-3 rounded-md relative">
            <FormField
              control={form.control}
              name={`otherItems.${index}.name`}
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormLabel className="text-xs">Item</FormLabel>
                  <Input placeholder="Ex: Luva de Raspa" {...field} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`otherItems.${index}.quantity`}
              render={({ field }) => (
                <FormItem className="w-full sm:w-20">
                  <FormLabel className="text-xs">Qtd</FormLabel>
                  <Input type="number" {...field} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`otherItems.${index}.size`}
              render={({ field }) => (
                <FormItem className="w-full sm:w-24">
                  <FormLabel className="text-xs">Tam</FormLabel>
                  <Input {...field} />
                </FormItem>
              )}
            />
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="text-destructive h-10" 
              onClick={() => remove(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="w-full md:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> Registrar Entrada
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
