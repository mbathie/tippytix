import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import Order from '@/models/Order';
import Ticket from '@/models/Ticket';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, DollarSign, Ticket as TicketIcon, Users, Plus, ArrowRight } from 'lucide-react';
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
            {recentEvents.map(event => (
              <Link key={event._id} href={`/dashboard/events/${event._id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  {event.bannerImage && (
                    <div className="h-32 overflow-hidden rounded-t-lg">
                      <img src={event.bannerImage} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{event.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {event.startDate ? new Date(event.startDate).toLocaleDateString('en-AU', {
                            weekday: 'short', month: 'short', day: 'numeric',
                          }) : 'No date set'}
                        </p>
                        {event.venue && <p className="text-sm text-gray-400">{event.venue}</p>}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        event.status === 'active' ? 'bg-green-100 text-green-700' :
                        event.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                        event.status === 'ended' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
