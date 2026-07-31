//importaciones
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getMedidasPorCliente, crearMedida, getTodasLasMedidas } from "../services/medidasService"
import { supabase } from '../services/supabaseClient'
import type { Medida, Cliente } from '../types'

type MedidaConCliente = Medida & {
  clientes?: { nombre: string }
}

// Creamos el form vacio para los campos de medidas
const medidaVacia = {
  //fecha de hoy por defecto
  fecha: new Date().toISOString().split('T')[0], 
  //seguimos con las demas.
  busto: '',
  espalda: '',
  escote: '',
  largo_manga:'',
  ancho_manga: '',
  largo_pinza: '',
  ancho_pinza: '',
  talle_delantero: '',
  talle_trasero: '',
  cintura: '',
  cadera: '',
  tiro_delantero: '',
  tiro_trasero: '',
  largo: '',
  observaciones: '', 

}

function Medidas() {
  //useParams lee el id del cliente desde la URL. 
  const { clienteId } = useParams()
  const navigate = useNavigate()

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const esVistaGlobal = !clienteId
  const [medidas, setMedidas] = useState<MedidaConCliente[]>([])
  const [cargando, setCargando] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [formulario, setFormulario] = useState(medidaVacia)
  // medida que se selecciona para ver completamente
  const [medidaDetalle, setMedidaDetalle] = useState<Medida | null>(null)

  useEffect(() => {
  cargarDatos()
}, [clienteId])

  async function cargarDatos() {
  setCargando(true)

  //cargamos el cliente para mostrar su nombre como title.
  if (clienteId) {
    const { data: clienteData } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', clienteId)
      .single()
    setCliente(clienteData)

    //cargarmos el historial de medidas.
    const { data: medidasData } = await getMedidasPorCliente(clienteId!)
    if (medidasData) setMedidas(medidasData as MedidaConCliente[])
  } else {
    const { data: medidasData } = await getTodasLasMedidas()
    if (medidasData) setMedidas(medidasData as MedidaConCliente[])
  }

  setCargando(false)
}

  //funcion de actualizar datos.
  function actualizarCampo(campo: string, valor: string) {
    setFormulario((anterior) => ({...anterior, [campo]: valor }))
  }

  //funcion de guardar datos.
  async function guardarMedida(e: React.FormEvent) {
    e.preventDefault()

    //convertir los campos numericos a string porque los input siempre devuleven un string
    //si el campo esta vacio guardamos un null no un cero. 
    const medidaFinal = {
      cliente_id: clienteId!,
      fecha: formulario.fecha,
      busto: formulario.busto ? Number(formulario.busto) : null,
      cintura: formulario.cintura ? Number(formulario.cintura) : null,
      cadera: formulario.cadera ? Number(formulario.cadera) : null,
      espalda: formulario.espalda ? Number(formulario.espalda) : null,
      largo_manga: formulario.largo_manga ? Number(formulario.largo_manga) : null,
      largo: formulario.largo ? Number(formulario.largo) : null,
      escote: formulario.escote ? Number(formulario.escote) : null,
      tiro_delantero: formulario.tiro_delantero ? Number(formulario.tiro_delantero) : null,
      tiro_trasero: formulario.tiro_trasero ? Number(formulario.tiro_trasero) : null,
      talle_delantero: formulario.talle_delantero ? Number(formulario.talle_delantero) : null,
      talle_trasero: formulario.talle_trasero ? Number(formulario.talle_trasero) : null,
      ancho_manga: formulario.ancho_manga ? Number(formulario.ancho_manga) : null,
      largo_pinza: formulario.largo_pinza ? Number(formulario.largo_pinza) : null,
      ancho_pinza: formulario.ancho_pinza ? Number(formulario.ancho_pinza) : null,
      observaciones: formulario.observaciones || null,
    }

    await crearMedida(medidaFinal)
    setModalAbierto(false)
    setFormulario(medidaVacia)
    cargarDatos()
    
  }

  //componente small reutilizable para cada input number del form.
  function InputMedida({ campo, label }: { campo: string; label: string}) {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <input
          type="number"
          step="0.1"
          placeholder="cm"
          className="input input-bordered input-sm w-full"
          value={formulario[campo as keyof typeof formulario]}
          onChange={(e) => actualizarCampo(campo, e.target.value)}
        />
      </div>
    )
  }

  if (cargando) return <p>Cargando...</p>

  return (
  <div>
    {/* Header */}
    <div className="flex items-center gap-3 mb-6">
      {!esVistaGlobal && (
        <button onClick={() => navigate('/clientes')} className="btn btn-sm btn-ghost">
          ← Volver
        </button>
      )}
      <h1 className="text-2xl font-bold">
        {esVistaGlobal ? 'Todas las medidas' : `Medidas de ${cliente?.nombre}`}
      </h1>
      {!esVistaGlobal && (
        <button onClick={() => setModalAbierto(true)} className="btn btn-primary btn-sm ml-auto">
          + Nueva medida
        </button>
      )}
    </div>

    {medidas.length === 0 ? (
      <p className="text-gray-500">Aún no hay medidas registradas.</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="table table-sm">
          <thead>
            <tr>
              {esVistaGlobal && <th>Cliente</th>}
              <th>Fecha</th>
              <th>Busto</th>
              <th>Cintura</th>
              <th>Cadera</th>
              <th>Espalda</th>
              <th>Largo manga</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {medidas.map((medida) => (
              <tr key={medida.id}>
                {esVistaGlobal && (
                  <td>
                    <button
                      onClick={() => navigate(`/medidas/${medida.cliente_id}`)}
                      className="link link-hover font-medium"
                    >
                      {medida.clientes?.nombre ?? '—'}
                    </button>
                  </td>
                )}
                <td>{new Date(medida.fecha).toLocaleDateString()}</td>
                <td>{medida.busto ?? '—'}</td>
                <td>{medida.cintura ?? '—'}</td>
                <td>{medida.cadera ?? '—'}</td>
                <td>{medida.espalda ?? '—'}</td>
                <td>{medida.largo_manga ?? '—'}</td>
                <td>
                  <button
                    onClick={() => setMedidaDetalle(medida)}
                    className="btn btn-xs btn-ghost"
                  >
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

      {/* Modal: formulario de nueva medida */}
      {modalAbierto && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">Nueva medida</h3>
            <form onSubmit={guardarMedida} className="flex flex-col gap-4">

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Fecha</label>
                <input
                  type="date"
                  className="input input-bordered input-sm w-full"
                  value={formulario.fecha}
                  onChange={(e) => actualizarCampo('fecha', e.target.value)}
                  required
                />
              </div>

              {/* Medidas principales */}
              <p className="font-semibold text-sm text-gray-600 border-b pb-1">
                Medidas principales
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <InputMedida campo="busto" label="Busto" />
                <InputMedida campo="cintura" label="Cintura" />
                <InputMedida campo="cadera" label="Cadera" />
                <InputMedida campo="espalda" label="Espalda" />
                <InputMedida campo="escote" label="Escote" />
                <InputMedida campo="largo_manga" label="Largo manga" />
                <InputMedida campo="largo" label="Largo" />
                <InputMedida campo="ancho_manga" label="Ancho manga" />
              </div>

              {/* Medidas de patronaje */}
              <p className="font-semibold text-sm text-gray-600 border-b pb-1">
                Patronaje
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <InputMedida campo="tiro_delantero" label="Tiro delantero" />
                <InputMedida campo="tiro_trasero" label="Tiro trasero" />
                <InputMedida campo="talle_delantero" label="Talle delantero" />
                <InputMedida campo="talle_trasero" label="Talle trasero" />
                <InputMedida campo="largo_pinza" label="Largo pinza" />
                <InputMedida campo="ancho_pinza" label="Ancho pinza" />
              </div>

              {/* Observaciones */}
              <textarea
                placeholder="Observaciones (opcional)"
                className="textarea textarea-bordered w-full"
                value={formulario.observaciones}
                onChange={(e) => actualizarCampo('observaciones', e.target.value)}
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
                  Guardar medida
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: detalle completo de una medida */}
      {medidaDetalle && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">
              Detalle — {new Date(medidaDetalle.fecha).toLocaleDateString()}
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                ['Busto', medidaDetalle.busto],
                ['Cintura', medidaDetalle.cintura],
                ['Cadera', medidaDetalle.cadera],
                ['Espalda', medidaDetalle.espalda],
                ['Escote', medidaDetalle.escote],
                ['Largo manga', medidaDetalle.largo_manga],
                ['Ancho manga', medidaDetalle.ancho_manga],
                ['Largo', medidaDetalle.largo],
                ['Tiro delantero', medidaDetalle.tiro_delantero],
                ['Tiro trasero', medidaDetalle.tiro_trasero],
                ['Talle delantero', medidaDetalle.talle_delantero],
                ['Talle trasero', medidaDetalle.talle_trasero],
                ['Largo pinza', medidaDetalle.largo_pinza],
                ['Ancho pinza', medidaDetalle.ancho_pinza],
              ].map(([label, valor]) => (
                <div key={label as string} className="flex flex-col">
                  <span className="text-xs text-gray-500">{label as string}</span>
                  <span className="font-medium">{valor ?? '—'} {valor ? 'cm' : ''}</span>
                </div>
              ))}
            </div>
            {medidaDetalle.observaciones && (
              <div className="mt-4">
                <span className="text-xs text-gray-500">Observaciones</span>
                <p className="mt-1">{medidaDetalle.observaciones}</p>
              </div>
            )}
            <div className="modal-action">
              <button onClick={() => setMedidaDetalle(null)} className="btn btn-ghost">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Medidas
