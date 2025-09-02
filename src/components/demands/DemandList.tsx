
"use client";

import type { Demand, DemandStatus, Employee } from '@/lib/types';
import DemandCard from './DemandCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ListFilter, ArrowDownAZ, ArrowUpAZ, CalendarClock, AlertOctagon, type LucideIcon, type LucideProps, icons, Smile } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DemandForm from './DemandForm';
import ManageStatusesDialog from './ManageStatusesDialog';
import { cn } from '@/lib/utils';


interface DemandListProps {
  demands: Demand[];
  statuses: DemandStatus[];
  onUpdateStatus: (id: string, status: string) => void;
  onDeleteDemand: (id: string) => void;
  onUpdateDemand: (demand: Demand) => void;
  employees: Employee[];
  onAddStatus: (label: string, icon: string, color: string) => void;
  onDeleteStatus: (id: string) => Promise<void>;
}

type SortKey = 'dueDate' | 'priority' | 'description';
type SortOrder = 'asc' | 'desc';

const LucideIcon = ({ name, ...props }: { name: string } & LucideProps) => {
    const IconComponent = (icons as any)[name];
    return IconComponent ? <IconComponent {...props} /> : <Smile {...props}/>;
};

export default function DemandList({ 
  demands, 
  statuses,
  onUpdateStatus, 
  onDeleteDemand, 
  onUpdateDemand, 
  employees,
  onAddStatus,
  onDeleteStatus
}: DemandListProps) {
  const [sortKey, setSortKey] = useState<SortKey>('dueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [editingDemand, setEditingDemand] = useState<Demand | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStatusManagerOpen, setIsStatusManagerOpen] = useState(false);

  const priorityOrder: Record<Demand['priority'], number> = { 'alta': 1, 'media': 2, 'baixa': 3 };

  const handleEdit = (demand: Demand) => {
    setEditingDemand(demand);
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingDemand(null);
  };


  const sortedAndFilteredDemands = useMemo(() => {
    let result = [...demands];

    if (statusFilter !== 'all') {
      result = result.filter(d => d.status === statusFilter);
    }

    result.sort((a, b) => {
      let comparison = 0;
      if (sortKey === 'dueDate') {
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortKey === 'priority') {
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortKey === 'description') {
        comparison = a.description.localeCompare(b.description);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return result;
  }, [demands, sortKey, sortOrder, statusFilter]);

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-card rounded-lg shadow">
        <div className="flex items-center gap-2">
          <ListFilter className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Filtrar e Ordenar</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status.id} value={status.label}>
                    <div className='flex items-center gap-2'>
                        <LucideIcon name={status.icon} className={cn("h-4 w-4", status.color ? status.color.replace("bg-", "text-") : "")} />
                        {status.label}
                    </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortKey} onValueChange={(value) => setSortKey(value as SortKey)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate"><CalendarClock className="inline mr-2 h-4 w-4" />Data de Entrega</SelectItem>
              <SelectItem value="priority"><AlertOctagon className="inline mr-2 h-4 w-4" />Prioridade</SelectItem>
              <SelectItem value="description"><ArrowDownAZ className="inline mr-2 h-4 w-4" />Descrição</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={toggleSortOrder} className="w-full sm:w-auto">
            {sortOrder === 'asc' ? <ArrowDownAZ className="h-4 w-4 mr-2" /> : <ArrowUpAZ className="h-4 w-4 mr-2" />}
            {sortOrder === 'asc' ? 'Asc' : 'Desc'}
          </Button>
        </div>
      </div>

      {sortedAndFilteredDemands.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">Nenhuma demanda encontrada.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAndFilteredDemands.map((demand) => (
            <DemandCard 
              key={demand.id} 
              demand={demand} 
              statuses={statuses}
              onUpdateStatus={onUpdateStatus}
              onDelete={onDeleteDemand}
              onEdit={handleEdit} 
              onManageStatuses={() => setIsStatusManagerOpen(true)}
            />
          ))}
        </div>
      )}
       {editingDemand && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Editar Demanda</DialogTitle>
            </DialogHeader>
            <DemandForm
              existingDemand={editingDemand}
              onUpdateDemand={onUpdateDemand}
              onClose={closeEditDialog}
              onAddDemand={()=>{}} // Not used in edit mode
              employees={employees}
            />
          </DialogContent>
        </Dialog>
      )}
      <ManageStatusesDialog
        open={isStatusManagerOpen}
        onOpenChange={setIsStatusManagerOpen}
        statuses={statuses}
        onAddStatus={onAddStatus}
        onDeleteStatus={onDeleteStatus}
      />
    </div>
  );
}
