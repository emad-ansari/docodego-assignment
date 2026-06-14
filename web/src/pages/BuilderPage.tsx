import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useSurveys, type Question } from '../context/SurveyContext'
import { 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Plus, 
  Copy, 
  Check, 
  ExternalLink,
  AlignLeft,
  List,
  Star,
  Sparkles,
  ArrowLeft,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

// Modern HSL/Slate presets for premium look
const COLOR_PRESETS = [
  { hex: '#0f172a', name: 'Slate' },
  { hex: '#6366f1', name: 'Indigo' },
  { hex: '#8b5cf6', name: 'Violet' },
  { hex: '#f43f5e', name: 'Rose' },
  { hex: '#14b8a6', name: 'Teal' },
  { hex: '#d97706', name: 'Amber' },
  { hex: '#10b981', name: 'Emerald' }
]

export const BuilderPage: React.FC = () => {
  const { surveyId } = useParams({ from: '/builder/$surveyId' })
  const navigate = useNavigate()
  const { 
    user, 
    surveys, 
    updateSurvey, 
    addQuestion, 
    updateQuestion, 
    deleteQuestion, 
    reorderQuestions 
  } = useSurveys()

  // Auth check
  useEffect(() => {
    if (!user) {
      navigate({ to: '/login' })
    }
  }, [user, navigate])

  const survey = surveys.find(s => s.id === surveyId)
  const [copied, setCopied] = useState(false)
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null)

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

  const handleCopyLink = () => {
    const publicUrl = `${window.location.origin}/survey/${survey.id}`
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const handleAddQuestion = (type: Question['type']) => {
    addQuestion(survey.id, type)
    // Auto-focus the newly added question card
    setTimeout(() => {
      const updatedSurvey = surveys.find(s => s.id === surveyId)
      if (updatedSurvey && updatedSurvey.questions.length > 0) {
        const lastQ = updatedSurvey.questions[updatedSurvey.questions.length - 1]
        setActiveQuestionId(lastQ.id)
      }
    }, 50)
  }

  // Handle reordering questions
  const handleMoveUp = (index: number) => {
    if (index === 0) return
    reorderQuestions(survey.id, index, index - 1)
  }

  const handleMoveDown = (index: number) => {
    if (index === survey.questions.length - 1) return
    reorderQuestions(survey.id, index, index + 1)
  }

  // Handle Multiple Choice Option edits
  const handleOptionChange = (questionId: string, optIndex: number, val: string) => {
    const q = survey.questions.find(item => item.id === questionId)
    if (!q || !q.options) return
    const updated = [...q.options]
    updated[optIndex] = val
    updateQuestion(survey.id, questionId, { options: updated })
  }

  const handleAddOption = (questionId: string) => {
    const q = survey.questions.find(item => item.id === questionId)
    if (!q) return
    const currentOptions = q.options || []
    updateQuestion(survey.id, questionId, { 
      options: [...currentOptions, `Option ${currentOptions.length + 1}`] 
    })
  }

  const handleDeleteOption = (questionId: string, optIndex: number) => {
    const q = survey.questions.find(item => item.id === questionId)
    if (!q || !q.options) return
    const updated = q.options.filter((_, idx) => idx !== optIndex)
    updateQuestion(survey.id, questionId, { options: updated })
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased flex flex-col selection:bg-neutral-800 selection:text-white">
      {/* Builder Sub-Navbar */}
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
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Builder</span>
              <span className="text-xs text-muted-foreground/60">/</span>
              <span className="text-xs font-medium text-foreground max-w-[150px] truncate">{survey.title}</span>
            </div>
          </div>

          {/* Quick tab switch (Builder vs Responses) & Share */}
          <div className="flex items-center gap-3">
            <nav className="flex items-center bg-muted p-1 rounded-lg border border-border">
              <Button 
                variant="secondary"
                size="xs"
                className="font-medium shadow-xs"
                disabled
              >
                Design
              </Button>
              <Button 
                variant="ghost"
                size="xs"
                onClick={() => navigate({ to: `/responses/${survey.id}` })}
                className="font-medium text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Responses
              </Button>
            </nav>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copied ? 'Copied' : 'Copy Link'}</span>
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() => navigate({ to: `/survey/${survey.id}` })}
              className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
            >
              <span>Preview</span>
              <ExternalLink className="w-3 h-3 stroke-[2.5]" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Double Column Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8 animate-fade-in">
        
        {/* Canvas Area (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Header Card */}
          <Card className="bg-card border-border rounded-2xl p-6 md:p-8 flex flex-col gap-4 text-left animate-slide-up">
            <input 
              type="text" 
              value={survey.title} 
              onChange={(e) => updateSurvey(survey.id, { title: e.target.value })}
              className="w-full bg-transparent border-0 border-b border-transparent hover:border-border focus:border-neutral-500 text-2xl md:text-3xl font-bold text-foreground focus:outline-hidden pb-1 transition-colors duration-200 placeholder:text-muted-foreground"
              placeholder="Untitled Survey Name"
            />
            <textarea 
              value={survey.description} 
              onChange={(e) => updateSurvey(survey.id, { description: e.target.value })}
              className="w-full bg-transparent border-0 border-b border-transparent hover:border-border focus:border-neutral-500 text-sm text-muted-foreground focus:outline-hidden pb-1 transition-colors duration-200 resize-none placeholder:text-muted-foreground"
              placeholder="Provide context or instructions for your respondents..."
              rows={2}
            />
          </Card>

          {/* Question List */}
          <div className="flex flex-col gap-4">
            {survey.questions.map((q, index) => {
              const isActive = activeQuestionId === q.id
              return (
                <Card 
                  key={q.id}
                  onClick={() => setActiveQuestionId(q.id)}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className={`bg-card border transition-all duration-300 relative flex flex-col gap-5 p-5 md:p-6 text-left animate-slide-up ${
                    isActive 
                      ? 'border-neutral-500 bg-neutral-900/30 ring-1 ring-neutral-500/30 shadow-md' 
                      : 'border-border hover:border-neutral-800'
                  }`}
                >
                  {/* Question Header: Move Handles & Delete */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMoveUp(index)
                        }}
                        disabled={index === 0}
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Move Up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMoveDown(index)
                        }}
                        disabled={index === survey.questions.length - 1}
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Move Down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>

                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest ml-2">
                        Question {index + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Required Toggle */}
                      <label className="flex items-center gap-2 cursor-pointer select-none border border-border bg-background hover:bg-muted px-2.5 py-1 rounded-lg text-[11px] font-medium text-muted-foreground hover:text-foreground transition-all">
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={(e) => updateQuestion(survey.id, q.id, { required: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/30 peer-checked:bg-indigo-500 transition-colors" />
                        <span>Required</span>
                      </label>

                      {/* Question type selector */}
                      <select 
                        value={q.type}
                        onChange={(e) => updateQuestion(survey.id, q.id, { 
                          type: e.target.value as Question['type'],
                          ...(e.target.value === 'multiple-choice' ? { options: q.options || ['Option 1', 'Option 2'] } : {})
                        })}
                        className="bg-background border border-border rounded-lg text-xs font-semibold px-2 py-1 text-foreground focus:outline-hidden focus:border-neutral-500 transition-colors cursor-pointer"
                      >
                        <option value="short-text">Short Text</option>
                        <option value="multiple-choice">Multiple Choice</option>
                        <option value="rating">Rating (1-5)</option>
                      </select>

                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteQuestion(survey.id, q.id)
                        }}
                        className="text-muted-foreground hover:text-red-400 hover:bg-red-950/20 cursor-pointer"
                        title="Delete Question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Question Text Input */}
                  <input
                    type="text"
                    value={q.text}
                    onChange={(e) => updateQuestion(survey.id, q.id, { text: e.target.value })}
                    className="w-full bg-transparent border-0 border-b border-border hover:border-neutral-500 focus:border-neutral-500 text-sm font-medium text-foreground focus:outline-hidden pb-1 transition-colors"
                    placeholder="Enter question wording..."
                  />

                  {/* Type Specific Fields */}
                  {q.type === 'short-text' && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/20 border border-border rounded-xl px-4 py-3 select-none">
                      <AlignLeft className="w-3.5 h-3.5" />
                      <span>Respondent answers with open-ended short text</span>
                    </div>
                  )}

                  {q.type === 'rating' && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <div 
                            key={rating}
                            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-xs font-semibold text-muted-foreground bg-background select-none"
                          >
                            {rating}
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] text-muted-foreground/60 ml-1">Rating scale from 1 (lowest) to 5 (highest)</span>
                    </div>
                  )}

                  {q.type === 'multiple-choice' && (
                    <div className="flex flex-col gap-2.5">
                      {/* Options stack */}
                      <div className="flex flex-col gap-2">
                        {q.options?.map((option, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-2.5 group/opt">
                            <div className="w-3.5 h-3.5 rounded-full border border-border bg-background flex-shrink-0" />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(q.id, oIdx, e.target.value)}
                              className="flex-1 bg-transparent border-0 border-b border-transparent hover:border-border focus:border-neutral-500 text-xs text-foreground focus:outline-hidden pb-0.5 transition-colors"
                              placeholder={`Option ${oIdx + 1}`}
                            />
                            
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleDeleteOption(q.id, oIdx)}
                              disabled={(q.options?.length || 0) <= 1}
                              className="opacity-0 group-hover/opt:opacity-100 text-muted-foreground hover:text-foreground disabled:opacity-0 cursor-pointer"
                              title="Delete option"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddOption(q.id)}
                        className="flex items-center gap-1.5 self-start text-xs font-semibold cursor-pointer mt-1"
                      >
                        <Plus className="w-3 h-3 stroke-[2.5]" />
                        <span>Add Option</span>
                      </Button>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>

          {/* Add Question Actions */}
          <div className="border border-dashed border-border rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-muted/10 animate-slide-up">
            <div className="text-left">
              <h4 className="text-sm font-semibold text-foreground mb-0.5">Add a new component</h4>
              <p className="text-xs text-muted-foreground">Pick a type below to extend your survey design.</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddQuestion('short-text')}
                className="flex items-center gap-1.5 text-xs cursor-pointer bg-card"
              >
                <AlignLeft className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Short Text</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddQuestion('multiple-choice')}
                className="flex items-center gap-1.5 text-xs cursor-pointer bg-card"
              >
                <List className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Multiple Choice</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddQuestion('rating')}
                className="flex items-center gap-1.5 text-xs cursor-pointer bg-card"
              >
                <Star className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Rating</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Branding Sidebar (1 Col) */}
        <div className="flex flex-col gap-6">
          
          {/* Logo Branding settings */}
          <Card className="bg-card border-border p-5 text-left flex flex-col gap-5 animate-slide-up [--card-spacing:0]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 pb-2 border-b border-border">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Branding Config</span>
            </h3>

            {/* Logo Settings */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold text-muted-foreground">Logo Image URL</label>
              <Input
                type="text"
                placeholder="https://example.com/logo.png"
                value={survey.logoUrl}
                onChange={(e) => updateSurvey(survey.id, { logoUrl: e.target.value })}
                className="w-full bg-background border-border text-foreground text-xs focus-visible:ring-ring/40"
              />
              <span className="text-[9px] text-muted-foreground/60">Provide an HTTPS image link. Unsplash works great.</span>
            </div>

            {/* Custom Color Selector Presets */}
            <div className="flex flex-col gap-2.5">
              <label className="text-[11px] font-semibold text-muted-foreground">Accent Theme Color</label>
              
              {/* Preset Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => updateSurvey(survey.id, { primaryColor: color.hex })}
                    className="w-7 h-7 rounded-full border flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
                    style={{ 
                      backgroundColor: color.hex,
                      borderColor: survey.primaryColor === color.hex ? 'var(--foreground)' : 'transparent'
                    }}
                    title={color.name}
                  >
                    {survey.primaryColor === color.hex && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white mix-blend-difference" />
                    )}
                  </button>
                ))}
              </div>

              {/* Custom Picker */}
              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="color" 
                  value={survey.primaryColor.startsWith('#') && survey.primaryColor.length === 7 ? survey.primaryColor : '#6366f1'} 
                  onChange={(e) => updateSurvey(survey.id, { primaryColor: e.target.value })}
                  className="w-7 h-7 rounded-lg bg-transparent border border-border cursor-pointer overflow-hidden"
                />
                <Input
                  type="text"
                  placeholder="#6366f1"
                  value={survey.primaryColor}
                  onChange={(e) => updateSurvey(survey.id, { primaryColor: e.target.value })}
                  className="flex-1 h-7 bg-background border-border text-xs text-foreground focus-visible:ring-ring/40 uppercase"
                />
              </div>
            </div>
          </Card>

          {/* Live Mock Preview Widget */}
          <Card className="bg-card border-border p-5 text-left flex flex-col gap-4 animate-slide-up">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Live Preview</h3>
            
            {/* The Branded Mock Card */}
            <div className="bg-background border border-border rounded-xl p-4 flex flex-col gap-4 shadow-inner">
              {/* Mock Logo */}
              {survey.logoUrl ? (
                <img 
                  src={survey.logoUrl} 
                  alt="preview logo" 
                  className="w-7 h-7 rounded-md object-cover border border-border self-start"
                  onError={(e) => {
                    // Hide logo preview if URL is bad
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <div 
                  className="w-7 h-7 rounded-md flex items-center justify-center border text-[9px] font-semibold tracking-wider self-start select-none"
                  style={{ 
                    borderColor: `${survey.primaryColor}33`,
                    color: survey.primaryColor,
                    backgroundColor: `${survey.primaryColor}08`
                  }}
                >
                  {survey.title.substring(0, 1)}
                </div>
              )}

              {/* Title & Description Mock */}
              <div>
                <div className="h-3.5 bg-muted rounded-md w-3/4 mb-1.5" />
                <div className="h-2.5 bg-muted/55 rounded-md w-full mb-1" />
                <div className="h-2.5 bg-muted/55 rounded-md w-2/3" />
              </div>

              {/* Action Button styled with primaryColor */}
              <button 
                disabled
                className="w-full text-xs font-semibold py-2 rounded-lg text-white select-none transition-colors"
                style={{ backgroundColor: survey.primaryColor }}
              >
                Submit Survey
              </button>
            </div>

            <span className="text-[10px] text-muted-foreground/60 text-center leading-normal">
              Your logo and theme color will shape the layout of the public submission form automatically.
            </span>
          </Card>

        </div>

      </div>
    </div>
  )
}
