
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import ZovidaLogo from '@/components/ZovidaLogo';
import { ArrowLeft, Lock, Mail, User, Sparkles, ShieldCheck, Zap, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { endpoints } from '@/lib/api';

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('harshitarora1065@gmail.com');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('harshit123');
  const [otpCode, setOtpCode] = useState('');
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [otpMethod, setOtpMethod] = useState<'email' | 'phone'>('phone');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [name, setName] = useState('');
  const [activeTab, setActiveTab] = useState('login');

  const handleRequestOtp = async () => {
    if (otpMethod === 'email' && !email) {
      toast.error("Email required", { description: "Please enter your email to receive an OTP." });
      return;
    }
    if (otpMethod === 'phone' && !phone) {
      toast.error("Phone required", { description: "Please enter your mobile number to receive an OTP." });
      return;
    }
    
    setIsLoading(true);
    try {
      const body = otpMethod === 'email' 
        ? { email: email.trim() } 
        : { phone: phone.trim() };

      const response = await fetch(endpoints.auth.requestOtp, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      const data = await response.json();
      if (response.ok) {
        setIsOtpSent(true);
        if (data.code && data.code !== "SENT") {
          setOtpCode(data.code);
          toast.success("OTP Sent!", { description: otpMethod === 'email' ? `Demo: Use code ${data.code}` : `Real-time SMS sent to ${phone} (Demo code: ${data.code})` });
        } else {
          toast.success("OTP Sent!", { description: otpMethod === 'email' ? "Check your inbox for the 6-digit code." : `Real-time SMS sent to ${phone}. Please enter the 6-digit code.` });
        }
      } else {
        toast.error("Failed to send OTP", { description: data.error || "Something went wrong." });
      }
    } catch (error) {
      toast.error("Connection error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loginMode === 'otp' && !isOtpSent) {
      handleRequestOtp();
      return;
    }

    setIsLoading(true);
    const trimmedEmail = email.trim();
    
    try {
      const url = loginMode === 'password' ? endpoints.auth.login : endpoints.auth.loginOtp;
      
      let body: any = { otp_code: otpCode };
      if (loginMode === 'password') {
        body = { email: trimmedEmail, password };
      } else {
        if (otpMethod === 'email') body.email = trimmedEmail;
        else body.phone = phone.trim();
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      const data = await response.json();
      
      if (response.ok && !data.error) {
        localStorage.setItem('zovida_user_id', data.user_id.toString());
        toast.success("Welcome back!", {
          description: "You have successfully logged in.",
        });
        navigate('/');
      } else {
        toast.error("Login failed", {
          description: data.error || "Invalid credentials",
        });
      }
    } catch (error) {
      toast.error("Connection error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    if (password.length < 4) {
      toast.error("Signup failed", {
        description: "Password must be at least 4 characters long",
      });
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch(endpoints.auth.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: trimmedEmail, 
          phone: phone.trim(),
          password, 
          name: trimmedName 
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && !data.error) {
        toast.success("Account created!", {
          description: "Welcome to Zovida. Please sign in with your new account.",
        });
        setActiveTab('login');
      } else {
        toast.error("Signup failed", {
          description: data.error || "Could not create account",
        });
      }
    } catch (error) {
      toast.error("Connection error", {
        description: "Could not connect to the server.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-safe/10 rounded-full blur-[130px] animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,white_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)]" />
      </div>

      <div className="p-4 md:p-8">
        {/* Removed 'Back to Home' as auth is mandatory first step */}
      </div>

      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side: Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block space-y-8"
          >
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <ZovidaLogo size="sm" showText={false} />
              </div>
              <span className="text-3xl font-black tracking-tighter">
                Zovida<span className="text-primary">.</span>
              </span>
            </div>
            
            <h1 className="text-5xl font-black leading-tight tracking-tight">
              Secure Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-safe">Family's Health</span> <br />
              With Vision AI.
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-md leading-relaxed">
              Join the next generation of healthcare safety. Scan, track, and protect with intelligent medication monitoring.
            </p>

            <div className="space-y-6 pt-4">
              {[
                { icon: ShieldCheck, title: "AI Interaction Detection", desc: "Instantly spot dangerous drug combinations." },
                { icon: Zap, title: "Real-time Monitoring", desc: "Stay updated on medication adherence and safety." },
                { icon: Sparkles, title: "Family SafeCircle™", desc: "Connect and protect your loved ones in one place." }
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="mt-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm text-primary">
                    <feature.icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Side: Auth Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mx-auto"
          >
            <div className="lg:hidden flex justify-center mb-8">
              <ZovidaLogo size="xl" />
            </div>

            <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 rounded-[2.5rem] overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <CardHeader className="p-8 pb-4">
                  <TabsList className="grid w-full grid-cols-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl h-14">
                    <TabsTrigger value="login" className="rounded-xl font-bold text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">Login</TabsTrigger>
                    <TabsTrigger value="register" className="rounded-xl font-bold text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">Sign Up</TabsTrigger>
                  </TabsList>
                </CardHeader>
                
                <AnimatePresence mode="wait">
                  {activeTab === 'login' ? (
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <form onSubmit={handleLogin}>
                        <CardContent className="space-y-5 p-8 pt-4">
                          {loginMode === 'otp' && (
                            <div className="flex gap-2 mb-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                              <Button
                                type="button"
                                variant={otpMethod === 'phone' ? 'secondary' : 'ghost'}
                                className={`flex-1 rounded-lg text-xs font-bold transition-all ${otpMethod === 'phone' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
                                onClick={() => { setOtpMethod('phone'); setIsOtpSent(false); }}
                              >
                                <Phone size={14} className="mr-2" /> Mobile
                              </Button>
                              <Button
                                type="button"
                                variant={otpMethod === 'email' ? 'secondary' : 'ghost'}
                                className={`flex-1 rounded-lg text-xs font-bold transition-all ${otpMethod === 'email' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
                                onClick={() => { setOtpMethod('email'); setIsOtpSent(false); }}
                              >
                                <Mail size={14} className="mr-2" /> Email
                              </Button>
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label htmlFor="identifier" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                              {loginMode === 'password' || otpMethod === 'email' ? 'Email Address' : 'Mobile Number'}
                            </Label>
                            <div className="relative group">
                              {loginMode === 'password' || otpMethod === 'email' ? (
                                <>
                                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                  <Input 
                                    id="email" 
                                    placeholder="name@example.com" 
                                    type="email" 
                                    className="pl-12 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium" 
                                    required 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isOtpSent}
                                  />
                                </>
                              ) : (
                                <>
                                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                  <Input 
                                    id="phone" 
                                    placeholder="+1 234 567 8900" 
                                    type="tel" 
                                    className="pl-12 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium" 
                                    required 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    disabled={isOtpSent}
                                  />
                                </>
                              )}
                            </div>
                          </div>

                          <AnimatePresence mode="wait">
                            {loginMode === 'password' ? (
                              <motion.div 
                                key="password-input"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2"
                              >
                                <div className="flex items-center justify-between ml-1">
                                  <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Password</Label>
                                  <Button variant="link" className="p-0 h-auto text-[10px] font-bold text-primary uppercase tracking-wider" type="button">
                                    Forgot password?
                                  </Button>
                                </div>
                                <div className="relative group">
                                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                  <Input 
                                    id="password" 
                                    placeholder="••••••••" 
                                    type="password" 
                                    className="pl-12 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium" 
                                    required={loginMode === 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                  />
                                </div>
                              </motion.div>
                            ) : (
                              <motion.div 
                                key="otp-input"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2"
                              >
                                <div className="flex items-center justify-between ml-1">
                                  <Label htmlFor="otp" className="text-xs font-black uppercase tracking-widest text-muted-foreground">OTP Code</Label>
                                  {isOtpSent && (
                                    <Button 
                                      variant="link" 
                                      className="p-0 h-auto text-[10px] font-bold text-primary uppercase tracking-wider" 
                                      type="button"
                                      onClick={() => { setIsOtpSent(false); setOtpCode(''); }}
                                    >
                                      {otpMethod === 'email' ? 'Change Email?' : 'Change Phone?'}
                                    </Button>
                                  )}
                                </div>
                                <div className="relative group">
                                  <Zap className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                  <Input 
                                    id="otp" 
                                    placeholder={isOtpSent ? "Enter 6-digit code" : "Click button below to get OTP"}
                                    className="pl-12 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium" 
                                    required={loginMode === 'otp'}
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value)}
                                    disabled={!isOtpSent}
                                    maxLength={6}
                                  />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="flex justify-center pt-2">
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              className="text-xs font-bold text-muted-foreground hover:text-primary rounded-xl"
                              onClick={() => {
                                setLoginMode(loginMode === 'password' ? 'otp' : 'password');
                                setIsOtpSent(false);
                                setOtpCode('');
                              }}
                            >
                              {loginMode === 'password' ? "Switch to OTP Login" : "Switch to Password Login"}
                            </Button>
                          </div>
                        </CardContent>
                        <CardFooter className="p-8 pt-0 flex flex-col gap-6">
                          <Button 
                            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95 group" 
                            type="submit" 
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Processing...</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span>{loginMode === 'otp' && !isOtpSent ? "Send OTP Code" : "Sign In Now"}</span>
                                <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                              </div>
                            )}
                          </Button>
                          
                          <div className="flex items-center gap-4 w-full">
                            <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Secure Access</span>
                            <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1" />
                          </div>
                        </CardFooter>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="register"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <form onSubmit={handleSignup}>
                        <CardContent className="space-y-4 p-8 pt-4">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                            <div className="relative group">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                              <Input 
                                id="name" 
                                placeholder="John Doe" 
                                className="pl-12 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium" 
                                required 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="signup-email" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                            <div className="relative group">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                              <Input 
                                id="signup-email" 
                                placeholder="name@example.com" 
                                type="email" 
                                className="pl-12 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium" 
                                required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="signup-phone" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Mobile Number (Optional)</Label>
                            <div className="relative group">
                              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                              <Input 
                                id="signup-phone" 
                                placeholder="+1 234 567 8900" 
                                type="tel" 
                                className="pl-12 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium" 
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="signup-password" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Create Password</Label>
                            <div className="relative group">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                              <Input 
                                id="signup-password" 
                                placeholder="Min. 8 characters" 
                                type="password" 
                                className="pl-12 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium" 
                                required 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                              />
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="p-8 pt-0 flex flex-col gap-6">
                          <Button 
                            className="w-full h-14 bg-safe hover:bg-safe/90 rounded-2xl text-lg font-black shadow-xl shadow-safe/20 transition-all active:scale-95" 
                            type="submit" 
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                <span>Creating Account...</span>
                              </div>
                            ) : "Create Account"}
                          </Button>
                          
                          <div className="flex items-center gap-4 w-full">
                            <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Verify Email Next</span>
                            <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1" />
                          </div>
                        </CardFooter>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Tabs>
            </Card>
            
            <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-8 opacity-50">
              © 2026 Zovida Healthcare AI • Privacy First
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
