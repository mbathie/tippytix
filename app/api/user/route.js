import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id).lean();
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('GET /api/user error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();

    // Only allow updating safe fields
    const allowedFields = [
      'name', 'organizationName', 'phone', 'firstName', 'lastName',
      'dateOfBirth', 'addressLine1', 'addressLine2', 'addressCity',
      'addressState', 'addressPostalCode', 'country',
      'bankName', 'bankRoutingNumber', 'bankAccountNumber', 'bankAccountName',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    const user = await User.findByIdAndUpdate(session.user.id, updates, { new: true }).lean();
    return NextResponse.json(user);
  } catch (error) {
    console.error('PUT /api/user error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
