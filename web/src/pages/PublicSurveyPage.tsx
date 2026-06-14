import React, { useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useSurveys } from '../context/SurveyContext'
import { Star, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export const PublicSurveyPage: React.FC = () => {
  const { surveyId } = useParams({ from: '/survey/$surveyId' })
  const navigate = useNavigate()
  const { surveys, submitResponse, user } = useSurveys()

  const survey = surveys.find(s => s.id === surveyId)
  
  // Answers state: questionId -> answer string
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  if (!survey) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center font-sans">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-bold mb-2">Survey Not Found</h3>
        <p className="text-sm text-muted-foreground mb-6">The link you followed may be incorrect or the survey has been removed.</p>
        <Button
          variant="outline"
          onClick={() => window.close()}
          className="cursor-pointer"
        >
          Close Tab
        </Button>
      </div>
    )
  }

  const handleRatingSelect = (qId: string, ratingVal: number) => {
    setAnswers(prev => ({ ...prev, [qId]: ratingVal.toString() }))
    // Clear validation error if any
    if (errors[qId]) {
      setErrors(prev => {
        const copy = { ...prev }
        delete copy[qId]
        return copy
      })
    }
  }

  const handleChoiceSelect = (qId: string, optionVal: string) => {
    setAnswers(prev => ({ ...prev, [qId]: optionVal }))
    // Clear validation error if any
    if (errors[qId]) {
      setErrors(prev => {
        const copy = { ...prev }
        delete copy[qId]
        return copy
      })
    }
  }

  const handleTextChange = (qId: string, textVal: string) => {
    setAnswers(prev => ({ ...prev, [qId]: textVal }))
    if (textVal.trim() && errors[qId]) {
      setErrors(prev => {
        const copy = { ...prev }
        delete copy[qId]
        return copy
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required questions
    const newErrors: Record<string, string> = {}
    survey.questions.forEach(q => {
      if (q.required && (!answers[q.id] || !answers[q.id].trim())) {
        newErrors[q.id] = 'This question is required.'
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      
      // Scroll to first error
      const firstErrorId = Object.keys(newErrors)[0]
      const element = document.getElementById(`q-container-${firstErrorId}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    // Submit answers
    submitResponse(survey.id, answers)
    setSubmitted(true)
  }

  // Render completed view
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-background text-foreground px-4 font-sans select-none relative overflow-hidden">
        {/* Glow styling centered around completion card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full blur-[100px] pointer-events-none" 
          style={{ backgroundColor: `${survey.primaryColor}15` }}
        />
        
        <Card className="w-full max-w-[480px] bg-card/65 backdrop-blur-xl border-border rounded-3xl relative z-10 shadow-2xl animate-zoom-in">
          <CardContent className="p-8 text-center flex flex-col items-center">
            {survey.logoUrl && (
              <img 
                src={survey.logoUrl} 
                alt={survey.title}
                className="w-12 h-12 rounded-xl object-cover border border-border mb-6 shadow-md"
              />
            )}

            <div className="inline-flex p-3 rounded-full bg-muted border border-border mb-4" style={{ color: survey.primaryColor }}>
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h1 className="text-xl font-bold text-foreground mb-2">Thank you!</h1>
            <p className="text-sm text-muted-foreground max-w-[280px] mx-auto mb-8">
              Your responses have been securely recorded. You can close this window now.
            </p>

            <div className="pt-6 border-t border-border w-full flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/60">
              <Sparkles className="w-3 h-3" />
              <span>Powered by Forma Surveys</span>
            </div>
          </CardContent>
        </Card>

        {user && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3.5 px-5 py-3 bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-full text-xs shadow-2xl animate-fade-in whitespace-nowrap">
            <span className="text-neutral-500 font-medium">Admin Preview</span>
            <div className="w-1 h-1 rounded-full bg-neutral-850" />
            <Button
              variant="ghost"
              size="xs"
              onClick={() => navigate({ to: `/builder/${survey.id}` })}
              className="text-neutral-300 hover:text-white transition-colors cursor-pointer font-medium p-0 h-auto hover:bg-transparent"
            >
              Edit Design
            </Button>
            <div className="w-1 h-1 rounded-full bg-neutral-850" />
            <Button
              variant="ghost"
              size="xs"
              onClick={() => navigate({ to: `/responses/${survey.id}` })}
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors cursor-pointer p-0 h-auto hover:bg-transparent"
            >
              View Responses
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-12 md:py-20 px-4 font-sans antialiased text-left selection:bg-neutral-800 selection:text-white relative overflow-hidden">
      {/* Light grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_0.5px,transparent_0.5px),linear-gradient(to_bottom,var(--border)_0.5px,transparent_0.5px)] bg-[size:32px_32px] pointer-events-none opacity-40" />

      <div className="max-w-[620px] mx-auto relative z-10 flex flex-col gap-8 animate-fade-in">
        
        {/* Survey Header Branding Box */}
        <Card className="bg-card border-border rounded-3xl shadow-xs relative animate-slide-up">
          <CardContent className="p-6 md:p-8 flex flex-col gap-5">
            {/* Logo container */}
            {survey.logoUrl && (
              <img 
                src={survey.logoUrl} 
                alt={survey.title}
                className="w-14 h-14 rounded-2xl object-cover border border-border self-start shadow-md"
              />
            )}

            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mb-2">
                {survey.title}
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {survey.description}
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 pt-3 border-t border-border">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Anonymous response collection enabled</span>
            </div>
          </CardContent>
        </Card>

        {/* Survey Questions Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {survey.questions.map((q, idx) => {
            const hasError = !!errors[q.id]
            const answerVal = answers[q.id] || ''

            return (
              <Card
                key={q.id}
                id={`q-container-${q.id}`}
                style={{ animationDelay: `${(idx + 1) * 50}ms` }}
                className={`bg-card border rounded-3xl transition-all duration-300 flex flex-col gap-4 relative animate-slide-up ${
                  hasError 
                    ? 'border-destructive/80 bg-destructive/5 ring-1 ring-destructive/10' 
                    : 'border-border hover:border-neutral-800'
                }`}
              >
                <CardContent className="p-6 md:p-8 flex flex-col gap-4">
                  {/* Error Banner */}
                  {hasError && (
                    <div className="absolute top-6 right-6 flex items-center gap-1 text-destructive text-[10px] font-semibold bg-destructive/10 border border-destructive/20 px-2 py-0.5 rounded-md">
                      <AlertCircle className="w-3 h-3" />
                      <span>Required</span>
                    </div>
                  )}

                  {/* Question Label */}
                  <h3 className="text-sm font-semibold text-foreground flex items-start gap-1">
                    <span>{idx + 1}.</span>
                    <span className="flex-1">{q.text}</span>
                    {q.required && (
                      <span className="text-destructive font-bold text-xs" title="Required">*</span>
                    )}
                  </h3>

                  {/* Inputs Mapping */}
                  {q.type === 'short-text' && (
                    <Input
                      type="text"
                      placeholder="Type your answer here..."
                      value={answerVal}
                      onChange={(e) => handleTextChange(q.id, e.target.value)}
                      className="h-11 w-full bg-background border-border rounded-xl px-4 py-3 text-sm text-foreground focus-visible:ring-ring/40"
                      style={{
                        borderColor: answerVal ? survey.primaryColor : undefined,
                      }}
                    />
                  )}

                  {q.type === 'rating' && (
                    <div className="flex items-center gap-2 pt-1.5">
                      {[1, 2, 3, 4, 5].map((ratingVal) => {
                        const isSelected = answerVal === ratingVal.toString()
                        return (
                          <button
                            key={ratingVal}
                            type="button"
                            onClick={() => handleRatingSelect(q.id, ratingVal)}
                            className="w-10 h-10 rounded-full border flex items-center justify-center text-sm font-semibold cursor-pointer transition-all duration-150 active:scale-95"
                            style={{
                              borderColor: isSelected ? survey.primaryColor : 'var(--border)',
                              backgroundColor: isSelected ? `${survey.primaryColor}1a` : 'var(--background)',
                              color: isSelected ? 'var(--foreground)' : 'var(--muted-foreground)'
                            }}
                          >
                            {ratingVal}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {q.type === 'multiple-choice' && (
                    <div className="flex flex-col gap-2.5 pt-1">
                      {q.options?.map((option, oIdx) => {
                        const isSelected = answerVal === option
                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => handleChoiceSelect(q.id, option)}
                            className="flex items-center gap-3.5 w-full bg-background/40 border rounded-2xl px-4.5 py-3 text-left text-xs text-foreground cursor-pointer hover:bg-background hover:border-neutral-500 transition-all duration-150 active:scale-[0.99]"
                            style={{
                              borderColor: isSelected ? survey.primaryColor : undefined,
                              backgroundColor: isSelected ? `${survey.primaryColor}08` : undefined
                            }}
                          >
                            {/* Inner Radio Circle */}
                            <div 
                              className="w-4.5 h-4.5 rounded-full border flex items-center justify-center flex-shrink-0"
                              style={{
                                borderColor: isSelected ? survey.primaryColor : 'var(--border)',
                                backgroundColor: isSelected ? survey.primaryColor : 'transparent'
                              }}
                            >
                              {isSelected && (
                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                              )}
                            </div>
                            
                            <span className={`transition-colors duration-150 ${isSelected ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                              {option}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}

          {/* Form Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm transition-all duration-200 cursor-pointer hover:brightness-110 active:scale-[0.985] shadow-lg flex items-center justify-center gap-2"
            style={{ backgroundColor: survey.primaryColor }}
          >
            <span>Submit Survey Response</span>
          </button>
        </form>
      </div>

      {user && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3.5 px-5 py-3 bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-full text-xs shadow-2xl animate-fade-in whitespace-nowrap">
          <span className="text-neutral-500 font-medium">Admin Preview</span>
          <div className="w-1 h-1 rounded-full bg-neutral-850" />
          <Button
            variant="ghost"
            size="xs"
            onClick={() => navigate({ to: `/builder/${survey.id}` })}
            className="text-neutral-300 hover:text-white transition-colors cursor-pointer font-medium p-0 h-auto hover:bg-transparent"
          >
            Edit Design
          </Button>
          <div className="w-1 h-1 rounded-full bg-neutral-850" />
          <Button
            variant="ghost"
            size="xs"
            onClick={() => navigate({ to: `/responses/${survey.id}` })}
            className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors cursor-pointer p-0 h-auto hover:bg-transparent"
          >
            View Responses
          </Button>
        </div>
      )}
    </div>
  )
}
