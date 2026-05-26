
"use client";

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlusCircle, X, Search, Check, Plus, Loader2, AlertCircle } from 'lucide-react';
import type { Card, School } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const cardSchema = z.object({
  recipientName: z.string().min(3, { message: "O nome do destinatário é obrigatório." }),
  schoolId: z.string().min(1, { message: "Selecione um colégio." }),
});

type CardFormValues = z.infer<typeof cardSchema>;

interface CardFormProps {
  schools: School[];
  onAddCard: (card: Omit<Card, 'id'>) => void;
  onAddSchool: (name: string) => Promise<School>;
  onClose?: () => void;
}

/**
 * Converte uma string para Title Case
 */
function toTitleCase(str: string) {
    return str
        .toLowerCase()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Gera uma chave de comparação simplificada
 */
function getComparisonKey(name: string) {
    const noiseWords = [
        'colegio', 'escola', 'estadual', 'municipal', 'tempo', 'integral', 
        'ceti', 'de', 'da', 'do', 'das', 'dos', 'e', 'centro', 'educacional'
    ];
    
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .split(/\s+/)
        .filter(word => !noiseWords.includes(word) && word.length > 1)
        .join('');
}

export default function CardForm({ schools, onAddCard, onAddSchool, onClose }: CardFormProps) {
  const { toast } = useToast();
  const [isSchoolPopoverOpen, setIsSchoolPopoverOpen] = useState(false);
  const [isAddingSchool, setIsAddingSchool] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState("");

  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      recipientName: '',
      schoolId: '',
    },
  });

  const handleCreateSchool = async () => {
    const trimmedName = newSchoolName.trim();
    if (!trimmedName) return;
    
    const formattedName = toTitleCase(trimmedName);
    const newKey = getComparisonKey(formattedName);
    
    const duplicate = schools.find(s => getComparisonKey(s.name) === newKey);
    
    if (duplicate) {
        toast({
            variant: 'destructive',
            title: "Colégio já cadastrado",
            description: `O colégio "${duplicate.name}" já existe e é similar ao que você digitou.`,
        });
        return;
    }

    setIsAddingSchool(true);
    try {
      const created = await onAddSchool(formattedName);
      form.setValue('schoolId', created.id);
      setIsSchoolPopoverOpen(false);
      setNewSchoolName("");
    } finally {
      setIsAddingSchool(false);
    }
  };

  const onSubmit = (values: CardFormValues) => {
    const selectedSchool = schools.find(s => s.id === values.schoolId);
    
    const cardData: Omit<Card, 'id'> = {
      recipientName: values.recipientName,
      schoolId: values.schoolId,
      schoolName: selectedSchool?.name || 'Não Informado',
      status: 'pending',
      arrivalDate: new Date().toISOString(),
    };
    onAddCard(cardData);
    form.reset();
    if (onClose) onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="recipientName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Destinatário</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Zilda F. J. Nascimento" {...field} />
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
                        placeholder="Buscar ou digitar novo..." 
                        value={newSchoolName}
                        onValueChange={setNewSchoolName}
                      />
                      <CommandList>
                        <CommandEmpty>
                          <div className="p-2 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <p>Este colégio não está na lista.</p>
                            </div>
                            <Button 
                              type="button" 
                              size="sm" 
                              className="w-full" 
                              onClick={handleCreateSchool}
                              disabled={isAddingSchool || !newSchoolName.trim()}
                            >
                              {isAddingSchool ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                              Cadastrar "{toTitleCase(newSchoolName)}"
                            </Button>
                          </div>
                        </CommandEmpty>
                        <CommandGroup heading="Colégios Cadastrados">
                          {schools
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((school) => (
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
        
        <div className="flex gap-2">
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
