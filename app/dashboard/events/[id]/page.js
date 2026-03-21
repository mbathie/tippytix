'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Loader2, Edit, ExternalLink, QrCode, Download, Copy, Ticket, DollarSign, Users, CheckCircle, ArrowLeft, ScanLine, Play, Pause, MoreVertical } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [orders, setOrders] = useState([]);
  const [patrons, setPatrons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/events/${id}`).then(r => r.json()),
      fetch(`/api/events/${id}/orders`).then(r => r.json()),
      fetch(`/api/events/${id}/patrons`).then(r => r.json()),
    ]).then(([eventData, ordersData, patronsData]) => {
      setEvent(eventData);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setPatrons(Array.isArray(patronsData) ? patronsData : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-violet-600" /></div>;
  }
  if (!event) {
    return <p className="text-center py-20 text-gray-500">Event not found</p>;
  }

  const shareUrl = `${window.location.origin}/events/${event.slug}`;

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied!');
  }

  async function downloadCSV() {
    const res = await fetch(`/api/events/${id}/patrons?format=csv`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.slug}-patrons.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const stats = event.stats || {};
  const isLive = event.status === 'active';

  async function toggleStatus() {
    const newStatus = isLive ? 'draft' : 'active';
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, isActive: newStatus === 'active' }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      setEvent(prev => ({ ...prev, status: newStatus, isActive: newStatus === 'active' }));
      toast.success(newStatus === 'active' ? 'Event is now live!' : 'Event disabled');
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/events')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Events
        </Button>

        {/* Desktop buttons */}
        <div className="hidden md:flex items-center gap-2">
          {isLive ? (
            <Button variant="outline" size="sm" onClick={toggleStatus} className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600">
              <Pause className="w-4 h-4 mr-1" /> Pause
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={toggleStatus} className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700">
              <Play className="w-4 h-4 mr-1" /> Launch
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={copyLink}>
            <Copy className="w-4 h-4 mr-1" /> Copy Link
          </Button>
          <Link href={`/events/${event.slug}`} target="_blank">
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-1" /> View Page
            </Button>
          </Link>
          <Link href={`/dashboard/events/${id}/scan`}>
            <Button variant="outline" size="sm">
              <ScanLine className="w-4 h-4 mr-1" /> Scan Tickets
            </Button>
          </Link>
          <Link href={`/dashboard/events/${id}/edit`}>
            <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
              <Edit className="w-4 h-4 mr-1" /> Edit
            </Button>
          </Link>
        </div>

        {/* Mobile dropdown */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={toggleStatus}>
                {isLive ? <><Pause className="w-4 h-4 mr-2" /> Pause</> : <><Play className="w-4 h-4 mr-2" /> Launch</>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={copyLink}>
                <Copy className="w-4 h-4 mr-2" /> Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/events/${event.slug}`} target="_blank">
                  <ExternalLink className="w-4 h-4 mr-2" /> View Page
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/events/${id}/scan`}>
                  <ScanLine className="w-4 h-4 mr-2" /> Scan Tickets
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/events/${id}/edit`}>
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold">{event.name}</h1>
        <p className="text-gray-500 mt-1">
          {event.startDate ? new Date(event.startDate).toLocaleDateString('en-AU', {
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
          }) : 'No date set'}
          {event.venue ? ` · ${event.venue}` : ''}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center gap-2"><Ticket className="w-4 h-4" /> Sold</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.totalTicketsSold || 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Checked In</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.checkedIn || 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue || 0)}</p>
            <p className="text-xs text-gray-400 mt-1">Fees: {formatCurrency(stats.totalFees || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center gap-2"><Users className="w-4 h-4" /> Orders</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.totalOrders || 0}</p></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tickets">
        <TabsList>
          <TabsTrigger value="tickets">Ticket Categories</TabsTrigger>
          <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
          <TabsTrigger value="patrons">Patrons ({patrons.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="mt-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {event.ticketCategories?.map(cat => {
              const soldOut = cat.sold >= cat.quantity;
              const pct = cat.quantity > 0 ? Math.round((cat.sold / cat.quantity) * 100) : 0;
              return (
                <Card key={cat._id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{cat.name}</h3>
                      {soldOut ? (
                        <Badge variant="destructive" className="text-xs">Sold Out</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">{cat.quantity - cat.sold} left</Badge>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-violet-600">{formatCurrency(cat.price)}</p>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{cat.sold} sold</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-violet-600 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    {cat.description && <p className="text-sm text-gray-500 mt-2">{cat.description}</p>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {orders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No orders yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Order</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Customer</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Tickets</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Total</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order._id} className="border-b last:border-0">
                          <td className="px-4 py-3 font-mono text-xs">{order.orderNumber}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium">{order.customerName}</p>
                            <p className="text-gray-500 text-xs">{order.customerEmail}</p>
                          </td>
                          <td className="px-4 py-3">{order.totalQuantity}</td>
                          <td className="px-4 py-3 font-medium">{formatCurrency(order.totalAmount)}</td>
                          <td className="px-4 py-3">
                            <Badge variant={order.status === 'succeeded' ? 'default' : 'secondary'} className={
                              order.status === 'succeeded' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                              order.status === 'refunded' ? 'bg-red-100 text-red-700 hover:bg-red-100' : ''
                            }>{order.status}</Badge>
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString('en-AU')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patrons" className="mt-4">
          <div className="flex justify-end mb-3">
            {patrons.length > 0 && (
              <Button variant="outline" size="sm" onClick={downloadCSV}>
                <Download className="w-4 h-4 mr-1" /> Download CSV
              </Button>
            )}
          </div>
          <Card>
            <CardContent className="p-0">
              {patrons.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No patrons yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Phone</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Tickets</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Categories</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Checked In</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patrons.map((p, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="px-4 py-3 font-medium">{p.name}</td>
                          <td className="px-4 py-3 text-gray-500">{p.email}</td>
                          <td className="px-4 py-3 text-gray-500">{p.phone || '-'}</td>
                          <td className="px-4 py-3">{p.ticketCount}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{p.categories}</td>
                          <td className="px-4 py-3">{p.checkedIn}/{p.ticketCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
