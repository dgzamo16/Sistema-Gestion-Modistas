//Creacion del CRUD para el sistema. 
import { supabase } from './supabaseClient'
import type { Cliente } from '../types'

// obtener todos los clientes, los mas recientes primero.
export async function getClientes() {
    const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('fecha_registro', { ascending: false})
    return { data, error}
}

//crear un nuevo cliente nuevo. recibe los datos del formulario + el id del usuario logueado
//El usuario id es obligatorio por la politica RLS: cada cliente debe pertenecer a una modista. 
export async function crearCliente(cliente: Partial<Cliente> & { usuario_id: string }) {
  const { data, error } = await supabase.from('clientes').insert([cliente]).select()
  return { data, error }
}

//Actualizar los campos que cambiaron 
//con el partial<cliente> hacemos que algunos campos, no todos obligatorios. 
export async function actualizarCliente(id: string, cambios: Partial<Cliente>) {
    const { data,error } = await supabase.from('clientes').update(cambios).eq('id', id).select()
    return{ data,error }
}

//eliminar algun campo.
export async function eliminarCliente(id: string) {
    const { error } = await supabase.from('clientes').delete().eq('id',id)
    return { error }
}