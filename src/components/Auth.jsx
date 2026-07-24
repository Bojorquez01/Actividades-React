import { useState } from 'react';
import { supabase } from '../supabaseClient';

function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar contraseña
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [message, setMessage] = useState('');

  // Función para cambiar de modo limpiando los campos
  const switchMode = (newSignUpState, newResetState) => {
    setIsSignUp(newSignUpState);
    setIsResetPassword(newResetState);
    setEmail('');
    setPassword('');
    setMessage('');
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (isResetPassword) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) {
        setMessage('Error: ' + error.message);
      } else {
        setMessage('¡Correo enviado! Revisa tu bandeja para cambiar tu contraseña.');
      }
    } else if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage('¡Registro exitoso! Ya puedes iniciar sesión.');
        // Limpiamos la contraseña al registrarse con éxito por seguridad
        setPassword('');
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
      <h2>
        {isResetPassword ? 'Recuperar Contraseña' : (isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión')}
      </h2>

      <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '8px', fontSize: '14px' }}
        />

        {!isResetPassword && (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ padding: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box', paddingRight: '60px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '8px',
                background: 'transparent',
                border: 'none',
                color: '#007bff',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              {showPassword ? 'Ocultar' : 'Ver'}
            </button>
          </div>
        )}

        <button type="submit" disabled={loading} style={{ padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Procesando...' : (isResetPassword ? 'Enviar instrucciones' : (isSignUp ? 'Registrarse' : 'Entrar'))}
        </button>
      </form>

      {message && <p style={{ color: message.includes('exitoso') || message.includes('enviado') ? 'green' : 'red', fontSize: '13px' }}>{message}</p>}

      <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {!isResetPassword ? (
          <>
            <span 
              onClick={() => switchMode(!isSignUp, false)} 
              style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </span>
            <span 
              onClick={() => switchMode(false, true)} 
              style={{ color: '#6c757d', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}
            >
              ¿Olvidaste tu contraseña?
            </span>
          </>
        ) : (
          <span 
            onClick={() => switchMode(false, false)} 
            style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Volver al inicio de sesión
          </span>
        )}
      </div>
    </div>
  );
}

export default Auth;