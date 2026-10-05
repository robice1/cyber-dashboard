import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TrendPoint } from '../data/models'

function TrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id="openedFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff8068" stopOpacity={0.19} />
            <stop offset="95%" stopColor="#ff8068" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="resolvedFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#63d8b2" stopOpacity={0.17} />
            <stop offset="95%" stopColor="#63d8b2" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#293137" strokeDasharray="3 5" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#78858a', fontSize: 11 }} dy={8} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#657177', fontSize: 10 }} />
        <Tooltip
          contentStyle={{ background: '#171e21', border: '1px solid #313d40', borderRadius: 6, color: '#e4ece9', fontSize: 12 }}
          labelStyle={{ color: '#98a6a4', marginBottom: 4 }}
        />
        <Area type="monotone" dataKey="opened" name="Opened" stroke="#ff8068" strokeWidth={2} fill="url(#openedFill)" activeDot={{ r: 4, strokeWidth: 0 }} />
        <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#63d8b2" strokeWidth={2} fill="url(#resolvedFill)" activeDot={{ r: 4, strokeWidth: 0 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default TrendChart