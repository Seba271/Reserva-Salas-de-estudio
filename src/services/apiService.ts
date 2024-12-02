export const crearUsuario = async (rut: string, nombre_carrera: string, tipo_usuario: string) => {
  try {
    const response = await fetch('http://localhost:3000/api/usuarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rut, nombre_carrera, tipo_usuario }),
    });

    if (!response.ok) {
      throw new Error('Error al crear el usuario');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en la solicitud:', error);
    throw error;
  }
};

export const obtenerCarreras = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/carreras');
    if (!response.ok) {
      throw new Error('Error al obtener las carreras');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en la solicitud:', error);
    throw error;
  }
};

export const loginUsuario = async (username: string, password: string) => {
  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Credenciales inválidas');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en la solicitud de login:', error);
    throw error;
  }
};

export const crearReserva = async (id_sala: number, fecha_reserva: string, hora_inicio: string, rut_usuario: string, numero_personas: number) => {
  try {
    const response = await fetch('http://localhost:3000/api/reservas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id_sala, fecha_reserva, hora_inicio, rut_usuario, numero_personas }),
    });

    if (!response.ok) {
      throw new Error('Error al crear la reserva');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en la solicitud de reserva:', error);
    throw error;
  }
};

export const actualizarEstadoReserva = async (id_reserva: number, estado_reserva: string) => {
  try {
    const response = await fetch(`http://localhost:3000/api/reservas/${id_reserva}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ estado_reserva }),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar la reserva');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en la solicitud de actualización de reserva:', error);
    throw error;
  }
};

export const actualizarEstadoSala = async (id_sala: number, estado: string) => {
  try {
    const response = await fetch(`http://localhost:3000/api/salas/${id_sala}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ estado }),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar el estado de la sala');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en la solicitud de actualización de sala:', error);
    throw error;
  }
};

export const obtenerSalas = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/salas');
    return await response.json();
  } catch (error) {
    console.error('Error en la solicitud de salas:', error);
    throw error;
  }
};


export const obtenerSalasConReservas = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/salas-con-reservas');
    if (!response.ok) {
      throw new Error('Error al obtener las salas con reservas');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en la solicitud de salas con reservas:', error);
    throw error;
  }
};

export const obtenerUsuarioPorRut = async (rut: string) => {
  try {
    const response = await fetch(`http://localhost:3000/api/usuarios/${rut}`);
    if (!response.ok) {
      throw new Error('Usuario no encontrado');
    }
    return await response.json();
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    throw error;
  }
};

export const obtenerSalasDeshabilitadas = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/salas/deshabilitadas');
    if (!response.ok) {
      throw new Error('Error al obtener las salas deshabilitadas');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en la solicitud de salas deshabilitadas:', error);
    throw error;
  }
};

// Puedes agregar más funciones para otras solicitudes aquí 