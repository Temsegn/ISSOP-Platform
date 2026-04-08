'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Mail, Lock, ArrowRight, Loader2, Info, Building2, MapPin, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await api.login(email, password)
      
      if (response.status === 'success') {
        const { user, token } = response.data
        
        // Ensure user is an admin or superadmin
        if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
          toast.error('Access denied. Admin privileges required.')
          setIsLoading(false)
          return
        }

        api.setToken(token)
        toast.success(`Welcome back, ${user.name}!`)
        
        // Brief delay for the toast and transition
        setTimeout(() => {
          router.push('/dashboard')
        }, 800)
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0c0d12] flex items-center justify-center p-4">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] animate-pulse-slow delayed-3000" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px] animate-float" />
        
        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      {/* Floating Decorative Icons */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] left-[20%] text-primary/30"
        >
          <Building2 size={64} />
        </motion.div>
        <motion.div 
          animate={{ y: [0, 20, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[20%] left-[15%] text-accent/20"
        >
          <MapPin size={48} />
        </motion.div>
        <motion.div 
          animate={{ x: [0, 15, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[25%] right-[20%] text-primary/20"
        >
          <Zap size={56} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-strong rounded-3xl p-8 shadow-2xl overflow-hidden relative">
          {/* Card Accent Top */}
          <div className="absolute top-0 left-0 w-full h-1 gradient-primary" />
          
          <div className="flex flex-col items-center text-center mb-8">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/20"
            >
              <Shield className="text-white h-8 w-8" />
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">ISSOP Admin</h1>
            <p className="text-muted-foreground mt-2">Intelligent Smart City Operations Platform</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Administrative Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@issop.gov"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Secure Password</Label>
                  <button type="button" className="text-xs text-primary hover:underline transition-all">
                    Forgot password?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98] group"
              disabled={isLoading}
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Authenticating...
                  </motion.div>
                ) : (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    Sign In to Dashboard
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border/50 flex flex-col gap-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 text-xs text-muted-foreground">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p>
                This terminal is restricted to authorized ISSOP Urban Management personnel. 
                All activities are logged and monitored.
              </p>
            </div>
            
            <p className="text-center text-xs text-muted-foreground">
              &copy; 2026 ISSOP Platform Central. v2.4.0
            </p>
          </div>
        </div>
      </motion.div>

      {/* Decorative Blur Orbs */}
      <div className="fixed bottom-[5%] left-[5%] h-64 w-64 rounded-full bg-primary/5 blur-[80px] pointer-events-none" />
      <div className="fixed top-[5%] right-[5%] h-64 w-64 rounded-full bg-accent/5 blur-[80px] pointer-events-none" />
    </div>
  )
}
