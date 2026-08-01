import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Lock, LogIn } from "lucide-react";
import { startLogin } from "@/const";

export default function AdminLogin() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // If user is already authenticated and is admin, redirect to dashboard
  if (isAuthenticated && user?.role === "admin") {
    setLocation("/admin");
    return null;
  }

  // If user is authenticated but not admin, show access denied
  if (isAuthenticated && user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-yellow-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-4 rounded-full">
                <Lock className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>You don't have permission to access the admin dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-center">
              Only administrators can access this area. If you believe this is an error, please contact the site administrator.
            </p>
            <Button onClick={() => setLocation("/")} className="w-full bg-purple-600 hover:bg-purple-700">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If not authenticated, show login prompt
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-yellow-50 flex items-center justify-center px-4">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        button:active {
          transform: scale(0.97);
          transition: transform 0.1s ease;
        }
      `}</style>

      <Card className="w-full max-w-md border-purple-200 animate-fade-in-up">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src="/manus-storage/chafhein-logo_138241eb.png" alt="CHAFHEIN" className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
          <CardDescription>Sign in to manage CHAFHEI content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 text-center">
              This is a restricted area for administrators only. Sign in with your account to access the dashboard.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Admin Features:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                Manage campaigns and events
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                View contact submissions
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                Track donations and volunteers
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                Export reports to PDF
              </li>
            </ul>
          </div>

          <Button
            onClick={startLogin}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Sign In with Manus
          </Button>

          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            className="w-full border-purple-600 text-purple-600 hover:bg-purple-50"
          >
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
