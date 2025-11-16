// backend/emissorFront.js

function emitirParaFront(io, leadId, evento, payload) {
    try {
      if (!leadId) {
        console.warn("⚠️ [SOCKET] Tentativa de emitir evento sem leadId:", evento);
        return;
      }
  
      const sala = `lead-${leadId}`;
      console.log(`📡 [SOCKET] Emitindo evento "${evento}" para sala ${sala}`);
      io.to(sala).emit(evento, payload);
  
    } catch (err) {
      console.error("❌ [SOCKET] Erro ao emitir evento para o front:", err);
    }
  }
  
  module.exports = { emitirParaFront };