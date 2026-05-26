
"use client";

import React, { useState } from 'react';
import type { Card, School } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card as ShadCnCard, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, CreditCard, Building } from 'lucide-react';
import CardForm from './CardForm';
import CardList from './CardList';

interface CardManagementPageProps {
  cards: Card[];
  schools: School[];
  onAddCard: (card: Omit<Card, 'id'>) => void;
  onUpdateCard: (card: Card) => void;
  onDeleteCard: (id: string) => void;
  onAddSchool: (name: string) => Promise<School>;
  onOpenSchoolManagement: () => void;
}

export default function CardManagementPage({
  cards,
  schools,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onAddSchool,
  onOpenSchoolManagement,
}: CardManagementPageProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <section aria-labelledby="card-form-section">
        <ShadCnCard className="shadow-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="space-y-1">
                <CardTitle className="text-xl font-headline text-primary flex items-center gap-3">
                  <CreditCard className="h-6 w-6" />
                  Registrar Chegada de Cartão
                </CardTitle>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" onClick={onOpenSchoolManagement} className="flex-1 sm:flex-none">
                  <Building className="mr-2 h-4 w-4" /> Gerenciar Colégios
                </Button>
                <Button variant="default" size="sm" onClick={() => setShowForm(!showForm)} className="flex-1 sm:flex-none">
                  <PlusCircle className="mr-2 h-4 w-4" /> {showForm ? 'Ocultar' : 'Adicionar Novo'}
                </Button>
              </div>
            </div>
          </CardHeader>
        </ShadCnCard>
        {showForm && (
          <div className="mt-4">
            <CardForm 
              schools={schools}
              onAddCard={(data) => {
                onAddCard(data);
                setShowForm(false);
              }} 
              onAddSchool={onAddSchool}
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
