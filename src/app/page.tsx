"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DemandForm from '@/components/demands/DemandForm';
import DemandList from '@/components/demands/DemandList';
import VacationForm from '@/components/vacations/VacationForm';
import VacationList from '@/components/vacations/VacationList';
import type { Demand, Vacation, DemandStatus, AIConflictCheckResult } from '@/lib/types';
import { vacationConflictDetection } from '@/ai/flows/vacation-conflict-detection';
import type { VacationConflictDetectionInput } from '@/ai/flows/vacation-conflict-detection';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { BarChart, CalendarCheck, ListChecks } from 'lucide-react';

const DEMANDS_STORAGE_KEY = 'autoSb_demands';
const VACATIONS_STORAGE_KEY = 'autoSb_vacations';

export default function GestaoFeriasPage() {
  const [demands, setDemands] = useState<Demand[]>([]);
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("demands");

  // Load data from localStorage on initial render
  useEffect(() => {
    const storedDemands = localStorage.getItem(DEMANDS_STORAGE_KEY);
    if (storedDemands) {
      setDemands(JSON.parse(storedDemands));
    }
    const storedVacations = localStorage.getItem(VACATIONS_STORAGE_KEY);
    if (storedVacations) {
      setVacations(JSON.parse(storedVacations));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(DEMANDS_STORAGE_KEY, JSON.stringify(demands));
  }, [demands]);

  useEffect(() => {
    localStorage.setItem(VACATIONS_STORAGE_KEY, JSON.stringify(vacations));
  }, [vacations]);

  const handleAddDemand = (newDemand: Demand) => {
    setDemands(prev => [newDemand, ...prev]);
  };

  const handleUpdateDemand = (updatedDemand: Demand) => {
    setDemands(prev => prev.map(d => d.id === updatedDemand.id ? updatedDemand : d));
  };

  const handleDeleteDemand = (id: string) => {
    setDemands(prev => prev.filter(d => d.id !== id));
    toast({ title: "Demanda Excluída", description: "A demanda foi removida." });
  };

  const handleUpdateDemandStatus = (id: string, status: DemandStatus) => {
    setDemands(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    toast({ title: "Status Atualizado", description: `Status da demanda alterado para ${status}.`});
  };

  const handleAddVacation = (newVacation: Vacation) => {
    setVacations(prev => [newVacation, ...prev]);
  };
  
  const handleUpdateVacation = (updatedVacation: Vacation) => {
    setVacations(prev => prev.map(v => v.id === updatedVacation.id ? updatedVacation : v));
  };

  const handleDeleteVacation = (id: string) => {
    setVacations(prev => prev.filter(v => v.id !== id));
    toast({ title: "Férias Excluídas", description: "O registro de férias foi removido." });
  };

  const handleCheckConflict = useCallback(async (vacation: Vacation, demandId: string) => {
    const targetDemand = demands.find(d => d.id === demandId);
    if (!targetDemand) {
      toast({ title: "Erro", description: "Demanda selecionada não encontrada.", variant: "destructive" });
      return;
    }

    const aiInput: VacationConflictDetectionInput = {
      vacationStartDate: format(parseISO(vacation.startDate), 'yyyy-MM-dd'),
      vacationEndDate: format(parseISO(vacation.endDate), 'yyyy-MM-dd'),
      employeeName: vacation.employeeName,
      projectDueDate: format(parseISO(targetDemand.dueDate), 'yyyy-MM-dd'),
      projectPriority: targetDemand.priority, // Assuming DemandPriority matches AI enum
      projectDescription: targetDemand.description, // Consider if title should be part of AI input
    };

    try {
      const result: AIConflictCheckResult = await vacationConflictDetection(aiInput);
      setVacations(prevVacations => 
        prevVacations.map(v => 
          v.id === vacation.id 
            ? { ...v, conflictCheckResult: { ...result, checkedAgainstDemandId: demandId, checkedDemandDescription: targetDemand.title } } // Using title here
            : v
        )
      );
      toast({
        title: result.conflictDetected ? "Conflito Detectado!" : "Sem Conflitos",
        description: result.conflictDetails || (result.conflictDetected ? "Um conflito foi encontrado." : "Nenhum conflito encontrado com a demanda selecionada."),
        variant: result.conflictDetected ? "destructive" : "default",
      });
    } catch (error) {
      console.error("AI Conflict Check Error:", error);
      toast({ title: "Erro na Verificação", description: "Não foi possível verificar o conflito.", variant: "destructive" });
    }
  }, [demands, toast]);


  return (
    <div className="w-full space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2 mx-auto">
          <TabsTrigger value="demands">
            <ListChecks className="mr-2 h-5 w-5" /> Demandas
          </TabsTrigger>
          <TabsTrigger value="vacations">
            <CalendarCheck className="mr-2 h-5 w-5" /> Férias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="demands" className="space-y-6 mt-6">
          <section aria-labelledby="demands-form-title">
            <h2 id="demands-form-title" className="text-2xl font-headline font-semibold mb-4 text-primary">Registrar Nova Demanda</h2>
            <DemandForm onAddDemand={handleAddDemand} />
          </section>
          <section aria-labelledby="demands-list-title">
            <h2 id="demands-list-title" className="text-2xl font-headline font-semibold my-6 text-primary">Lista de Demandas</h2>
            <DemandList 
              demands={demands} 
              onUpdateStatus={handleUpdateDemandStatus} 
              onDeleteDemand={handleDeleteDemand}
              onUpdateDemand={handleUpdateDemand}
            />
          </section>
        </TabsContent>

        <TabsContent value="vacations" className="space-y-6 mt-6">
          <section aria-labelledby="vacations-form-title">
            <h2 id="vacations-form-title" className="text-2xl font-headline font-semibold mb-4 text-primary">Registrar Novas Férias</h2>
            <VacationForm onAddVacation={handleAddVacation} />
          </section>
          <section aria-labelledby="vacations-list-title">
            <h2 id="vacations-list-title" className="text-2xl font-headline font-semibold my-6 text-primary">Calendário de Férias</h2>
            <VacationList 
              vacations={vacations} 
              demands={demands}
              onDeleteVacation={handleDeleteVacation}
              onUpdateVacation={handleUpdateVacation}
              onCheckConflict={handleCheckConflict}
            />
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
