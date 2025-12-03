
"use client";

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlusCircle, X } from 'lucide-react';
import type { Card } from '@/lib/types';

const cardSchema = z.object({
  recipientName: z.string().min(3, { message: "O nome do destinatário é obrigatório." }),
});

type CardFormValues = z.infer<typeof cardSchema>;

interface CardFormProps {
  onAddCard: (card: Omit<Card, 'id'>) => void;
  onClose?: () => void;
}

export default function CardForm({ onAddCard, onClose }: CardFormProps) {
  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      recipientName: '',
    },
  });

  const onSubmit = (values: CardFormValues) => {
    const cardData: Omit<Card, 'id'> = {
      recipientName: values.recipientName,
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
        <div className="flex gap-2">
          <Button type="submit" className="w-full md:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Cartão
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
