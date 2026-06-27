// useState: para recordar lo que la modista escribe en email/contraseña, y si hay error.
import { useState } from 'react'
// useNavigate: nos permite redirigir a otra página después de un login exitoso.
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

function Login() {
  // Cada useState crea una "casilla de memoria" + una función para actualizarla.
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  const navigate = useNavigate()

  // Esta función se ejecuta cuando la modista envía el formulario.
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault() // evita que el navegador recargue la página al enviar el form
    setError(null)
    setCargando(true)

    // signInWithPassword es la función de Supabase Auth que valida el email+contraseña
    // contra auth.users (donde Supabase guarda las contraseñas de forma segura, encriptadas).
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setCargando(false)

    if (error) {
      setError('Email o contraseña incorrectos.')
      return
    }

    // Si no hubo error, el login fue exitoso → redirigimos al Dashboard.
    navigate('/')
  }
//#FEEBE7  #FDF5E6
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFFE0]">
      <form
        onSubmit={handleLogin}
        className="card w-96 bg-base-100 shadow-xl p-8 flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-center mb-2">Atelier Manager</h1>

        <input
          type="email"
          placeholder="Email"
          className="input input-bordered w-full"
          value={email}
          // onChange se ejecuta cada vez que la modista escribe una letra.
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="input input-bordered w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Solo mostramos este texto SI existe un error (renderizado condicional) */}
        {error && <p className="text-error text-sm">{error}</p>}

        <button type="submit" className="btn btn-primary w-full" disabled={cargando}>
          {cargando ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}

export default Login