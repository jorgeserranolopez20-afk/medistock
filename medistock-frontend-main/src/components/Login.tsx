import React, { useState } from 'react';
import { ShieldCheck, User, Store, ArrowRight, ArrowLeft } from 'lucide-react';

export interface UsuarioActivo {
  nombre: string;
  rol: 'admin' | 'cliente';
  email: string;
}

interface LoginProps {
  onLogin: (usuario: UsuarioActivo) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Estado para controlar si estamos en la pantalla de Cliente o de Administrador
  const [esVistaAdmin, setEsVistaAdmin] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (esVistaAdmin) {
      // 1. USUARIO ADMINISTRADOR ÚNICO
      if (email === 'admin@medistock.com' && password === 'admin123') {
        onLogin({ 
          nombre: 'Administrador General', 
          rol: 'admin', 
          email: 'admin@medistock.com' 
        });
      } else {
        setError('Credenciales de administrador incorrectas. Acceso denegado.');
      }
    } else {
      // 2. USUARIO CLIENTE NORMAL ÚNICO
      if (email === 'juan.perez@email.com' && password === 'cliente123') {
        onLogin({ 
          nombre: 'Juan Pérez', 
          rol: 'cliente', 
          email: 'juan.perez@email.com' 
        });
      } else {
        setError('Correo o contraseña de cliente incorrectos. Verifica tus datos.');
      }
    }
  };

  const cambiarVista = (haciaAdmin: boolean) => {
    setEsVistaAdmin(haciaAdmin);
    setError('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-4 transition-colors duration-500 ${esVistaAdmin ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className={`max-w-md w-full rounded-3xl shadow-xl border p-8 transition-all ${esVistaAdmin ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
        
        {/* ENCABEZADO */}
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md ${esVistaAdmin ? 'bg-emerald-500' : 'bg-blue-600'}`}>
            {esVistaAdmin ? <ShieldCheck className="text-white" size={32} /> : <Store className="text-white" size={32} />}
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            {esVistaAdmin ? 'PORTAL ADMIN' : 'MEDISTOCK'}
          </h1>
          <p className={`text-sm mt-2 ${esVistaAdmin ? 'text-slate-400' : 'text-slate-500'}`}>
            {esVistaAdmin 
              ? 'Área de gestión. Ingrese credenciales maestras.' 
              : 'Bienvenido. Inicie sesión para adquirir insumos médicos.'}
          </p>
        </div>

        {/* MENSAJE DE ERROR */}
        {error && (
          <div className={`mb-6 p-3 text-sm rounded-xl text-center font-medium border ${esVistaAdmin ? 'bg-red-900/30 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
            {error}
          </div>
        )}

        {/* FORMULARIO DE CREDENCIALES */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={`block text-xs font-bold uppercase mb-1 ${esVistaAdmin ? 'text-slate-400' : 'text-slate-500'}`}>
              Correo Electrónico
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={esVistaAdmin ? "admin@medistock.com" : "juan.perez@email.com"} 
              className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${
                esVistaAdmin 
                  ? 'bg-slate-900 border-slate-700 text-white focus:border-emerald-500 focus:ring-emerald-500/20' 
                  : 'border border-slate-300 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
              required
            />
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase mb-1 ${esVistaAdmin ? 'text-slate-400' : 'text-slate-500'}`}>
              Contraseña
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${
                esVistaAdmin 
                  ? 'bg-slate-900 border-slate-700 text-white focus:border-emerald-500 focus:ring-emerald-500/20' 
                  : 'border border-slate-300 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
              required
            />
          </div>

          <button 
            type="submit" 
            className={`w-full font-bold py-3.5 rounded-xl transition-all shadow-sm flex justify-center items-center gap-2 ${
              esVistaAdmin 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white hover:-translate-y-0.5' 
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:-translate-y-0.5'
            }`}
          >
            {esVistaAdmin ? <ShieldCheck size={18} /> : <User size={18} />}
            {esVistaAdmin ? 'Ingresar como Administrador' : 'Ingresar como Cliente'}
          </button>
        </form>

        {/* INTERRUPTOR DE ROLES (ABAJO) */}
        <div className={`mt-8 pt-6 border-t flex flex-col items-center ${esVistaAdmin ? 'border-slate-700' : 'border-slate-100'}`}>
          {esVistaAdmin ? (
            <button 
              type="button"
              onClick={() => cambiarVista(false)}
              className="text-sm font-medium text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
            >
              <ArrowLeft size={16} />
              Volver al acceso de clientes
            </button>
          ) : (
            <button 
              type="button"
              onClick={() => cambiarVista(true)}
              className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center gap-2 transition-colors"
            >
              Acceso exclusivo para Administradores
              <ArrowRight size={16} />
            </button>
          )}
        </div>

      </div>

      {/* TORPEDO DE CREDENCIALES (Muy útil para la disertación) */}
      <div className={`mt-8 text-xs max-w-md w-full text-center px-4 ${esVistaAdmin ? 'text-slate-500' : 'text-slate-400'}`}>
        <p className="font-bold uppercase tracking-wider mb-1">Credenciales académicas de acceso</p>
        {esVistaAdmin ? (
          <p>Usuario: <strong className="text-emerald-500">admin@medistock.com</strong> / Clave: <strong>admin123</strong></p>
        ) : (
          <p>Usuario: <strong className="text-blue-500">juan.perez@email.com</strong> / Clave: <strong>cliente123</strong></p>
        )}
      </div>
    </div>
  );
}