import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { UsersAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clapperboard } from "lucide-react";
import { toast } from "sonner";
import { S3API } from "@/lib/api";

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"email" | "name">("email");
  const [pendingEmail, setPendingEmail] = useState("");
  const [name, setName] = useState("");

  // Todos os hooks têm de estar ANTES de qualquer return condicional
  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  if (user) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await UsersAPI.login({ email: email.trim().toLowerCase() });
      login(res);
      navigate("/");
    } catch (err: any) {
      if (err?.response?.data?.needsName) {
        setPendingEmail(email);
        setStep("name");
      } else {
        toast.error("Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await UsersAPI.login({ email: pendingEmail, name });
      login(res);
      const apiUrl = import.meta.env.VITE_API_URL;
      const allUsers = await fetch(`${apiUrl}s3/users`).then(r => r.json());
      allUsers.push({ _id: res._id, name: res.name, email: res.email });
      await fetch(`${apiUrl}s3/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: "users.json",
          fileContent: btoa(JSON.stringify(allUsers)),
          mimeType: "application/json",
        }),
      });
      navigate("/");
    } catch {
      toast.error("Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Clapperboard className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Sign in to CineTrack</CardTitle>
          <CardDescription>
            Enter your {step === "email" ? "email" : "name"} to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                Continue
              </Button>
            </form>
          ) : (
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground text-center p-2">
                  Welcome! Please choose a name for your new account
                </p>
                <Label>Name</Label>
                <Input
                  type="text"
                  required
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                Create account
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}