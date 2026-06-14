import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import { SurveyProvider } from './context/SurveyContext'

function App() {
  return (
    <SurveyProvider>
      <RouterProvider router={router} />
    </SurveyProvider>
  )
}

export default App
