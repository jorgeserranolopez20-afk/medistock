import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, AlertTriangle, Calendar } from 'lucide-react';

interface DetalleItem {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface Venta {
  id: number;
  fecha: string;
  clienteId: string;
  total: number;
  detalle: DetalleItem[];
}

interface Producto {
  id: number;
  nombre: string;
  stock: number;
  precio: number;
}

export function AdminDashboard() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarDatosDashboard = async () => {
    setCargando(true);
    try {
      const [resVentas, resProductos] = await Promise.all([
        fetch('http://localhost:3000/api/v1/ventas'),
        fetch('http://localhost:3000/api/v1/productos')
      ]);
      
      const dataVentas = await resVentas.json();
      const dataProductos = await resProductos.json();
      
      setVentas(dataVentas);
      setProductos(dataProductos);
    } catch (error) {
      console.error("Error al cargar datos del dashboard:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  const totalIngresos = ventas.reduce((sum, v) => sum + v.total, 0);
  const totalOrdenes = ventas.length;
  const ticketPromedio = totalOrdenes > 0 ? Math.round(totalIngresos / totalOrdenes) : 0;
  const productosCriticos = productos.filter(p => p.stock < 5);

  if (cargando) {
    return <div className="p-8 text-center text-slate-500">Cargando reportes del sistema...</div>;
  }

  return (
    <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 min-h-[85vh] space-y-8">
      
      <div className="border-b border-slate-200 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Panel de Reportes e Informes</h2>
          <p className="text-slate-500 mt-1">Auditoría de ventas en tiempo real e informes de inventario crítico.</p>
        </div>
        <button 
          onClick={cargarDatosDashboard}
          className="flex items-center gap-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold py-2 px-4 rounded-lg transition-colors border border-blue-200"
        >
          Actualizar Reportes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ingresos Totales</span>
            <h3 className="text-2xl font-black text-slate-800">${totalIngresos.toLocaleString('es-CL')}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
            <ShoppingBag size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ventas Emitidas</span>
            <h3 className="text-2xl font-black text-slate-800">{totalOrdenes} órdenes</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket Promedio</span>
            <h3 className="text-2xl font-black text-slate-800">${ticketPromedio.toLocaleString('es-CL')}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Calendar className="text-blue-600" size={20} />
            <h3 className="text-lg font-bold text-slate-800">Informe Detallado de Ventas</h3>
          </div>
          
          <div className="overflow-x-auto">
            {ventas.length === 0 ? (
              <div className="py-12 text-center text-slate-400">No se han registrado ventas en el sistema aún.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="py-3 px-6">ID / Fecha</th>
                    <th className="py-3 px-6">Cliente</th>
                    <th className="py-3 px-6">Detalle de Productos</th>
                    <th className="py-3 px-6 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {ventas.map((venta) => (
                    <tr key={venta.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-800">#00{venta.id}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {new Date(venta.fecha).toLocaleDateString('es-CL')}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-600">{venta.clienteId}</td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                          {venta.detalle.map((item, idx) => (
                            <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 inline-block w-fit">
                              {item.nombre} <b className="text-blue-600">x{item.cantidad}</b>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right font-extrabold text-emerald-600">
                        ${venta.total.toLocaleString('es-CL')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={20} />
            <h3 className="text-lg font-bold text-slate-800">Alerta: Stock Crítico</h3>
          </div>
          
          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-500">
              Productos con inventario inferior a <b>5 unidades</b>.
            </p>
            
            <div className="space-y-3">
              {productosCriticos.length === 0 ? (
                <div className="text-center py-6 text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-100 text-sm font-semibold">
                  No hay productos en stock crítico.
                </div>
              ) : (
                productosCriticos.map((prod) => (
                  <div key={prod.id} className="flex justify-between items-center p-3 bg-red-50/60 rounded-xl border border-red-100">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-slate-800 truncate">{prod.nombre}</h4>
                    </div>
                    <div className="text-right ml-4">
                      <span className="bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-sm">
                        {prod.stock} un.
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}