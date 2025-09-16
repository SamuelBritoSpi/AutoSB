"use client";

import type { JustifiedAbsence } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, XCircle, MoreVertical, Pencil, Trash2, Eye } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from '../ui/scroll-area';
import AbsenceDetailsDialog from './AbsenceDetailsDialog';

interface AbsenceHistoryDialogProps {
  absences: JustifiedAbsence[];
  onDelete: (id: string) => void;
  onUpdate: (absence: JustifiedAbsence) => void;
  onEdit: (absence: JustifiedAbsence) => void;
}

export default function AbsenceHistoryDialog({ absences, onDelete, onUpdate, onEdit }: AbsenceHistoryDialogProps) {
  const [selectedAbsence, setSelectedAbsence] = useState<JustifiedAbsence | null>(null);

  const sortedAbsences = useMemo(() => {
     return [...absences].sort((a,b) => parseISO(b.startDate).getTime() - parseISO(a.startDate).getTime());
  }, [absences]);

  const handleUpdateDetails = (updatedAbsence: JustifiedAbsence) => {
    onUpdate(updatedAbsence);
    setSelectedAbsence(null);
  };

  return (
    <>
      <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
              {sortedAbsences.length > 0 ? sortedAbsences.map(absence => {
                      const days = differenceInDays(parseISO(absence.endDate), parseISO(absence.startDate)) + 1;

                      return (
                          <div key={absence.id} className={cn("p-3 border rounded-lg flex items-center justify-between group", absence.status === 'cancelled' && 'bg-muted/50')}>
                              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 flex-grow">
                                  <div className={cn("flex items-center text-sm p-2 rounded-md font-medium", absence.status === 'cancelled' ? 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900/50' : 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/50', absence.status === 'cancelled' && 'line-through')}>
                                      <span className="flex items-center gap-2">
                                          {absence.status === 'cancelled' ? <XCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />} 
                                          {absence.status === 'cancelled' ? 'Cancelada' : 'Ativa'}
                                      </span>
                                  </div>
                                  <div>
                                      <p className="font-semibold">{format(parseISO(absence.startDate), "dd/MM/yyyy")} a {format(parseISO(absence.endDate), "dd/MM/yyyy")} ({days} dias)</p>
                                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{absence.reason}</p>
                                  </div>
                              </div>
                              <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                          <MoreVertical className="h-4 w-4" />
                                      </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => setSelectedAbsence(absence)}>
                                          <Eye className="mr-2 h-4 w-4 text-blue-500" /> Ver Detalhes
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => onEdit(absence)}>
                                          <Pencil className="mr-2 h-4 w-4 text-blue-500" /> Editar Falta
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => onUpdate({ ...absence, status: absence.status === 'cancelled' ? 'active' : 'cancelled' })} className={absence.status === 'cancelled' ? 'text-green-600 focus:text-green-700' : 'text-amber-600 focus:text-amber-700'}>
                                          {absence.status === 'cancelled' ? (
                                              <>
                                                  <CheckCircle className="mr-2 h-4 w-4" /> Reativar Falta
                                              </>
                                          ) : (
                                              <>
                                                  <XCircle className="mr-2 h-4 w-4" /> Cancelar Falta
                                              </>
                                          )}
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => onDelete(absence.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                          <Trash2 className="mr-2 h-4 w-4" /> Excluir Registro
                                      </DropdownMenuItem>
                                  </DropdownMenuContent>
                              </DropdownMenu>
                          </div>
                      )
                  }) : (
                      <p className="text-sm text-muted-foreground text-center py-10">Nenhuma falta justificada registrada para este funcionário.</p>
                  )}
          </div>
      </ScrollArea>
      
      {/* Diálogo de Detalhes */}
      {selectedAbsence && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <AbsenceDetailsDialog
                absence={selectedAbsence}
                onUpdate={handleUpdateDetails}
                onClose={() => setSelectedAbsence(null)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

