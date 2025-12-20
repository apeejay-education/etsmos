import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import type { HealthDistribution } from '@/hooks/useAnalytics';

interface HealthDistributionChartProps {
  data: HealthDistribution[];
}

const chartConfig = {
  Green: {
    label: 'Green',
    color: 'hsl(142, 76%, 36%)'
  },
  Amber: {
    label: 'Amber',
    color: 'hsl(45, 93%, 47%)'
  },
  Red: {
    label: 'Red',
    color: 'hsl(0, 84%, 60%)'
  }
} satisfies ChartConfig;

export function HealthDistributionChart({ data }: HealthDistributionChartProps) {
  const totalCount = data.reduce((acc, item) => acc + item.count, 0);

  if (totalCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Health Distribution</CardTitle>
          <CardDescription>Current initiative health status breakdown</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No health signals recorded yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Distribution</CardTitle>
        <CardDescription>Current initiative health status breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              innerRadius={40}
              dataKey="count"
              nameKey="status"
              label={({ status, count, percent }) => 
                count > 0 ? `${status}: ${count} (${(percent * 100).toFixed(0)}%)` : ''
              }
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
