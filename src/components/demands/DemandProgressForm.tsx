
"use client";

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../AuthProvider';
import type { DemandProgress } from '@/lib/types';
import { addDemandProgress } from '@/lib/idb';
import { PlusCircle, Sparkles, Loader2 } from 'lucide-react';

const progressSchema = z.object({
  description: z.string().min(1, { message: "Descrição é obrigatória." }),
});

type ProgressFormValues = z.infer<typeof progressSchema>;

interface DemandProgressFormProps {
  demandId: string;
  onProgressAdded: (progress: DemandProgress) => void;
}

export default function DemandProgressForm({ demandId, onProgressAdded }: DemandProgressFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  const form = useForm<ProgressFormValues>({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      description: '',
    },
  });

  const handleEnhanceText = async () => {
    const originalText = form.getValues("description");
    if (!originalText) return;

    setIsEnhancing(true);
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
      form.setValue("description", enhancedText, { shouldValidate: true });
      toast({ title: 'Texto Aprimorado!', description: 'O andamento foi corrigido e refinado pela IA.' });
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

  const onSubmit = async (values: ProgressFormValues) => {
    try {
      setIsSubmitting(true);
      
      const newProgress: Omit<DemandProgress, 'id'> = {
        demandId,
        description: values.description,
        date: new Date().toISOString(),
        createdBy: user?.uid || null,
      };
      
      const addedProgress = await addDemandProgress(newProgress);
      
      toast({
        title: "Andamento adicionado",
        description: "O andamento foi adicionado com sucesso.",
      });
      
      form.reset();
      onProgressAdded(addedProgress);
    } catch (error) {
      console.error("Erro ao adicionar andamento:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao adicionar o andamento.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adicionar Andamento</FormLabel>
              <div className="relative">
                <FormControl>
                  <Textarea 
                    placeholder="Descreva a atualização da demanda..." 
                    {...field} 
                    rows={3} 
                    className="resize-none pr-10"
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
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          {isSubmitting ? "Adicionando..." : "Adicionar Andamento"}
        </Button>
      </form>
    </Form>
  );
}
