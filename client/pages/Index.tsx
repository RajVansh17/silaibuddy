import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import {
  CheckCircle2,
  BadgeCheck,
  Scissors,
  Truck,
  Users,
  Sparkles,
} from "lucide-react";

import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const handleGoogleLogin = async (credentialResponse) => {
  try {
    const token = credentialResponse.credential;
    if (!token) throw new Error("Google login failed");

    // Decode user info (optional)
    const userInfo = jwtDecode(token);

    // Send token to backend for verification + linking
    const res = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");

    toast({ title: "Google login successful" });
    // Save your own JWT
    localStorage.setItem("token", data.token);
  } catch (err) {
    toast({ title: err.message });
  }
};

export default function Index() {
  const navigate = useNavigate();

  const [login, setLogin] = useState({ phone: "", password: "" });
  const [signup, setSignup] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirm: "",
  });

  const phoneMaskHint = useMemo(() => "+91 XXXXXXX123", []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(login.phone)) {
      toast({ title: "Enter a valid 10-digit mobile number" });
      return;
    }
    if (!login.password) {
      toast({ title: "Password is required" });
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: login.phone, password: login.password }),
      });
      const data = await res.json();
      
      if (res.ok) {
        // Successful login
        toast({ title: data.message || "Login successful!" });
        
        // Save the token if it exists in the response
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        
        // Optionally, you might want to redirect the user after a successful login.
        // navigate("/dashboard");
      } else {
        // Login failed - show error message from backend
        toast({ title: data.error || "Login failed. Please check your credentials." });
      }
    } catch (error) {
      // Network errors
      console.error("Login failed:", error);
      toast({ title: "Something went wrong. Please try again." });
    }
  };

  const handleLoginOtp = () => {
    if (!/^\d{10}$/.test(login.phone)) {
      toast({ title: "Enter a valid 10-digit mobile number" });
      return;
    }
    navigate(`/verify-otp?phone=${encodeURIComponent(login.phone)}`);
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (!signup.name.trim()) return toast({ title: "Please enter your full name" });
    if (!/^\d{10}$/.test(signup.phone))
      return toast({ title: "Enter a valid 10-digit mobile number" });
    if (signup.password.length < 6)
      return toast({ title: "Password must be at least 6 characters" });
    if (signup.password !== signup.confirm)
      return toast({ title: "Passwords do not match" });
    toast({ title: "Account created! Please verify OTP" });
    navigate(`/verify-otp?phone=${encodeURIComponent(signup.phone)}`);
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-gradient-to-br from-secondary to-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,theme(colors.primary/0.08),transparent_40%),radial-gradient(ellipse_at_bottom_right,theme(colors.accent/0.08),transparent_40%)]" />

      <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-6 py-10 lg:grid-cols-2 lg:gap-14 lg:py-16">
        <section className="flex flex-col justify-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground ring-1 ring-inset ring-border">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Customers Only
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Welcome Back to Silaibuddy
            </span>{" "}
            👗✨
          </h1>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            Login to continue your personalized tailoring journey — book tailors,
            manage orders, and track your stitching requests.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Benefit icon={BadgeCheck} title="Book skilled tailors" />
            <Benefit icon={Scissors} title="Customize stitching" />
            <Benefit icon={Truck} title="Track orders easily" />
            <Benefit icon={Users} title="Empower women tailors" />
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            💜 Fashion meets empowerment. Join Silaibuddy today and stitch your story with us.
          </p>
        </section>

        <section>
          <Card className="backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <CardHeader>
              <CardTitle className="text-2xl">🔑 Login to Your Account</CardTitle>
              <CardDescription>
                Enter your details to continue. You can use password or OTP for quick access.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Signup</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="login-phone">Enter Mobile Number</Label>
                      <p className="text-xs text-muted-foreground">We’ll verify your number for secure access</p>
                      <Input
                        id="login-phone"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        value={login.phone}
                        onChange={(e) => setLogin({ ...login, phone: e.target.value.replace(/\D/g, "") })}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <p className="text-xs text-muted-foreground">Or choose OTP login if you prefer quick access</p>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Your password"
                        value={login.password}
                        onChange={(e) => setLogin({ ...login, password: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <Button type="submit" className="flex-1">Login</Button>
                      <Button type="button" variant="outline" className="flex-1" onClick={handleLoginOtp}>
                        Login with OTP
                      </Button>
                    </div>
                    <div className="text-right text-sm">
                      <button
                        type="button"
                        onClick={() => toast({ title: "Reset link will be sent to your mobile" })}
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </form>

                  <div className="my-6">
                    <Separator />
                    <p className="my-2 text-center text-xs text-muted-foreground">
                      OR
                    </p>
                    <GoogleLogin
                      onSuccess={handleGoogleLogin}
                      onError={() => toast({ title: "Google login failed" })}
                      size="large"
                      width="100%"
                      shape="square"
                      text="continue_with"
                      theme="filled_blue"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    New here? Create an account in minutes.
                  </p>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Your full name"
                        value={signup.name}
                        onChange={(e) => setSignup({ ...signup, name: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-phone">Mobile Number</Label>
                      <Input
                        id="signup-phone"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        value={signup.phone}
                        onChange={(e) => setSignup({ ...signup, phone: e.target.value.replace(/\D/g, "") })}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address <span className="text-muted-foreground">(optional)</span></Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={signup.email}
                        onChange={(e) => setSignup({ ...signup, email: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="signup-password">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Create a password"
                          value={signup.password}
                          onChange={(e) => setSignup({ ...signup, password: e.target.value })}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirm">Confirm Password</Label>
                        <Input
                          id="confirm"
                          type="password"
                          placeholder="Re-enter password"
                          value={signup.confirm}
                          onChange={(e) => setSignup({ ...signup, confirm: e.target.value })}
                          required
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full">Sign Up</Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">⭐ Why Join Silaibuddy?</span>
                <ul className="mt-2 list-disc pl-5">
                  <li>Book local skilled tailors at your fingertips.</li>
                  <li>Customize stitching for blouses, kurtas, sarees, suits & more.</li>
                  <li>Track your orders and delivery status easily.</li>
                  <li>Empower women tailors in your community.</li>
                </ul>
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Closing Note</span>
                <p className="mt-1">💜 Fashion meets empowerment. Join Silaibuddy today and stitch your story with us.</p>
              </div>
            </CardFooter>
          </Card>
          <p className="sr-only">OTP sent hint: {phoneMaskHint}</p>
        </section>
      </div>
    </div>
  );
}

function Benefit({
  icon: Icon,
  title,
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card/50 p-3 shadow-sm ring-1 ring-border/50">
      <div className="rounded-full bg-primary/10 p-2 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-sm font-medium text-foreground">{title}</div>
    </div>
  );
}