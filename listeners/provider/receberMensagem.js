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
module.exports = function receberMensagem(socketProvider, io) {
  console.log("📩 Listener receberMensagem.js foi carregado pelo backend");

  // Escuta mensagens vindas do Provider (ex: WhatsApp)
  socketProvider.on("mensagem", async (payload) => {
    try {
      console.log("📥 [Provider→Backend] Nova mensagem recebida:", payload);

      // Extrai ou busca leadId
      let leadId = payload?.lead_id;
      if (!leadId && payload?.telefone) {
        leadId = await buscarLeadIdPorTelefone(payload.telefone);
        console.log("🔍 Lead ID obtido pelo telefone:", leadId);
      }

      if (!leadId) {
        console.warn("⚠️ Nenhum lead_id encontrado para mensagem recebida:", payload);
        return;
      }

      // Normaliza mensagem
      const mensagemNormalizada = normalizarMensagem(payload, leadId);

      // Emite para o front específico do lead
      const room = `lead-${leadId}`;
      io.to(room).emit("mensagemRecebida", mensagemNormalizada);

      console.log(`📤 [Backend→Front] Emitido mensagemRecebida para sala ${room}:`, mensagemNormalizada);

      // Opcional: salvar no banco se quiser persistir
      // await supabase.from('mensagens').insert([mensagemNormalizada]);

    } catch (err) {
      console.error("❌ Erro no listener receberMensagem.js:", err);
    }
  });
};
