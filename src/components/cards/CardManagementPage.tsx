
"use client";

import React, { useState } from 'react';
import type { Card } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card as ShadCnCard, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, CreditCard } from 'lucide-react';
import CardForm from './CardForm';
import CardList from './CardList';

interface CardManagementPageProps {
  cards: Card[];
  onAddCard: (card: Omit<Card, 'id'>) => void;
  onUpdateCard: (card: Card) => void;
  onDeleteCard: (id: string) => void;
}

export default function CardManagementPage({
  cards,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
}: CardManagementPageProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <section aria-labelledby="card-form-section">
        <ShadCnCard className="shadow-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <CardTitle className="text-xl font-headline text-primary flex items-center gap-3">
                <CreditCard className="h-6 w-6" />
                Registrar Chegada de Cartão
              </CardTitle>
              <Button variant="outline" onClick={() => setShowForm(!showForm)}>
                <PlusCircle className="mr-2 h-4 w-4" /> {showForm ? 'Ocultar Formulário' : 'Adicionar Novo'}
              </Button>
            </div>
          </CardHeader>
        </ShadCnCard>
        {showForm && (
          <div className="mt-4">
            <CardForm 
              onAddCard={(data) => {
                onAddCard(data);
                setShowForm(false);
              }} 
              onClose={() => setShowForm(false)} 
            />
          </div>
        )}
      </section>

      <section aria-labelledby="card-list-section">
        <CardList
          cards={cards}
          onUpdateCard={onUpdateCard}
          onDeleteCard={onDeleteCard}
        />
      </section>
    </div>
  );
}
