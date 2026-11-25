
import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { database } from "./firebase/config";

function FirebaseTest() {
  const [mensaje, setMensaje] = useState("Probando conexión...");
  const [error, setError] = useState(false);

  useEffect(() => {
    get(ref(database, "/"))
      .then((snapshot) => {
        setMensaje(
          snapshot.exists()
            ? "¡Conexión correcta! Hay datos en Firebase."
            : "¡Conexión correcta! La base de datos está vacía."
        );
      })
      .catch((err: Error) => {
        setError(true);
        setMensaje("Error: " + err.message);
      });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Prueba de Firebase</h2>
      <p style={{ color: error ? "red" : "green" }}>
        {mensaje}
      </p>
    </div>
  );
}

export default FirebaseTest;
