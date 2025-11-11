// Arquivo: backend/listeners/frontend/entrarNaSala.js

// backend/listeners/frontend/entrarNaSala.js
module.exports = function entrarNaSala(socket, io) {

  console.log("🚀 [INIT] Listener entrarNaSala.js foi carregado pelo backend");

  socket.on('entrarNaSala', ({ lead_id }) => {
    console.log("⚡ [IO] Evento 'entrarNaSala' recebido pelo backend.");
    console.log("➡️  lead_id recebido:", lead_id);
    console.log("➡️  socket.id atual:", socket.id);

    if (!lead_id) {
      console.warn(`⚠️ [IO] ${socket.id} tentou entrar sem lead_id`);
      return;
    }
    const room = `lead-${lead_id}`;
    socket.join(room);
     // Confirma que realmente entrou
    const rooms = Array.from(socket.rooms);
    console.log(`🏠 [IO] ${socket.id} entrou na sala ${room}`);
    console.log("📦 Salas ativas desse socket:", rooms);
  });
};
