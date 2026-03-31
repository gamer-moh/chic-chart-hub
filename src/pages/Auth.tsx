import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Building2, Lock } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("تم تسجيل الدخول بنجاح");
        navigate(-1);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("تم إنشاء الحساب بنجاح");
        navigate(-1);
      }
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-bl from-[hsl(200,50%,18%)] via-[hsl(195,65%,25%)] to-[hsl(165,60%,30%)] flex items-center justify-center px-4">
      <div className="bg-card rounded-2xl shadow-2xl p-8 w-full max-w-md border border-border">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {isLogin ? "تسجيل الدخول" : "إنشاء حساب"}
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            للوصول إلى صفحات إدارة المشاريع
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label>البريد الإلكتروني</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
              required
              dir="ltr"
            />
          </div>
          <div>
            <Label>كلمة المرور</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
              required
              dir="ltr"
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "جاري المعالجة..." : isLogin ? "دخول" : "إنشاء حساب"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-primary hover:underline"
          >
            {isLogin ? "ليس لديك حساب؟ سجل الآن" : "لديك حساب؟ سجل دخول"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
