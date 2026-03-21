import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';
import Link from 'next/link';

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-pink-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-violet-600" />
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription className="text-base">
            A sign-in link has been sent to your email address. Click the link to sign in to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login" className="text-violet-600 hover:underline text-sm">
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
