import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Unlock from './pages/Unlock'
import AuthSessionProvider from './components/AuthSessionProvider'
import { useAuthSession } from './hooks/useAuthSession'

function AuthGate() {
  const { token } = useAuthSession()
  return token ? <Home /> : <Unlock />
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [{ index: true, element: <AuthGate /> }],
  },
])

function App() {
  return (
    <AuthSessionProvider>
      <RouterProvider router={router} />
    </AuthSessionProvider>
  )
}

export default App
