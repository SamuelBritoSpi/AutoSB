
"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DemandForm from '@/components/demands/DemandForm';
import DemandList from '@/components/demands/DemandList';
import VacationForm from '@/components/vacations/VacationForm';
import VacationList from '@/components/vacations/VacationList';
import EmployeeForm from '@/components/employees/EmployeeForm';
import EmployeeList from '@/components/employees/EmployeeList';
import DashboardTab from '@/components/dashboard/DashboardTab';
import CalendarView from '@/components/calendar/CalendarView';
import type { Demand, Vacation, Employee, MedicalCertificate, DemandStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ListChecks, CalendarCheck, PlusCircle, Users, LayoutDashboard, Calendar as CalendarIconLucide, Menu, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  addDemand as addDbDemand,
  updateDemand as updateDbDemand, 
  deleteDemand as deleteDbDemand,
  addVacation as addDbVacation,
  updateVacation as updateDbVacation,
  deleteVacation as deleteDbVacation,
  addEmployee as addDbEmployee,
  updateEmployee as updateDbEmployee,
  deleteEmployee as deleteDbEmployee,
  addCertificate as addDbCertificate,
  deleteCertificate as deleteDbCertificate,
  addDemandStatus as addDbDemandStatus,
  deleteDemandStatus as deleteDbDemandStatus,
  getAllData,
} from '@/lib/idb';
import { sendNotification } from '@/ai/flows/send-notification-flow';

// Define the fixed statuses that should always exist.
const FIXED_STATUSES: Record<string, Omit<DemandStatus, 'id' | 'label'>> = {
  "Aberto": { order: 0, icon: "Inbox", color: "bg-blue-500" },
  "Aguardando Resposta": { order: 1, icon: "MailQuestion", color: "bg-yellow-500" },
  "Finalizado": { order: 99, icon: "CheckCircle2", color: "bg-green-500" },
};

export default function GestaoFeriasPage() {
  const { toast } = useToast();

  const [demands, setDemands] = useState<Demand[]>([]);
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [certificates, setCertificates] = useState<MedicalCertificate[]>([]);
  const [demandStatuses, setDemandStatuses] = useState<DemandStatus[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [showDemandForm, setShowDemandForm] = useState(false);
  const [showVacationForm, setShowVacationForm] = useState(false);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const initialData = await getAllData();
        setDemands(initialData.demands);
        setVacations(initialData.vacations);
        setEmployees(initialData.employees);
        setCertificates(initialData.certificates);

        // Ensure fixed statuses exist
        const existingLabels = new Set(initialData.demandStatuses.map(s => s.label));
        let statuses = [...initialData.demandStatuses];
        let needsUpdate = false;

        for (const [label, props] of Object.entries(FIXED_STATUSES)) {
            if (!existingLabels.has(label)) {
                needsUpdate = true;
                const newStatusData: Omit<DemandStatus, 'id'> = { label, ...props };
                const savedStatus = await addDbDemandStatus(newStatusData);
                statuses.push(savedStatus);
            }
        }

        if (needsUpdate) {
            statuses.sort((a, b) => a.order - b.order);
        }
        
        setDemandStatuses(statuses);
      } catch (error) {
        console.error("Failed to load initial data", error);
        toast({ variant: 'destructive', title: "Erro ao Carregar Dados", description: "Não foi possível buscar os dados do servidor."})
      } finally {
        setDataLoaded(true);
      }
    };
    
    loadData();
  }, [toast]);


  const tabOptions = [
    { value: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="mr-2 h-5 w-5" /> },
    { value: "calendar", label: "Calendário", icon: <CalendarIconLucide className="mr-2 h-5 w-5" /> },
    { value: "demands", label: "Demandas", icon: <ListChecks className="mr-2 h-5 w-5" /> },
    { value: "vacations", label: "Férias", icon: <CalendarCheck className="mr-2 h-5 w-5" /> },
    { value: "employees", label: "Funcionários", icon: <Users className="mr-2 h-5 w-5" /> },
  ];

  const handleAddDemand = (demandData: Omit<Demand, 'id'>) => {
    const tempId = `temp-${Date.now()}`;
    const newDemand: Demand = { ...demandData, id: tempId, ownerId: demandData.ownerId || null };
    const originalDemands = [...demands];

    setDemands(prev => [newDemand, ...prev]);
    setShowDemandForm(false);
    toast({ title: "Demanda Adicionada", description: "A demanda foi salva com sucesso." });
    
    addDbDemand(newDemand)
      .then(savedDemand => {
        setDemands(prev => prev.map(d => d.id === tempId ? savedDemand : d));
      })
      .catch(error => {
        console.error("Failed to add demand:", error);
        toast({ variant: 'destructive', title: 'Erro de Sincronização', description: 'Não foi possível salvar a demanda.' });
        setDemands(originalDemands);
      });
  };

  const handleUpdateDemand = (updatedDemand: Demand) => {
    const originalDemands = [...demands];
    const finalDemand = {
      ...updatedDemand,
      ownerId: updatedDemand.ownerId || null,
    };
    setDemands(prev => prev.map(d => d.id === finalDemand.id ? finalDemand : d));
    
    updateDbDemand(finalDemand).catch(error => {
      console.error("Failed to update demand:", error);
      toast({ variant: 'destructive', title: 'Erro de Sincronização', description: 'Não foi possível atualizar a demanda.' });
      setDemands(originalDemands);
    });
  };

  const handleDeleteDemand = (id: string) => {
    const originalDemands = [...demands];
    const demandToDelete = demands.find(d => d.id === id);
    
    setDemands(prev => prev.filter(d => d.id !== id));
    toast({ title: "Demanda Excluída", description: "A demanda foi removida." });

    if (demandToDelete) {
      deleteDbDemand(id).catch(error => {
        console.error("Failed to delete demand:", error);
        toast({ variant: 'destructive', title: 'Erro de Sincronização', description: 'Não foi possível excluir a demanda.' });
        setDemands(originalDemands);
      });
    }
  };

  const handleUpdateDemandStatus = (id: string, status: string) => {
    const demandToUpdate = demands.find(d => d.id === id);
    if(demandToUpdate) {
      const updatedDemand = { ...demandToUpdate, status };
      handleUpdateDemand(updatedDemand);
      toast({ title: "Status Atualizado", description: `Status da demanda alterado.`});

      // Send notification if finalized
      const finalStatus = demandStatuses.find(s => s.label === "Finalizado");
      if (status === finalStatus?.label) {
        const owner = employees.find(e => e.id === updatedDemand.ownerId);
        if (owner?.fcmTokens && owner.fcmTokens.length > 0) {
            owner.fcmTokens.forEach(token => {
                sendNotification({
                    token,
                    title: 'Demanda Finalizada!',
                    body: `A demanda "${updatedDemand.title}" foi concluída.`
                }).catch(console.error);
            });
        }
      }
    }
  };

  const handleAddVacation = (vacationData: Omit<Vacation, 'id'>) => {
    const tempId = `temp-vacation-${Date.now()}`;
    const newVacation: Vacation = { ...vacationData, id: tempId };
    const originalVacations = [...vacations];

    setVacations(prev => [newVacation, ...prev]);
    setShowVacationForm(false);
    toast({ title: "Férias Adicionadas", description: "Sincronizando com a nuvem..." });
    
    addDbVacation(vacationData)
      .then(savedVacation => {
        setVacations(prev => prev.map(v => v.id === tempId ? savedVacation : v));
      })
      .catch(error => {
       console.error("Failed to add vacation:", error);
       toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível adicionar as férias.' });
       setVacations(originalVacations);
    });
  };
  
  const handleUpdateVacation = (updatedVacation: Vacation) => {
    const originalVacations = [...vacations];
    setVacations(prev => prev.map(v => v.id === updatedVacation.id ? updatedVacation : v));

    updateDbVacation(updatedVacation).catch(error => {
       console.error("Failed to update vacation:", error);
       toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar as férias.' });
       setVacations(originalVacations);
    });
  };

  const handleDeleteVacation = (id: string) => {
    const originalVacations = [...vacations];
    setVacations(prev => prev.filter(v => v.id !== id));
    toast({ title: "Férias Excluídas", description: "O registro de férias foi removido." });

    deleteDbVacation(id).catch(error => {
       console.error("Failed to delete vacation:", error);
       toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir as férias.' });
       setVacations(originalVacations);
    });
  };

  const handleAddEmployee = (employeeData: Omit<Employee, 'id'>) => {
    const tempId = `temp-employee-${Date.now()}`;
    const newEmployee: Employee = { ...employeeData, id: tempId };
    const originalEmployees = [...employees];

    setEmployees(prev => [newEmployee, ...prev]);
    setShowEmployeeForm(false);
    toast({ title: "Funcionário Adicionado", description: "Sincronizando..." });

    addDbEmployee(employeeData)
      .then(savedEmployee => {
        setEmployees(prev => prev.map(e => e.id === tempId ? savedEmployee : e));
      })
      .catch(error => {
       console.error("Failed to add employee:", error);
       toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível adicionar o funcionário.' });
       setEmployees(originalEmployees);
    });
  };

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    const originalEmployees = [...employees];
    setEmployees(prev => prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));

    updateDbEmployee(updatedEmployee).catch(error => {
       console.error("Failed to update employee:", error);
       toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar o funcionário.' });
       setEmployees(originalEmployees);
    });
  };

  const handleDeleteEmployee = (id: string) => {
    const originalEmployees = [...employees];
    const originalCertificates = [...certificates];
    
    const relatedCerts = certificates.filter(c => c.employeeId === id);
    
    setEmployees(prev => prev.filter(e => e.id !== id));
    setCertificates(prev => prev.filter(c => c.employeeId !== id));
    toast({ title: "Funcionário Excluído", description: "O registro do funcionário e seus atestados foram removidos." });

    deleteDbEmployee(id).then(() => {
        const deletePromises = relatedCerts.map(cert => deleteDbCertificate(cert.id));
        return Promise.all(deletePromises);
    })
    .catch(error => {
      console.error("Failed to delete employee or their certificates:", error);
      toast({ variant: 'destructive', title: 'Erro de Sincronização', description: 'Não foi possível excluir o funcionário.' });
      setEmployees(originalEmployees);
      setCertificates(originalCertificates);
    });
  };

  const handleAddCertificate = (certificateData: Omit<MedicalCertificate, 'id'>) => {
    const tempId = `temp-cert-${Date.now()}`;
    const newCertificate: MedicalCertificate = { ...certificateData, id: tempId };
    const originalCertificates = [...certificates];

    setCertificates(prev => [newCertificate, ...prev]);
    toast({ title: "Atestado Adicionado", description: "Sincronizando..." });

    addDbCertificate(certificateData)
      .then(savedCertificate => {
        setCertificates(prev => prev.map(c => c.id === tempId ? savedCertificate : c));
      })
      .catch(error => {
       console.error("Failed to add certificate:", error);
       toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível adicionar o atestado.' });
       setCertificates(originalCertificates);
    });
  };
  
  const handleDeleteCertificate = (id: string) => {
    const originalCertificates = [...certificates];
    setCertificates(prev => prev.filter(c => c.id !== id));
    toast({ title: "Atestado Excluído", description: "O registro do atestado foi removido." });

    deleteDbCertificate(id).catch(error => {
       console.error("Failed to delete certificate:", error);
       toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir o atestado.' });
       setCertificates(originalCertificates);
    });
  };

   const addGlobalDemandStatus = (label: string, icon: string, color: string) => {
      const newOrder = demandStatuses.length > 0 ? Math.max(...demandStatuses.filter(s => s.label !== 'Finalizado').map(s => s.order)) + 1 : 0;
      const tempId = `temp-status-${Date.now()}`;
      const newStatusData: Omit<DemandStatus, 'id'> = { label, icon, color, order: newOrder };
      
      const optimisticStatus: DemandStatus = { ...newStatusData, id: tempId };
      setDemandStatuses(prev => [...prev, optimisticStatus].sort((a, b) => a.order - b.order));

      addDbDemandStatus(newStatusData)
        .then(savedStatus => {
          setDemandStatuses(prev => prev.map(s => s.id === tempId ? savedStatus : s).sort((a,b) => a.order - b.order));
          toast({ title: "Status Adicionado", description: `"${label}" foi adicionado com sucesso.` });
        })
        .catch(error => {
          toast({ variant: 'destructive', title: "Erro", description: "Não foi possível adicionar o status." });
          setDemandStatuses(prev => prev.filter(s => s.id !== tempId));
        });
    };

    const deleteGlobalDemandStatus = async (id: string) => {
      const statusToDelete = demandStatuses.find(s => s.id === id);
      if (!statusToDelete) return;
      
      if (Object.keys(FIXED_STATUSES).includes(statusToDelete.label)) {
        toast({ variant: 'destructive', title: "Ação não permitida", description: "Este é um status fixo e não pode ser excluído." });
        return;
      }
      
      const originalStatuses = [...demandStatuses];
      const demandsToUpdate = demands.filter(d => d.status === statusToDelete.label);
      const newStatusLabel = demandStatuses.find(s => s.label === 'Aberto')?.label || 'Aberto';

      setDemandStatuses(prev => prev.filter(s => s.id !== id));
      if (demandsToUpdate.length > 0) {
        setDemands(prev => prev.map(d => d.status === statusToDelete.label ? { ...d, status: newStatusLabel } : d));
      }
      
      try {
        if (demandsToUpdate.length > 0) {
          const updatePromises = demandsToUpdate.map(d => updateDbDemand({ ...d, status: newStatusLabel }));
          await Promise.all(updatePromises);
        }
        await deleteDbDemandStatus(id);
        toast({ title: "Status Removido", description: `"${statusToDelete.label}" foi removido.`});
      } catch (error) {
        toast({ variant: 'destructive', title: "Erro de Sincronização", description: 'Não foi possível remover o status.' });
        setDemandStatuses(originalStatuses);
         if (demandsToUpdate.length > 0) {
           setDemands(prev => prev.map(d => {
              const originalDemand = demandsToUpdate.find(upd => upd.id === d.id);
              return originalDemand ? { ...d, status: originalDemand.status } : d;
           }));
         }
      }
    };


  if (!dataLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
          <div className="text-center flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-lg font-semibold">Carregando dados...</p>
              <p className="text-muted-foreground">Por favor, aguarde.</p>
          </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 mt-0">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-center">
            <TabsList className="grid w-full grid-cols-5 md:w-5/6 mx-auto">
                {tabOptions.map(tab => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                        {tab.icon} {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex justify-center px-4">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full">
                        <Menu className="mr-2 h-5 w-5" />
                        {tabOptions.find(t => t.value === activeTab)?.label || 'Menu'}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-[--radix-dropdown-menu-trigger-width]]">
                    {tabOptions.map(tab => (
                         <DropdownMenuItem key={tab.value} onSelect={() => setActiveTab(tab.value)}>
                            {tab.icon} {tab.label}
                         </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
             </DropdownMenu>
        </div>
        
        <TabsContent value="dashboard" className="space-y-6 mt-6">
          <DashboardTab demands={demands} employees={employees} certificates={certificates} demandStatuses={demandStatuses}/>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6 mt-6">
          <CalendarView demands={demands} vacations={vacations} />
        </TabsContent>

        <TabsContent value="demands" className="space-y-6 mt-6">
          <section aria-labelledby="demands-form-section-title">
            <div className="flex justify-between items-center mb-4">
              <h2 id="demands-form-section-title" className="text-2xl font-headline font-semibold text-primary">Registrar Nova Demanda</h2>
              <Button variant="outline" onClick={() => setShowDemandForm(!showDemandForm)}>
                <PlusCircle className="mr-2 h-4 w-4" /> {showDemandForm ? 'Ocultar' : 'Adicionar'}
              </Button>
            </div>
            {showDemandForm && (
              <DemandForm 
                onAddDemand={handleAddDemand} 
                onClose={() => setShowDemandForm(false)} 
                employees={employees}
              />
            )}
          </section>
          <section aria-labelledby="demands-list-title">
            <h2 id="demands-list-title" className="text-2xl font-headline font-semibold my-6 text-primary">Lista de Demandas</h2>
            <DemandList 
              demands={demands}
              demandStatuses={demandStatuses}
              onUpdateStatus={handleUpdateDemandStatus}
              onDeleteDemand={handleDeleteDemand}
              onUpdateDemand={handleUpdateDemand}
              onAddStatus={addGlobalDemandStatus}
              onDeleteStatus={deleteGlobalDemandStatus}
              employees={employees}
            />
          </section>
        </TabsContent>

        <TabsContent value="vacations" className="space-y-6 mt-6">
          <section aria-labelledby="vacations-form-section-title">
              <div className="flex justify-between items-center mb-4">
              <h2 id="vacations-form-section-title" className="text-2xl font-headline font-semibold text-primary">Registrar Novas Férias</h2>
              <Button variant="outline" onClick={() => setShowVacationForm(!showVacationForm)}>
                <PlusCircle className="mr-2 h-4 w-4" /> {showVacationForm ? 'Ocultar' : 'Adicionar'}
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
            />
          </section>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6 mt-6">
          <section aria-labelledby="employees-form-section-title">
              <div className="flex justify-between items-center mb-4">
              <h2 id="employees-form-section-title" className="text-2xl font-headline font-semibold text-primary">Registrar Novo Funcionário</h2>
              <Button variant="outline" onClick={() => setShowEmployeeForm(!showEmployeeForm)}>
                <PlusCircle className="mr-2 h-4 w-4" /> {showEmployeeForm ? 'Ocultar' : 'Adicionar'}
              </Button>
            </div>
            {showEmployeeForm && (
              <EmployeeForm 
                onAddEmployee={handleAddEmployee}
                onClose={() => setShowEmployeeForm(false)} />
            )}
          </section>
          <section aria-labelledby="employees-list-title">
            <h2 id="employees-list-title" className="text-2xl font-headline font-semibold my-6 text-primary">Lista de Funcionários</h2>
            <EmployeeList 
              employees={employees}
              certificates={certificates}
              onDeleteEmployee={handleDeleteEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onAddCertificate={handleAddCertificate}
              onDeleteCertificate={handleDeleteCertificate}
            />
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
