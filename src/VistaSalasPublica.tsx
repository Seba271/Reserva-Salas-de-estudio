import React, { useState } from 'react';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import Modal from './Modal';

interface Sala {
    estado: string;
    rut: string;
    personas: number;
    carrera: string;
}

interface SalasProps {
    salas: {
        edificioA: Sala[];
        edificioB: Sala[];
    };
    onLoginClick: () => void;
}

const VistaSalasPublica: React.FC<SalasProps> = ({ salas, onLoginClick }) => {
    const [showInfo, setShowInfo] = useState(false);

    return (
        <div className="container">
            <h1 style={{ color: 'black' }}>Estado de las Salas</h1>
            <div className="edificio">
                <h2>Edificio A</h2>
                <div className="salas-container">
                    {salas.edificioA.map((sala, index) => (
                        <div key={index} className="sala" data-estado={sala.estado}>
                            Sala {index + 1}
                        </div>
                    ))}
                </div>
            </div>
            <div className="edificio">
                <h2>Edificio B</h2>
                <div className="salas-container">
                    {salas.edificioB.map((sala, index) => (
                        <div key={index} className="sala" data-estado={sala.estado}>
                            Sala {index + 7}
                        </div>
                    ))}
                </div>
            </div>
            <button onClick={onLoginClick} className="btn btn-primary">Iniciar Sesión</button>

            <div style={{ color: 'white', position: 'fixed', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#ff7f00', padding: '10px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)' }}>
                <FontAwesomeIcon 
                    icon={faInfoCircle} 
                    onClick={() => setShowInfo(true)} 
                    style={{ cursor: 'pointer', fontSize: '24px', color: '#007bff' }}
                />
                <p style={{ margin: '5px 0 0 0', color: 'white' }}>Ayuda</p>
            </div>

            <Modal show={showInfo} onClose={() => setShowInfo(false)} className="modal-content-instructions">
                <h2>Instrucciones de las salas</h2>
                <div className="instruction">
                    <img src="https://img.icons8.com/ios-filled/50/40C057/full-stop.png" alt="Verde" />
                    <span>Sala disponible: Puede Reservar la sala. dirigase a la biblioteca del edifico A para realizar la reserva. (capacidad maxima de 8 personas y 2 horas de duracion)</span>
                </div>
                <div className="instruction">
                    <img width="50" height="50" src="https://img.icons8.com/ios-filled/50/FA5252/full-stop.png" alt="full-stop"/>
                    <span>Sala Ocupada: Esta sala tiene 1 o mas ocupantes en curso. </span>
                </div>
                <div className="instruction">
                    <img width="50" height="50" src="https://img.icons8.com/ios-filled/50/737373/full-stop.png" alt="full-stop"/>
                    <span>Sala deshabilitada: Esta sala no puede recibir reservas, esta en mantenimiento.</span>
                </div>
                <div className="instruction">
                    <img width="50" height="50" src="https://img.icons8.com/ios-filled/50/FAB005/full-stop.png" alt="full-stop"/>  
                    <span>Tiempo excedido: La sala esta pronta para ser usada o ya puede ser usada, para mas informacion dirijase a la biblioteca del edificio A</span>
                </div>
            </Modal>
        </div>
    );
}

export default VistaSalasPublica;