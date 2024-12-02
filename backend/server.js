// Importar dependencias
import express from 'express'; // Express permite crear un servidor para usar mi base de datos
import mysql from 'mysql2'; // mysql2 se encarga de la compatibilidad de mi backend con los datos de SQL
import dotenv from 'dotenv'; // dotenv permite cargar variables de entorno e información esencial, es la llave a la base de datos
import cors from 'cors'; // cors permite que el frontend y backend se puedan comunicar, a pesar de que ocupen diferentes dominios

// Configurar dotenv para usar variables de entorno
dotenv.config();

// Crear la aplicación de Express
const app = express();

// Configurar CORS para permitir solicitudes desde http://localhost:5173
app.use(cors({
  origin: 'http://localhost:5173'
}));

// Middleware para parsear JSON
app.use(express.json()); // **parsear json, es transformar lo entendible de la página para humanos a algo entendible a los sistemas

// Crear conexión a la base de datos MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL');
});

// Definir una ruta para probar la conexión a la base de datos - BORRAR
app.get('/api/prueba', (req, res) => {
  const query = "INSERT INTO `usuarios`( `rut`, `tipo_usuario`, `carrera_id`) VALUES ('20914762-0','Estudiante','4')";
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error al insertar en la base de datos' });
    }
    res.json(results);
  });
});



// Definir una ruta para login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM administradores WHERE correo_admin = ? AND clave_admin = ?';
  
  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('Error al verificar las credenciales:', err);
      return res.status(500).json({ error: 'Error al verificar las credenciales' });
    }
    if (results.length > 0) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
  });
});

// Definir una ruta para obtener las carreras
app.get('/api/carreras', (req, res) => {
  const query = 'SELECT * FROM carreras';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener carreras' });
    }
    res.json(results);
  });
});


// Definir una ruta para crear un nuevo usuario o verificar si ya existe
app.post('/api/usuarios', (req, res) => {
  const { rut, nombre_carrera, tipo_usuario } = req.body;

  if (!rut || !nombre_carrera || !tipo_usuario) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  // Consulta para obtener el ID de la carrera basado en el nombre
  const getCarreraIdQuery = "SELECT id_carrera FROM `carreras` WHERE `nombre_carrera` = ?";
  db.query(getCarreraIdQuery, [nombre_carrera], (err, results) => {
    if (err) {
      console.error('Error al obtener el ID de la carrera:', err);
      return res.status(500).json({ error: 'Error al obtener el ID de la carrera' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Carrera no encontrada' });
    }

    const id_carrera = results[0].id_carrera;

    // Consulta para verificar si el usuario ya existe
    const checkUserQuery = "SELECT * FROM `usuarios` WHERE `rut` = ?";
    db.query(checkUserQuery, [rut], (err, results) => {
      if (err) {
        console.error('Error al verificar el usuario:', err);
        return res.status(500).json({ error: 'Error al verificar el usuario' });
      }

      if (results.length > 0) {
        // El usuario ya existe, no es necesario crearlo de nuevo
        return res.status(200).json({ message: 'Usuario ya existe', userId: results[0].id });
      }

      // Consulta para insertar un nuevo usuario
      const insertUserQuery = "INSERT INTO `usuarios`( `rut`, `tipo_usuario`, `carrera_id`) VALUES (?, ?, ?)";
      db.query(insertUserQuery, [rut, tipo_usuario, id_carrera], (err, result) => {
        if (err) {
          console.error('Error al insertar el usuario:', err);
          return res.status(500).json({ error: 'Error al insertar el usuario' });
        }
        res.status(201).json({ message: 'Usuario creado exitosamente', userId: result.insertId });
      });
    });
  });
});

// Definir una ruta para crear una nueva reserva
app.post('/api/reservas', (req, res) => {
  const { id_sala, fecha_reserva, hora_inicio, rut_usuario, numero_personas } = req.body;

  // Mapear hora_inicio a hora_fin según los rangos predefinidos
  const horarios = {
    "08:30:00": "10:30:00",
    "10:30:00": "12:30:00",
    "12:30:00": "14:30:00",
    "14:30:00": "16:30:00",
    "16:30:00": "18:30:00",
    "18:30:00": "20:30:00",
    "20:30:00": "22:30:00"
  };

  const hora_fin = horarios[hora_inicio];

  if (!hora_fin) {
    return res.status(400).json({ error: 'Hora de inicio no válida' });
  }

  // Consulta para insertar una nueva reserva
  const query = `
    INSERT INTO reservas (id_sala, fecha_reserva, hora_inicio, hora_fin, rut_usuario, numero_personas)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(query, [id_sala, fecha_reserva, hora_inicio, hora_fin, rut_usuario, numero_personas], (err, result) => {
    if (err) {
      console.error('Error al insertar la reserva:', err);
      return res.status(500).json({ error: 'Error al insertar la reserva' });
    }
    res.status(201).json({ message: 'Reserva creada exitosamente', reservaId: result.insertId });
  });
});

// Definir una ruta para actualizar el estado de una reserva
app.put('/api/reservas/:id', (req, res) => {
  const { id } = req.params;
  const { estado_reserva } = req.body;

  const query = "UPDATE reservas SET estado_reserva = ? WHERE id_reserva = ?";
  db.query(query, [estado_reserva, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar la reserva:', err);
      return res.status(500).json({ error: 'Error al actualizar la reserva' });
    }
    res.status(200).json({ message: 'Reserva actualizada exitosamente' });
  });
});

// Definir una ruta para actualizar el estado de una sala
app.put('/api/salas/:id', (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  const query = "UPDATE salas SET estado = ? WHERE id_sala = ?";
  db.query(query, [estado, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar el estado de la sala:', err);
      return res.status(500).json({ error: 'Error al actualizar el estado de la sala' });
    }
    res.status(200).json({ message: 'Estado de la sala actualizado exitosamente' });
  });
});

app.get('/api/salas', (req, res) => {
  const query = "SELECT * FROM salas";
  db.query(query, (err, results) => {
    res.json(results);
  });
});


// Definir una ruta para obtener el estado de las salas junto con las reservas activas
app.get('/api/salas-con-reservas', (req, res) => {
  const query = `
    SELECT salas.id_sala, salas.estado, reservas.id_reserva, reservas.rut_usuario, reservas.numero_personas, usuarios.carrera_id, carreras.nombre_carrera, reservas.fecha_creacion, hora_inicio
    FROM salas
    INNER JOIN reservas ON salas.id_sala = reservas.id_sala AND reservas.estado_reserva = 'activa'
    INNER JOIN usuarios ON reservas.rut_usuario = usuarios.rut
    INNER JOIN carreras ON usuarios.carrera_id = carreras.id_carrera
    WHERE salas.id_sala <= 10
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener el estado de las salas con reservas:', err);
      return res.status(500).json({ error: 'Error al obtener el estado de las salas con reservas' });
    }
    res.json(results);
  });
});

app.get('/api/usuarios/:rut', (req, res) => {
  const { rut } = req.params;
  const query = `
    SELECT usuarios.rut, usuarios.tipo_usuario, usuarios.carrera_id, carreras.nombre_carrera
    FROM usuarios
    LEFT JOIN carreras ON usuarios.carrera_id = carreras.id_carrera
    WHERE usuarios.rut = ?
  `;
  db.query(query, [rut], (err, results) => {
    if (err) {
      console.error('Error al obtener el usuario:', err);
      return res.status(500).json({ error: 'Error al obtener el usuario' });
    }
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  });
});

// Ruta para obtener salas con estado deshabilitado
app.get('/api/salas/deshabilitadas', (req, res) => {
  const query = "SELECT * FROM salas WHERE estado = 'deshabilitada'";
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener las salas deshabilitadas:', err);
      return res.status(500).json({ error: 'Error al obtener las salas deshabilitadas' });
    }
    res.json(results);
  });
});

// Iniciar el servidor en el puerto definido en .env
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});

// Imprimir en consola las variables de entorno relacionadas con la base de datos
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_NAME:', process.env.DB_NAME);

// node.js permite juntar todos los componentes anteriores para que sea ejecutable
