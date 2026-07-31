import { useEffect, useState } from "react"
import { useParams, useNavigate } from 'react-router-dom'
import {
  getPrendasPorCliente,
  crearPrenda,
  actualizarPrenda,
  eliminarPrenda,
  getTodasLasPrendas,
} from '../services/prendasService'
import { supabase } from '../services/supabaseClient'
import type { Prenda, Cliente, EstadoPrenda } from '../types'

const prendaVacia = {
  tipo_prenda: '',
  descripcion: '',
  fecha_pedido: new Date().toISOString().split('T')[0],
  fecha_entrega: '',
  estado: 'pendiente' as EstadoPrenda,
  valor_total: '',
}

const coloresEstado: Record<EstadoPrenda, string> = {
  pendiente: 'badge-warning',
  en_proceso: 'badge-info',
  lista: 'badge-success',
  entregada: 'badge-neutral',
}

const etiquetasEstado: Record<EstadoPrenda, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En Proceso',
  lista: 'Lista',
  entregada: 'Entregada',
}

// Tipo extendido para la vista global (incluye el nombre del cliente)
type PrendaConCliente = Prenda & {
  clientes?: { nombre: string }
}

function Prendas() {
  const { clienteId } = useParams()
  const navigate = useNavigate()

  const esVistaGlobal = !clienteId

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [prendas, setPrendas] = useState<PrendaConCliente[]>([])
  const [cargando, setCargando] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [prendaEditando, setPrendaEditando] = useState<Prenda | null>(null)
  const [formulario, setFormulario] = useState(prendaVacia)
  const [filtroEstado, setFiltroEstado] = useState<EstadoPrenda | null>(null)

  // Ahora corre siempre — con o sin clienteId
  useEffect(() => {
    cargarDatos()
  }, [clienteId])

  async function cargarDatos() {
    setCargando(true)

    if (clienteId) {
      // Vista por cliente
      const { data: clienteData } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', clienteId)
        .single()
      setCliente(clienteData)

      const { data: prendasData } = await getPrendasPorCliente(clienteId)
      if (prendasData) setPrendas(prendasData as PrendaConCliente[])
    } else {
      // Vista global
      const { data: prendasData } = await getTodasLasPrendas()
      if (prendasData) setPrendas(prendasData as PrendaConCliente[])
    }

    setCargando(false)
  }

  function actualizarCampo(campo: string, valor: string) {
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }))
  }

  function abrirModalCrear() {
    setPrendaEditando(null)
    setFormulario(prendaVacia)
    setModalAbierto(true)
  }

  function abrirModalEditar(prenda: Prenda) {
    setPrendaEditando(prenda)
    setFormulario({
      tipo_prenda: prenda.tipo_prenda,
      descripcion: prenda.descripcion ?? '',
      fecha_pedido: prenda.fecha_pedido,
      fecha_entrega: prenda.fecha_entrega ?? '',
      estado: prenda.estado,
      valor_total: prenda.valor_total.toString(),
    })
    setModalAbierto(true)
  }

  async function guardarPrenda(e: React.FormEvent) {
    e.preventDefault()

    const prendaFinal = {
      cliente_id: clienteId!,
      tipo_prenda: formulario.tipo_prenda,
      descripcion: formulario.descripcion || null,
      fecha_pedido: formulario.fecha_pedido,
      fecha_entrega: formulario.fecha_entrega || null,
      estado: formulario.estado,
      valor_total: Number(formulario.valor_total),
    }

    if (prendaEditando) {
      await actualizarPrenda(prendaEditando.id, prendaFinal)
    } else {
      await crearPrenda(prendaFinal)
    }

    setModalAbierto(false)
    cargarDatos()
  }

  async function cambiarEstado(prenda: Prenda, nuevoEstado: EstadoPrenda) {
    await actualizarPrenda(prenda.id, { estado: nuevoEstado })
    cargarDatos()
  }

  async function manejarEliminar(id: string) {
    const confirmar = window.confirm('¿Seguro que quieres eliminar esta prenda?')
    if (!confirmar) return
    await eliminarPrenda(id)
    cargarDatos()
  }

  const prendasFiltradas = filtroEstado
    ? prendas.filter((p) => p.estado === filtroEstado)
    : prendas

  if (cargando) return <p>Cargando...</p>

  return (
    <div className="flex items-center gap-3 mb-6">
  {!esVistaGlobal && (
    <button onClick={() => navigate('/clientes')} className="btn btn-sm btn-ghost">
      ← Volver
    </button>
  )}
  <h1 className="text-2xl font-bold">
    {esVistaGlobal ? 'Todas las prendas' : `Prendas de ${cliente?.nombre}`}
  </h1>
  {!esVistaGlobal && (
    <button onClick={abrirModalCrear} className="btn btn-primary btn-sm ml-auto">
      + Nueva prenda
    </button>
  )}

      {/* Filtros por estado */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setFiltroEstado(null)}
          className={`btn btn-sm ${filtroEstado === null ? 'btn-neutral' : 'btn-ghost'}`}
        >
          Todas
        </button>
        {(Object.keys(etiquetasEstado) as EstadoPrenda[]).map((estado) => (
          <button
            key={estado}
            onClick={() => setFiltroEstado(estado)}
            className={`btn btn-sm ${filtroEstado === estado ? 'btn-neutral' : 'btn-ghost'}`}
          >
            {etiquetasEstado[estado]}
          </button>
        ))}
      </div>

      {prendasFiltradas.length === 0 ? (
        <p className="text-gray-500">No hay prendas registradas.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                {/* En vista global mostramos el nombre del cliente */}
                {esVistaGlobal && <th>Cliente</th>}
                <th>Prenda</th>
                <th>Descripción</th>
                <th>Fecha pedido</th>
                <th>Fecha entrega</th>
                <th>Estado</th>
                <th>Valor total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {prendasFiltradas.map((prenda) => (
                <tr key={prenda.id}>
                  {esVistaGlobal && (
                    <td>
                      <button
                        onClick={() => navigate(`/prendas/${prenda.cliente_id}`)}
                        className="link link-hover font-medium"
                      >
                        {prenda.clientes?.nombre ?? '—'}
                      </button>
                    </td>
                  )}
                  <td>{prenda.tipo_prenda}</td>
                  <td>{prenda.descripcion ?? '—'}</td>
                  <td>{new Date(prenda.fecha_pedido).toLocaleDateString()}</td>
                  <td>
                    {prenda.fecha_entrega
                      ? new Date(prenda.fecha_entrega).toLocaleDateString()
                      : '—'}
                  </td>
                  <td>
                    <select
                      className={`badge ${coloresEstado[prenda.estado]} border-none cursor-pointer`}
                      value={prenda.estado}
                      onChange={(e) => cambiarEstado(prenda, e.target.value as EstadoPrenda)}
                    >
                      {(Object.keys(etiquetasEstado) as EstadoPrenda[]).map((estado) => (
                        <option key={estado} value={estado}>
                          {etiquetasEstado[estado]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>${prenda.valor_total.toLocaleString('es-CO')}</td>
                  <td className="flex gap-2">
                    {!esVistaGlobal && (
                      <button
                        onClick={() => abrirModalEditar(prenda)}
                        className="btn btn-sm btn-ghost"
                      >
                        ✏️
                      </button>
                    )}
                    <button
                      onClick={() => manejarEliminar(prenda.id)}
                      className="btn btn-sm btn-ghost text-error"
                    >
                      🗑️
                    </button>
                    <button
                      onClick={() => navigate(`/pagos/${prenda.id}`)}
                      className="btn btn-sm btn-ghost"
                    >
                      💰
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: crear/editar prenda */}
      {modalAbierto && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {prendaEditando ? 'Editar prenda' : 'Nueva prenda'}
            </h3>
            <form onSubmit={guardarPrenda} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Tipo de prenda (ej: Vestido de gala)"
                className="input input-bordered w-full"
                value={formulario.tipo_prenda}
                onChange={(e) => actualizarCampo('tipo_prenda', e.target.value)}
                required
              />
              <textarea
                placeholder="Descripción (opcional)"
                className="textarea textarea-bordered w-full"
                value={formulario.descripcion}
                onChange={(e) => actualizarCampo('descripcion', e.target.value)}
              />
              <div className="flex gap-2">
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-sm text-gray-600">Fecha pedido</label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={formulario.fecha_pedido}
                    onChange={(e) => actualizarCampo('fecha_pedido', e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-sm text-gray-600">Fecha entrega</label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={formulario.fecha_entrega}
                    onChange={(e) => actualizarCampo('fecha_entrega', e.target.value)}
                  />
                </div>
              </div>
              <select
                className="select select-bordered w-full"
                value={formulario.estado}
                onChange={(e) => actualizarCampo('estado', e.target.value)}
              >
                {(Object.keys(etiquetasEstado) as EstadoPrenda[]).map((estado) => (
                  <option key={estado} value={estado}>
                    {etiquetasEstado[estado]}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Valor total ($)"
                className="input input-bordered w-full"
                value={formulario.valor_total}
                onChange={(e) => actualizarCampo('valor_total', e.target.value)}
                required
              />
              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="btn btn-ghost"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
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

export default Prendas