"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { login as apiLogin } from "@/lib/api";
import { setToken, setRole } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [voterId, setVoterId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Check if test mode is enabled
  React.useEffect(() => {
    setTestMode(localStorage.getItem("testMode") === "true");
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Handle test mode login with mock users
      if (testMode) {
        // Mock login with predefined test users
        if (
          (voterId === "admin" && password === "admin123") ||
          (voterId === "voter" && password === "voter123")
        ) {
          const mockRole = voterId === "admin" ? "admin" : "voter";
          const mockToken = "test-token-" + Date.now();

          // Store mock auth data
          setToken(mockToken);
          setRole(mockRole);

          toast({
            title: "Test Mode",
            description: `Logged in as ${mockRole} in test mode`,
          });

          if (mockRole === "admin") {
            router.replace("/dashboard/admin");
          } else {
            router.replace("/dashboard/user");
          }
          return;
        } else {
          throw new Error("Invalid test credentials");
        }
      }

      // Normal login process
      const res = await apiLogin({ voterId, password });
      setToken(res?.token);
      // Expect the backend to return role in payload; fallback to 'voter'
      setRole(res?.user?.role || "voter");
      toast({ title: "Success", description: "Logged in successfully." });
      if ((res?.user?.role || "voter") === "admin") {
        router.replace("/dashboard/admin");
      } else {
        router.replace("/dashboard/user");
      }
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err?.message || "Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh grid place-items-center bg-background text-foreground p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login {testMode && "(Test Mode)"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="voterId">Voter ID</Label>
              <Input
                id="voterId"
                value={voterId}
                onChange={(e) => setVoterId(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            {testMode && (
              <div className="mt-2 p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Test Credentials:</p>
                <ul className="text-xs space-y-1 mt-1">
                  <li>
                    <strong>Admin:</strong> voterId: admin / password: admin123
                  </li>
                  <li>
                    <strong>Voter:</strong> voterId: voter / password: voter123
                  </li>
                </ul>
              </div>
            )}
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <a className="underline" href="/auth/register">
              Register
            </a>
          </p>

          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                const currentMode = localStorage.getItem("testMode") === "true";
                localStorage.setItem("testMode", (!currentMode).toString());
                setTestMode(!currentMode);
              }}
            >
              {testMode ? "Disable" : "Enable"} Test Mode
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
