import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPagosPorPrenda, crearPago, eliminarPago, getTodosLosPagos } from '../services/pagosService'
import { supabase } from '../services/supabaseClient'
import type { Pago } from '../types'

type PagoConDetalle = Pago & {
  prendas?: {
    tipo_prenda: string
    valor_total: number
    clientes?: { nombre: string }
  }
}

const pagoVacio = {
  monto: '',
  tipo_pago: 'abono',
  observaciones: '',
  fecha_pago: new Date().toISOString().split('T')[0],
}

function Pagos() {
  const { prendaId } = useParams()
  const navigate = useNavigate()
  const esVistaGlobal = !prendaId

  const [prenda, setPrenda] = useState<any>(null)
  const [pagos, setPagos] = useState<PagoConDetalle[]>([])
  const [cargando, setCargando] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [formulario, setFormulario] = useState(pagoVacio)


useEffect(() => {
  cargarDatos()
}, [prendaId])

async function cargarDatos() {
  setCargando(true)

  if (prendaId) {
    const { data: prendaData } = await supabase
      .from('prendas')
      .select(`*, clientes(nombre)`)
      .eq('id', prendaId)
      .single()
    setPrenda(prendaData)

    const { data: pagosData } = await getPagosPorPrenda(prendaId!)
    if (pagosData) setPagos(pagosData as PagoConDetalle[])
  } else {
    const { data: pagosData } = await getTodosLosPagos()
    if (pagosData) setPagos(pagosData as PagoConDetalle[])
  }

  setCargando(false)
}


  function actualizarCampo(campo: string, valor: string) {
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }))
  }

  async function guardarPago(e: React.FormEvent) {
    e.preventDefault()

    await crearPago({
      prenda_id: prendaId!,
      monto: Number(formulario.monto),
      tipo_pago: formulario.tipo_pago as 'abono' | 'pago_completo',
      observaciones: formulario.observaciones || null,
      fecha_pago: formulario.fecha_pago,
    })

    setModalAbierto(false)
    setFormulario(pagoVacio)
    cargarDatos()
  }

  async function manejarEliminar(id: string) {
    const confirmar = window.confirm('¿Eliminar este pago?')
    if (!confirmar) return
    await eliminarPago(id)
    cargarDatos()
  }

  // Calculamos el saldo en el navegador: total - suma de pagos
  const totalPagado = pagos.reduce((suma, pago) => suma + pago.monto, 0)
  const saldoPendiente = prenda ? prenda.valor_total - totalPagado : 0

  if (cargando) return <p>Cargando...</p>

 return (
  <div>
    {/* Header */}
    <div className="flex items-center gap-3 mb-6">
      {!esVistaGlobal && (
        <button onClick={() => navigate(-1)} className="btn btn-sm btn-ghost">
          ← Volver
        </button>
      )}
      <h1 className="text-2xl font-bold">
        {esVistaGlobal ? 'Todos los pagos' : `Pagos — ${prenda?.tipo_prenda}`}
      </h1>
      {!esVistaGlobal && (
        <button onClick={() => setModalAbierto(true)} className="btn btn-primary btn-sm ml-auto">
          + Nuevo pago
        </button>
      )}
    </div>

    {/* Resumen — solo en vista por prenda */}
    {!esVistaGlobal && prenda && (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="card bg-base-100 shadow-sm p-4">
            <p className="text-sm text-gray-500">Cliente</p>
            <p className="font-semibold">{prenda?.clientes?.nombre}</p>
          </div>
          <div className="card bg-base-100 shadow-sm p-4">
            <p className="text-sm text-gray-500">Valor total</p>
            <p className="font-semibold">${prenda?.valor_total.toLocaleString('es-CO')}</p>
          </div>
          <div className="card bg-base-100 shadow-sm p-4">
            <p className="text-sm text-gray-500">Total pagado</p>
            <p className="font-semibold text-success">${totalPagado.toLocaleString('es-CO')}</p>
          </div>
        </div>
        <div className={`alert mb-6 ${saldoPendiente <= 0 ? 'alert-success' : 'alert-warning'}`}>
          <span className="font-semibold">
            {saldoPendiente <= 0
              ? '✅ Prenda pagada completamente'
              : `Saldo pendiente: $${saldoPendiente.toLocaleString('es-CO')}`}
          </span>
        </div>
      </>
    )}

    {/* Tabla */}
    {pagos.length === 0 ? (
      <p className="text-gray-500">No hay pagos registrados.</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              {esVistaGlobal && <th>Cliente</th>}
              {esVistaGlobal && <th>Prenda</th>}
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Monto</th>
              <th>Observaciones</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pagos.map((pago) => (
              <tr key={pago.id}>
                {esVistaGlobal && (
                  <td>
                    <button
                      onClick={() => navigate(`/pagos/${pago.prenda_id}`)}
                      className="link link-hover font-medium"
                    >
                      {pago.prendas?.clientes?.nombre ?? '—'}
                    </button>
                  </td>
                )}
                {esVistaGlobal && <td>{pago.prendas?.tipo_prenda ?? '—'}</td>}
                <td>{new Date(pago.fecha_pago).toLocaleDateString()}</td>
                <td>
                  <span className="badge badge-neutral">
                    {pago.tipo_pago === 'abono' ? 'Abono' : 'Pago completo'}
                  </span>
                </td>
                <td className="font-medium">${pago.monto.toLocaleString('es-CO')}</td>
                <td>{pago.observaciones ?? '—'}</td>
                <td>
                  <button
                    onClick={() => manejarEliminar(pago.id)}
                    className="btn btn-sm btn-ghost text-error"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {!esVistaGlobal && (
            <tfoot>
              <tr>
                <td colSpan={2} className="font-semibold">Total pagado</td>
                <td className="font-semibold">${totalPagado.toLocaleString('es-CO')}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    )}

    {/* Modal: nuevo pago — solo en vista por prenda */}
    {modalAbierto && (
      <div className="modal modal-open">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Registrar pago</h3>
          <form onSubmit={guardarPago} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Fecha</label>
              <input
                type="date"
                className="input input-bordered w-full"
                value={formulario.fecha_pago}
                onChange={(e) => actualizarCampo('fecha_pago', e.target.value)}
                required
              />
            </div>
            <select
              className="select select-bordered w-full"
              value={formulario.tipo_pago}
              onChange={(e) => actualizarCampo('tipo_pago', e.target.value)}
            >
              <option value="abono">Abono</option>
              <option value="pago_completo">Pago completo</option>
            </select>
            <input
              type="number"
              placeholder="Monto ($)"
              className="input input-bordered w-full"
              value={formulario.monto}
              onChange={(e) => actualizarCampo('monto', e.target.value)}
              required
            />
            <textarea
              placeholder="Observaciones (opcional)"
              className="textarea textarea-bordered w-full"
              value={formulario.observaciones}
              onChange={(e) => actualizarCampo('observaciones', e.target.value)}
            />
            <div className="modal-action">
              <button type="button" onClick={() => setModalAbierto(false)} className="btn btn-ghost">
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Guardar pago
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>

)
}
export default Pagos