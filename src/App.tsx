import { Toaster } from 'sonner'
import AppRoutes from './routes/routes'

function App() {
  return (
    <>
      <Toaster richColors position="top-right" /> <AppRoutes />
    </>
  )
}

export default App
