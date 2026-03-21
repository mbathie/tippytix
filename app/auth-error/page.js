import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-pink-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Authentication Error</CardTitle>
          <CardDescription className="text-base">
            Something went wrong during sign in. This could be an expired link or a temporary issue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login">
            <Button className="bg-violet-600 hover:bg-violet-700">Try again</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
