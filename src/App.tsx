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