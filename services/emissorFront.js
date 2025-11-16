// backend/services/emissorFront.js

/**
 * Serviço responsável por emitir eventos para o frontend via Socket.IO.
 * É o ponto central para todos os envios em tempo real do CRM.
 */

function emitirParaFront(io, leadId, evento, payload) {
    if (!io) {
      console.error("❌ [SOCKET] Erro: objeto io indefinido.");
      return;
    }
  
    if (!leadId) {
      console.warn("⚠️ [SOCKET] Tentativa de emitir evento sem leadId:", evento);
      return;
    }
  
    const room = `lead-${leadId}`;
  
    try {
      io.to(room).emit(evento, payload);
  
      console.log(`
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📡 [SOCKET EMISSÃO]
  Evento: ${evento}
  Sala: ${room}
  Payload:`, payload, `
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    } catch (err) {
      console.error(`❌ [SOCKET] Falha ao emitir '${evento}' para sala ${room}:`, err);
    }
  }
  
  module.exports = { emitirParaFront };
  