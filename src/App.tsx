
import { useEffect, useState, type FormEvent } from "react";
import {
  onValue,
  push,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
import { database } from "./firebase/config";
import "./App.css";

type Producto = {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
};

type EstadoPedido = "Pendiente" | "En preparación" | "Listo";

type Pedido = {
  id: string;
  cliente: string;
  producto: string;
  cantidad: number;
  total: number;
  fecha: string;
  estado?: EstadoPedido;
};

function App() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState("Pollos");

  const [cliente, setCliente] = useState("");
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState("1");

  const [mensaje, setMensaje] = useState("Conectando con Firebase...");
  const [guardando, setGuardando] = useState(false);

  // Escuchar productos y pedidos en tiempo real.
  useEffect(() => {
    const cancelarProductos = onValue(
      ref(database, "productos"),
      (snapshot) => {
        const datos: Producto[] = [];

        snapshot.forEach((item) => {
          datos.push({
            id: item.key!,
            ...item.val(),
          } as Producto);
        });

        setProductos(datos);
        setMensaje("Conectado a Firebase");
      },
      (error) => {
        setMensaje("Error al leer productos: " + error.message);
      }
    );

    const cancelarPedidos = onValue(
      ref(database, "pedidos"),
      (snapshot) => {
        const datos: Pedido[] = [];

        snapshot.forEach((item) => {
          datos.push({
            id: item.key!,
            ...item.val(),
          } as Pedido);
        });

        datos.reverse();
        setPedidos(datos);
      },
      (error) => {
        setMensaje("Error al leer pedidos: " + error.message);
      }
    );

    return () => {
      cancelarProductos();
      cancelarPedidos();
    };
  }, []);

  // Formato de precios en soles peruanos.
  const dinero = (valor: number) =>
    Number(valor || 0).toLocaleString("es-PE", {
      style: "currency",
      currency: "PEN",
    });

  // Registrar un producto.
  async function agregarProducto(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const precioNumero = Number(precio);

    if (
      !nombre.trim() ||
      !precio ||
      !Number.isFinite(precioNumero) ||
      precioNumero <= 0
    ) {
      setMensaje("Escribe un nombre y un precio válido mayor que cero.");
      return;
    }

    setGuardando(true);

    try {
      const nuevo = push(ref(database, "productos"));

      await set(nuevo, {
        nombre: nombre.trim(),
        precio: precioNumero,
        categoria,
      });

      setNombre("");
      setPrecio("");
      setCategoria("Pollos");
      setMensaje("Producto guardado correctamente.");
    } catch (error) {
      setMensaje(
        "No se pudo guardar el producto. Revisa la conexión y los permisos de Firebase."
      );
    } finally {
      setGuardando(false);
    }
  }

  // Eliminar un producto.
  async function eliminarProducto(id: string) {
    if (!window.confirm("¿Deseas eliminar este producto?")) return;

    try {
      await remove(ref(database, `productos/${id}`));
      setMensaje("Producto eliminado correctamente.");
    } catch {
      setMensaje("No se pudo eliminar el producto. Revisa los permisos.");
    }
  }

  // Registrar un pedido.
  async function registrarPedido(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const producto = productos.find((p) => p.id === productoId);
    const cantidadNumero = Number(cantidad);

    if (
      !cliente.trim() ||
      !producto ||
      !Number.isInteger(cantidadNumero) ||
      cantidadNumero < 1
    ) {
      setMensaje("Completa el cliente, el producto y una cantidad válida.");
      return;
    }

    setGuardando(true);

    try {
      const nuevo = push(ref(database, "pedidos"));

      await set(nuevo, {
        cliente: cliente.trim(),
        producto: producto.nombre,
        cantidad: cantidadNumero,
        total: producto.precio * cantidadNumero,
        fecha: new Date().toLocaleString("es-PE"),
        estado: "Pendiente",
      });

      setCliente("");
      setProductoId("");
      setCantidad("1");
      setMensaje("Pedido registrado y enviado a cocina.");
    } catch {
      setMensaje(
        "No se pudo registrar el pedido. Revisa los permisos de Firebase."
      );
    } finally {
      setGuardando(false);
    }
  }

  // Cambiar el estado de un pedido desde cocina.
  async function cambiarEstado(id: string, estado: EstadoPedido) {
    try {
      await update(ref(database, `pedidos/${id}`), { estado });
      setMensaje(`Pedido actualizado: ${estado}.`);
    } catch {
      setMensaje("No se pudo cambiar el estado del pedido.");
    }
  }

  // Eliminar un pedido.
  async function eliminarPedido(id: string) {
    if (!window.confirm("¿Deseas eliminar este pedido?")) return;

    try {
      await remove(ref(database, `pedidos/${id}`));
      setMensaje("Pedido eliminado correctamente.");
    } catch {
      setMensaje("No se pudo eliminar el pedido.");
    }
  }

  const pedidosPendientes = pedidos.filter(
    (p) => (p.estado || "Pendiente") === "Pendiente"
  );

  const pedidosPreparacion = pedidos.filter(
    (p) => p.estado === "En preparación"
  );

  const pedidosListos = pedidos.filter((p) => p.estado === "Listo");

  const totalPedidos = pedidos.reduce(
    (suma, pedido) => suma + Number(pedido.total || 0),
    0
  );

  // Tarjeta reutilizable para el panel de cocina.
  function tarjetaCocina(pedido: Pedido) {
    const estado = pedido.estado || "Pendiente";

    return (
      <article className="pedido-card" key={pedido.id}>
        <div className="pedido-card-cabecera">
          <strong>Pedido #{pedido.id.slice(-5)}</strong>
          <span
            className={`estado-pedido ${
              estado === "Listo"
                ? "estado-listo"
                : estado === "En preparación"
                  ? "estado-preparacion"
                  : "estado-pendiente"
            }`}
          >
            {estado}
          </span>
        </div>

        <p className="pedido-cliente">👤 {pedido.cliente}</p>

        <div className="pedido-detalle">
          <span>{pedido.producto}</span>
          <strong>× {pedido.cantidad}</strong>
        </div>

        <div className="pedido-total">
          Total: {dinero(pedido.total)}
        </div>

        <p className="pedido-fecha">{pedido.fecha}</p>

        {estado === "Pendiente" && (
          <button
            type="button"
            className="boton-cocina boton-preparar"
            onClick={() =>
              cambiarEstado(pedido.id, "En preparación")
            }
          >
            👨‍🍳 Comenzar preparación
          </button>
        )}

        {estado === "En preparación" && (
          <button
            type="button"
            className="boton-cocina boton-listo"
            onClick={() => cambiarEstado(pedido.id, "Listo")}
          >
            ✅ Marcar como listo
          </button>
        )}

        {estado === "Listo" && (
          <p className="mensaje-listo">¡Pedido terminado!</p>
        )}

        <button
          type="button"
          className="boton-eliminar"
          onClick={() => eliminarPedido(pedido.id)}
        >
          Eliminar pedido
        </button>
      </article>
    );
  }

  return (
    <main className="app">
      <header className="encabezado">
        <div className="marca">🍗</div>
        <div>
          <h1>Pollería El Buen Sabor</h1>
          <p>Administración y control de cocina</p>
        </div>
      </header>

      <div className="estado">
        <span className="punto" />
        {mensaje}
      </div>

      <section className="resumen">
        <article className="tarjeta-resumen">
          <span>🍗</span>
          <p>Productos registrados</p>
          <strong>{productos.length}</strong>
        </article>

        <article className="tarjeta-resumen">
          <span>🧾</span>
          <p>Total de pedidos</p>
          <strong>{pedidos.length}</strong>
        </article>

        <article className="tarjeta-resumen">
          <span>💰</span>
          <p>Importe de pedidos registrados</p>
          <strong>{dinero(totalPedidos)}</strong>
        </article>
      </section>

      <section className="paneles">
        <article className="panel">
          <h2>➕ Registrar producto</h2>

          <form onSubmit={agregarProducto}>
            <label htmlFor="nombre">Nombre del producto</label>
            <input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. 1/8 de pollo"
              required
            />

            <label htmlFor="precio">Precio (S/)</label>
            <input
              id="precio"
              type="number"
              min="0.01"
              step="0.01"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              placeholder="Ej. 12.00"
              required
            />

            <label htmlFor="categoria">Categoría</label>
            <select
              id="categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="Pollos">Pollos</option>
              <option value="Bebidas">Bebidas</option>
              <option value="Complementos">Complementos</option>
            </select>

            <button type="submit" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar producto"}
            </button>
          </form>
        </article>

        <article className="panel">
          <h2>🧾 Registrar pedido</h2>

          <form onSubmit={registrarPedido}>
            <label htmlFor="cliente">Nombre del cliente</label>
            <input
              id="cliente"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              placeholder="Nombre del cliente"
              required
            />

            <label htmlFor="producto">Producto</label>
            <select
              id="producto"
              value={productoId}
              onChange={(e) => setProductoId(e.target.value)}
              required
            >
              <option value="">Selecciona un producto</option>

              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} — {dinero(p.precio)}
                </option>
              ))}
            </select>

            <label htmlFor="cantidad">Cantidad</label>
            <input
              id="cantidad"
              type="number"
              min="1"
              step="1"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={guardando || productos.length === 0}
            >
              {guardando ? "Guardando..." : "Registrar pedido"}
            </button>

            {productos.length === 0 && (
              <p className="ayuda">
                Primero registra un producto.
              </p>
            )}
          </form>
        </article>
      </section>

      <section className="panel listado">
        <h2>🍗 Productos de la pollería</h2>

        {productos.length === 0 ? (
          <p className="vacio">Todavía no hay productos registrados.</p>
        ) : (
          <div className="tabla-contenedor">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {productos.map((p) => (
                  <tr key={p.id}>
                    <td>{p.nombre}</td>
                    <td>{p.categoria}</td>
                    <td>{dinero(p.precio)}</td>
                    <td>
                      <button
                        type="button"
                        className="boton-eliminar"
                        onClick={() => eliminarProducto(p.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel listado">
        <h2>📋 Todos los pedidos</h2>

        {pedidos.length === 0 ? (
          <p className="vacio">Todavía no hay pedidos registrados.</p>
        ) : (
          <div className="tabla-contenedor">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>

              <tbody>
                {pedidos.map((p) => (
                  <tr key={p.id}>
                    <td>{p.cliente}</td>
                    <td>{p.producto}</td>
                    <td>{p.cantidad}</td>
                    <td>{dinero(p.total)}</td>
                    <td>{p.estado || "Pendiente"}</td>
                    <td>{p.fecha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="cocina">
        <div className="cocina-titulo">
          <div>
            <span className="etiqueta-cocina">PANEL DE COCINA</span>
            <h2>🍳 Pedidos en cocina</h2>
            <p>Controla la preparación de cada pedido en tiempo real.</p>
          </div>

          <div className="contador-cocina">
            {pedidosPendientes.length + pedidosPreparacion.length}
            <span> por atender</span>
          </div>
        </div>

        <div className="columnas-cocina">
          <div className="columna-cocina">
            <h3>
              🟠 Pendiente
              <span className="cantidad-pedidos">
                {pedidosPendientes.length}
              </span>
            </h3>

            {pedidosPendientes.length === 0 && (
              <p className="cocina-vacia">No hay pedidos pendientes.</p>
            )}

            {pedidosPendientes.map(tarjetaCocina)}
          </div>

          <div className="columna-cocina">
            <h3>
              👨‍🍳 En preparación
              <span className="cantidad-pedidos">
                {pedidosPreparacion.length}
              </span>
            </h3>

            {pedidosPreparacion.length === 0 && (
              <p className="cocina-vacia">
                No hay pedidos en preparación.
              </p>
            )}

            {pedidosPreparacion.map(tarjetaCocina)}
          </div>

          <div className="columna-cocina">
            <h3>
              ✅ Listo
              <span className="cantidad-pedidos">
                {pedidosListos.length}
              </span>
            </h3>

            {pedidosListos.length === 0 && (
              <p className="cocina-vacia">No hay pedidos listos.</p>
            )}

            {pedidosListos.map(tarjetaCocina)}
          </div>
        </div>
      </section>

      <footer>
        Pollería El Buen Sabor · Sistema de administración y cocina
      </footer>
    </main>
  );
}

export default App;





