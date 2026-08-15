import { useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { useLocation } from "wouter";
import { LogIn, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin() {
  const { isAuthenticated, loading, login, isLoggingIn } = useAdminAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (isAuthenticated) {
    setLocation("/admin");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success("Welcome back!");
      setLocation("/admin");
    } catch (error: any) {
      toast.error(error?.message || "Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-purple-200 shadow-xl shadow-purple-100/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CardHeader className="text-center space-y-3">
          <div className="flex justify-center">
            <Logo className="h-14 w-14" title={false} />
          </div>
          <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
          <CardDescription>Sign in to manage CHAFHEI content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="admin-email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@chafhein.ng"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="admin-password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-base"
              disabled={isLoggingIn || loading}
            >
              {isLoggingIn ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <LogIn className="w-5 h-5 mr-2" />
              )}
              Sign In
            </Button>
          </form>

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
