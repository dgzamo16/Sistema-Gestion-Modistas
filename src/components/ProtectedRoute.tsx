import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// "children" representa lo que sea que pongamos DENTRO de <ProtectedRoute>...</ProtectedRoute>
// (en nuestro caso, va a ser el MainLayout completo con todas sus páginas).
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, cargando } = useAuth()

  // Mientras revisamos si hay sesión, mostramos un mensaje simple en vez de nada (o un error).
  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando...
      </div>
    )
  }

  // Si terminamos de revisar y NO hay sesión, redirigimos a /login.
  // "replace" evita que el usuario pueda volver atrás con el botón del navegador
  // y quedar en una página protegida sin estar logueado.
  if (!session) {
    return <Navigate to="/login" replace />
  }

  // Si sí hay sesión, mostramos lo que sea que esté envuelto por ProtectedRoute.
  return <>{children}</>
}

export default ProtectedRoute