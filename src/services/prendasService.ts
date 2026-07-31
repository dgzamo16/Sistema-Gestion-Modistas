import { supabase } from "./supabaseClient";
import type { Prenda } from '../types'

// Trae todas las prendas de un client, la mas reciente primero 
export async function getPrendasPorCliente(clienteId: string) {
    const { data,error} = await supabase
        .from('prendas')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('fecha_pedido', { ascending: false })
    return { data,error}
}

//Crea una prenda nueva
export async function crearPrenda(prenda:Partial<Prenda> & { cliente_id: string}) {
    const { data, error } = await supabase.from('prendas').insert([prenda]).select()
    return { data, error}    
}

//actualiza culaquier campo de una prenda (incluyendo el estado)
export async function actualizarPrenda(id: string, cambios: Partial<Prenda>) {
    const { data, error } = await supabase.from('prendas').update(cambios).eq('id', id ).select()
    return { data, error}  
}

//eliminar una prenda
export async function eliminarPrenda(id: string) {
    const { error} = await supabase.from('prendas').delete().eq('id', id)
    return { error }
}

// Trae TODAS las prendas de la modista logueada, uniendo con clientes para mostrar el nombre
export async function getTodasLasPrendas() {
  const { data, error } = await supabase
    .from('prendas')
    .select(`
      *,
      clientes (
        nombre
      )
    `)
    .order('fecha_pedido', { ascending: false })
  return { data, error }
}