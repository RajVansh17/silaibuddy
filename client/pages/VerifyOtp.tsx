import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/hooks/use-toast";

function maskIndianNumber(num: string) {
  if (!/^\d{10}$/.test(num)) return "+91 XXXXXXX123";
  return "+91 XXXXXXX" + num.slice(-3);
}

export default function VerifyOtp() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const phone = params.get("phone") || "";
  const masked = useMemo(() => maskIndianNumber(phone), [phone]);

  const [otp, setOtp] = useState("");
  const [counter, setCounter] = useState(30);

  useEffect(() => {
    if (counter <= 0) return;
    const t = setTimeout(() => setCounter((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [counter]);

  const onVerify = () => {
    if (otp.length !== 6) {
      toast({ title: "Please enter the 6-digit OTP" });
      return;
    }
    toast({ title: "Verified! Welcome to Silaibuddy" });
  };

  const onResend = () => {
    setCounter(30);
    toast({ title: "OTP resent" });
  };

  return (
    <div className="relative mx-auto max-w-xl px-6 py-10 md:py-16">
      <Card className="backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <CardHeader>
          <CardTitle className="text-2xl">Verify Your Mobile Number 🔒</CardTitle>
          <CardDescription>
            We’ve sent a 6-digit OTP to your mobile number {masked}. Please enter it below to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="mb-2 text-sm font-medium">Enter OTP</div>
            <p className="text-xs text-muted-foreground">6-digit code sent via SMS/WhatsApp</p>
            <div className="mt-3">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
          <Button className="w-full" onClick={onVerify}>
            Verify & Continue
          </Button>
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground sm:flex-row sm:justify-between">
            <div>
              Didn’t receive the OTP?{" "}
              {counter > 0 ? (
                <span>Resend OTP (in {counter}s)</span>
              ) : (
                <button className="text-primary underline-offset-4 hover:underline" onClick={onResend}>
                  Resend OTP
                </button>
              )}
            </div>
            <button
              className="text-primary underline-offset-4 hover:underline"
              onClick={() => navigate("/")}
            >
              Entered wrong number? Change Mobile Number
            </button>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            💜 Your security is our priority. OTP ensures your account stays safe while giving you quick, hassle-free access to Silaibuddy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
