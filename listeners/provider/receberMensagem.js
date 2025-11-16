


// backend/listeners/provider/receberMensagem.js
const buscarLeadIdPorTelefone = require('../../services/buscarLeadIdPorTelefone');
const { randomUUID } = require('crypto');
const { normalizarMensagem } = require('../../utils/normalizarMensagem');



/**
 * Mantém o MESMO nome/função: receberMensagem
 * Agora ela registra o listener no socket do IO (onde o provider se conecta)
 */
module.exports = function receberMensagem(socketProvider, io) {
  console.log("📩 Listener receberMensagem.js foi carregado pelo backend");

  // Escuta mensagens vindas do Provider (ex: WhatsApp)
  socketProvider.on("mensagem", async (payload) => {
    console.log("🔥 ENTROU NO RECEBERMENSAGEM DO PROVIDER!");
    try {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📥 [Provider→Backend] EVENTO 'mensagem' RECEBIDO");
    console.log("Payload bruto recebido do provider:");
    console.dir(payload, { depth: null });

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
      console.log("📦 Mensagem normalizada:", mensagemNormalizada);

      // Emite para o front específico do lead
      const room = `lead-${leadId}`;
      console.log(`📤 [Backend→Front] Tentando emitir evento 'mensagemRecebida' para sala: ${room}`);
      console.log(`👥 Clientes conectados (esperado: 1+ se front entrou):`, io.sockets.adapter.rooms.get(room));

      io.to(room).emit("mensagemRecebida", mensagemNormalizada);

      console.log("✅ Emissão concluída. Mensagem enviada ao front-end com sucesso.");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      // Opcional: salvar no banco se quiser persistir
      // await supabase.from('mensagens').insert([mensagemNormalizada]);

    } catch (err) {
      console.error("❌ Erro no listener receberMensagem.js:", err);
    }
  });
};
