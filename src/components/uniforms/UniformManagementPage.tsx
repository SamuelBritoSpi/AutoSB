
"use client";

import React, { useState } from 'react';
import type { Uniform, School } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card as ShadCnCard, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Shirt } from 'lucide-react';
import UniformForm from './UniformForm';
import UniformList from './UniformList';

interface UniformManagementPageProps {
  uniforms: Uniform[];
  schools: School[];
  onAddUniform: (uniform: Omit<Uniform, 'id'>) => void;
  onUpdateUniform: (uniform: Uniform) => void;
  onDeleteUniform: (id: string) => void;
  onAddSchool: (name: string) => Promise<School>;
}

export default function UniformManagementPage({
  uniforms,
  schools,
  onAddUniform,
  onUpdateUniform,
  onDeleteUniform,
  onAddSchool,
}: UniformManagementPageProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <section aria-labelledby="uniform-form-section">
        <ShadCnCard className="shadow-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <CardTitle className="text-xl font-headline text-primary flex items-center gap-3">
                <Shirt className="h-6 w-6" />
                Registrar Chegada de Fardamento
              </CardTitle>
              <Button variant="outline" onClick={() => setShowForm(!showForm)}>
                <PlusCircle className="mr-2 h-4 w-4" /> {showForm ? 'Ocultar Formulário' : 'Adicionar Novo'}
              </Button>
            </div>
          </CardHeader>
        </ShadCnCard>
        {showForm && (
          <div className="mt-4">
            <UniformForm 
              schools={schools}
              onAddUniform={(data) => {
                onAddUniform(data);
                setShowForm(false);
              }} 
              onAddSchool={onAddSchool}
              onClose={() => setShowForm(false)} 
            />
          </div>
        )}
      </section>

      <section aria-labelledby="uniform-list-section">
        <UniformList
          uniforms={uniforms}
          onUpdateUniform={onUpdateUniform}
          onDeleteUniform={onDeleteUniform}
        />
      </section>
    </div>
  );
}
