
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
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent === 0) return null;

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
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
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
                color: 'hsl(var(--foreground))'
            }}
          />
          <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
