import React, { useState } from 'react'
import { useSurveys } from '../context/SurveyContext'
import { useNavigate } from '@tanstack/react-router'
import { 
  Plus, 
  BarChart3, 
  Edit3, 
  Copy, 
  Check, 
  Trash2, 
  Search, 
  FileText, 
  LogOut, 
  Calendar,
  MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

export const DashboardPage: React.FC = () => {
  const { user, surveys, responses, createSurvey, deleteSurvey, logout } = useSurveys()
  const navigate = useNavigate()
  
  // Auth redirection
  React.useEffect(() => {
    if (!user) {
      navigate({ to: '/login' })
    }
  }, [user, navigate])

  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  if (!user) return null

  // Filter surveys
  const filteredSurveys = surveys.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateSurvey = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const id = createSurvey(
      newTitle.trim(),
      newDesc.trim() || 'No description provided.'
    )
    
    // Reset inputs
    setNewTitle('')
    setNewDesc('')
    setIsCreateModalOpen(false)

    // Route to builder
    navigate({ to: `/builder/${id}` })
  }

  const handleCopyLink = (surveyId: string) => {
    const publicUrl = `${window.location.origin}/survey/${surveyId}`
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopiedId(surveyId)
      setTimeout(() => setCopiedId(null), 1500)
    })
  }

  const getResponseCount = (surveyId: string) => {
    return responses.filter(r => r.surveyId === surveyId).length
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-neutral-800 selection:text-white">
      {/* Navbar */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate({ to: '/' })}>
              <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="font-semibold text-foreground tracking-wide">Forma</span>
            </div>

            {/* Nav Links */}
            <nav className="hidden sm:flex items-center gap-1">
              <Badge variant="outline" className="px-3 py-1 text-xs font-semibold bg-muted text-foreground border-border rounded-lg">
                Dashboard
              </Badge>
            </nav>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pr-2">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-8 h-8 rounded-full border border-border"
              />
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-foreground">{user.name}</div>
                <div className="text-[10px] text-muted-foreground">{user.email}</div>
              </div>
            </div>
            
            <Button 
              variant="ghost"
              size="icon-sm"
              onClick={logout}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
        
        {/* Welcome Section / Hero Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-1">
              Surveys
            </h2>
            <p className="text-sm text-muted-foreground">
              Create responsive customer feedback check-ins, forms, and pulses.
            </p>
          </div>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4.5 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-medium cursor-pointer shadow-md transition-all duration-200 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Survey</span>
          </Button>
        </div>

        {/* Dashboard Search Actions Bar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input 
              type="text" 
              placeholder="Search surveys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 w-full bg-input/20 border-border rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/40"
            />
          </div>
        </div>

        {/* Cards Grid */}
        {filteredSurveys.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSurveys.map((survey, index) => {
              const respCount = getResponseCount(survey.id);
              return (
                <Card 
                  key={survey.id} 
                  style={{ animationDelay: `${index * 50}ms` }}
                  className="group flex flex-col bg-card border-border hover:border-neutral-700/80 hover:bg-muted/30 transition-all duration-300 shadow-xs animate-slide-up"
                >
                  <CardContent className="p-5 flex-1 flex flex-col gap-4">
                    {/* Card Header Info */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {survey.logoUrl ? (
                          <img 
                            src={survey.logoUrl} 
                            alt={survey.title}
                            className="w-10 h-10 rounded-lg object-cover border border-border"
                          />
                        ) : (
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center border text-xs font-semibold uppercase tracking-wider"
                            style={{ 
                              borderColor: `${survey.primaryColor}22`,
                              color: survey.primaryColor,
                              backgroundColor: `${survey.primaryColor}08`
                            }}
                          >
                            {survey.title.substring(0, 2)}
                          </div>
                        )}

                        <div className="text-left">
                          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary-foreground transition-colors duration-200">
                            {survey.title}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5 text-muted-foreground text-[11px]">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(survey.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Delete Survey action */}
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${survey.title}"?`)) {
                            deleteSurvey(survey.id)
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 hover:bg-red-950/20 cursor-pointer"
                        title="Delete Survey"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    {/* Card Description */}
                    <p className="text-muted-foreground text-xs line-clamp-2 flex-1 text-left">
                      {survey.description}
                    </p>
                  </CardContent>

                  {/* Survey Stats Footer */}
                  <CardFooter className="flex items-center justify-between border-t border-border bg-muted/20 p-5 mt-auto">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-semibold text-foreground">{respCount}</span>
                      <span>responses</span>
                    </div>

                    {/* Hover actions pill */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => handleCopyLink(survey.id)}
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Copy Public Link"
                      >
                        {copiedId === survey.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => navigate({ to: `/responses/${survey.id}` })}
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                        title="View Responses"
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate({ to: `/builder/${survey.id}` })}
                        className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
                        title="Edit Survey"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-3xl py-20 px-4 text-center max-w-2xl mx-auto my-12 bg-muted/10 animate-slide-up">
            <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center mb-4 text-muted-foreground">
              <FileText className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">No surveys found</h3>
            <p className="text-sm text-muted-foreground max-w-[320px] mb-6">
              {searchQuery ? "No surveys match your query. Try a different name." : "Create your first interactive survey and customize it with custom branding."}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-4.5 py-2 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl font-medium cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Create Survey</span>
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Creation Modal Overlay */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[480px] bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Create Survey</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Start building. Give your survey a clear name and initial context for respondents.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSurvey} className="flex flex-col gap-5 pt-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2">
                Survey Name
              </label>
              <Input
                type="text"
                required
                placeholder="e.g. Q3 Feedback Cycle"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-background border-border text-foreground focus-visible:ring-ring/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2">
                Description
              </label>
              <Textarea
                placeholder="e.g. Tell us about your onboarding experience..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
                className="w-full bg-background border-border text-foreground focus-visible:ring-ring/40 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border mt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsCreateModalOpen(false)
                  setNewTitle('')
                  setNewDesc('')
                }}
                className="cursor-pointer text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer font-medium"
              >
                Create and Build
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
