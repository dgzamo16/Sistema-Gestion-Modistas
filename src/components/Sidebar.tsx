

// Link y useLocation vienen de react-router-dom:
// Link sirve para navegar entre páginas sin recargar el navegador.
// useLocation nos dice en qué ruta/página estamos parados ahora mismo.
import { Link, useLocation } from 'react-router-dom'

// Definimos un "tipo" para cada item del menú: qué forma debe tener cada uno.
// Esto es TypeScript ayudándonos a no cometer errores (ej: olvidar el campo "ruta").
type ItemMenu = {
  nombre: string
  ruta: string
  disponible: boolean // false = "próximamente" (Reportes, Configuración)
}

// Este array es nuestra "fuente de la verdad" del menú.
// Si en el futuro agregas una página nueva, solo agregas un objeto aquí
// y el menú se actualiza solo — no tocas el resto del componente.
const itemsMenu: ItemMenu[] = [
  { nombre: 'Dashboard', ruta: '/', disponible: true },
  { nombre: 'Clientes', ruta: '/clientes', disponible: true },
  { nombre: 'Medidas', ruta: '/medidas', disponible: true },
  { nombre: 'Prendas', ruta: '/prendas', disponible: true },
  { nombre: 'Pagos', ruta: '/pagos', disponible: true },
  { nombre: 'Reportes', ruta: '/reportes', disponible: false },
  { nombre: 'Configuración', ruta: '/configuracion', disponible: false },
]

// Este es nuestro componente. En React, un componente es simplemente
// una función que devuelve HTML (en realidad JSX, una versión especial de HTML).
function Sidebar() {
  // location.pathname nos dice la ruta actual (ej: "/clientes").
  // Lo usamos para saber qué item del menú resaltar como "activo".
  const location = useLocation()

  return (
    <aside className="w-64 min-h-screen bg-base-100 border-r border-base-200 p-4">
      {/* Logo / nombre de la app, igual que en tu mockup */}
      <h2 className="text-xl font-bold mb-6 px-2">Atelier Manager</h2>

      <ul className="menu w-full">
        {/* .map() recorre el array itemsMenu y por cada objeto,
            genera un <li> en pantalla. Esto es "renderizar una lista". */}
        {itemsMenu.map((item) => {
          // Comparamos la ruta del item con la ruta actual para saber si está activo.
          const esActivo = location.pathname === item.ruta

          return (
            <li key={item.ruta}>
              {item.disponible ? (
                // Si la opción está disponible, es un link normal y funcional.
                <Link
                  to={item.ruta}
                  className={esActivo ? 'active font-semibold' : ''}
                >
                  {item.nombre}
                </Link>
              ) : (
                // Si no está disponible (Reportes, Configuración),
                // mostramos texto deshabilitado con un badge "Próximamente".
                <span className="opacity-40 cursor-not-allowed flex justify-between">
                  {item.nombre}
                  <span className="badge badge-sm">Próximamente</span>
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </aside>
  )
}

export default Sidebar