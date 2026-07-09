import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Clientes from './pages/Clientes'
import Medidas from './pages/Medidas'
import Prendas from './pages/Prendas'
import Pagos from './pages/Pagos'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login queda FUERA de la protección, obviamente: si no, nadie podría
            ni siquiera llegar a la pantalla para loguearse. */}
        <Route path="/login" element={<Login />} />

        {/* Envolvemos el MainLayout (y todo lo que tiene dentro) con ProtectedRoute. */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/medidas/:clienteId" element={<Medidas />} />
          <Route path="/prendas" element={<Prendas />} />
          <Route path="/pagos" element={<Pagos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App