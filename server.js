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
  const query = 'SELECT * FROM administradores';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener los administradores' });
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
