import { supabase } from './supabaseClient'
import type { Pago } from '../types'

// Trae todos los pagos de una prenda
export async function getPagosPorPrenda(prendaId: string) {
  const { data, error } = await supabase
    .from('pagos')
    .select('*')
    .eq('prenda_id', prendaId)
    .order('fecha_pago', { ascending: false })
  return { data, error }
}

// Registra un pago nuevo
export async function crearPago(pago: Partial<Pago> & { prenda_id: string }) {
  const { data, error } = await supabase.from('pagos').insert([pago]).select()
  return { data, error }
}

export async function eliminarPago(id: string) {
  const { error } = await supabase.from('pagos').delete().eq('id', id)
  return { error }
}


export async function getTodosLosPagos() {
  const { data, error } = await supabase
    .from('pagos')
    .select(`
      *,
      prendas (
        tipo_prenda,
        valor_total,
        clientes (
          nombre
        )
      )
    `)
    .order('fecha_pago', { ascending: false })
  return { data, error }
}