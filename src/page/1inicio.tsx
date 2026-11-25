import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { Navigate } from 'react-router-dom';

const Inicio = () => {
  const { usuario, usuarioAuth } = useAuth();

  if (!usuarioAuth) return <Navigate to="/iniciar-sesion" />;

  return (
    <div style={{ maxWidth: '600px', margin: '3rem auto', padding: '2rem' }}>
      <h1>¡Bienvenido, {usuario?.nombre || 'Usuario'}! 👋</h1>
      <p>Correo: {usuarioAuth.email}</p>
      <p>Teléfono: {usuario?.telefono || 'No registrado'}</p>
      <button
        onClick={() => signOut(auth)}
        style={{ padding: '0.5rem 1.5rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem' }}
      >
        Cerrar Sesión
      </button>
    </div>
  );
};

export default Inicio;


