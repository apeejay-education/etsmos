import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import type { MonthlyDeliveryData } from '@/hooks/useAnalytics';

interface DeliveryTrendsChartProps {
  data: MonthlyDeliveryData[];
}

const chartConfig = {
  delivered: {
    label: 'Delivered',
    color: 'hsl(142, 76%, 36%)'
  },
  approved: {
    label: 'Approved',
    color: 'hsl(221, 83%, 53%)'
  }
} satisfies ChartConfig;

export function DeliveryTrendsChart({ data }: DeliveryTrendsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Trends</CardTitle>
        <CardDescription>Initiatives approved vs delivered over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="approved" fill="var(--color-approved)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="delivered" fill="var(--color-delivered)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
