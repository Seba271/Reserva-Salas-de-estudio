import { useState } from 'react';
import './Login.css';
import { loginUsuario } from './services/apiService'; // Asegúrate de que la ruta sea correcta

const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await loginUsuario(username, password);
      alert('Login exitoso');
      onLogin();
    } catch (error: any) { // Asegúrate de que el tipo de error sea manejado correctamente
      alert(error.message || 'Error al intentar iniciar sesión');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Iniciar Sesión</h2>
      <div className="login-form">
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyDown}
          className="login-input"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          className="login-input"
        />
        <button onClick={handleLogin} className="login-button">Entrar</button>
      </div>
    </div>
  );
};

export default Login;