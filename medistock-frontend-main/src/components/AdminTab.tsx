import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen: string;
}

interface Venta {
  id: number;
  fecha: string;
  clienteId: string | number;
  total: number;
  detalle: any[];
}

export function AdminTab() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);

  const [filtroPeriodo, setFiltroPeriodo] = useState('todo');

  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const consultarServidor = async () => {
    try {
      const resProd = await fetch('http://localhost:3000/api/v1/productos');
      const dataProd = await resProd.json();
      setProductos(dataProd);

      const urlVentas = filtroPeriodo === 'todo' 
        ? 'http://localhost:3000/api/v1/ventas'
        : `http://localhost:3000/api/v1/ventas?periodo=${filtroPeriodo}`;

      const resVent = await fetch(urlVentas);
      const dataVent = await resVent.json();
      setVentas(dataVent);
    } catch (error) {
      console.error("Error conectando con la API:", error);
    }
  };

  useEffect(() => {
    consultarServidor();
  }, [filtroPeriodo]);

  const ordenesAprobadas = ventas.length;
  const ingresosEstimados = ventas.reduce((total, venta) => total + venta.total, 0);
  const productosCriticos = productos.filter(p => p.stock < 5);

  const emitirReporteVentas = () => {
    if (ventas.length === 0) return alert("No hay registros de ventas para emitir un informe.");

    const nombreFiltro = {
      'todo': 'Histórico Completo',
      'diario': 'Reporte Diario (Hoy)',
      'mensual': 'Reporte Mensual (Mes en curso)',
      'anual': 'Reporte Anual'
    }[filtroPeriodo] || 'Consolidado General';

    const element = document.createElement('div');
    element.innerHTML = `
      <div style="padding: 30px; font-family: Arial, sans-serif; color: #1e293b;">
        <div style="background-color: #0f172a; color: white; padding: 24px; border-radius: 12px; margin-bottom: 25px;">
          <h1 style="margin: 0; font-size: 24px;">Informe de Rendimiento de Ventas</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.8; font-size: 14px;">MediStock — Control e Insumos Médicos</p>
        </div>
        
        <div style="margin-bottom: 20px; font-size: 13px;">
          <strong>Fecha de Emisión:</strong> ${new Date().toLocaleDateString('es-CL')} a las ${new Date().toLocaleTimeString('es-CL')}<br>
          <strong>Tipo de Filtro Operacional:</strong> ${nombreFiltro}
        </div>

        <div style="display: flex; gap: 20px; margin-bottom: 30px; background-color: #f8fafc; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <div style="flex: 1;">
            <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Órdenes Concretadas</span>
            <div style="font-size: 24px; font-weight: bold; color: #0f172a;">${ordenesAprobadas}</div>
          </div>
          <div style="flex: 1;">
            <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Ingresos Totales (CLP)</span>
            <div style="font-size: 24px; font-weight: bold; color: #10b981;">$${ingresosEstimados.toLocaleString('es-CL')}</div>
          </div>
        </div>

        <h3 style="color: #334155; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px;">Historial de Transacciones Registradas</h3>
        <table style="w-full; width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="background-color: #f1f5f9; text-align: left;">
              <th style="padding: 10px; border: 1px solid #e2e8f0;">ID Venta</th>
              <th style="padding: 10px; border: 1px solid #e2e8f0;">Fecha / Hora</th>
              <th style="padding: 10px; border: 1px solid #e2e8f0;">ID Cliente</th>
              <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: right;">Total Pagado</th>
            </tr>
          </thead>
          <tbody>
            ${ventas.map(v => `
              <tr>
                <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">#${v.id}</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">${new Date(v.fecha).toLocaleString('es-CL')}</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">${v.clienteId}</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #0f172a;">$${v.total.toLocaleString('es-CL')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    const opt = {
      margin: 10,
      filename: `Informe_Ventas_${filtroPeriodo}_${new Date().toISOString().slice(0,10)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
  };

  const emitirReporteStock = () => {
    if (productosCriticos.length === 0) return alert("¡Excelente! No hay insumos en stock crítico en este momento.");

    const element = document.createElement('div');
    element.innerHTML = `
      <div style="padding: 30px; font-family: Arial, sans-serif; color: #1e293b;">
        <div style="background-color: #dc2626; color: white; padding: 24px; border-radius: 12px; margin-bottom: 25px;">
          <h1 style="margin: 0; font-size: 24px;">Informe de Alerta: Reposición Crítica</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">Requerimiento Inmediato de Adquisición de Insumos</p>
        </div>
        
        <div style="margin-bottom: 20px; font-size: 13px;">
          <strong>Fecha del Reporte:</strong> ${new Date().toLocaleDateString('es-CL')} a las ${new Date().toLocaleTimeString('es-CL')}<br>
          <strong>Nivel de Alerta Configurado:</strong> Menos de 5 unidades en bodega.
        </div>

        <div style="background-color: #fef2f2; border: 1px solid #fee2e2; padding: 15px; border-radius: 10px; margin-bottom: 30px;">
          <span style="font-size: 12px; font-weight: bold; color: #991b1b; text-transform: uppercase;">Total Insumos Afectados</span>
          <div style="font-size: 32px; font-weight: 900; color: #dc2626; margin-top: 5px;">${productosCriticos.length} <span style="font-size: 16px; font-weight: normal;">artículos en alerta roja</span></div>
        </div>

        <h3 style="color: #334155; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px;">Listado de Productos por Reponer</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="background-color: #f8fafc; text-align: left;">
              <th style="padding: 12px; border: 1px solid #e2e8f0;">ID</th>
              <th style="padding: 12px; border: 1px solid #e2e8f0;">Insumo Médico</th>
              <th style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">Stock Actual</th>
              <th style="padding: 12px; border: 1px solid #e2e8f0;">Estado Operativo</th>
            </tr>
          </thead>
          <tbody>
            ${productosCriticos.map(p => `
              <tr>
                <td style="padding: 12px; border: 1px solid #e2e8f0; color: #64748b;">#${p.id}</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0;">
                  <strong>${p.nombre}</strong><br>
                  <span style="font-size: 11px; color: #64748b;">${p.descripcion || 'Sin descripción detallada'}</span>
                </td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: #dc2626; background-color: #fef2f2;">
                  ${p.stock} un.
                </td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; color: #b91c1c; font-weight: bold;">
                  ⚠️ Reposición Urgente
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    const opt = {
      margin: 10,
      filename: `Requerimiento_Reposicion_${new Date().toISOString().slice(0,10)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
  };

  const iniciarEdicion = (prod: Producto) => {
    setEditandoId(prod.id);
    setNombre(prod.nombre);
    setPrecio(prod.precio.toString());
    setStock(prod.stock.toString());
    setDescripcion(prod.descripcion || '');
    setImagen(prod.imagen || '');
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombre('');
    setPrecio('');
    setStock('');
    setDescripcion('');
    setImagen('');
  };

  const handleGuardarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !precio || !stock) return alert("Completa los campos obligatorios");

    const url = editandoId 
      ? `http://localhost:3000/api/v1/productos/${editandoId}` 
      : 'http://localhost:3000/api/v1/productos';
      
    const metodo = editandoId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          descripcion,
          precio: Number(precio),
          stock: Number(stock),
          imagen: imagen || 'https://url-de-tu-imagen.jpg'
        })
      });

      if (res.ok) {
        cancelarEdicion();
        consultarServidor();
      } else {
        alert("Ocurrió un error al procesar la solicitud.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este insumo?")) return;
    try {
      await fetch(`http://localhost:3000/api/v1/productos/${id}`, { method: 'DELETE' });
      if (editandoId === id) cancelarEdicion();
      consultarServidor();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Panel de Administración</h1>
          <p className="text-sm font-medium text-slate-500">Gestiona el inventario y emite reportes de la operación.</p>
        </div>
        <button 
          onClick={consultarServidor}
          className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-colors"
        >
          🔄 Sincronizar Datos
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <span className="text-blue-500 text-xl">📈</span>
                <h2 className="font-bold text-slate-800 text-lg">Informe de Ventas</h2>
              </div>
              <select 
                value={filtroPeriodo}
                onChange={(e) => setFiltroPeriodo(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-3 py-1 text-sm font-semibold cursor-pointer"
              >
                <option value="todo">Histórico Completo</option>
                <option value="diario">Diaria</option>
                <option value="mensual">Mensual</option>
                <option value="anual">Anual</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Órdenes Aprobadas</p>
                <p className="text-3xl font-black text-slate-800">{ordenesAprobadas}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ingresos Estimados</p>
                <p className="text-3xl font-black text-emerald-600">${ingresosEstimados.toLocaleString('es-CL')}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={emitirReporteVentas}
            className="w-full bg-[#0f172a] hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            📄 Emitir Informe de Ventas
          </button>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-red-500 text-xl">⚠️</span>
              <h2 className="font-bold text-slate-800 text-lg">Control de Stock Crítico</h2>
            </div>
            <p className="text-sm font-semibold text-slate-500 mb-2">Productos con inventario inferior a 5 unidades:</p>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-black text-red-600">{productosCriticos.length}</span>
              <span className="text-sm font-bold text-slate-600">insumos en alerta</span>
            </div>
          </div>
          <button 
            onClick={emitirReporteStock}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            📥 Emitir Informe de Reposición
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm h-fit">
          <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
            {editandoId ? '✏️ Editar Insumo' : '📦 Nuevo Producto'}
          </h3>
          <form onSubmit={handleGuardarProducto} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Nombre del Insumo *</label>
              <input 
                type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                placeholder="Ej: Mascarillas Quirúrgicas" required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Precio (CLP) *</label>
                <input 
                  type="number" value={precio} onChange={e => setPrecio(e.target.value)}
                  placeholder="4990" required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Stock Actual *</label>
                <input 
                  type="number" value={stock} onChange={e => setStock(e.target.value)}
                  placeholder="20" required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Descripción</label>
              <textarea 
                value={descripcion} 
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Detalles del insumo..." 
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none"
              ></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">URL Imagen</label>
              <input 
                type="text" value={imagen} onChange={e => setImagen(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <button type="submit" className={`w-full font-bold py-2.5 rounded-xl text-sm shadow-md transition-colors ${editandoId ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/10' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10'}`}>
                {editandoId ? '💾 Guardar Cambios' : '➕ Registrar Insumo'}
              </button>
              {editandoId && (
                <button type="button" onClick={cancelarEdicion} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 rounded-xl text-xs transition-colors">
                  ❌ Cancelar Edición
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm lg:col-span-2 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-400 font-bold text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">Producto</th>
                  <th className="py-4 px-6 text-right">Precio</th>
                  <th className="py-4 px-6 text-center">Stock</th>
                  <th className="py-4 px-6 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {productos.map(prod => (
                  <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-400">
                        {prod.imagen && prod.imagen.startsWith('http') ? (
                          <img src={prod.imagen} alt={prod.nombre} className="w-full h-full object-cover rounded-lg" />
                        ) : '📦'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{prod.nombre}</p>
                        <p className="text-xs text-slate-400 line-clamp-1 font-normal">{prod.descripcion}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-slate-900">${prod.precio.toLocaleString('es-CL')}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${prod.stock < 5 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-700'}`}>
                        {prod.stock}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => iniciarEdicion(prod)} 
                          className={`p-2 rounded-lg transition-colors ${editandoId === prod.id ? 'bg-amber-100 text-amber-700' : 'text-amber-500 hover:bg-amber-50'}`}
                        >
                          ✏️
                        </button>
                        <button onClick={() => handleEliminar(prod.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}