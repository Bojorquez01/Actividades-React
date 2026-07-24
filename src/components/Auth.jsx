import { useState } from 'react';
import { supabase } from '../supabaseClient';

function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage('¡Registro exitoso! Ya puedes iniciar sesión.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage('Error al iniciar sesión: ' + error.message);
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '350px', margin: '60px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', fontFamily: 'sans-serif' }}>
      <h2>{isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
      <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '8px', fontSize: '14px' }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '8px', fontSize: '14px' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Procesando...' : (isSignUp ? 'Registrarse' : 'Entrar')}
        </button>
      </form>

      {message && <p style={{ color: message.includes('exitoso') ? 'green' : 'red', fontSize: '13px' }}>{message}</p>}

      <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
        {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'} {' '}
        <span 
          onClick={() => setIsSignUp(!isSignUp)} 
          style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isSignUp ? 'Inicia sesión aquí' : 'Regístrate aquí'}
        </span>
      </p>
    </div>
  );
}

export default Auth;