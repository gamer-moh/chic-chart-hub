import { useState } from "react";
import { Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PASSCODE = "1123";

interface PasswordGateProps {
  onUnlock: () => void;
}

const PasswordGate = ({ onUnlock }: PasswordGateProps) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSCODE) {
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-[hsl(200,50%,18%)] via-[hsl(195,65%,25%)] to-[hsl(165,60%,30%)]" dir="rtl">
      <div className="bg-card/90 backdrop-blur-md rounded-2xl shadow-2xl p-10 w-full max-w-sm text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">الدخول محمي</h1>
        <p className="text-sm text-muted-foreground mb-6">أدخل كلمة المرور للمتابعة</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور"
            className={`text-center text-lg tracking-widest ${error ? "border-destructive" : ""}`}
            autoFocus
          />
          {error && <p className="text-sm text-destructive">كلمة المرور غير صحيحة</p>}
          <Button type="submit" className="w-full">دخول</Button>
        </form>
      </div>
    </div>
  );
};

export default PasswordGate;
