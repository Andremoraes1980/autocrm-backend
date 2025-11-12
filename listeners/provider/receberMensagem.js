// backend/listeners/provider/receberMensagem.js
const buscarLeadIdPorTelefone = require('../../services/buscarLeadIdPorTelefone');
const { randomUUID } = require('crypto');

// Garante shape consistente para o front
function normalizarMensagem(payload, leadId) {
  const p = payload || {};
  const base = p.data || p.mensagem || p; // tolera variações

  return {
    id: base.id ?? p.id ?? randomUUID(),              // sempre tem id
    lead_id: leadId,                                  // sala do lead
    remetente: base.remetente ?? base.telefone ?? p.telefone ?? null,
    remetente_id: base.remetente_id ?? null,
    vendedor_id: base.vendedor_id ?? null,
    mensagem: base.mensagem ?? base.body ?? base.texto ?? '',
    canal: base.canal ?? 'WhatsApp Cockpit',
    tipo: base.tipo ?? 'texto',
    lida: Boolean(base.lida ?? false),
    criado_em: base.criado_em ?? new Date().toISOString(),
  };
}


/**
 * Mantém o MESMO nome/função: receberMensagem
 * Agora ela registra o listener no socket do IO (onde o provider se conecta)
 */
module.exports = function receberMensagem(socket, io) {
  socket.on('mensagemRecebida', async (payload) => {
    console.log('📥 [IO] mensagemRecebida via io:', payload);

    const { lead_id, telefone, mensagem } = payload || {};

    if (lead_id) {
      const dataFront1 = normalizarMensagem(payload, lead_id);
io.to(`lead-${lead_id}`).emit('mensagemRecebida', { success: true, data: dataFront1 });
console.log(`✅ [REPASSE] emitido para sala lead-${lead_id} (id=${dataFront1.id})`);

      return;
    }

    // Fallback por telefone
    try {
      const tel =
        telefone || mensagem?.from || mensagem?.telefone || mensagem?.telefone_cliente;

      if (!tel) {
        console.warn('⚠️ [IO] payload sem lead_id e sem telefone — não foi possível emitir.');
        return;
      }

      const leadIdBanco = await buscarLeadIdPorTelefone(tel);
      if (leadIdBanco) {
        const dataFront2 = normalizarMensagem(payload, leadIdBanco);
io.to(`lead-${leadIdBanco}`).emit('mensagemRecebida', { success: true, data: dataFront2 });
console.log(`✅ [REPASSE] emitido por telefone para sala lead-${leadIdBanco} (id=${dataFront2.id})`);

      } else {
        console.warn('⚠️ [IO] telefone não localizado no banco:', tel);
      }
    } catch (err) {
      console.error('❌ [IO] erro no fallback por telefone:', err?.message || err);
    }
  });
};
