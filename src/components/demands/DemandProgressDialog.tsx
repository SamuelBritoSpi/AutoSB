"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DemandProgressForm from './DemandProgressForm';
import DemandProgressList from './DemandProgressList';
import type { DemandProgress } from '@/lib/types';

interface DemandProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  demandId: string;
  demandTitle: string;
}

export default function DemandProgressDialog({ 
  open, 
  onOpenChange, 
  demandId,
  demandTitle 
}: DemandProgressDialogProps) {
  const [newProgress, setNewProgress] = useState<DemandProgress | undefined>();

  const handleProgressAdded = (progress: DemandProgress) => {
    setNewProgress(progress);
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Limpa o estado quando o diálogo é fechado para evitar contaminação
      setNewProgress(undefined);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Andamento da Demanda: {demandTitle}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <DemandProgressForm 
            demandId={demandId} 
            onProgressAdded={handleProgressAdded} 
          />
          <DemandProgressList 
            demandId={demandId} 
            newProgress={newProgress} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
