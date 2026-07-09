// Una "interface" en TypeScript describe la forma exacta que debe tener un objeto.
// Esto evita errores como escribir "telefno" en vez de "telefono" en algún lugar del código:
// TypeScript te avisa inmediatamente si algo no coincide con esta forma.

export interface Cliente {
  id: string
  nombre: string
  telefono: string
  direccion: string
  fecha_nacimiento: string | null // el "| null" significa: puede no tener valor
  notas: string | null
  fecha_registro: string
}

export interface Medida {
  id: string
  cliente_id: string
  fecha: string
  busto: number | null
  cintura: number | null
  cadera: number | null
  espalda: number | null
  largo_manga: number | null
  largo: number | null
  escote: number | null
  tiro_delantero: number | null
  tiro_trasero: number | null
  talle_delantero: number | null
  talle_trasero: number | null
  ancho_manga: number | null
  largo_pinza: number | null
  ancho_pinza: number | null
  observaciones: string | null
}

// "Estado" usa un tipo especial llamado "union type": solo permite estos 4 valores exactos,
// ni uno más. Si en otro archivo escribes estado: 'pendientee' (con error de tipeo),
// TypeScript te lo va a marcar como error antes de que pase a producción.
export type EstadoPrenda = 'pendiente' | 'en_proceso' | 'lista' | 'entregada'

export interface Prenda {
  id: string
  cliente_id: string
  tipo_prenda: string
  descripcion: string | null
  fecha_pedido: string
  fecha_entrega: string | null
  estado: EstadoPrenda
  valor_total: number
}

export interface Pago {
  id: string
  prenda_id: string
  monto: number
  tipo_pago: 'abono' | 'pago_completo'
  observaciones: string | null
  fecha_pago: string
}