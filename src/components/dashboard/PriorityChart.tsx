
"use client";

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Demand, DemandStatus } from '@/lib/types';
import { useTheme } from 'next-themes';


const FINAL_STATUS_LABEL = 'Finalizado';

interface PriorityChartProps {
  demands: Demand[];
  demandStatuses: DemandStatus[];
}

const COLORS: Record<Demand['priority'], string> = {
  alta: 'hsl(var(--destructive))', // red
  media: 'hsl(var(--status-warning))', // yellow
  baixa: 'hsl(var(--status-success))', // green
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  // Não renderiza o rótulo se a fatia for muito pequena para evitar poluição visual
  if (percent < 0.05) {
    return null;
  }
  
  // Ajusta o raio para posicionar o texto mais próximo do centro da fatia
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor="middle" 
      dominantBaseline="central"
      fontSize="14"
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function PriorityChart({ demands, demandStatuses }: PriorityChartProps) {
    const { resolvedTheme } = useTheme();
    
    const chartData = useMemo(() => {
        const priorityCounts: Record<Demand['priority'], number> = {
            alta: 0,
            media: 0,
            baixa: 0,
        };
        
        demands.forEach(demand => {
            if (demand.status !== FINAL_STATUS_LABEL) {
                priorityCounts[demand.priority]++;
            }
        });
        
        return [
            { name: 'Alta', value: priorityCounts.alta },
            { name: 'Média', value: priorityCounts.media },
            { name: 'Baixa', value: priorityCounts.baixa },
        ].filter(d => d.value > 0);
    }, [demands]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-60 text-muted-foreground">
        Nenhuma demanda ativa para exibir.
      </div>
    )
  }
 
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => {
              const priorityKey = entry.name.toLowerCase().replace('é', 'e') as Demand['priority'];
              return <Cell key={`cell-${index}`} fill={COLORS[priorityKey]} />;
             })}
          </Pie>
          <Tooltip 
            contentStyle={{ 
                backgroundColor: resolvedTheme === 'dark' ? '#1f2937' : '#ffffff',
                border: resolvedTheme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
                borderRadius: '6px',
                color: resolvedTheme === 'dark' ? '#ffffff !important' : '#111827',
                boxShadow: resolvedTheme === 'dark' 
                  ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)' 
                  : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            }}
            labelStyle={{
                color: resolvedTheme === 'dark' ? '#ffffff' : '#111827'
            }}
            itemStyle={{
                color: resolvedTheme === 'dark' ? '#ffffff' : '#111827'
            }}
          />
          <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
