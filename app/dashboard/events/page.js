import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, CalendarDays } from 'lucide-react';

export default async function EventsPage() {
  const session = await auth();
  await connectDB();

  const events = await Event.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Events</h1>
        <Link href="/dashboard/events/new">
          <Button className="bg-violet-600 hover:bg-violet-700">
            <Plus className="w-4 h-4 mr-2" /> Create Event
          </Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CalendarDays className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
            <p className="text-gray-500 mb-6">Create your first event to start selling tickets.</p>
            <Link href="/dashboard/events/new">
              <Button className="bg-violet-600 hover:bg-violet-700">
                <Plus className="w-4 h-4 mr-2" /> Create Event
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map(event => {
            const totalTickets = event.ticketCategories.reduce((sum, c) => sum + c.quantity, 0);
            const totalSold = event.ticketCategories.reduce((sum, c) => sum + c.sold, 0);
            return (
              <Link key={event._id} href={`/dashboard/events/${event._id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      {event.bannerImage ? (
                        <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={event.bannerImage} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-20 h-14 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${event.primaryColor}, ${event.secondaryColor})` }}>
                          <CalendarDays className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{event.name}</h3>
                        <p className="text-sm text-gray-500">
                          {event.startDate ? new Date(event.startDate).toLocaleDateString('en-AU', {
                            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                          }) : 'No date set'}
                          {event.venue ? ` · ${event.venue}` : ''}
                        </p>
                      </div>
                      <div className="hidden sm:flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="font-semibold">{totalSold}/{totalTickets}</p>
                          <p className="text-gray-400 text-xs">tickets sold</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          event.status === 'active' ? 'bg-green-100 text-green-700' :
                          event.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                          event.status === 'ended' ? 'bg-blue-100 text-blue-700' :
                          event.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
