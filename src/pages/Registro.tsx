import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Registro = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState('');
  const { usuarioAuth } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const respuesta = await createUserWithEmailAndPassword(auth, email, password);
      const usuario = respuesta.user;

      await set(ref(db, `usuarios/${usuario.uid}`), {
        nombre,
        email,
        telefono
      });

    } catch (err: any) {
      setError('No se pudo crear la cuenta. Intenta de nuevo.');
    }
  };

  if (usuarioAuth) return <Navigate to="/" />;

  return (
    <div style={{ maxWidth: '400px', margin: '5rem auto', padding: '2rem' }}>
      <h2>Crear Cuenta</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Nombre completo:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.3rem' }}
            required
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Correo electrónico:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.3rem' }}
            required
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Teléfono:</label>
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.3rem' }}
            required
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.3rem' }}
            required
          />
        </div>
        <button
          type="submit"
          style={{ width: '100%', padding: '0.7rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem' }}
        >
          Registrarse
        </button>
      </form>
      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        ¿Ya tienes cuenta? <a href="/iniciar-sesion">Inicia sesión aquí</a>
      </p>
    </div>
  );
};

export default Registro;
