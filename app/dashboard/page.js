import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import Order from '@/models/Order';
import Ticket from '@/models/Ticket';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, DollarSign, Ticket as TicketIcon, Users, Plus, ArrowRight, Pencil, ExternalLink, QrCode } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default async function DashboardPage() {
  const session = await auth();
  await connectDB();

  const events = await Event.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean();
  const eventIds = events.map(e => e._id);

  const [orderCount, ticketCount, totalRevenue, checkedInCount] = await Promise.all([
    Order.countDocuments({ eventId: { $in: eventIds }, status: 'succeeded' }),
    Ticket.countDocuments({ eventId: { $in: eventIds } }),
    Order.aggregate([
      { $match: { eventId: { $in: eventIds }, status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$subtotal' } } },
    ]).then(r => r[0]?.total || 0),
    Ticket.countDocuments({ eventId: { $in: eventIds }, status: 'used' }),
  ]);

  // Per-event stats
  const [perEventTickets, perEventRevenue] = await Promise.all([
    Ticket.aggregate([
      { $match: { eventId: { $in: eventIds } } },
      { $group: { _id: '$eventId', count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { eventId: { $in: eventIds }, status: 'succeeded' } },
      { $group: { _id: '$eventId', total: { $sum: '$subtotal' } } },
    ]),
  ]);

  const ticketsByEvent = Object.fromEntries(perEventTickets.map(t => [t._id.toString(), t.count]));
  const revenueByEvent = Object.fromEntries(perEventRevenue.map(r => [r._id.toString(), r.total]));

  const recentEvents = events.slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {session.user.name}</p>
        </div>
        <Link href="/dashboard/events/new">
          <Button className="bg-violet-600 hover:bg-violet-700">
            <Plus className="w-4 h-4 mr-2" /> Create Event
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Events</CardTitle>
            <CalendarDays className="w-4 h-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{events.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Tickets Sold</CardTitle>
            <TicketIcon className="w-4 h-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{ticketCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Check-ins</CardTitle>
            <Users className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{checkedInCount}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Events</h2>
          <Link href="/dashboard/events" className="text-sm text-violet-600 hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {recentEvents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CalendarDays className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No events yet. Create your first event to start selling tickets.</p>
              <Link href="/dashboard/events/new">
                <Button className="bg-violet-600 hover:bg-violet-700">
                  <Plus className="w-4 h-4 mr-2" /> Create Event
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentEvents.map(event => {
              const eventId = event._id.toString();
              const soldCount = ticketsByEvent[eventId] || 0;
              const revenue = revenueByEvent[eventId] || 0;
              return (
                <Card key={eventId} className="overflow-hidden flex flex-col">
                  <div className="relative h-32 -mt-6 -mx-6">
                    {event.bannerImage ? (
                      <img src={event.bannerImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-500 to-pink-500" />
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="line-clamp-1">{event.name}</CardTitle>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${
                        event.status === 'active' ? 'bg-green-100 text-green-700' :
                        event.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                        event.status === 'ended' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        <span>
                          {event.startDate ? new Date(event.startDate).toLocaleDateString('en-AU', {
                            weekday: 'short', month: 'short', day: 'numeric',
                          }) : 'No date set'}
                        </span>
                      </div>
                      {event.venue && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">{event.venue}</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between text-sm mt-auto">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <TicketIcon className="h-3.5 w-3.5 text-pink-500" />
                        {soldCount} sold
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <DollarSign className="h-3.5 w-3.5 text-green-500" />
                        {formatCurrency(revenue)}
                      </span>
                    </div>
                  </CardContent>
                  <div className="grid grid-cols-3 divide-x divide-violet-400/30 -mb-6 bg-violet-600 text-white rounded-b-lg overflow-hidden">
                    <Link
                      href={`/dashboard/events/${eventId}`}
                      className="flex items-center justify-center gap-1.5 py-2.5 text-sm hover:bg-white/10 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                    <Link
                      href={`/dashboard/events/${eventId}?tab=tickets`}
                      className="flex items-center justify-center gap-1.5 py-2.5 text-sm hover:bg-white/10 transition-colors"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      Tickets
                    </Link>
                    <Link
                      href={`/events/${event.slug}`}
                      target="_blank"
                      className="flex items-center justify-center gap-1.5 py-2.5 text-sm hover:bg-white/10 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Preview
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
