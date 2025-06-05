
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
import { ListChecks, CalendarCheck, PlusCircle } from 'lucide-react';
import AppHeader from '@/components/AppHeader'; 
import { Button } from '@/components/ui/button';

const DEMANDS_STORAGE_KEY = 'autoSb_demands';
const VACATIONS_STORAGE_KEY = 'autoSb_vacations';

export default function GestaoFeriasPage() {
  const [demands, setDemands] = useState<Demand[]>([]);
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("demands");
  const [showDemandForm, setShowDemandForm] = useState(false);
  const [showVacationForm, setShowVacationForm] = useState(false);

  useEffect(() => {
    const storedDemands = localStorage.getItem(DEMANDS_STORAGE_KEY);
    if (storedDemands) {
      try {
        const parsedDemands = JSON.parse(storedDemands);
        if(Array.isArray(parsedDemands)) setDemands(parsedDemands);
      } catch (e) {
        console.error("Failed to parse demands from localStorage", e);
        setDemands([]);
      }
    }
    const storedVacations = localStorage.getItem(VACATIONS_STORAGE_KEY);
    if (storedVacations) {
      try {
        const parsedVacations = JSON.parse(storedVacations);
        if(Array.isArray(parsedVacations)) setVacations(parsedVacations);
      } catch (e) {
        console.error("Failed to parse vacations from localStorage", e);
        setVacations([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(DEMANDS_STORAGE_KEY, JSON.stringify(demands));
  }, [demands]);

  useEffect(() => {
    localStorage.setItem(VACATIONS_STORAGE_KEY, JSON.stringify(vacations));
  }, [vacations]);

  const handleAddDemand = (newDemand: Demand) => {
    setDemands(prev => [newDemand, ...prev]);
    setShowDemandForm(false); // Oculta o formulário após adicionar
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
    setShowVacationForm(false); // Oculta o formulário após adicionar
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
      projectPriority: targetDemand.priority,
      projectDescription: targetDemand.description,
    };

    try {
      const result: AIConflictCheckResult = await vacationConflictDetection(aiInput);
      setVacations(prevVacations => 
        prevVacations.map(v => 
          v.id === vacation.id 
            ? { ...v, conflictCheckResult: { ...result, checkedAgainstDemandId: demandId, checkedDemandDescription: targetDemand.title } }
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

  const handleExportData = () => {
    const dataToExport = { demands, vacations };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "autoSb_data.json";
    link.click();
    toast({ title: "Dados Exportados", description: "Seus dados foram exportados como autoSb_data.json." });
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result;
            if (typeof content === 'string') {
              const parsedData = JSON.parse(content);
              if (parsedData && Array.isArray(parsedData.demands) && Array.isArray(parsedData.vacations)) {
                const validDemands = parsedData.demands.filter((d: any) => 
                  d.id && d.title && d.description && d.priority && d.dueDate && d.status
                );
                const validVacations = parsedData.vacations.filter((v: any) =>
                  v.id && v.employeeName && v.startDate && v.endDate
                );
                setDemands(validDemands);
                setVacations(validVacations);
                toast({ title: "Dados Importados", description: "Seus dados foram importados com sucesso." });
              } else {
                toast({ title: "Erro na Importação", description: "Formato de arquivo inválido. Certifique-se de que o JSON contém 'demands' e 'vacations' como arrays.", variant: "destructive" });
              }
            }
          } catch (error) {
            toast({ title: "Erro na Importação", description: "Não foi possível ler o arquivo JSON.", variant: "destructive" });
            console.error("Import error:", error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <>
      <AppHeader onExport={handleExportData} onImport={handleImportData} />
      <div className="w-full space-y-8 mt-0">
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
            <section aria-labelledby="demands-form-section-title">
              <div className="flex justify-between items-center mb-4">
                <h2 id="demands-form-section-title" className="text-2xl font-headline font-semibold text-primary">Registrar Nova Demanda</h2>
                <Button variant="outline" onClick={() => setShowDemandForm(!showDemandForm)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> {showDemandForm ? 'Ocultar Formulário' : 'Adicionar Demanda'}
                </Button>
              </div>
              {showDemandForm && (
                <DemandForm 
                  onAddDemand={handleAddDemand} 
                  onClose={() => setShowDemandForm(false)} 
                />
              )}
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
            <section aria-labelledby="vacations-form-section-title">
               <div className="flex justify-between items-center mb-4">
                <h2 id="vacations-form-section-title" className="text-2xl font-headline font-semibold text-primary">Registrar Novas Férias</h2>
                <Button variant="outline" onClick={() => setShowVacationForm(!showVacationForm)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> {showVacationForm ? 'Ocultar Formulário' : 'Adicionar Férias'}
                </Button>
              </div>
              {showVacationForm && (
                <VacationForm 
                  onAddVacation={handleAddVacation} 
                  onClose={() => setShowVacationForm(false)} 
                />
              )}
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
    </>
  );
}
