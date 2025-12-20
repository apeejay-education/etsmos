import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import type { ContributionStats } from '@/hooks/useAnalytics';

interface ContributionStatsChartProps {
  data: ContributionStats[];
}

const chartConfig = {
  contributions: {
    label: 'Contributions',
    color: 'hsl(262, 83%, 58%)'
  }
} satisfies ChartConfig;

export function ContributionStatsChart({ data }: ContributionStatsChartProps) {
  const hasData = data.some(d => d.contributions > 0);

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contribution Activity</CardTitle>
          <CardDescription>Monthly contribution counts</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No contributions recorded yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contribution Activity</CardTitle>
        <CardDescription>Monthly contribution counts over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line 
              type="monotone" 
              dataKey="contributions" 
              stroke="var(--color-contributions)" 
              strokeWidth={2}
              dot={{ fill: 'var(--color-contributions)', strokeWidth: 2 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
