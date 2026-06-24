// Importamos useEffect, un "hook" de React que nos permite ejecutar código
// automáticamente cuando el componente se carga en pantalla.
import { useEffect } from 'react'

// Importamos nuestra conexión a Supabase que creamos en el paso anterior.
import { supabase } from './services/supabaseClient'

function App() {
  // useEffect con un array vacío [] al final significa:
  // "ejecuta esto una sola vez, justo cuando la página carga".
  useEffect(() => {
    // Le pedimos a Supabase: trae todos (*) los registros de la tabla "clientes".
    supabase.from('clientes').select('*').then(({ data, error }) => {
      // Mostramos el resultado en la consola del navegador para revisarlo.
      console.log('data:', data, 'error:', error)
    })
  }, [])

  return <h1>Conexión a Supabase OK si no hay error en consola</h1>
}

export default App