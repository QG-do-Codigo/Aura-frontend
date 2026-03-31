import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export type HealthWeekChartDatum = {
  label: string
  medicine: number
  workout: number
}

type HealthWeekChartProps = {
  data: HealthWeekChartDatum[]
}

export function HealthWeekChart({ data }: HealthWeekChartProps) {
  const maxValue = Math.max(
    1,
    ...data.map(item => Math.max(item.medicine, item.workout))
  )

  return (
    <div className="mt-6 h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          barCategoryGap={16}
          barGap={6}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            domain={[0, maxValue]}
            width={28}
            tick={{ fontSize: 12, fill: '#64748b' }}
          />
          <Tooltip
            cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
            contentStyle={{
              borderRadius: 12,
              borderColor: '#e2e8f0',
              fontSize: 12,
            }}
          />
          <Bar
            dataKey="medicine"
            name="Medicamentos confirmados"
            fill="#FB7185"
            radius={[8, 8, 0, 0]}
            barSize={12}
          />
          <Bar
            dataKey="workout"
            name="Treinos confirmados"
            fill="#38BDF8"
            radius={[8, 8, 0, 0]}
            barSize={12}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
