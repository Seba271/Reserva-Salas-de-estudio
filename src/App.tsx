import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './Login';
import VistaSalasPublica from './VistaSalasPublica';
import './App.css';
import { crearUsuario, obtenerCarreras, crearReserva, actualizarEstadoReserva, actualizarEstadoSala, obtenerSalasConReservas, obtenerUsuarioPorRut } from './services/apiService';

interface Sala {
  estado: string;
  rut: string;
  personas: number;
  carrera: string;
  id_reserva?: number;
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
          <p>Carrera: {sala.carrera}</p> {/* Asegúrate de que `sala.carrera` contenga el nombre de la carrera */}
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
    edificioA: Array(6).fill({ estado: 'verde', rut: '', personas: 0, carrera: '' }), // 6 salas para Edificio A
    edificioB: Array(4).fill({ estado: 'verde', rut: '', personas: 0, carrera: '' }), // 4 salas para Edificio B
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
  const [tipoUsuario, setTipoUsuario] = useState('');
  const [timers, setTimers] = useState<{ [key: number]: number }>({});
  const [carreras, setCarreras] = useState<{ id_carrera: number; nombre_carrera: string }[]>([]);
  const [horaInicio, setHoraInicio] = useState('');

  useEffect(() => {
    const fetchCarreras = async () => {
      try {
        const data = await obtenerCarreras();
        setCarreras(data);
      } catch (error) {
        console.error('Error al obtener las carreras:', error);
        toast.error('No se pudieron cargar las carreras.');
      }
    };

    fetchCarreras();
  }, []);

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

 //// Función para validar el RUT
 /*
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
  */
  

  const handleRutChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[0-9]*-?[0-9Kk]?$/.test(value) && value.length <= 10) {
      setRut(value);

      if (value.length > 0) {
        try {
          const usuario = await obtenerUsuarioPorRut(value);
          if (usuario.carrera_id !== null && usuario.carrera_id !== undefined) {
            toast.info(`ID de Carrera: ${usuario.carrera_id}`);
          } else {
            toast.error('ID de Carrera no disponible');
          }
        } catch (error) {
          toast.error('Usuario no existe');
        }
      }
    }
  };

  const handleSalaClick = (edificio: string, index: number) => {
    const sala = salas[edificio as keyof typeof salas][index];
    
    if (sala.estado === 'rojo') {
      toast.error('Esta sala está ocupada.');
      return;
    }

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

  const confirmarAsignacion = async () => {
    /*
    if (!validarRut(rut)) {
      toast.error('El RUT ingresado no es válido.');
      return;
    }
    */

    if (personas > 8) {
      toast.error('El máximo permitido es 8 personas.');
      return;
    }

    if (isUserBanned(rut)) {
      toast.error('Este usuario está baneado y no puede reservar salas.');
      return;
    }

    if (!horaInicio) {
      toast.error('Por favor, selecciona un rango de horas.');
      return;
    }

    try {
      // Intentar crear el usuario
      await crearUsuario(rut, Number(carrera), tipoUsuario);

      // Si el usuario se crea con éxito, proceder a crear la reserva
      const fechaReserva = new Date().toISOString().split('T')[0]; // Fecha actual
      const idSala = selectedSala.index + 1; // Asumiendo que el índice de la sala es su ID

      const reservaResponse = await crearReserva(idSala, fechaReserva, horaInicio, rut, personas);
      const { reservaId } = reservaResponse; // Obtener el ID de la reserva

      asignarSala(reservaId); // Pasar el ID de la reserva a la función asignarSala
      console.log('Usuario y reserva creados exitosamente.');
    } catch (error) {
      console.error('Error al crear el usuario o la reserva:', error);
      toast.error('Error al crear el usuario o la reserva.');
    }
  };

  const asignarSala = async (reservaId: number) => {
    const { edificio, index } = selectedSala;
    const idSala = index + 1; // Asumiendo que el índice de la sala es su ID

    try {
      // Actualizar el estado de la sala a "ocupada"
      await actualizarEstadoSala(idSala, 'ocupada');

      const newSalas = { ...salas };
      newSalas[edificio as keyof typeof salas][index] = {
        estado: 'rojo',
        rut,
        personas,
        carrera,
        tipoUsuario,
        id_reserva: reservaId, // Almacenar el ID de la reserva
      };
      setSalas(newSalas);

      if (edificio === 'edificioA') {
        setTimers((prevTimers) => ({
          ...prevTimers,
          [index]: 7200, // Inicializar con 7200 segundos para 2 horas
        }));
      }

      setSelectedSala(null);
      toast.success('Sala asignada exitosamente.');
      setRut('');
      setPersonas(0);
      setCarrera('');
      setTipoUsuario('');
    } catch (error) {
      toast.error('Error al asignar la sala.');
    }
  };

  const liberarSala = async (edificio: string, index: number) => {
    const newSalas = { ...salas };
    const sala = newSalas[edificio as keyof typeof salas][index];
    const idSala = index + 1; // Asumiendo que el índice de la sala es su ID

    try {
      if (sala.id_reserva) {
        await actualizarEstadoReserva(sala.id_reserva, 'expirada');
      }

      await actualizarEstadoSala(idSala, 'disponible');

      newSalas[edificio as keyof typeof salas][index] = { estado: 'verde', rut: '', personas: 0, carrera: '' };
      setSalas(newSalas);

      setTimers((prevTimers) => {
        const newTimers = { ...prevTimers };
        delete newTimers[index];
        return newTimers;
      });

      toast.success('Sala liberada exitosamente.');
    } catch (error) {
      console.error('Error al liberar la sala:', error);
      toast.error('Error al liberar la sala.');
    }
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
    /*
    if (!validarRut(banRut)) {
      toast.error('El RUT ingresado no es válido.');
      return;
    }
    */
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

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prevTimers) => {
        const newTimers = { ...prevTimers };
        Object.keys(newTimers).forEach((key) => {
          const numericKey = Number(key);
          if (newTimers[numericKey] > 0) {
            newTimers[numericKey] -= 1;
          } else if (newTimers[numericKey] === 0) {
            const sala = salas.edificioA[numericKey] || salas.edificioB[numericKey];
            if (sala && sala.id_reserva) {
              actualizarEstadoReserva(sala.id_reserva, 'expirada')
                .then(() => {
                  toast.success(`Reserva de la sala ${numericKey + 1} expirada.`);
                })
                .catch(() => {
                  toast.error('Error al expirar la reserva automáticamente.');
                });
            }
            newTimers[numericKey] = -1;
          }
        });
        localStorage.setItem('timers', JSON.stringify(newTimers));
        return newTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [salas]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  useEffect(() => {
    const fetchSalasConReservas = async () => {
      try {
        const salasConReservas = await obtenerSalasConReservas();
        const newSalas = { ...salas };

        salasConReservas.forEach((sala: { id_sala: number; estado: string; rut_usuario: string; numero_personas: number; carrera_id: number, nombre_carrera: string, id_reserva: number, fecha_creacion: string }) => {
          const edificio = sala.id_sala <= 6 ? 'edificioA' : 'edificioB';
          const index = sala.id_sala - 1;

          const fechaCreacion = new Date(sala.fecha_creacion);
          const ahora = new Date();
          const tiempoTranscurrido = Math.floor((ahora.getTime() - fechaCreacion.getTime()) / 1000);
          const tiempoRestante = Math.max(7200 - tiempoTranscurrido, 0);

          newSalas[edificio as keyof typeof salas][index] = {
            estado: sala.estado === 'ocupada' ? 'rojo' : 'verde',
            rut: sala.rut_usuario || '',
            personas: sala.numero_personas || 0,
            carrera: sala.nombre_carrera || '',
            id_reserva: sala.id_reserva,
          };

          if (tiempoRestante > 0) {
            setTimers((prevTimers) => ({
              ...prevTimers,
              [index]: tiempoRestante,
            }));
          }
        });

        setSalas(newSalas);
      } catch (error) {
        console.error('Error al obtener las salas con reservas:', error);
        toast.error('No se pudo obtener el estado de las salas.');
      }
    };

    fetchSalasConReservas();
  }, []);

  // Función para obtener las opciones de hora válidas
  const getValidTimeOptions = () => {
    const currentHour = new Date().getHours();
    const timeOptions = [
      { value: "08:30:00", label: "08:30 - 10:30" },
      { value: "10:30:00", label: "10:30 - 12:30" },
      { value: "12:30:00", label: "12:30 - 14:30" },
      { value: "14:30:00", label: "14:30 - 16:30" },
      { value: "16:30:00", label: "16:30 - 18:30" },
      { value: "18:30:00", label: "18:30 - 20:30" },
      { value: "20:30:00", label: "20:30 - 22:30" },
    ];

    // Encontrar el índice del primer tramo válido
    const validIndex = timeOptions.findIndex(option => {
      const optionHour = parseInt(option.value.split(':')[0], 10);
      return optionHour > currentHour;
    });

    // Incluir el tramo anterior si existe
    const startIndex = validIndex > 0 ? validIndex - 1 : validIndex;

    // Retornar las opciones válidas incluyendo el tramo anterior
    return timeOptions.slice(startIndex);
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
            {salas.edificioA.map((sala, index) => {
              const tiempoRestante = timers[index];
              let estadoSala = sala.estado; // Usar el estado actual de la sala

              if (tiempoRestante !== undefined) {
                if (tiempoRestante >= 6) {
                  estadoSala = 'rojo'; // Entre 9 y 6 segundos restantes
                } else if (tiempoRestante >= 1) {
                  estadoSala = 'naranja'; // Entre 5 y 1 segundos restantes
                } else if (tiempoRestante === 0 && sala.estado !== 'amarillo') {
                  estadoSala = 'amarillo'; // Tiempo excedido
                }
              }

              return (
                <div key={index} className="sala" data-estado={estadoSala}>
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
                          placeholder=" Ingrese RUT"
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
                          {carreras.map((carrera) => (
                            <option key={carrera.id_carrera} value={carrera.id_carrera}>
                              {carrera.nombre_carrera}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="input-group">
                        <select
                          value={tipoUsuario}
                          onChange={(e) => setTipoUsuario(e.target.value)}
                        >
                          <option value="">Selecciona tipo de usuario</option>
                          <option value="estudiante">Estudiante</option>
                          <option value="profesor">Profesor</option>
                        </select>
                      </div>
                      <div className="input-group">
                        <select
                          value={horaInicio}
                          onChange={(e) => setHoraInicio(e.target.value)}
                        >
                          <option value="">Selecciona un rango de horas</option>
                          {getValidTimeOptions().map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="button-group">
                        <button className="btn btn-primary" onClick={confirmarAsignacion}>Asignar</button>
                        <button className="btn btn-secondary" onClick={() => setSelectedSala(null)}>Cancelar</button>
                      </div>
                    </div>
                  )}
                  {tiempoRestante !== undefined && (
                    <div className="timer">
                      {tiempoRestante > 0 ? `Tiempo restante: ${formatTime(tiempoRestante)}` : `Tiempo excedido`}
                    </div>
                  )}
                  {estadoSala !== 'rojo' && (
                    <button className="btn btn-warning" onClick={() => toggleMantenimiento('edificioA', index)}>
                      {mantenimiento.edificioA[index] ? 'Habilitar' : 'Deshabilitar'}
                    </button>
                  )}
                </div>
              );
            })}
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
                        {carreras.map((carrera) => (
                          <option key={carrera.id_carrera} value={carrera.id_carrera}>
                            {carrera.nombre_carrera}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="input-group">
                      <select
                        value={tipoUsuario}
                        onChange={(e) => setTipoUsuario(e.target.value)}
                      >
                        <option value="">Selecciona tipo de usuario</option>
                        <option value="estudiante">Estudiante</option>
                        <option value="profesor">Profesor</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <select
                        value={horaInicio}
                        onChange={(e) => setHoraInicio(e.target.value)}
                      >
                        <option value="">Selecciona un rango de horas</option>
                          <option value="08:30:00">08:30 - 10:30</option>
                          <option value="10:30:00">10:30 - 12:30</option>
                          <option value="12:30:00">12:30 - 14:30</option>
                          <option value="14:30:00">14:30 - 16:30</option>
                          <option value="16:30:00">16:30 - 18:30</option>
                          <option value="18:30:00">18:30 - 20:30</option>
                          <option value="20:30:00">20:30 - 22:30</option>
                      </select>
                    </div>
                    <div className="button-group">
                      <button className="btn btn-primary" onClick={confirmarAsignacion}>Asignar</button>
                      <button className="btn btn-secondary" onClick={() => setSelectedSala(null)}>Cancelar</button>
                    </div>
                  </div>
                )}
                {sala.estado !== 'rojo' && (
                  <button className="btn btn-warning" onClick={() => toggleMantenimiento('edificioB', index)}>
                    {mantenimiento.edificioB[index] ? 'Habilitar' : 'Deshabilitar'}
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={handleLogout} className="btn btn-secondary">Cerrar Sesión</button>
          <button onClick={() => setShowBanForm(true)} className="btn btn-danger">Bloquear Usuario</button>
          {showBanForm && (
            <div className="ban-form">
              <h3>Bloquear Usuario</h3>
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
                placeholder="Motivo del Bloqueo"
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
