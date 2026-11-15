import React, { useState, useEffect } from 'react';
import { UserPlus, Edit2, Trash2, RefreshCw, Users, Mail, Phone, Fingerprint } from 'lucide-react';

interface Cliente {
  id?: number;
  rut: string;
  nombre: string;
  email: string;
  telefono: string;
}

export function ClientesTab() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(false);
  
  const [form, setForm] = useState<Cliente>({
    rut: '',
    nombre: '',
    email: '',
    telefono: ''
  });
  
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const fetchClientes = async () => {
    setCargando(true);
    try {
      const res = await fetch('http://localhost:3000/api/v1/clientes');
      const data = await res.json();
      setClientes(data);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      alert("No se pudo conectar con el servidor");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const limpiarFormulario = () => {
    setForm({ rut: '', nombre: '', email: '', telefono: '' });
    setEditandoId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.rut || !form.nombre || !form.email) {
      alert("Por favor, rellena los campos obligatorios (RUT, Nombre y Email).");
      return;
    }

    const esEdicion = editandoId !== null;
    const url = esEdicion 
      ? `http://localhost:3000/api/v1/clientes/${editandoId}`
      : 'http://localhost:3000/api/v1/clientes';
    
    const metodo = esEdicion ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        alert(esEdicion ? "Cliente actualizado con éxito" : "Cliente registrado con éxito");
        limpiarFormulario();
        fetchClientes();
      } else {
        alert("Error en el servidor al guardar el cliente.");
      }
    } catch (error) {
      console.error("Error en la operación:", error);
      alert("Error de conexión");
    }
  };

  const prepararEdicion = (cliente: Cliente) => {
    if (cliente.id) {
      setEditandoId(cliente.id);
      setForm({
        rut: cliente.rut,
        nombre: cliente.nombre,
        email: cliente.email,
        telefono: cliente.telefono
      });
    }
  };

  const handleEliminar = async (id: number, nombre: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar a "${nombre}" del sistema?`)) return;

    try {
      const res = await fetch(`http://localhost:3000/api/v1/clientes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchClientes();
        if (editandoId === id) limpiarFormulario();
      } else {
        alert("No se pudo eliminar el cliente.");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  return (
    <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 min-h-[85vh]">
      
      {/* ENCABEZADO */}
      <div className="mb-8 border-b border-slate-200 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Gestión de Clientes</h2>
          <p className="text-slate-500 mt-1">Registra y administra la cartera de clientes y hospitales.</p>
        </div>
        <button 
          onClick={fetchClientes} 
          disabled={cargando}
          className="flex items-center gap-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-4 rounded-lg transition-colors border border-slate-200"
        >
          <RefreshCw size={16} className={cargando ? 'animate-spin' : ''} />
          Sincronizar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* FORMULARIO CRUD */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Users className="text-blue-600" size={22} />
            {editandoId !== null ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">RUT / Empresa</label>
              <div className="relative">
                <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" value={form.rut} onChange={(e) => setForm({...form, rut: e.target.value})} placeholder="Ej: 12.345.678-9" className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre Completo o Razón Social</label>
              <input type="text" value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} placeholder="Ej: Clínica Santa María" className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} placeholder="contacto@empresa.com" className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teléfono</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" value={form.telefono} onChange={(e) => setForm({...form, telefono: e.target.value})} placeholder="+56 9 1234 5678" className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button type="submit" className={`flex-1 text-white py-2 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 ${editandoId !== null ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {editandoId !== null ? <Edit2 size={16} /> : <UserPlus size={16} />}
                {editandoId !== null ? 'Actualizar' : 'Registrar'}
              </button>
              {editandoId !== null && (
                <button type="button" onClick={limpiarFormulario} className="bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 px-4 rounded-xl font-semibold text-sm transition-colors">Cancelar</button>
              )}
            </div>
          </form>
        </div>

        {/* TABLA MAESTRA DE CLIENTES */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Cliente</th>
                  <th className="py-4 px-4">Contacto</th>
                  <th className="py-4 px-6 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {clientes.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400">No hay clientes registrados.</td>
                  </tr>
                ) : (
                  clientes.map((cliente) => (
                    <tr key={cliente.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-800">{cliente.nombre}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Fingerprint size={12} /> {cliente.rut}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1 text-xs">
                          <span className="flex items-center gap-1 text-slate-600"><Mail size={12}/> {cliente.email}</span>
                          <span className="flex items-center gap-1 text-slate-600"><Phone size={12}/> {cliente.telefono || 'Sin teléfono'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center items-center gap-2">
                          <button onClick={() => prepararEdicion(cliente)} className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg" title="Editar"><Edit2 size={16} /></button>
                          <button onClick={() => cliente.id && handleEliminar(cliente.id, cliente.nombre)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg" title="Eliminar"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}