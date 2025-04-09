"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ProfilePage() {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();

  // Redirect to sign in page if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/signin");
    }
  }, [user, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="container py-12 max-w-md">
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Your Profile</CardTitle>
          <CardDescription>
            View and manage your account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Email</h3>
            <p className="text-sm">{user.email}</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Full Name</h3>
            <p className="text-sm">{user.full_name || "Not provided"}</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Account Created</h3>
            <p className="text-sm">
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => signOut().then(() => router.push("/"))}
          >
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
