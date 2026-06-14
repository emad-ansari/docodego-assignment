import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useSurveys, type SurveyResponse } from '../context/SurveyContext'
import { 
  ArrowLeft, 
  BarChart3, 
  Clock, 
  User, 
  MessageSquare, 
  Calendar,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const ResponsesPage: React.FC = () => {
  const { surveyId } = useParams({ from: '/responses/$surveyId' })
  const navigate = useNavigate()
  const { user, surveys, responses } = useSurveys()

  // Auth check
  useEffect(() => {
    if (!user) {
      navigate({ to: '/login' })
    }
  }, [user, navigate])

  const [activeTab, setActiveTab] = useState<'summary' | 'individual'>('summary')
  const [selectedResponseIdx, setSelectedResponseIdx] = useState<number>(0)

  const survey = surveys.find(s => s.id === surveyId)
  if (!survey) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center text-muted-foreground font-sans">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Survey not found</h3>
        <Button 
          variant="outline"
          onClick={() => navigate({ to: '/' })}
          className="cursor-pointer"
        >
          Return to Dashboard
        </Button>
      </div>
    )
  }

  // Filter responses belonging to this survey
  const surveyResponses = responses
    .filter(r => r.surveyId === surveyId)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()) // Newest first

  const totalResponses = surveyResponses.length

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Analytics helper calculations
  const calculateRatingStats = (questionId: string) => {
    const ratings = surveyResponses
      .map(r => parseInt(r.answers[questionId]))
      .filter(val => !isNaN(val))

    if (ratings.length === 0) return { avg: 0, count: 0 }
    const sum = ratings.reduce((acc, curr) => acc + curr, 0)
    return {
      avg: sum / ratings.length,
      count: ratings.length
    }
  }

  const calculateChoiceStats = (questionId: string, options: string[]) => {
    const counts: Record<string, number> = {}
    options.forEach(opt => { counts[opt] = 0 })

    let answeredCount = 0
    surveyResponses.forEach(r => {
      const answer = r.answers[questionId]
      if (answer) {
        counts[answer] = (counts[answer] || 0) + 1
        answeredCount++
      }
    })

    return options.map(opt => {
      const count = counts[opt] || 0
      const pct = answeredCount > 0 ? Math.round((count / answeredCount) * 100) : 0
      return { option: opt, count, pct }
    })
  }

  const getShortTextResponses = (questionId: string) => {
    return surveyResponses
      .map(r => ({
        text: r.answers[questionId],
        date: r.submittedAt
      }))
      .filter(item => item.text && item.text.trim() !== '')
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased flex flex-col selection:bg-neutral-800 selection:text-white">
      
      {/* Sub-Header bar */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost"
              size="icon-xs"
              onClick={() => navigate({ to: '/' })}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <div className="h-4 w-px bg-border" />
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Responses</span>
              <span className="text-xs text-muted-foreground/60">/</span>
              <span className="text-xs font-medium text-foreground max-w-[150px] truncate">{survey.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View navigation */}
            <nav className="flex items-center bg-muted p-1 rounded-lg border border-border">
              <Button 
                variant="ghost"
                size="xs"
                onClick={() => navigate({ to: `/builder/${survey.id}` })}
                className="font-medium text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Design
              </Button>
              <Button 
                variant="secondary"
                size="xs"
                className="font-medium shadow-xs"
                disabled
              >
                Responses
              </Button>
            </nav>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: `/survey/${survey.id}` })}
              className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
            >
              <span>View Public Page</span>
              <ExternalLink className="w-3.5 h-3.5 stroke-[2]" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 animate-fade-in">
        
        {/* Survey Summary Stats Header */}
        <Card className="bg-card border-border rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 text-left animate-slide-up">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mb-2">
              {survey.title} Responses
            </h1>
            <p className="text-xs text-muted-foreground">
              Anonymous responses are updated dynamically.
            </p>
          </div>

          {/* Stat Pill */}
          <Card className="flex flex-row items-center gap-4.5 bg-background border border-border rounded-2xl px-6 py-4 self-start md:self-auto shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
              <MessageSquare className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <div className="text-2xl font-black text-foreground leading-none mb-1">{totalResponses}</div>
              <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Submissions</div>
            </div>
          </Card>
        </Card>

        {/* Mode Toggle Tabs */}
        {totalResponses > 0 && (
          <div className="flex border-b border-border gap-6">
            <button
              onClick={() => setActiveTab('summary')}
              className={`pb-3 text-xs font-bold uppercase tracking-wider relative cursor-pointer ${
                activeTab === 'summary' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Question Summary
              {activeTab === 'summary' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: survey.primaryColor }} />
              )}
            </button>
            <button
              onClick={() => setActiveTab('individual')}
              className={`pb-3 text-xs font-bold uppercase tracking-wider relative cursor-pointer ${
                activeTab === 'individual' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Individual Responses
              {activeTab === 'individual' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: survey.primaryColor }} />
              )}
            </button>
          </div>
        )}

        {/* Content Views */}
        {totalResponses === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-3xl py-20 px-4 text-center bg-card/20 animate-slide-up">
            <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center mb-4 text-muted-foreground">
              <BarChart3 className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">Waiting for submissions</h3>
            <p className="text-sm text-muted-foreground max-w-[320px] mb-6">
              Share the public link with your audience to collect responses. Submissions will appear here instantly.
            </p>
            <Button
              variant="default"
              size="lg"
              onClick={() => navigate({ to: `/survey/${survey.id}` })}
              className="flex items-center gap-1.5 cursor-pointer text-sm font-semibold shadow-md"
            >
              <span>Submit Mock Response</span>
              <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
            </Button>
          </div>
        ) : activeTab === 'summary' ? (
          /* SUMMARY VIEW: Metric boxes */
          <div className="flex flex-col gap-6">
            {survey.questions.map((q, qIdx) => {
              return (
                <Card 
                  key={q.id}
                  style={{ animationDelay: `${qIdx * 50}ms` }}
                  className="bg-card border-border rounded-2xl p-6 text-left flex flex-col gap-4 animate-slide-up"
                >
                  {/* Question Heading */}
                  <div className="flex items-start justify-between border-b border-border pb-3">
                    <h3 className="text-sm font-semibold text-foreground">
                      <span className="text-muted-foreground mr-1.5">Q{qIdx + 1}.</span>
                      {q.text}
                    </h3>
                    
                    <Badge variant="outline" className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-md bg-background border-border text-muted-foreground tracking-wider">
                      {q.type}
                    </Badge>
                  </div>

                  {/* Summary analytics depending on question type */}
                  {q.type === 'rating' && (
                    (() => {
                      const stats = calculateRatingStats(q.id)
                      return (
                        <div className="flex items-center gap-8 py-3">
                          {/* Avg Rating */}
                          <div className="flex flex-col">
                            <span className="text-4xl font-black text-foreground leading-none mb-1">{stats.avg.toFixed(1)}</span>
                            <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">Average Score</span>
                          </div>

                          <div className="flex-1 max-w-xs flex flex-col gap-1">
                            {/* Stars visual indicator */}
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  className="w-4 h-4 fill-amber-450 stroke-amber-450" 
                                  style={{ opacity: star <= stats.avg ? 1 : 0.2 }}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] text-muted-foreground/60">Calculated from {stats.count} reviews</span>
                          </div>
                        </div>
                      )
                    })()
                  )}

                  {q.type === 'multiple-choice' && q.options && (
                    <div className="flex flex-col gap-3 py-1">
                      {calculateChoiceStats(q.id, q.options).map((stat, oIdx) => (
                        <div key={oIdx} className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between text-xs font-medium text-foreground">
                            <span>{stat.option}</span>
                            <span className="text-muted-foreground">{stat.count} ({stat.pct}%)</span>
                          </div>
                          
                          {/* Custom colored progress bar */}
                          <div className="h-2 w-full bg-background rounded-full overflow-hidden border border-border">
                            <div 
                              className="h-full rounded-full transition-all duration-500" 
                              style={{ 
                                width: `${stat.pct}%`,
                                backgroundColor: survey.primaryColor
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === 'short-text' && (
                    (() => {
                      const txtResponses = getShortTextResponses(q.id)
                      return (
                        <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                          {txtResponses.length > 0 ? (
                            txtResponses.map((item, idx) => (
                              <div 
                                key={idx}
                                className="bg-background/60 border border-border rounded-xl p-3.5 text-xs text-foreground leading-relaxed relative"
                              >
                                <p className="mb-1">{item.text}</p>
                                <span className="text-[9px] text-muted-foreground/60 flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>{formatDate(item.date)}</span>
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground/60 py-3">No text answers submitted.</span>
                          )}
                        </div>
                      )
                    })()
                  )}

                </Card>
              )
            })}
          </div>
        ) : (
          /* INDIVIDUAL RESPONSES VIEW */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start animate-slide-up">
            
            {/* List column */}
            <div className="md:col-span-1 border border-border rounded-2xl overflow-hidden flex flex-col bg-card/20">
              <div className="p-4 bg-card border-b border-border flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Submission Log</span>
              </div>
              
              <div className="flex flex-col max-h-[480px] overflow-y-auto divide-y divide-border">
                {surveyResponses.map((resp, idx) => {
                  const isActive = idx === selectedResponseIdx
                  return (
                    <button
                      key={resp.id}
                      onClick={() => setSelectedResponseIdx(idx)}
                      className={`p-4 text-left flex items-start gap-3 transition-colors duration-150 cursor-pointer ${
                        isActive 
                          ? 'bg-card text-foreground' 
                          : 'hover:bg-muted/30 text-muted-foreground'
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-background border border-border text-muted-foreground">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-foreground">
                          Response #{surveyResponses.length - idx}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {formatDate(resp.submittedAt)}
                        </div>
                      </div>

                      <ChevronRight className="w-3.5 h-3.5 self-center text-muted-foreground/40" />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Answer detail card column */}
            <Card className="md:col-span-2 border-border bg-card p-6 flex flex-col gap-6 text-left relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: survey.primaryColor }} />

              {/* Responder title details */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="font-bold text-foreground text-base">
                    Response #{surveyResponses.length - selectedResponseIdx}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Submitted on {formatDate(surveyResponses[selectedResponseIdx]?.submittedAt)}</span>
                  </p>
                </div>

                <Badge variant="outline" className="text-[9px] uppercase font-bold bg-background border-border px-2 py-0.5 rounded text-muted-foreground">
                  Secure ID: {surveyResponses[selectedResponseIdx]?.id}
                </Badge>
              </div>

              {/* Answers Grid */}
              <div className="flex flex-col gap-5">
                {survey.questions.map((q, qIdx) => {
                  const ans = surveyResponses[selectedResponseIdx]?.answers[q.id]
                  return (
                    <div key={q.id} className="flex flex-col gap-1.5">
                      <div className="text-xs font-semibold text-muted-foreground">
                        Q{qIdx + 1}. {q.text}
                      </div>

                      <div className="pl-3 border-l-2 text-sm text-foreground" style={{ borderColor: survey.primaryColor }}>
                        {ans ? (
                          q.type === 'rating' ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-foreground">{ans}</span>
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star 
                                    key={star} 
                                    className="w-3 h-3 fill-amber-450 stroke-amber-450" 
                                    style={{ opacity: star <= parseInt(ans) ? 1 : 0.2 }}
                                  />
                                ))}
                              </div>
                            </div>
                          ) : (
                            ans
                          )
                        ) : (
                          <span className="text-muted-foreground italic">No response provided</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="pt-6 border-t border-border flex items-center justify-center gap-1.5 text-[9px] text-muted-foreground/60 mt-4 select-none">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Format verified by Acme survey database</span>
              </div>
            </Card>

          </div>
        )}

      </main>
    </div>
  )
}
