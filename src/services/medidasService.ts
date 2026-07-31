//importamos la base de datos del cliente y por ende la tabla de medidas.
import { supabase } from "./supabaseClient"
import type { Medida } from "../types"

//traemos todas las medidas mas recientes del cliente
export async function getMedidasPorCliente(clienteId: string) {
    const { data, error} = await supabase
        .from('medidas')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('fecha', {ascending: false})
    return { data, error }
}

// No vamos a editar, usaremos nuevos registros para historial
export async function crearMedida(medida: Partial<Medida> & { cliente_id: string }) {
    const { data, error } = await supabase.from('medidas').insert([medida]).select()
    return {data, error}
}

// Trae todas las medidas de todos los clientes, uniendo con clientes para mostrar el nombre
export async function getTodasLasMedidas() {
  const { data, error } = await supabase
    // Consultamos la vista en vez de la tabla directamente
    .from('vista_ultima_medida_por_cliente')
    .select(`
      *,
      clientes (
        nombre
      )
    `)
    .order('fecha', { ascending: false })
  return { data, error }
}