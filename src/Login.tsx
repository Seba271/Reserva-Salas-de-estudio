import { useState } from 'react';
import './Login.css';
import { loginUsuario } from './services/apiService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import Modal from './Modal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const [flashHelp, setFlashHelp] = useState(false);

  const handleLogin = async () => {
    try {
      await loginUsuario(username, password);
      toast.success('Login exitoso');
      onLogin();
    } catch (error: any) {
      toast.error('Error al intentar iniciar sesión');
      setFlashHelp(true);
      setTimeout(() => setFlashHelp(false), 1000); // Remueve la clase después de 1 segundo
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
      <div className={`help-icon ${flashHelp ? 'flash' : ''}`} style={{ position: 'fixed', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="help-icon-container">
          <FontAwesomeIcon 
            icon={faInfoCircle} 
            onClick={() => setShowInfo(true)} 
            style={{ cursor: 'pointer', fontSize: '24px', color: '#007bff' }}
          />
          <p className="help-text">Ayuda</p>
        </div>
      </div >
      <Modal 
        show={showInfo} 
        onClose={() => setShowInfo(false)} 
        className="modal-content-login"
      >
        <h2>Información de Inicio de Sesión</h2>
        <p className="class-modal-info">Para iniciar sesión, ingrese con sus credenciales de acceso. El <strong>usuario</strong> es su <strong>rut sin puntos ni guiones</strong> y la <strong>contraseña</strong> es el <strong>numero de documento sin puntos</strong>.</p>
      </Modal>
      <ToastContainer />
    </div>
  );
};

export default Login;