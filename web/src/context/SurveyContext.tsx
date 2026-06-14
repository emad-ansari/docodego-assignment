import React, { createContext, useContext, useState, useEffect } from 'react'

export interface Question {
  id: string
  type: 'short-text' | 'multiple-choice' | 'rating'
  text: string
  required: boolean
  options?: string[] // For multiple choice
}

export interface Survey {
  id: string
  title: string
  description: string
  logoUrl: string
  primaryColor: string
  createdAt: string
  questions: Question[]
}

export interface SurveyResponse {
  id: string
  surveyId: string
  submittedAt: string
  answers: Record<string, string> // questionId -> answer string/choice/rating
}

export interface User {
  name: string
  email: string
  avatar: string
}

interface SurveyContextType {
  user: User | null
  surveys: Survey[]
  responses: SurveyResponse[]
  login: () => void
  logout: () => void
  createSurvey: (title: string, description: string) => string
  updateSurvey: (surveyId: string, fields: Partial<Survey>) => void
  deleteSurvey: (surveyId: string) => void
  addQuestion: (surveyId: string, type: Question['type']) => void
  updateQuestion: (surveyId: string, questionId: string, fields: Partial<Question>) => void
  deleteQuestion: (surveyId: string, questionId: string) => void
  reorderQuestions: (surveyId: string, startIndex: number, endIndex: number) => void
  submitResponse: (surveyId: string, answers: Record<string, string>) => void
}

const SurveyContext = createContext<SurveyContextType | undefined>(undefined)

const DEFAULT_SURVEYS: Survey[] = [
  {
    id: 'survey-1',
    title: 'Acme Developer Platform Survey',
    description: 'We are redesigning our developer dashboard. Share your feedback so we can build a better workflow for your team.',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop&auto=format&q=80',
    primaryColor: '#0f172a', // Slate 900
    createdAt: '2026-06-10T14:32:00.000Z',
    questions: [
      {
        id: 'q1',
        type: 'short-text',
        text: 'What is your primary use case for our platform?',
        required: true
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        text: 'Which deployment region do you use most frequently?',
        required: true,
        options: ['US East (N. Virginia)', 'EU Central (Frankfurt)', 'ap-southeast-1 (Singapore)', 'Local Host Only']
      },
      {
        id: 'q3',
        type: 'rating',
        text: 'How satisfied are you with our deployment speed?',
        required: false
      },
      {
        id: 'q4',
        type: 'multiple-choice',
        text: 'How did you first hear about Acme Developer Platform?',
        required: false,
        options: ['Hacker News', 'GitHub Trending', 'Twitter / X', 'Friend referral', 'Other']
      }
    ]
  },
  {
    id: 'survey-2',
    title: 'Remote Workspace Pulse check',
    description: 'A brief weekly pulse check to align on goals, blockers, and check in on workload stress levels.',
    logoUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=128&h=128&fit=crop&auto=format&q=80',
    primaryColor: '#6366f1', // Indigo 500
    createdAt: '2026-06-11T09:15:00.000Z',
    questions: [
      {
        id: 'rq1',
        type: 'rating',
        text: 'How would you rate your workspace comfort and ergonomics?',
        required: true
      },
      {
        id: 'rq2',
        type: 'short-text',
        text: 'What is the single biggest blocker in your workflow this week?',
        required: false
      },
      {
        id: 'rq3',
        type: 'multiple-choice',
        text: 'Do you feel sufficiently connected to your teammates?',
        required: true,
        options: ['Absolutely', 'Somewhat, could be better', 'I feel isolated']
      }
    ]
  }
]

const DEFAULT_RESPONSES: SurveyResponse[] = [
  // Responses for survey-1
  {
    id: 'r1',
    surveyId: 'survey-1',
    submittedAt: '2026-06-11T16:40:00.000Z',
    answers: {
      q1: 'Building full-stack React projects with serverless APIs.',
      q2: 'US East (N. Virginia)',
      q3: '5',
      q4: 'GitHub Trending'
    }
  },
  {
    id: 'r2',
    surveyId: 'survey-1',
    submittedAt: '2026-06-11T18:12:00.000Z',
    answers: {
      q1: 'Hosting a static documentation site and running scheduled cron jobs.',
      q2: 'EU Central (Frankfurt)',
      q3: '4',
      q4: 'Hacker News'
    }
  },
  {
    id: 'r3',
    surveyId: 'survey-1',
    submittedAt: '2026-06-12T02:05:00.000Z',
    answers: {
      q1: 'Internal tool building and staging environment testbeds.',
      q2: 'ap-southeast-1 (Singapore)',
      q3: '4',
      q4: 'Friend referral'
    }
  },
  {
    id: 'r4',
    surveyId: 'survey-1',
    submittedAt: '2026-06-12T10:45:00.000Z',
    answers: {
      q1: 'We run a high-traffic e-commerce database sync service.',
      q2: 'US East (N. Virginia)',
      q3: '3',
      q4: 'Twitter / X'
    }
  },
  {
    id: 'r5',
    surveyId: 'survey-1',
    submittedAt: '2026-06-12T12:00:00.000Z',
    answers: {
      q1: 'Hobby coding mostly, deploying fast prototypes.',
      q2: 'Local Host Only',
      q3: '5',
      q4: 'Hacker News'
    }
  },

  // Responses for survey-2
  {
    id: 'rr1',
    surveyId: 'survey-2',
    submittedAt: '2026-06-12T08:00:00.000Z',
    answers: {
      rq1: '4',
      rq2: 'Waiting on client API credentials to finish the staging environment.',
      rq3: 'Absolutely'
    }
  },
  {
    id: 'rr2',
    surveyId: 'survey-2',
    submittedAt: '2026-06-12T09:30:00.000Z',
    answers: {
      rq1: '5',
      rq2: 'No major blockers, everything is on track.',
      rq3: 'Somewhat, could be better'
    }
  },
  {
    id: 'rr3',
    surveyId: 'survey-2',
    submittedAt: '2026-06-12T11:20:00.000Z',
    answers: {
      rq1: '2',
      rq2: 'My desk chair is broken, ordering a replacement.',
      rq3: 'I feel isolated'
    }
  }
]

export const SurveyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('sb_user')
    return saved ? JSON.parse(saved) : null
  })

  const [surveys, setSurveys] = useState<Survey[]>(() => {
    const saved = localStorage.getItem('sb_surveys')
    return saved ? JSON.parse(saved) : DEFAULT_SURVEYS
  })

  const [responses, setResponses] = useState<SurveyResponse[]>(() => {
    const saved = localStorage.getItem('sb_responses')
    return saved ? JSON.parse(saved) : DEFAULT_RESPONSES
  })

  // Sync state with localStorage
  useEffect(() => {
    localStorage.setItem('sb_user', user ? JSON.stringify(user) : '')
  }, [user])

  useEffect(() => {
    localStorage.setItem('sb_surveys', JSON.stringify(surveys))
  }, [surveys])

  useEffect(() => {
    localStorage.setItem('sb_responses', JSON.stringify(responses))
  }, [responses])

  const login = () => {
    const mockUser: User = {
      name: 'Sarah Connor',
      email: 'sarah.connor@sky.net',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format&q=80'
    }
    setUser(mockUser)
  }

  const logout = () => {
    setUser(null)
  }

  const createSurvey = (title: string, description: string) => {
    const id = `survey-${Date.now()}`
    const newSurvey: Survey = {
      id,
      title,
      description,
      logoUrl: '',
      primaryColor: '#6366f1', // default Indigo
      createdAt: new Date().toISOString(),
      questions: [
        {
          id: `q-${Date.now()}-1`,
          type: 'short-text',
          text: 'Untitled Question 1',
          required: false
        }
      ]
    }
    setSurveys((prev) => [newSurvey, ...prev])
    return id
  }

  const updateSurvey = (surveyId: string, fields: Partial<Survey>) => {
    setSurveys((prev) =>
      prev.map((s) => (s.id === surveyId ? { ...s, ...fields } : s))
    )
  }

  const deleteSurvey = (surveyId: string) => {
    setSurveys((prev) => prev.filter((s) => s.id !== surveyId))
    setResponses((prev) => prev.filter((r) => r.surveyId !== surveyId))
  }

  const addQuestion = (surveyId: string, type: Question['type']) => {
    setSurveys((prev) =>
      prev.map((s) => {
        if (s.id !== surveyId) return s
        const newQuestion: Question = {
          id: `q-${Date.now()}`,
          type,
          text: type === 'short-text' ? 'New Short Text Question' : type === 'multiple-choice' ? 'New Multiple Choice Question' : 'Rate your experience',
          required: false,
          ...(type === 'multiple-choice' ? { options: ['Option 1', 'Option 2'] } : {})
        }
        return {
          ...s,
          questions: [...s.questions, newQuestion]
        }
      })
    )
  }

  const updateQuestion = (surveyId: string, questionId: string, fields: Partial<Question>) => {
    setSurveys((prev) =>
      prev.map((s) => {
        if (s.id !== surveyId) return s
        return {
          ...s,
          questions: s.questions.map((q) =>
            q.id === questionId ? { ...q, ...fields } : q
          )
        }
      })
    )
  }

  const deleteQuestion = (surveyId: string, questionId: string) => {
    setSurveys((prev) =>
      prev.map((s) => {
        if (s.id !== surveyId) return s
        return {
          ...s,
          questions: s.questions.filter((q) => q.id !== questionId)
        }
      })
    )
  }

  const reorderQuestions = (surveyId: string, startIndex: number, endIndex: number) => {
    setSurveys((prev) =>
      prev.map((s) => {
        if (s.id !== surveyId) return s
        const questionsCopy = [...s.questions]
        const [removed] = questionsCopy.splice(startIndex, 1)
        questionsCopy.splice(endIndex, 0, removed)
        return {
          ...s,
          questions: questionsCopy
        }
      })
    )
  }

  const submitResponse = (surveyId: string, answers: Record<string, string>) => {
    const newResponse: SurveyResponse = {
      id: `resp-${Date.now()}`,
      surveyId,
      submittedAt: new Date().toISOString(),
      answers
    }
    setResponses((prev) => [newResponse, ...prev])
  }

  return (
    <SurveyContext.Provider
      value={{
        user,
        surveys,
        responses,
        login,
        logout,
        createSurvey,
        updateSurvey,
        deleteSurvey,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        reorderQuestions,
        submitResponse
      }}
    >
      {children}
    </SurveyContext.Provider>
  )
}

export const useSurveys = () => {
  const context = useContext(SurveyContext)
  if (context === undefined) {
    throw new Error('useSurveys must be used within a SurveyProvider')
  }
  return context
}
