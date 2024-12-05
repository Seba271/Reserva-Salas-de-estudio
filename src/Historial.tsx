import React, { useState } from 'react';
import { fetchReservasDetalles } from './services/apiService';
import * as XLSX from 'xlsx';
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

    const exportToExcel = () => {
        const workbook = XLSX.utils.book_new();
        const horarios = [
            "08:30:00", "10:30:00", "12:30:00", "14:30:00",
            "16:30:00", "18:30:00", "20:30:00"
        ];

        const fechas = [...new Set(reservas.map(reserva => reserva.fecha))];
        //añadir primera hoja con datos generales

    // Crear la estructura de datos generales
    const dataGeneral: any[] = [
        { "Descripción": "Rut más repetido", "Valor": rutMasRepetido },
        { "Descripción": "Tramo más reservado", "Valor": `${tramoMasReservadoInicio} - ${tramoMasReservadoFin}` },
        { "Descripción": "Registros encontrados", "Valor": reservas.length },
        { "Descripción": "Carrera Frecuente", "Valor": carreraMasReservada }
    ];

    // Convertir dataGeneral a una hoja de Excel
    const worksheetGeneral = XLSX.utils.json_to_sheet(dataGeneral);
    XLSX.utils.book_append_sheet(workbook, worksheetGeneral, "Datos Generales");

    // Agregar detalles de cada reserva
    const dataReservas = reservas.map(reserva => ({
        Sala: reserva.sala,
        Fecha: new Date(reserva.fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }),
        HoraInicio: reserva.horaInicio,
        HoraFin: reserva.horaFin,
        RUTUsuario: reserva.rutUsuario,
        NúmeroPersonas: reserva.numeroPersonas,
        Carrera: reserva.carrera
    }));

    const worksheetReservas = XLSX.utils.json_to_sheet(dataReservas);
    XLSX.utils.book_append_sheet(workbook, worksheetReservas, "Reservas");
        
        fechas.forEach(fecha => {
            const reservasPorFecha = reservas.filter(reserva => reserva.fecha === fecha);
            const salas = [...new Set(reservasPorFecha.map(reserva => reserva.sala))];

            const data: any[] = [];
            let totalDia = 0;
            let totalManana = 0;
            let totalTarde = 0;
            let totalNoche = 0;

            salas.forEach(sala => {
                data.push([{ Sala: `Sala ${sala}` }]);

                let totalEstudiantes = 0;

                horarios.forEach(horaInicio => {
                    const reserva = reservasPorFecha.find(reserva => reserva.sala === sala && reserva.horaInicio === horaInicio);
                    const numeroEstudiantes = reserva ? reserva.numeroPersonas : 0;
                    //solo obtener valor, no es necesario guardar la
                    totalEstudiantes += numeroEstudiantes;

                // Sumar a los tramos correspondientes
                    if (horaInicio >= "08:30:00" && horaInicio < "14:30:00") {
                        totalManana += numeroEstudiantes;
                    } else if (horaInicio >= "14:30:00" && horaInicio < "18:30:00") {
                        totalTarde += numeroEstudiantes;
                    } else if (horaInicio >= "18:30:00") {
                        totalNoche += numeroEstudiantes;
                    }

                    data.push({
                        Tramo: `${horaInicio} A ${horarios[horarios.indexOf(horaInicio) + 1] || "22:30:00"}`,
                        "N° estudiantes": numeroEstudiantes,
                        "RUT responsable": reserva ? reserva.rutUsuario : '',
                        Carrera: reserva ? reserva.carrera : '',
                    });
                });

                totalDia += totalEstudiantes;

                data.push({
                    Tramo: "TOTAL",
                    "N° estudiantes": totalEstudiantes,
                    "RUT responsable": "",
                    Carrera: "",
                });

                data.push([]);
            });

            // se crea otra tabla para las estadisticas
            data.push([]);  


// Verifica que la celda H22 esté dentro del rango de datos
            // columna total dia XD                 
            // su dato de abajo es totaldia         

          //  data.push([{ TRAMOS: "TRAMOS", TOTAL: "TOTAL" }]);
            //data.push([{ TRAMOS: "08:30 - 14:30", TOTAL: totalManana }]);
            //data.push([{ TRAMOS: "14:30 - 18:30", TOTAL: totalTarde }]);
       //     data.push([{ TRAMOS: "18:30 - 22:30", TOTAL: totalNoche }]);
        
        const worksheet = XLSX.utils.json_to_sheet(data.flat());
            


    // Verifica que la celda H22 esté dentro del rango de datos
    if (!worksheet['!ref'] || !worksheet['!ref'].includes('H1') && !worksheet['!ref'].includes('I1') && !worksheet['!ref'].includes('H3') && !worksheet['!ref'].includes('H4') && !worksheet['!ref'].includes('H5') && !worksheet['!ref'].includes('H6') && !worksheet['!ref'].includes('I3') && !worksheet['!ref'].includes('I4') && !worksheet['!ref'].includes('I5') && !worksheet['!ref'].includes('I6')) {
        worksheet['!ref'] = `A1:I600`; // Ajusta el rango si es necesario
}

        // Especificar el valor de una celda en H22
    
        worksheet['H1'] = { t: 's', v: "Total personas en el dia" };

        worksheet['I1'] = { t: 'n', v: totalDia }; //  
        // COLUMNAS TRAMOS 
        worksheet['H3'] = { t: 's', v: "TRAMOS" };
        worksheet['H4'] = { t: 's', v: "08:30 - 14:30"};   
        worksheet['H5'] = { t: 's', v: "14:30 - 18:30"};   
        worksheet['H6'] = { t: 's', v: "18:30 - 22:30"};   
        // COLUMNAS TOTAL
        worksheet['I3'] = { t: 's', v: "TOTAL" };   
        worksheet['I4'] = { t: 'n', v: totalManana };   
        worksheet['I5'] = { t: 'n', v: totalTarde };   
        worksheet['I6'] = { t: 'n', v: totalNoche };   
        
            worksheet['!cols'] = [
                { wch: 7 },
                { wch: 17 },
                { wch: 13 },
                { wch: 14 },
                { wch: 37 }
            ];

            const fechaFormateada = new Date(fecha).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            XLSX.utils.book_append_sheet(workbook, worksheet, fechaFormateada);
        });

        XLSX.writeFile(workbook, 'HistorialReservas.xlsx');
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
                    <button className="btn btn-export" onClick={exportToExcel}>
                        Exportar Reporte
                    </button>
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
