//Aqui vamos a crear la conexion con nuestra base de datos.
//importamos la funcion createCliente directamente de la supebase
//esta funcion nos permite conectar el proyecto con nuestra base de datos.
import { createClient } from '@supabase/supabase-js'

//leemos la url de nuestro proyecto supabase desde las variables de entorno (.env)
// import.meta.env es la forma en que VITE nos da acceso a ellas.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

//leemos la clave publica que es segura para el front, desde el .env
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Creamos la conexión real a Supabase usando la URL y la key de arriba,
// y la guardamos en la constante "supabase".
// export hace que esta constante pueda ser usada (importada) desde cualquier otro archivo del proyecto.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)