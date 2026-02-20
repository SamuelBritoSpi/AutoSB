
"use client";

import React, { useMemo, useState } from 'react';
import type { Uniform } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, Search, FileText, Send, XCircle, Trash2, CheckCircle, Clock, Shirt } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { renderReport } from '@/lib/print-utils';
import UniformsReport from '../reports/UniformsReport';
import UniformDeliveryTermDialog from './DeliveryTermDialog';
import { Badge } from '../ui/badge';

interface UniformListProps {
  uniforms: Uniform[];
  onUpdateUniform: (uniform: Uniform) => void;
  onDeleteUniform: (id: string) => void;
}

export default function UniformList({ uniforms, onUpdateUniform, onDeleteUniform }: UniformListProps) {
  const { toast } = useToast();
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniforms, setSelectedUniforms] = useState<string[]>([]);
  const [isTermDialogOpen, setIsTermDialogOpen] = useState(false);

  const filteredUniforms = useMemo(() => {
    return uniforms
      .filter(u => {
        const matchesFilter = filter === 'all' || u.status === filter;
        const matchesSearch = u.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             u.schoolName.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => new Date(b.arrivalDate).getTime() - new Date(a.arrivalDate).getTime());
  }, [uniforms, filter, searchTerm]);

  const handleMarkAsDelivered = (uniform: Uniform) => {
    onUpdateUniform({ ...uniform, status: 'delivered', deliveryDate: new Date().toISOString() });
    toast({ title: 'Status Atualizado', description: `Fardamento de ${uniform.employeeName} marcado como entregue.` });
  };

  const handleMarkAsPending = (uniform: Uniform) => {
    onUpdateUniform({ ...uniform, status: 'pending', deliveryDate: null });
    toast({ title: 'Status Atualizado', description: `Fardamento de ${uniform.employeeName} marcado como pendente.` });
  };
  
  const handleGenerateReport = (ids: string[]) => {
    const reportItems = ids.length > 0 ? uniforms.filter(u => ids.includes(u.id)) : filteredUniforms;
    if (reportItems.length === 0) {
      toast({ variant: 'destructive', title: 'Nenhum item', description: 'Selecione ou filtre itens para gerar o relatório.' });
      return;
    }
    const reportElement = <UniformsReport uniforms={reportItems} />;
    renderReport(reportElement, 'Relatório de Fardamento');
    setSelectedUniforms([]);
  };

  const handleGenerateDeliveryTerm = () => {
    if (selectedUniforms.length === 0) {
        toast({ variant: 'destructive', title: 'Nenhum item selecionado' });
        return;
    }
    const hasDelivered = uniforms.filter(u => selectedUniforms.includes(u.id) && u.status === 'delivered');
    if (hasDelivered.length > 0) {
        toast({ variant: 'destructive', title: 'Status Inválido', description: 'Apenas fardamentos "Pendentes" podem ser incluídos no termo.' });
        return;
    }
    setIsTermDialogOpen(true);
  };

  const handleConfirmDelivery = (ids: string[]) => {
    const itemsToUpdate = uniforms.filter(u => ids.includes(u.id));
    itemsToUpdate.forEach(item => {
        onUpdateUniform({ ...item, status: 'delivered', deliveryDate: new Date().toISOString() });
    });
    setSelectedUniforms([]);
    toast({ title: 'Entrega Registrada', description: `${ids.length} fardamento(s) marcado(s) como entregue(s).`});
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-card rounded-lg shadow">
          <div className="flex items-center gap-2">
            <Shirt className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Gestão de Fardamento</h3>
          </div>
          <div className="relative w-full sm:w-auto flex-grow sm:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por funcionário ou colégio..."
              className="pl-10 w-full md:w-[350px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button variant={filter === 'pending' ? 'default' : 'outline'} onClick={() => setFilter('pending')}>Pendentes</Button>
            <Button variant={filter === 'delivered' ? 'default' : 'outline'} onClick={() => setFilter('delivered')}>Entregues</Button>
            <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>Todos</Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => handleGenerateReport(selectedUniforms)} className="w-full sm:w-auto">
                <FileText className="mr-2 h-4 w-4" /> Gerar Relatório
            </Button>
            <Button onClick={handleGenerateDeliveryTerm} className="w-full sm:w-auto" variant="secondary">
                <Send className="mr-2 h-4 w-4" /> Gerar Termo de Entrega
            </Button>
        </div>

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedUniforms.length === filteredUniforms.length && filteredUniforms.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedUniforms(filteredUniforms.map(u => u.id));
                      } else {
                        setSelectedUniforms([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Funcionário / Colégio</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUniforms.length > 0 ? (
                filteredUniforms.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUniforms.includes(u.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedUniforms(prev => [...prev, u.id]);
                          } else {
                            setSelectedUniforms(prev => prev.filter(id => id !== u.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <p className="font-bold">{u.employeeName}</p>
                      <p className="text-xs text-muted-foreground">{u.schoolName}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {u.items.map((item, idx) => (
                          <Badge key={idx} variant="outline" className="text-[10px] px-1 h-5">
                            {item.quantity}x {item.name} ({item.size})
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {u.status === 'pending' ? (
                        <span className="flex items-center gap-2 text-yellow-600 font-medium text-xs"><Clock className="h-3 w-3" /> Pendente</span>
                      ) : (
                        <span className="flex items-center gap-2 text-green-600 font-medium text-xs"><CheckCircle className="h-3 w-3" /> Entregue</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {format(parseISO(u.arrivalDate), 'dd/MM/yy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {u.status === 'pending' ? (
                            <DropdownMenuItem onClick={() => handleMarkAsDelivered(u)}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Marcar como Entregue
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleMarkAsPending(u)}>
                              <XCircle className="mr-2 h-4 w-4 text-yellow-500" /> Marcar como Pendente
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => onDeleteUniform(u.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Nenhum registro de fardamento encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <UniformDeliveryTermDialog 
        open={isTermDialogOpen}
        onOpenChange={setIsTermDialogOpen}
        uniforms={uniforms.filter(u => selectedUniforms.includes(u.id))}
        onConfirmDelivery={handleConfirmDelivery}
      />
    </>
  );
}
