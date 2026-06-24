// Outlet es un componente especial de react-router-dom:
// representa "el espacio donde se va a mostrar la página actual"
// (Dashboard, Clientes, etc.), dependiendo de la ruta.
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

function MainLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-6">
          {/* Aquí se "inyecta" la página actual según la ruta */}
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout