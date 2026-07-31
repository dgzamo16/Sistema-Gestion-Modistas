//Construir la pagina completa de clientes.
import { useEffect, useState } from 'react'
import {
  getClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
} from '../services/clientesService'
import { useAuth } from "../hooks/useAuth"
import type { Cliente } from '../types'
import { useNavigate } from 'react-router-dom'

//poner el formulario vacio, para cuando se crea un cliente nuevo
const clienteVacio = {
  nombre: '',
  telefono: '',
  direccion: '',
  fecha_nacimiento: '',
  notas: '',
}

//cargar el nuevo usuario. 
function Clientes(){
  //sesion.user.id es lo que usaremos para el id de un nuevo usuario.
  const { session } = useAuth()
  const navigate = useNavigate()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  const [modalAbierto, setModalAbierto] = useState(false)
  //si estamos editando, aqui guardamos el cliente original para saber su is.
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null)
  //logramos un solo objeto por todo el formulario, en vez de 5 useState sueltos.
  const [formulario, setFormulario] = useState(clienteVacio)


  useEffect(() => {
    cargarClientes()
  }, [])

  async function cargarClientes() {
    setCargando(true)
    const { data, error } = await getClientes()
    if (!error && data) setClientes(data as Cliente[])
      setCargando(false)    
  }

  //filtra en el navegador mientras escribes (no volvemos a consultar a la db letra por letra)
  const clientesFiltrados = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  function abrirModalCrear() {
    setClienteEditando(null)
    setFormulario(clienteVacio)
    setModalAbierto(true)
  }

  function abrirModalEditar(cliente: Cliente) {
    setClienteEditando(cliente)
    setFormulario({
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      direccion: cliente.direccion,
      fecha_nacimiento: cliente.fecha_nacimiento ?? '',
      notas: cliente.notas ?? '',
    })
    setModalAbierto(true)
  }

  //copia todos los cambios que ya habia, y solo pisamos el campo que cambio.
  //sin esto tendriamos que escribir un setformulario distinto por cada input.
  function actualizarCampo(campo: string, valor: string) {
    setFormulario((anterior) => ({...anterior, [campo]: valor}))
  }

  async function guardarCliente(e: React.FormEvent ) {
    e.preventDefault()

    if(clienteEditando){
      await actualizarCliente(clienteEditando.id, formulario)
    } else{
      await crearCliente({...formulario, usuario_id: session!.user.id })
    }
    
    setModalAbierto(false)
    cargarClientes()//recargamos la lista para ver el campo reflejado. 
  }

  async function manejarEliminar(id: string) {
    const confirmar = window.confirm('¿Seguro que quieres eliminar este cliente? Esta acción no se puede deshacer.')
    if (!confirmar) return

    await eliminarCliente(id)
    cargarClientes()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <button onClick={abrirModalCrear} className="btn btn-primary">
          + Nuevo cliente
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar cliente..."
        className="input input-bordered w-full max-w-xs mb-4"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {cargando ? (
        <p>Cargando...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Fecha registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.nombre}</td>
                <td>{cliente.telefono}</td>
                <td>{cliente.direccion}</td>
                <td>{new Date(cliente.fecha_registro).toLocaleDateString()}</td>
                <td className="flex gap-2">
                  <button onClick={() => navigate(`/medidas/${cliente.id}`)} 
                  className="btn btn-sm btn-ghost" >
                  📏
                  </button>
                  <button
                    onClick={() => navigate(`/prendas/${cliente.id}`)}
                    className="btn btn-sm btn-ghost"
                  >
                    👗
                  </button>
                  <button onClick={() => abrirModalEditar(cliente)} className="btn btn-sm btn-ghost">
                    ✏️
                  </button>
                  <button
                    onClick={() => manejarEliminar(cliente.id)}
                    className="btn btn-sm btn-ghost text-error"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

     {/* DaisyUI muestra/oculta el modal según la clase "modal-open" presente o no */}
      {modalAbierto && (
        <div className="modal modal-open">
          <div className="modal-box bg-[#FFFFE0]">
            <h3 className="font-bold text-lg mb-4">
              {clienteEditando ? 'Editar cliente' : 'Nuevo cliente'}
            </h3>
            <form onSubmit={guardarCliente} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Nombre"
                className="input input-bordered w-full"
                value={formulario.nombre}
                onChange={(e) => actualizarCampo('nombre', e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Teléfono"
                className="input input-bordered w-full"
                value={formulario.telefono}
                onChange={(e) => actualizarCampo('telefono', e.target.value)}
              />
              <input
                type="text"
                placeholder="Dirección"
                className="input input-bordered w-full"
                value={formulario.direccion}
                onChange={(e) => actualizarCampo('direccion', e.target.value)}
              />
              <input
                type="date"
                className="input input-bordered w-full"
                value={formulario.fecha_nacimiento}
                onChange={(e) => actualizarCampo('fecha_nacimiento', e.target.value)}
              />
              <textarea
                placeholder="Notas (ej: prefiere telas suaves, colores claros)"
                className="textarea textarea-bordered w-full"
                value={formulario.notas}
                onChange={(e) => actualizarCampo('notas', e.target.value)}
              />

              <div className="modal-action">
                <button type="button" onClick={() => setModalAbierto(false)} className="btn btn-ghost">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-dark">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Clientes
  



