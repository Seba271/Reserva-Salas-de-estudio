import React, { useState } from 'react';
import { fetchReservasDetalles } from './services/apiService';
import './Historial.css';

interface Reserva {
    sala: number;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    rutUsuario: string;
    numeroPersonas: number;
    carrera: string;
}

interface HistorialProps {
    onBack: () => void;
}

const Historial: React.FC<HistorialProps> = ({ onBack }) => {
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Reserva; direction: 'asc' | 'desc' } | null>(null);
    const [rutMasRepetido, setRutMasRepetido] = useState('');
    const [carreraMasReservada, setCarreraMasReservada] = useState('');
    const [tramoMasReservadoInicio, setTramoMasReservadoInicio] = useState('');
    const [tramoMasReservadoFin, setTramoMasReservadoFin] = useState('');
    const [showRecordCardContainer, setShowRecordCardContainer] = useState(false);
    const [showExportButton, setShowExportButton] = useState(false);

    const handleSearch = async () => {
        try {
                        setShowRecordCardContainer(true); // Mostrar el contenedor al buscar
            const formattedFechaInicio = new Date(fechaInicio).toISOString().split('T')[0];
            const formattedFechaFin = new Date(fechaFin).toISOString().split('T')[0];

            const resultados = await fetchReservasDetalles(formattedFechaInicio, formattedFechaFin);
            console.log('Resultados:', resultados.length);
            setReservas(resultados);


            // Análisis de datos
            setRutMasRepetido(resultados.reduce((max: Reserva, current: Reserva) => {
                return current.rutUsuario.length > max.rutUsuario.length ? current : max;
            }, resultados[0]).rutUsuario);
            setCarreraMasReservada(resultados.reduce((max: Reserva, current: Reserva) => {
                return current.carrera.length > max.carrera.length ? current : max;
            }, resultados[0]).carrera);
            setTramoMasReservadoInicio(resultados.reduce((max: Reserva, current: Reserva) => {
                return current.horaInicio.length > max.horaInicio.length ? current : max;
            }, resultados[0]).horaInicio);
            setTramoMasReservadoFin(resultados.reduce((max: Reserva, current: Reserva) => {
                return current.horaFin.length > max.horaFin.length ? current : max;
            }, resultados[0]).horaFin);

            setShowExportButton(true);
        } catch (error) {
            console.error('Error al obtener las reservas:', error);
        }
    };

    const sortedReservas = React.useMemo(() => {
        if (sortConfig !== null) {
            return [...reservas].sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return reservas;
    }, [reservas, sortConfig]);

    const requestSort = (key: keyof Reserva) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof Reserva) => {
        if (!sortConfig || sortConfig.key !== key) {
            return '⇅'; // Icono para indicar que se puede ordenar
        }
        return sortConfig.direction === 'asc' ? '↑' : '↓'; // Iconos para ascendente y descendente
    };

    return (
        <div className="historial-container">
            <h1>Historial de Reservas</h1>
            <div className="search-controls">
                <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="date-picker"
                />
                <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="date-picker"
                />
                {showExportButton && (
                    <button className="btn btn-export">Exportar Reporte</button>
                )}
                <button onClick={handleSearch} className="btn btn-primary">Buscar</button>
                <button onClick={onBack} className="btn btn-danger">Volver</button>

            </div>
            {showRecordCardContainer && (
                <div className="record-card-container">
                    <div className="record-card">
                        <span>Rut mas repetido
                            <br/>
                            <p>{rutMasRepetido}</p></span>
                    </div>
                    <div className="record-card">   
                        <span>Tramo mas reservado
                            <br/>
                            <p>{tramoMasReservadoInicio} - {tramoMasReservadoFin}</p></span>
                    </div> 
                    <div className="record-card">
                        <span>Registros encontrados
                            <br/>
                            <p>{reservas.length}</p></span>
                    </div>
                    <div className="record-card">
                        <span>Carrera Frecuente
                            <br/>
                            <p>{carreraMasReservada}</p></span>
                    </div>
                </div>
            )}
            <table className="reservas-table">
                <thead>
                    <tr>
                        <th onClick={() => requestSort('sala')} style={{ cursor: 'pointer' }}>
                            Sala {getSortIcon('sala')}
                        </th>
                        <th onClick={() => requestSort('fecha')} style={{ cursor: 'pointer' }}>
                            Fecha {getSortIcon('fecha')}
                        </th>
                        <th onClick={() => requestSort('horaInicio')} style={{ cursor: 'pointer' }}>
                            Hora Inicio {getSortIcon('horaInicio')}
                        </th>
                        <th onClick={() => requestSort('horaFin')} style={{ cursor: 'pointer' }}>
                            Hora Fin {getSortIcon('horaFin')}
                        </th>
                        <th onClick={() => requestSort('rutUsuario')} style={{ cursor: 'pointer' }}>
                            RUT Usuario {getSortIcon('rutUsuario')}
                        </th>
                        <th onClick={() => requestSort('numeroPersonas')} style={{ cursor: 'pointer' }}>
                            Número de Personas {getSortIcon('numeroPersonas')}
                        </th>
                        <th onClick={() => requestSort('carrera')} style={{ cursor: 'pointer' }}>
                            Carrera {getSortIcon('carrera')}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sortedReservas.map((reserva, index) => {
                        const fechaActual = new Date(reserva.fecha).toLocaleDateString('es-ES');
                        const fechaAnterior = index > 0 ? new Date(reservas[index - 1].fecha).toLocaleDateString('es-ES') : null;
                        const isDifferentDate = fechaActual !== fechaAnterior;

                        return (
                            <tr key={index} className={isDifferentDate ? 'different-date' : ''}>
                                <td>{reserva.sala}</td>
                                <td>{fechaActual}</td>
                                <td>{reserva.horaInicio}</td>
                                <td>{reserva.horaFin}</td>
                                <td>{reserva.rutUsuario}</td>
                                <td>{reserva.numeroPersonas}</td>
                                <td>{reserva.carrera}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default Historial;
