import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, CreditCard } from 'lucide-react';
import { UsuarioActivo } from './Login'; 

interface EcommerceTabProps {
  usuarioLogueado: UsuarioActivo;
}

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock?: number;
  imagen: string;
}

interface ItemCarrito extends Producto {
  cantidad: number;
}

export function EcommerceTab({ usuarioLogueado }: EcommerceTabProps) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [cargandoPago, setCargandoPago] = useState(false);

  const fetchProductos = async () => {
    try {
      const res = await fetch('/api/v1/productos');
      const data = await res.json();
      setProductos(data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  // --- LÓGICA DEL CARRITO ---
  const agregarAlCarrito = (producto: Producto) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === producto.id);
      if (existe) {
        return prev.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const quitarUnidad = (id: number) => {
    setCarrito((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, cantidad: Math.max(0, item.cantidad - 1) } : item
      ).filter(item => item.cantidad > 0)
    );
  };

  const totalCarrito = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  // --- LÓGICA INTEGRADA: REGISTRO DE VENTA Y REDIRECCIÓN SILENCIOSA ---
// --- LÓGICA CON DIRECCIONAMIENTO ABSOLUTO ---
  const handlePagoWebpay = async () => {
    if (totalCarrito === 0) return;
    setCargandoPago(true);

    try {
      console.log("1. Enviando venta al backend...");
      // Forzamos que vaya al puerto 3000 de tu Node.js
      const resVenta = await fetch('http://localhost:3000/api/v1/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          clienteId: usuarioLogueado.email,
          clienteNombre: usuarioLogueado.nombre,
          detalleCarrito: carrito,
          total: totalCarrito 
        })
      });

      if (!resVenta.ok) {
        throw new Error("No se pudo registrar la venta en el backend.");
      }

      const totalTemporal = totalCarrito;
      setCarrito([]); 
      fetchProductos();
      
      console.log("2. Solicitando token de Transbank a http://localhost:3000/api/v1/pagos...");
      // Forzamos el puerto 3000 también para el pago
      const resPago = await fetch('http://localhost:3000/api/v1/pagos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total: totalTemporal })
      });
      
      const dataPago = await resPago.json();
      console.log("Respuesta de Transbank recibida:", dataPago);
      
      // 3. Crear el formulario oculto y saltar hacia la página de Webpay Oficial
      if (dataPago.exito && dataPago.urlWebpay && dataPago.tokenWebpay) {
        console.log("3. Redirigiendo al usuario a la pasarela comercial...");
        const form = document.createElement('form');
        form.action = dataPago.urlWebpay;
        form.method = 'POST';
        
        const inputToken = document.createElement('input');
        inputToken.type = 'hidden';
        inputToken.name = 'token_ws';
        inputToken.value = dataPago.tokenWebpay;
        
        form.appendChild(inputToken);
        document.body.appendChild(form);
        form.submit(); 
      } else {
        console.error("El backend no retornó los tokens esperados:", dataPago);
        alert(`Error de Transbank: ${dataPago.mensaje || 'No se recibieron credenciales válidas.'}`);
        setCargandoPago(false);
      }

    } catch (error) {
      console.error("Error crítico en el flujo:", error);
      alert("No se pudo conectar con el servidor en el puerto 3000. ¿Iniciaste el backend con node/nodemon?");
      setCargandoPago(false);
    }
  };

  return (
    <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 flex flex-col lg:flex-row gap-8 min-h-[85vh]">
      
      {/* SECCIÓN IZQUIERDA: CATÁLOGO DE PRODUCTOS */}
      <div className="flex-1">
        <div className="mb-8 border-b border-slate-200 pb-4">
          <h2 className="text-3xl font-bold text-slate-800">Catálogo de Insumos</h2>
          <p className="text-slate-500 mt-1">Hola, <strong>{usuarioLogueado.nombre}</strong>. Selecciona los productos médicos para añadirlos a tu carrito.</p>
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {productos.map((producto) => {
            const cantidadEnCarrito = carrito.find(item => item.id === producto.id)?.cantidad || 0;

            return (
              <div key={producto.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-transform hover:shadow-md hover:-translate-y-1">
                <div className="h-48 w-full bg-slate-50 relative border-b border-slate-100">
                  <img 
                    src={producto.imagen} 
                    alt={producto.nombre} 
                    className="w-full h-full object-contain p-2"
                  />
                  {producto.stock !== undefined && producto.stock <= 5 && (
                     <span className="absolute top-2 right-2 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-md border border-red-200">
                       Stock crítico: {producto.stock}
                     </span>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-slate-800 text-lg leading-tight mb-2">{producto.nombre}</h3>
                  <p className="text-xs text-slate-500 mb-6 line-clamp-2">{producto.descripcion}</p>
                  
                  <div className="mt-auto flex items-center justify-between w-full gap-2">
                    <span className="text-lg font-extrabold text-emerald-600 whitespace-nowrap shrink-0">
                      ${producto.precio.toLocaleString('es-CL')}
                    </span>
                    
                    {cantidadEnCarrito > 0 ? (
                      <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg p-0.5 shadow-sm shrink-0">
                        <button 
                          onClick={() => quitarUnidad(producto.id)} 
                          className="bg-white text-slate-500 hover:text-red-500 p-1 rounded-md shadow-sm transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-xs font-black w-4 text-center select-none text-slate-700">
                          {cantidadEnCarrito}
                        </span>
                        <button 
                          onClick={() => agregarAlCarrito(producto)} 
                          className="bg-white text-slate-500 hover:text-blue-600 p-1 rounded-md shadow-sm transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => agregarAlCarrito(producto)}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-2.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold shadow-sm shrink-0"
                      >
                        <Plus size={14} /> Agregar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {productos.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400">
              Cargando catálogo o no hay productos disponibles...
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN DERECHA: CARRITO DE COMPRAS */}
      <div className="w-full lg:w-[420px] shrink-0">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sticky top-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-5">
            <ShoppingCart className="text-blue-600" size={28} />
            <h3 className="text-xl font-bold text-slate-800">Tu Carrito</h3>
            <span className="ml-auto bg-blue-50 text-blue-700 text-sm font-bold px-3 py-1 rounded-full">
              {carrito.reduce((acc, item) => acc + item.cantidad, 0)} items
            </span>
          </div>

          <div className="flex flex-col gap-3 min-h-[200px] max-h-[500px] overflow-y-auto pr-2 mb-6">
            {carrito.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3 my-auto">
                <ShoppingCart size={48} className="opacity-20" />
                <p className="text-sm">Tu carrito está vacío.</p>
              </div>
            ) : (
              carrito.map((item) => (
                <div key={item.id} className="flex gap-3 items-center border border-slate-100 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 truncate">{item.nombre}</h4>
                    <span className="text-sm font-bold text-emerald-600">${item.precio.toLocaleString('es-CL')}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                    <button onClick={() => quitarUnidad(item.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                      {item.cantidad === 1 ? <Trash2 size={15} /> : <Minus size={15} />}
                    </button>
                    <span className="text-sm font-black w-5 text-center select-none text-slate-700">{item.cantidad}</span>
                    <button onClick={() => agregarAlCarrito(item)} className="text-slate-400 hover:text-blue-500 transition-colors">
                      <Plus size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="bg-slate-50 rounded-xl p-5 mb-6 border border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-500 text-sm font-medium">Subtotal</span>
              <span className="font-bold text-slate-700">${totalCarrito.toLocaleString('es-CL')}</span>
            </div>
            <div className="border-t border-slate-200 my-3"></div>
            <div className="flex justify-between items-center">
              <span className="font-black text-slate-800 text-lg">Total a pagar</span>
              <span className="font-black text-emerald-600 text-2xl">${totalCarrito.toLocaleString('es-CL')}</span>
            </div>
          </div>

          <button
            onClick={handlePagoWebpay}
            disabled={carrito.length === 0 || cargandoPago}
            className={`w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl font-bold text-white text-lg transition-all ${
              carrito.length === 0 || cargandoPago
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-[#00c49f] hover:bg-[#00a887] hover:-translate-y-1 shadow-lg shadow-[#00c49f]/30'
            }`}
          >
            {cargandoPago ? (
              <span className="animate-pulse">Redirigiendo a Webpay...</span>
            ) : (
              <>
                <CreditCard size={24} />
                Pagar con Webpay
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}