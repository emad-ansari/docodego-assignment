import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet
} from '@tanstack/react-router'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { BuilderPage } from './pages/BuilderPage'
import { PublicSurveyPage } from './pages/PublicSurveyPage'
import { ResponsesPage } from './pages/ResponsesPage'

// Root layout route
const rootRoute = createRootRoute({
  component: () => <Outlet />
})

// Create route tree structure
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage
})

const builderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/builder/$surveyId',
  component: BuilderPage
})

const surveyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/survey/$surveyId',
  component: PublicSurveyPage
})

const responsesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/responses/$surveyId',
  component: ResponsesPage
})

// Route tree declaration
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  builderRoute,
  surveyRoute,
  responsesRoute
])

// Create router configuration
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent'
})

// Register router for TypeScript safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
