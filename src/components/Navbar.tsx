// Este componente no necesita recordar ningún valor (no usa useState),
// así que es lo más simple posible: solo recibe estructura y la muestra.
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

function Navbar() {
  const navigate = useNavigate()

  // signOut() borra la sesión actual guardada por Supabase.
  // Después, redirigimos manualmente a /login.
  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <header className="navbar bg-base-100 border-b border-base-200 px-6">
      <div className="flex-1"></div>
      <div className="flex items-center gap-3">
        <div className="avatar placeholder">
          <div className="bg-primary text-primary-content rounded-full w-8">
            <span className="text-sm">M</span>
          </div>
        </div>
        <span className="font-medium">Modista</span>
        <button onClick={handleLogout} className="btn btn-sm btn-ghost">
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}

export default Navbar