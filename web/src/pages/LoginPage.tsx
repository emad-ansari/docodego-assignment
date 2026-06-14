import React, { useState } from 'react'
import { useSurveys } from '../context/SurveyContext'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const LoginPage: React.FC = () => {
  const { login, user } = useSurveys()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  // If already logged in, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      navigate({ to: '/' })
    }
  }, [user, navigate])

  const handleLogin = () => {
    setIsLoading(true)
    setTimeout(() => {
      login()
      setIsLoading(false)
      navigate({ to: '/' })
    }, 1200) // Simulate a premium loading latency
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center bg-[#030303] text-neutral-100 overflow-hidden font-sans selection:bg-neutral-800 selection:text-white">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f12_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f12_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Main Login Card Container */}
      <div className="w-full max-w-[420px] px-6 py-12 flex flex-col items-center relative z-10 animate-fade-in">
        
        {/* Logo Icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 shadow-xl mb-6 group transition-all duration-300 hover:border-neutral-700">
          <svg className="w-6 h-6 text-white transition-transform duration-500 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>

        {/* Brand Header */}
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          Forma
        </h1>
        <p className="text-sm text-neutral-400 text-center mb-8 max-w-[280px]">
          Design premium, branded surveys. Built for modern product teams.
        </p>

        {/* Action Card */}
        <Card className="w-full bg-neutral-900/60 backdrop-blur-xl border border-neutral-800/80 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
          <CardContent className="p-6 flex flex-col gap-4">
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-6 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-950 text-sm font-medium transition-all duration-200 cursor-pointer active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-neutral-900" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 0, 0)">
                    <path d="M21.35,11.1H12v2.7h5.38C16.88,16.27,14.62,18,12,18c-3.31,0-6-2.69-6-6s2.69-6,6-6c1.66,0,3.13,0.67,4.24,1.76l2-2C16.5,4.18,14.38,3,12,3c-4.97,0-9,4.03-9,9s4.03,9,9,9c4.97,0,9-4.03,9-9C21,11.75,20.77,11.23,21.35,11.1z" fill="#000" />
                  </g>
                </svg>
              )}
              <span>{isLoading ? 'Verifying with Google...' : 'Continue with Google'}</span>
            </Button>

            <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
              <span>Enterprise SSO</span>
              <span className="flex items-center gap-1 hover:text-neutral-400 cursor-pointer transition-colors">
                Request access <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Fine print footer */}
        <div className="mt-8 text-xs text-neutral-500 text-center max-w-[280px]">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  )
}
