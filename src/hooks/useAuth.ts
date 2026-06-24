import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
// "Session" es el tipo que Supabase usa para describir una sesión activa (usuario + token).
import type { Session } from '@supabase/supabase-js'

export function useAuth() {
  // session guarda la sesión actual (o null si nadie ha iniciado sesión).
  const [session, setSession] = useState<Session | null>(null)
  // cargando nos sirve para saber si todavía estamos revisando, y así no mostrar
  // "no hay sesión" por un instante antes de confirmar que sí la hay.
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // Al abrir la app, preguntamos: ¿el navegador ya tiene una sesión guardada?
    // (Supabase guarda la sesión automáticamente, por eso no hay que loguearse cada vez).
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setCargando(false)
    })

    // onAuthStateChange "escucha" en tiempo real cualquier cambio de sesión:
    // login, logout, o renovación automática del token.
    // Cada vez que algo cambia, actualizamos nuestro estado "session".
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    // Esta función se ejecuta cuando el componente que usa este hook desaparece de pantalla.
    // Aquí "apagamos" el listener para no dejarlo corriendo sin necesidad (evita fugas de memoria).
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  // Devolvemos ambos valores para que cualquier componente pueda usarlos.
  return { session, cargando }
}