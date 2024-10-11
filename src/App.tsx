import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './Login';
import VistaSalasPublica from './VistaSalasPublica';
import './App.css';

interface Sala {
  estado: string;
  rut: string;
  personas: number;
  carrera: string;
}

interface SalaInfoProps {
  sala: Sala;
  index: number;
  edificio: 'edificioA' | 'edificioB';
  liberarSala: (edificio: 'edificioA' | 'edificioB', index: number) => void;
}

const SalaInfo: React.FC<SalaInfoProps> = ({ sala, index, edificio, liberarSala }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      {expanded ? (
        <div className="sala-info-expanded">
          <p>RUT: {sala.rut}</p>
          <p>N° de personas: {sala.personas}</p>
          <p>Carrera: {sala.carrera}</p>
          <button className="btn btn-secondary" onClick={() => setExpanded(false)}>Ver menos</button>
          <button className="btn btn-secondary" onClick={() => liberarSala(edificio, index)}>Liberar</button>
        </div>
      ) : (
        <div className="sala-info-compressed">
          <span>Ocupada</span>
          <button className="btn btn-secondary" onClick={() => setExpanded(true)}>Ver más</button>
        </div>
      )}
    </div>
  );
};

const SalaManager = () => {
  const [salas, setSalas] = useState({
    edificioA: Array(6).fill({ estado: 'verde', rut: '', personas: 0, carrera: '' }),
    edificioB: Array(4).fill({ estado: 'verde', rut: '', personas: 0, carrera: '' }),
  });

  const [selectedSala, setSelectedSala] = useState<any>(null);
  const [rut, setRut] = useState('');
  const [personas, setPersonas] = useState(0);
  const [carrera, setCarrera] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [mantenimiento, setMantenimiento] = useState({
    edificioA: Array(6).fill(false),
    edificioB: Array(4).fill(false),
  });

  const [bannedUsers, setBannedUsers] = useState<{ rut: string; fecha: string; motivo: string }[]>([]);
  const [showBanForm, setShowBanForm] = useState(false);
  const [banRut, setBanRut] = useState('');
  const [banFecha, setBanFecha] = useState('');
  const [banMotivo, setBanMotivo] = useState('');

  const carreras = [
    "Arquitectura",
    "Pedagogía en Educación Diferencial",
    "Pedagogía en Educación Física",
    "Enfermería",
    "Nutrición y Dietética",
    "Terapia Ocupacional",
    "Kinesiología (NUEVA)",
    "Obstetricia y Puericultura (NUEVA)",
    "Ingeniería Comercial",
    "Ingeniería Civil Industrial",
    "Ingeniería Civil en Computación e Informática",
    "Ingeniería Civil en Minas (NUEVA)",
    "Licenciatura en Astronomía (NUEVA)",
    "Administración Pública",
    "Derecho",
    "Psicología",
    "Sociología",
    "Trabajo Social",
    "Otros"
  ];

  // Cargar datos de Local Storage al iniciar
  useEffect(() => {
    const savedSalas = localStorage.getItem('salas');
    if (savedSalas) {
      setSalas(JSON.parse(savedSalas));
    }
  }, []);

  // Guardar en Local Storage cada vez que cambien las salas
  useEffect(() => {
    localStorage.setItem('salas', JSON.stringify(salas));
  }, [salas]);

  // Función para validar el RUT
  const validarRut = (rut: string) => {
    if (!/^[0-9]+-[0-9Kk]$/.test(rut)) {
      return false;
    }
    const [rutBase, digitoVerificador] = rut.split('-');
    let suma = 0;
    let multiplicador = 2;

    for (let i = rutBase.length - 1; i >= 0; i--) {
      suma += Number(rutBase[i]) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const dvCalculado = 11 - (suma % 11);
    const dvFinal = dvCalculado === 10 ? 'K' : dvCalculado === 11 ? '0' : dvCalculado.toString();

    return digitoVerificador.toUpperCase() === dvFinal;
  };

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[0-9]*-?[0-9Kk]?$/.test(value) && value.length <= 10) {
      setRut(value);
    }
  };

  const handleSalaClick = (edificio: string, index: number) => {
    if (mantenimiento[edificio as keyof typeof mantenimiento][index]) {
      toast.error('Esta sala está en mantenimiento.');
      return;
    }
    if (selectedSala && selectedSala.edificio === edificio && selectedSala.index === index) {
      setSelectedSala(null);
    } else {
      setSelectedSala({ edificio, index });
    }
  };

  const confirmarAsignacion = () => {
    if (!validarRut(rut)) {
      toast.error('El RUT ingresado no es válido.');
      return;
    }

    if (personas > 8) {
      toast.error('El máximo permitido es 8 personas.');
      return;
    }

    if (isUserBanned(rut)) {
      toast.error('Este usuario está baneado y no puede reservar salas.');
      return;
    }

    asignarSala();
  };

  const asignarSala = () => {
    const { edificio, index } = selectedSala;

    const newSalas = { ...salas };
    newSalas[edificio as keyof typeof salas][index] = {
      estado: 'rojo',
      rut,
      personas,
      carrera,
    }; // Cambiar al color rojo (ocupado) y guardar información
    setSalas(newSalas);
    setSelectedSala(null); // Cerrar modal
    toast.success('Sala asignada exitosamente.');
    setRut(""); // Limpiar inputs
    setPersonas(0);
    setCarrera(''); // Limpiar carrera
  };

  const liberarSala = (edificio: string, index: number) => {
    const newSalas = { ...salas };
    newSalas[edificio as keyof typeof salas][index] = { estado: 'verde', rut: '', personas: 0, carrera: '' }; // Cambiar al color verde (disponible)
    setSalas(newSalas);
    toast.success('Sala liberada exitosamente.');
  };

  const toggleMantenimiento = (edificio: string, index: number) => {
    const newMantenimiento = { ...mantenimiento };
    newMantenimiento[edificio as keyof typeof mantenimiento][index] = !newMantenimiento[edificio as keyof typeof mantenimiento][index];
    setMantenimiento(newMantenimiento);

    const newSalas = { ...salas };
    newSalas[edificio as keyof typeof salas][index] = {
      ...newSalas[edificio as keyof typeof salas][index],
      estado: newMantenimiento[edificio as keyof typeof mantenimiento][index] ? 'gris' : 'verde',
    };
    setSalas(newSalas);

    toast.success(`Sala ${index + 1} en ${edificio} ${newMantenimiento[edificio as keyof typeof mantenimiento][index] ? 'deshabilitada' : 'habilitada'}`);
  };

  const handleLoginClick = () => {
    setShowLoginForm(true);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowLoginForm(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowLoginForm(false);
  };

  const handleBan = () => {
    if (!validarRut(banRut)) {
      toast.error('El RUT ingresado no es válido.');
      return;
    }
    setBannedUsers([...bannedUsers, { rut: banRut, fecha: banFecha, motivo: banMotivo }]);
    setBanRut('');
    setBanFecha('');
    setBanMotivo('');
    setShowBanForm(false);
    toast.success('Usuario baneado exitosamente.');
  };

  const isUserBanned = (rut: string) => {
    return bannedUsers.some(user => user.rut === rut);
  };

  return (
    <div className="container">
      {!isLoggedIn && !showLoginForm ? (
        <VistaSalasPublica salas={salas} onLoginClick={handleLoginClick} />
      ) : showLoginForm ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          <h1>Asignación de Salas</h1>
          <div className="edificio">
            <h2>Edificio A</h2>
            {salas.edificioA.map((sala, index) => (
              <div key={index} className="sala" data-estado={sala.estado}>
                <div onClick={() => handleSalaClick('edificioA', index)}>
                  Sala {index + 1}
                </div>
                {sala.estado === 'rojo' && (
                  <SalaInfo sala={sala} index={index} edificio="edificioA" liberarSala={liberarSala} />
                )}
                {selectedSala && selectedSala.edificio === 'edificioA' && selectedSala.index === index && (
                  <div className="menu-asignacion">
                    <h3>Asignar Sala {index + 1}</h3>
                    <div className="input-group">
                      <input
                        type="text"
                        placeholder="RUT"
                        value={rut}
                        onChange={handleRutChange}
                        maxLength={10}
                      />
                    </div>
                    <div className="input-group">
                      <select
                        value={personas}
                        onChange={(e) => setPersonas(Number(e.target.value))}
                      >
                        <option value={0}>N° de personas</option>
                        {[...Array(8)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                      </select>
                    </div>
                    <div className="input-group">
                      <select
                        value={carrera}
                        onChange={(e) => setCarrera(e.target.value)}
                      >
                        <option value="">Selecciona una carrera</option>
                        {carreras.map((carrera, index) => (
                          <option key={index} value={carrera}>{carrera}</option>
                        ))}
                      </select>
                    </div>
                    <button className="btn btn-primary" onClick={confirmarAsignacion}>Asignar</button>
                    <button className="btn btn-secondary" onClick={() => setSelectedSala(null)}>Cancelar</button>
                  </div>
                )}
                <button className="btn btn-warning" onClick={() => toggleMantenimiento('edificioA', index)}>
                  {mantenimiento.edificioA[index] ? 'Habilitar' : 'Deshabilitar'}
                </button>
              </div>
            ))}
          </div>

          <div className="edificio">
            <h2>Edificio B</h2>
            {salas.edificioB.map((sala, index) => (
              <div key={index} className="sala" data-estado={sala.estado}>
                <div onClick={() => handleSalaClick('edificioB', index)}>
                  Sala {index + 7}
                </div>
                {sala.estado === 'rojo' && (
                  <SalaInfo sala={sala} index={index} edificio="edificioB" liberarSala={liberarSala} />
                )}
                {selectedSala && selectedSala.edificio === 'edificioB' && selectedSala.index === index && (
                  <div className="menu-asignacion">
                    <h3>Asignar Sala {index + 7}</h3>
                    <div className="input-group">
                      <input
                        type="text"
                        placeholder="RUT"
                        value={rut}
                        onChange={handleRutChange}
                        maxLength={10}
                      />
                    </div>
                    <div className="input-group">
                      <select
                        value={personas}
                        onChange={(e) => setPersonas(Number(e.target.value))}
                      >
                        <option value={0}>N° de personas</option>
                        {[...Array(8)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                      </select>
                    </div>
                    <div className="input-group">
                      <select
                        value={carrera}
                        onChange={(e) => setCarrera(e.target.value)}
                      >
                        <option value="">Selecciona una carrera</option>
                        {carreras.map((carrera, index) => (
                          <option key={index} value={carrera}>{carrera}</option>
                        ))}
                      </select>
                    </div>
                    <div className="button-group">
                      <button className="btn btn-primary" onClick={confirmarAsignacion}>Asignar</button>
                      <button className="btn btn-secondary" onClick={() => setSelectedSala(null)}>Cancelar</button>
                    </div>
                  </div>
                )}
                <button className="btn btn-warning" onClick={() => toggleMantenimiento('edificioB', index)}>
                  {mantenimiento.edificioB[index] ? 'Habilitar' : 'Deshabilitar'}
                </button>
              </div>
            ))}
          </div>
          <button onClick={handleLogout} className="btn btn-secondary">Cerrar Sesión</button>
          <button onClick={() => setShowBanForm(true)} className="btn btn-danger">Banear Usuario</button>
          {showBanForm && (
            <div className="ban-form">
              <h3>Banear Usuario</h3>
              <label htmlFor="banRut">RUT</label>
              <input
                type="text"
                id="banRut"
                placeholder="RUT"
                value={banRut}
                onChange={(e) => setBanRut(e.target.value)}
                maxLength={10}
              />
              <label htmlFor="banFecha">Fecha</label>
              <input
                type="date"
                id="banFecha"
                value={banFecha}
                onChange={(e) => setBanFecha(e.target.value)}
              />
              <label htmlFor="banMotivo">Motivo del ban</label>
              <textarea
                id="banMotivo"
                placeholder="Motivo del ban"
                value={banMotivo}
                onChange={(e) => setBanMotivo(e.target.value)}
                className="ban-form"
              />
              <button onClick={handleBan} className="btn btn-primary">Confirmar Ban</button>
              <button onClick={() => setShowBanForm(false)} className="btn btn-secondary">Cancelar</button>
            </div>
          )}
          <ToastContainer />
        </>
      )}
    </div>
  );
};

export default SalaManager;