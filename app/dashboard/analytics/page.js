'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, DollarSign, Ticket, Users, CalendarDays, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-violet-600" /></div>;
  }
  if (!data) {
    return <p className="text-center py-20 text-gray-500">Failed to load analytics</p>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Analytics</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Total Revenue</CardTitle>
          </CardHeader>
          <CardContent><p className="text-3xl font-bold">{formatCurrency(data.totalRevenue)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center gap-2"><Ticket className="w-4 h-4" /> Tickets Sold</CardTitle>
          </CardHeader>
          <CardContent><p className="text-3xl font-bold">{data.totalTicketsSold}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center gap-2"><Users className="w-4 h-4" /> Check-ins</CardTitle>
          </CardHeader>
          <CardContent><p className="text-3xl font-bold">{data.totalCheckedIn}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Events</CardTitle>
          </CardHeader>
          <CardContent><p className="text-3xl font-bold">{data.totalEvents}</p></CardContent>
        </Card>
      </div>

      {data.salesTimeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Sales (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.salesTimeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={d => new Date(d).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v / 100).toFixed(0)}`} />
                  <Tooltip formatter={(v) => formatCurrency(v)} labelFormatter={d => new Date(d).toLocaleDateString('en-AU')} />
                  <Line type="monotone" dataKey="revenue" stroke="#6d28d9" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Top Events</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data.eventStats.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No events yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Event</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Tickets</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Revenue</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Check-ins</th>
                  </tr>
                </thead>
                <tbody>
                  {data.eventStats.map(e => (
                    <tr key={e._id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">{e.name}</td>
                      <td className="px-4 py-3 text-gray-500">{e.startDate ? new Date(e.startDate).toLocaleDateString('en-AU') : '-'}</td>
                      <td className="px-4 py-3">{e.ticketsSold}</td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(e.revenue)}</td>
                      <td className="px-4 py-3">{e.checkedIn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
