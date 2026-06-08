
"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import DemandForm from '@/components/demands/DemandForm';
import DemandList from '@/components/demands/DemandList';
import VacationForm from '@/components/vacations/VacationForm';
import VacationList from '@/components/vacations/VacationList';
import JustifiedAbsenceList from '@/components/absences/JustifiedAbsenceList';
import EmployeeForm from '@/components/employees/EmployeeForm';
import EmployeeList from '@/components/employees/EmployeeList';
import DashboardTab from '@/components/dashboard/DashboardTab';
import CardManagementPage from '@/components/cards/CardManagementPage';
import UniformManagementPage from '@/components/uniforms/UniformManagementPage';
import SchoolManagementDialog from '@/components/schools/SchoolManagementDialog';
import ThirdPartyEmployeePage from '@/components/employees/ThirdPartyEmployeePage';
import type { Demand, Vacation, Employee, MedicalCertificate, DemandStatus, JustifiedAbsence, Card, Uniform, School, ThirdPartyEmployee } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ListChecks, CalendarCheck, PlusCircle, Users, LayoutDashboard, Menu, Loader2, ListPlus, UserPlus, ClipboardList, FileText, CreditCard, Shirt, UserCircle2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  addDemand as addDbDemand,
  updateDemand as updateDbDemand, 
  deleteDemand as deleteDbDemand,
  addVacation as addDbVacation,
  updateVacation as updateDbVacation,
  deleteVacation as deleteDbVacation,
  addJustifiedAbsence as addDbJustifiedAbsence,
  updateJustifiedAbsence as updateDbJustifiedAbsence,
  deleteJustifiedAbsence as deleteDbJustifiedAbsence,
  addEmployee as addDbEmployee,
  updateEmployee as updateDbEmployee,
  deleteEmployee as deleteDbEmployee,
  addThirdPartyEmployee as addDbThirdPartyEmployee,
  updateThirdPartyEmployee as updateDbThirdPartyEmployee,
  deleteThirdPartyEmployee as deleteDbThirdPartyEmployee,
  addCertificate as addDbCertificate,
  deleteCertificate as deleteDbCertificate,
  addDemandStatus as addDbDemandStatus,
  deleteDemandStatus as deleteDbDemandStatus,
  updateDemandStatus as updateDbDemandStatus,
  addCard as addDbCard,
  updateCard as updateDbCard,
  deleteCard as deleteDbCard,
  addUniform as addDbUniform,
  updateUniform as updateDbUniform,
  deleteUniform as deleteDbUniform,
  addSchool as addDbSchool,
  deleteSchool as deleteDbSchool,
  getAllData,
  getDemandStatuses,
} from '@/lib/idb';
import { sendNotification } from '@/ai/flows/send-notification-flow';
import { Card as ShadCnCard, CardHeader, CardTitle } from './ui/card';
import { cn } from '@/lib/utils';

// Define the fixed statuses that should always exist.
const FIXED_STATUSES: Record<string, Omit<DemandStatus, 'id'>> = {
  "Aberto": { label: "Aberto", order: 0, icon: "Inbox", color: "text-blue-500" },
  "Aguardando Resposta": { label: "Aguardando Resposta", order: 1, icon: "MailQuestion", color: "text-yellow-500" },
  "Finalizado": { label: "Finalizado", order: 99, icon: "CheckCircle2", color: "text-green-500" },
};


// --- Initialization Logic with Lock ---
let isInitializing = false;

async function ensureFixedStatuses(): Promise<DemandStatus[]> {
    if (isInitializing) {
        return getDemandStatuses();
    }
    isInitializing = true;

    try {
        const currentStatuses = await getDemandStatuses();
        const existingLabels = new Set(currentStatuses.map(s => s.label));
        const statusesToAdd: Omit<DemandStatus, 'id'>[] = [];

        for (const [label, props] of Object.entries(FIXED_STATUSES)) {
            if (!existingLabels.has(label)) {
                statusesToAdd.push({ ...props });
            }
        }

        if (statusesToAdd.length > 0) {
            await Promise.all(statusesToAdd.map(statusData => addDbDemandStatus(statusData)));
            return getDemandStatuses();
        }

        return currentStatuses;
    } finally {
        isInitializing = false;
    }
}


export default function GestaoFeriasPage() {
  const { toast } = useToast();

  const [demands, setDemands] = useState<Demand[]>([]);
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [justifiedAbsences, setJustifiedAbsences] = useState<JustifiedAbsence[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [thirdPartyEmployees, setThirdPartyEmployees] = useState<ThirdPartyEmployee[]>([]);
  const [certificates, setCertificates] = useState<MedicalCertificate[]>([]);
  const [demandStatuses, setDemandStatuses] = useState<DemandStatus[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [uniforms, setUniforms] = useState<Uniform[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [showDemandForm, setShowDemandForm] = useState(false);
  const [showVacationForm, setShowVacationForm] = useState(false);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showSchoolManagement, setShowSchoolManagement] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const finalStatuses = await ensureFixedStatuses();
        setDemandStatuses(finalStatuses.sort((a, b) => a.order - b.order));
        
        const initialData = await getAllData();
        setDemands(initialData.demands);
        setVacations(initialData.vacations);
        setJustifiedAbsences(initialData.justifiedAbsences || []);
        setEmployees(initialData.employees);
        setThirdPartyEmployees(initialData.thirdPartyEmployees || []);
        setCertificates(initialData.certificates);
        setCards(initialData.cards || []);
        setUniforms(initialData.uniforms || []);
        setSchools(initialData.schools || []);

        const freshStatuses = await getDemandStatuses();
        setDemandStatuses(freshStatuses.sort((a, b) => a.order - b.order));

      } catch (error) {
        console.error("Failed to load initial data", error);
        toast({ variant: 'destructive', title: "Erro ao Carregar Dados", description: "Não foi possível buscar os dados do servidor."})
      } finally {
        setDataLoaded(true);
      }
    };
    
    loadData();
  }, [toast]);


  // Tabs individuais
  const soloTabs = [
    { value: "dashboard",  label: "Dashboard",          icon: <LayoutDashboard className="h-4 w-4" /> },
    { value: "demands",    label: "Demandas",            icon: <ListChecks       className="h-4 w-4" /> },
    { value: "vacations",  label: "Férias/Afastamento",  icon: <CalendarCheck    className="h-4 w-4" /> },
  ];

  // Grupos de dropdown no desktop
  const navGroups = [
    {
      label: "Funcionários",
      icon: <Users className="h-4 w-4" />,
      items: [
        { value: "employees",   label: "Funcionários/Atestados", icon: <Users        className="h-4 w-4" /> },
        { value: "absences",    label: "Faltas Justificadas",     icon: <FileText     className="h-4 w-4" /> },
        { value: "third-party", label: "Terceirizados",           icon: <UserCircle2  className="h-4 w-4" /> },
      ],
    },
    {
      label: "Patrimônio",
      icon: <CreditCard className="h-4 w-4" />,
      items: [
        { value: "cards",    label: "Cartões",    icon: <CreditCard className="h-4 w-4" /> },
        { value: "uniforms", label: "Fardamento", icon: <Shirt      className="h-4 w-4" /> },
      ],
    },
  ];

  // Lista plana usada apenas no mobile
  const allTabOptions = [
    ...soloTabs,
    ...navGroups.flatMap(g => g.items),
  ];

  // Label atual para o botão do mobile
  const activeLabel = allTabOptions.find(t => t.value === activeTab)?.label ?? 'Menu';

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

  const handleAddJustifiedAbsence = (absenceData: Omit<JustifiedAbsence, 'id'>) => {
    const tempId = `temp-absence-${Date.now()}`;
    const newAbsence: JustifiedAbsence = { ...absenceData, id: tempId };
    const originalAbsences = [...justifiedAbsences];

    setJustifiedAbsences(prev => [newAbsence, ...prev]);
    toast({ title: "Falta Justificada Adicionada", description: "Sincronizando com a nuvem..." });
    
    addDbJustifiedAbsence(absenceData)
      .then(savedAbsence => {
        setJustifiedAbsences(prev => prev.map(a => a.id === tempId ? savedAbsence : a));
      })
      .catch(error => {
       console.error("Failed to add justified absence:", error);
       toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível adicionar a falta justificada.' });
       setJustifiedAbsences(originalAbsences);
    });
  };
  
  const handleUpdateJustifiedAbsence = (updatedAbsence: JustifiedAbsence) => {
    const originalAbsences = [...justifiedAbsences];
    setJustifiedAbsences(prev => prev.map(a => a.id === updatedAbsence.id ? updatedAbsence : a));

    updateDbJustifiedAbsence(updatedAbsence).catch(error => {
       console.error("Failed to update justified absence:", error);
       toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar a falta justificada.' });
       setJustifiedAbsences(originalAbsences);
    });
  };

  const handleDeleteJustifiedAbsence = (id: string) => {
    const originalAbsences = [...justifiedAbsences];
    setJustifiedAbsences(prev => prev.filter(a => a.id !== id));
    toast({ title: "Falta Justificada Excluída", description: "O registro de falta foi removido." });

    deleteDbJustifiedAbsence(id).catch(error => {
       console.error("Failed to delete justified absence:", error);
       toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir a falta justificada.' });
       setJustifiedAbsences(originalAbsences);
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
    setCertificates(prev => prev.filter(c => c.employeeId === id));
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

  // --- Third Party Employee Handlers ---
  const handleAddThirdPartyEmployee = (empData: Omit<ThirdPartyEmployee, 'id'>) => {
    const tempId = `temp-tp-${Date.now()}`;
    const newEmp: ThirdPartyEmployee = { ...empData, id: tempId };
    const original = [...thirdPartyEmployees];

    setThirdPartyEmployees(prev => [newEmp, ...prev]);
    toast({ title: "Funcionário Terceirizado Adicionado" });

    addDbThirdPartyEmployee(empData)
      .then(saved => {
        setThirdPartyEmployees(prev => prev.map(e => e.id === tempId ? saved : e));
      })
      .catch(error => {
        console.error(error);
        toast({ variant: 'destructive', title: 'Erro ao salvar' });
        setThirdPartyEmployees(original);
      });
  };

  const handleUpdateThirdPartyEmployee = (emp: ThirdPartyEmployee) => {
    const original = [...thirdPartyEmployees];
    setThirdPartyEmployees(prev => prev.map(e => e.id === emp.id ? emp : e));

    updateDbThirdPartyEmployee(emp).catch(error => {
      console.error(error);
      toast({ variant: 'destructive', title: 'Erro ao atualizar' });
      setThirdPartyEmployees(original);
    });
  };

  const handleDeleteThirdPartyEmployee = (id: string) => {
    const original = [...thirdPartyEmployees];
    setThirdPartyEmployees(prev => prev.filter(e => e.id !== id));
    toast({ title: "Funcionário Excluído" });

    deleteDbThirdPartyEmployee(id).catch(error => {
      console.error(error);
      toast({ variant: 'destructive', title: 'Erro ao excluir' });
      setThirdPartyEmployees(original);
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
       toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir the atestado.' });
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

    const updateGlobalDemandStatus = (updatedStatus: DemandStatus) => {
      const originalStatuses = [...demandStatuses];
      setDemandStatuses(prev => prev.map(s => (s.id === updatedStatus.id ? updatedStatus : s)).sort((a,b) => a.order - b.order));
      
      updateDbDemandStatus(updatedStatus)
          .then(() => {
              toast({ title: "Status Atualizado", description: `"${updatedStatus.label}" foi atualizado.` });
          })
          .catch(error => {
              console.error("Failed to update status:", error);
              toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar o status.' });
              setDemandStatuses(originalStatuses);
          });
    };

    // --- Card Handlers ---
    const handleAddCard = (cardData: Omit<Card, 'id'>) => {
        const tempId = `temp-card-${Date.now()}`;
        const newCard: Card = { ...cardData, id: tempId };
        const originalCards = [...cards];

        setCards(prev => [newCard, ...prev].sort((a, b) => new Date(b.arrivalDate).getTime() - new Date(a.arrivalDate).getTime()));
        toast({ title: "Cartão Adicionado", description: "Sincronizando..." });

        addDbCard(cardData)
            .then(savedCard => {
                setCards(prev => prev.map(c => c.id === tempId ? savedCard : c));
            })
            .catch(error => {
                console.error("Failed to add card:", error);
                toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível adicionar o cartão.' });
                setCards(originalCards);
            });
    };

    const handleUpdateCard = (updatedCard: Card) => {
        const originalCards = [...cards];
        setCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));

        updateDbCard(updatedCard).catch(error => {
            console.error("Failed to update card:", error);
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar o cartão.' });
            setCards(originalCards);
        });
    };

    const handleDeleteCard = (id: string) => {
        const originalCards = [...cards];
        setCards(prev => prev.filter(c => c.id !== id));
        toast({ title: "Cartão Excluído" });

        deleteDbCard(id).catch(error => {
            console.error("Failed to delete card:", error);
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir o cartão.' });
            setCards(originalCards);
        });
    };

    // --- Uniform Handlers ---
    const handleAddUniform = (uniformData: Omit<Uniform, 'id'>) => {
        const tempId = `temp-uniform-${Date.now()}`;
        const newUniform: Uniform = { ...uniformData, id: tempId };
        const originalUniforms = [...uniforms];

        setUniforms(prev => [newUniform, ...prev].sort((a, b) => new Date(b.arrivalDate).getTime() - new Date(a.arrivalDate).getTime()));
        toast({ title: "Registro de Fardamento Adicionado", description: "Sincronizando..." });

        addDbUniform(uniformData)
            .then(savedUniform => {
                setUniforms(prev => prev.map(u => u.id === tempId ? savedUniform : u));
            })
            .catch(error => {
                console.error("Failed to add uniform record:", error);
                toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar o registro.' });
                setUniforms(originalUniforms);
            });
    };

    const handleUpdateUniform = (updatedUniform: Uniform) => {
        const originalUniforms = [...uniforms];
        setUniforms(prev => prev.map(u => u.id === updatedUniform.id ? updatedUniform : u));

        updateDbUniform(updatedUniform).catch(error => {
            console.error("Failed to update uniform record:", error);
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar o registro.' });
            setUniforms(originalUniforms);
        });
    };

    const handleDeleteUniform = (id: string) => {
        const originalUniforms = [...uniforms];
        setUniforms(prev => prev.filter(u => u.id !== id));
        toast({ title: "Registro Excluído" });

        deleteDbUniform(id).catch(error => {
            console.error("Failed to delete uniform record:", error);
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir o registro.' });
            setUniforms(originalUniforms);
        });
    };

    const handleAddSchool = async (name: string) => {
        try {
            const newSchool = await addDbSchool({ name });
            setSchools(prev => [...prev, newSchool].sort((a, b) => a.name.localeCompare(b.name)));
            return newSchool;
        } catch (error) {
            toast({ variant: 'destructive', title: "Erro", description: "Não foi possível adicionar o colégio." });
            throw error;
        }
    };

    const handleDeleteSchool = async (id: string) => {
        try {
            await deleteDbSchool(id);
            setSchools(prev => prev.filter(s => s.id !== id));
            toast({ title: "Colégio Excluído" });
        } catch (error) {
            toast({ variant: 'destructive', title: "Erro", description: "Não foi possível excluir o colégio." });
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
  
  const containerClass = "p-4 md:p-6 mx-auto";

  return (
    <div className="w-full space-y-8 mt-0">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

        {/* ── Desktop Navigation ── */}
        <div className="hidden md:flex justify-center border-b bg-background/95 backdrop-blur sticky top-0 z-30">
          <div className="container mx-auto">
            <nav className="flex items-end h-12">

              {/* Tabs individuais */}
              {soloTabs.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "flex items-center gap-2 px-4 h-full text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                    activeTab === tab.value
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                  )}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}

              {/* Grupos com dropdown no hover */}
              {navGroups.map(group => {
                const groupActive = group.items.some(i => i.value === activeTab);
                const activeItem  = group.items.find(i => i.value === activeTab);
                return (
                  <DropdownMenu key={group.label}>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={cn(
                          "flex items-center gap-2 px-4 h-full text-sm font-medium border-b-2 transition-colors whitespace-nowrap outline-none",
                          groupActive
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                        )}
                      >
                        {groupActive ? activeItem!.icon : group.icon}
                        {groupActive ? activeItem!.label : group.label}
                        <ChevronDown className="h-3 w-3 opacity-60" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-52">
                      <DropdownMenuLabel className="text-xs text-muted-foreground">{group.label}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {group.items.map(item => (
                        <DropdownMenuItem
                          key={item.value}
                          onSelect={() => setActiveTab(item.value)}
                          className={cn(
                            "flex items-center gap-2 cursor-pointer",
                            activeTab === item.value && "bg-accent text-accent-foreground font-medium"
                          )}
                        >
                          {item.icon} {item.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              })}

            </nav>
          </div>
        </div>

        {/* ── Mobile Navigation ── */}
        <div className="md:hidden flex justify-center px-4 pt-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full">
                <Menu className="mr-2 h-5 w-5" />
                {activeLabel}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-[--radix-dropdown-menu-trigger-width]">
              {soloTabs.map(tab => (
                <DropdownMenuItem key={tab.value} onSelect={() => setActiveTab(tab.value)}
                  className={cn(activeTab === tab.value && "bg-accent font-medium")}>
                  {tab.icon} {tab.label}
                </DropdownMenuItem>
              ))}
              {navGroups.map(group => (
                <>
                  <DropdownMenuSeparator key={`sep-${group.label}`} />
                  <DropdownMenuLabel key={`lbl-${group.label}`} className="text-xs text-muted-foreground">{group.label}</DropdownMenuLabel>
                  {group.items.map(item => (
                    <DropdownMenuItem key={item.value} onSelect={() => setActiveTab(item.value)}
                      className={cn("pl-6", activeTab === item.value && "bg-accent font-medium")}>
                      {item.icon} {item.label}
                    </DropdownMenuItem>
                  ))}
                </>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <TabsContent value="dashboard" className={cn(containerClass, "space-y-6 mt-6")}>
          <DashboardTab 
            demands={demands} 
            employees={employees} 
            certificates={certificates} 
            demandStatuses={demandStatuses}
            vacations={vacations}
          />
        </TabsContent>

        <TabsContent value="demands" className={cn(containerClass, "space-y-6 mt-6")}>
          <section aria-labelledby="demands-form-section-title">
             <ShadCnCard className="shadow-sm">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <CardTitle className="text-xl font-headline text-primary flex items-center gap-3">
                            <ListPlus className="h-6 w-6" />
                            Registrar Nova Demanda
                        </CardTitle>
                        <Button variant="outline" onClick={() => setShowDemandForm(!showDemandForm)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> {showDemandForm ? 'Ocultar Formulário' : 'Adicionar Nova'}
                        </Button>
                    </div>
                </CardHeader>
            </ShadCnCard>
            {showDemandForm && (
              <div className="mt-4">
                <DemandForm 
                  onAddDemand={handleAddDemand} 
                  onClose={() => setShowDemandForm(false)} 
                  employees={employees}
                />
              </div>
            )}
          </section>
          <section aria-labelledby="demands-list-title">
            <div className="flex items-center gap-3 my-6">
                <ClipboardList className="h-6 w-6 text-primary" />
                <h2 id="demands-list-title" className="text-2xl font-headline font-semibold text-primary">Lista de Demandas</h2>
            </div>
            <DemandList 
              demands={demands}
              demandStatuses={demandStatuses}
              onUpdateStatus={handleUpdateDemandStatus}
              onDeleteDemand={handleDeleteDemand}
              onUpdateDemand={handleUpdateDemand}
              onAddStatus={addGlobalDemandStatus}
              onDeleteStatus={deleteGlobalDemandStatus}
              onUpdateStatusDetails={updateGlobalDemandStatus}
              employees={employees}
            />
          </section>
        </TabsContent>

        <TabsContent value="vacations" className={cn(containerClass, "space-y-6 mt-6")}>
          <section aria-labelledby="vacations-form-section">
             <ShadCnCard className="shadow-sm">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <CardTitle className="text-xl font-headline text-primary flex items-center gap-3">
                      <ListPlus className="h-6 w-6" />
                      Novo Afastamento
                    </CardTitle>
                    <Button variant="outline" onClick={() => setShowVacationForm(!showVacationForm)}>
                      <PlusCircle className="mr-2 h-4 w-4" /> {showVacationForm ? 'Ocultar Formulário' : 'Registrar Novo'}
                    </Button>
                  </div>
                </CardHeader>
             </ShadCnCard>
             {showVacationForm && (
                <div className="mt-4">
                    <VacationForm 
                        onAddVacation={handleAddVacation} 
                        onClose={() => setShowVacationForm(false)} 
                        employees={employees}
                    />
                </div>
            )}
          </section>
          <section aria-labelledby="vacations-list-title" className="mt-8">
            <VacationList 
              vacations={vacations} 
              employees={employees}
              onDeleteVacation={handleDeleteVacation}
              onUpdateVacation={handleUpdateVacation}
            />
          </section>
        </TabsContent>

        <TabsContent value="absences" className={cn(containerClass, "space-y-6 mt-6")}>
          <JustifiedAbsenceList 
            absences={justifiedAbsences} 
            employees={employees} 
            onDeleteAbsence={handleDeleteJustifiedAbsence}
            onUpdateAbsence={handleUpdateJustifiedAbsence}
            onAddAbsence={handleAddJustifiedAbsence}
          />
        </TabsContent>

        <TabsContent value="employees" className={cn(containerClass, "space-y-6 mt-6")}>
          <section aria-labelledby="employees-form-section-title">
              <ShadCnCard className="shadow-sm">
                  <CardHeader>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <CardTitle className="text-xl font-headline text-primary flex items-center gap-3">
                              <UserPlus className="h-6 w-6" />
                              Registrar Novo Funcionário
                          </CardTitle>
                          <Button variant="outline" onClick={() => setShowEmployeeForm(!showEmployeeForm)}>
                              <PlusCircle className="mr-2 h-4 w-4" /> {showEmployeeForm ? 'Ocultar Formulário' : 'Adicionar Novo'}
                          </Button>
                      </div>
                  </CardHeader>
              </ShadCnCard>
              {showEmployeeForm && (
                <div className="mt-4">
                  <EmployeeForm 
                    onAddEmployee={handleAddEmployee}
                    onClose={() => setShowEmployeeForm(false)} />
                </div>
              )}
          </section>
          <section aria-labelledby="employees-list-title">
             <div className="flex items-center gap-3 my-6">
                <Users className="h-6 w-6 text-primary" />
                <h2 id="employees-list-title" className="text-2xl font-headline font-semibold text-primary">Lista de Funcionários</h2>
            </div>
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

        <TabsContent value="third-party" className={cn(containerClass, "space-y-6 mt-6")}>
          <ThirdPartyEmployeePage
            employees={thirdPartyEmployees}
            schools={schools}
            onAddEmployee={handleAddThirdPartyEmployee}
            onUpdateEmployee={handleUpdateThirdPartyEmployee}
            onDeleteEmployee={handleDeleteThirdPartyEmployee}
            onAddSchool={handleAddSchool}
            onOpenSchoolManagement={() => setShowSchoolManagement(true)}
          />
        </TabsContent>
        
        <TabsContent value="cards" className={cn(containerClass, "space-y-6 mt-6")}>
          <CardManagementPage
            cards={cards}
            schools={schools}
            onAddCard={handleAddCard}
            onUpdateCard={handleUpdateCard}
            onDeleteCard={handleDeleteCard}
            onAddSchool={handleAddSchool}
            onOpenSchoolManagement={() => setShowSchoolManagement(true)}
          />
        </TabsContent>

        <TabsContent value="uniforms" className={cn(containerClass, "space-y-6 mt-6")}>
          <UniformManagementPage
            uniforms={uniforms}
            schools={schools}
            onAddUniform={handleAddUniform}
            onUpdateUniform={handleUpdateUniform}
            onDeleteUniform={handleDeleteUniform}
            onAddSchool={handleAddSchool}
            onOpenSchoolManagement={() => setShowSchoolManagement(true)}
          />
        </TabsContent>

      </Tabs>

      <SchoolManagementDialog
        open={showSchoolManagement}
        onOpenChange={setShowSchoolManagement}
        schools={schools}
        onDeleteSchool={handleDeleteSchool}
        onAddSchool={handleAddSchool}
      />
    </div>
  );
}
