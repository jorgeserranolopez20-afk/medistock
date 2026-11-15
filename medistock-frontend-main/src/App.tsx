import React, { useState, useEffect } from 'react';
import { Login, UsuarioActivo } from './components/Login';
import { EcommerceTab } from './components/EcommerceTab';
import { ClientesTab } from './components/ClientesTab';
import { AdminTab } from './components/AdminTab';

export default function App() {
  // Inicializamos buscando si existe sesión en el navegador
  const [usuario, setUsuario] = useState<UsuarioActivo | null>(() => {
    const usuarioGuardado = localStorage.getItem('usuarioMedistock');
    return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  });
  
  // Estado para evitar el parpadeo del login mientras lee el localStorage
  const [cargandoSesion, setCargandoSesion] = useState(true);

  // Estado de la pestaña activa
  const [tabActiva, setTabActiva] = useState<'admin_panel' | 'clientes' | 'ecommerce'>('ecommerce');

  // EFECTO MÁGICO: Sincroniza y valida la sesión apenas abre la app
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuarioMedistock');
    if (usuarioGuardado) {
      const user = JSON.parse(usuarioGuardado);
      setUsuario(user);
      // Si es admin, nos aseguramos de que mantenga una pestaña válida
      if (user.rol === 'admin' && tabActiva === 'ecommerce') {
        setTabActiva('admin_panel');
      }
    }
    setCargandoSesion(false);
  }, []);

  // Si está leyendo el almacenamiento del navegador, mostramos un estado de carga breve
  if (cargandoSesion) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-bold">
        Cargando sesión...
      </div>
    );
  }

  // Si no hay usuario, obligatoriamente va al Login
  if (!usuario) {
    return (
      <Login 
        onLogin={(usuarioLogueado) => {
          setUsuario(usuarioLogueado);
          localStorage.setItem('usuarioMedistock', JSON.stringify(usuarioLogueado));
          
          if (usuarioLogueado.rol === 'admin') {
            setTabActiva('admin_panel');
          } else {
            setTabActiva('ecommerce');
          }
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      
      {/* BARRA DE NAVEGACIÓN SUPERIOR REFINADA */}
      <header className="bg-[#0f172a] text-white px-6 pt-4 flex flex-col gap-4 shadow-md">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl">
              <span className="font-black text-xl tracking-wider text-white">MEDISTOCK</span>
            </div>
          </div>

          {/* PERFIL Y SALIDA */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-300 mr-2 uppercase tracking-wider">{usuario.rol}:</span>
              <span className="text-sm font-black text-slate-100">{usuario.nombre}</span>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('usuarioMedistock');
                setUsuario(null);
              }}
              className="bg-slate-800 hover:bg-red-900/40 hover:text-red-400 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
            >
              Salir
            </button>
          </div>
        </div>

        {/* MENÚ DE PESTAÑAS EXCLUSIVO */}
        <nav className="flex gap-1 overflow-x-auto border-b border-slate-800">
          {usuario.rol === 'cliente' && (
            <button
              onClick={() => setTabActiva('ecommerce')}
              className={`px-5 py-3 font-bold text-sm transition-all border-b-2 ${
                tabActiva === 'ecommerce' 
                  ? 'border-blue-500 text-white bg-slate-800/40' 
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              🛒 Vista E-Commerce
            </button>
          )}

          {usuario.rol === 'admin' && (
            <>
              <button
                onClick={() => setTabActiva('admin_panel')}
                className={`px-5 py-3 font-bold text-sm transition-all border-b-2 ${
                  tabActiva === 'admin_panel' 
                    ? 'border-emerald-500 text-white bg-slate-800/40' 
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                ⚙️ Panel Admin (CRUD & Reportes)
              </button>
              
              <button
                onClick={() => setTabActiva('clientes')}
                className={`px-5 py-3 font-bold text-sm transition-all border-b-2 ${
                  tabActiva === 'clientes' 
                    ? 'border-emerald-500 text-white bg-slate-800/40' 
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                👥 Gestión Clientes
              </button>

              <button
                onClick={() => setTabActiva('ecommerce')}
                className={`px-5 py-3 font-bold text-sm transition-all border-b-2 ${
                  tabActiva === 'ecommerce' 
                    ? 'border-emerald-500 text-white bg-slate-800/40' 
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                📦 Vista E-Commerce (Ver tienda)
              </button>
            </>
          )}
        </nav>
      </header>

      {/* RENDERIZADO DE LAS COMPONENTES ACTUALES */}
      <main className="flex-1 w-full p-4 bg-slate-50">
        {tabActiva === 'ecommerce' && <EcommerceTab usuarioLogueado={usuario} />}
        {tabActiva === 'clientes' && <ClientesTab />}
        {tabActiva === 'admin_panel' && <AdminTab />}
      </main>

    </div>
  );
}