// Este componente no necesita recordar ningún valor (no usa useState),
// así que es lo más simple posible: solo recibe estructura y la muestra.
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../hooks/useAuth'

function Navbar() {
  const navigate = useNavigate()
  const { perfil } = useAuth()
  // signOut() borra la sesión actual guardada por Supabase.
  // Después, redirigimos manualmente a /login.
  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  //tomamos la primera letra de la modista para mostrar en el icono.
  //si no carga mostraremos la M como defecto.
  const inicial = perfil?.nombre?.charAt(0).toUpperCase() ?? 'M'

  return (
    <header className="navbar bg-[#FFFFE0] text-gray-800 px-6">
      <div className="flex-1"></div>
      <div className="flex items-center gap-3">
        <div className="avatar placeholder">
          <div className="bg-gray-800 text-white rounded-full w-8">
            <span className="text-sm font-semibold">{inicial}</span>
          </div>
        </div>
        {/*Mientras carga, mostramaos .... en vez de un nombre vacio*/}
        <span className="font-medium">{perfil?.nombre ?? '...'}</span>
        <button onClick={handleLogout} className="btn btn-sm btn-ghost text-gray-800 hover:bg-white/30">
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}

export default Navbar