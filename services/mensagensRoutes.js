const express = require('express');
const { normalizarMensagem } = require('../utils/normalizarMensagem');
const { salvarMensagem } = require('../mensagensController');
const buscarLeadIdPorTelefone = require('../services/buscarLeadIdPorTelefone');
const { emitirParaFront } = require('../emissorFront');

module.exports = function (io) {
  const router = express.Router();

  router.post('/inserir', async (req, res) => {
    console.log("🟢 [1] [BACKEND] → Chegou requisição em /api/mensagens/inserir");

    try {
      // [2] Garantir leitura correta do corpo
      let data = req.body;
      let rawBody = '';

      if (!data || Object.keys(data).length === 0) {
        req.on('data', chunk => (rawBody += chunk));
        await new Promise(resolve => req.on('end', resolve));
        try {
          data = JSON.parse(rawBody);
        } catch (err) {
          console.error("⚠️ [2A] Erro ao converter rawBody:", err.message);
        }
      }

      console.log("📦 [2B] Payload recebido do provedor:", data);

      // [3] Buscar ou resolver o leadId
      const leadId = data.lead_id || await buscarLeadIdPorTelefone(data.telefone);
      console.log("🔍 [3] leadId resolvido =", leadId, "para telefone =", data.telefone);

      // [4] Salvar a mensagem no banco
      const resultado = await salvarMensagem(data);

      if (!resultado.success) {
        console.error("❌ [4A] Falha ao salvar mensagem:", resultado.error);
        return res.status(500).json(resultado);
      }

      console.log("💾 [4B] Mensagem salva com sucesso:", resultado.mensagem);

      // [5] Sincronizar lead_id após o salvamento
      data.lead_id = leadId || resultado.mensagem?.lead_id || null;
      console.log("🔄 [5] lead_id sincronizado =", data.lead_id);

      // [6] Normalizar formato para o front
      const canal = data.canal || 'WhatsApp';
      const mensagemNormalizada = normalizarMensagem(data, data.lead_id, canal);

      console.log("📤 [6] Mensagem normalizada pronta para emitir:", mensagemNormalizada);

      // [7] Emitir via socket centralizado
      emitirParaFront(io, data.lead_id, 'mensagemRecebida', mensagemNormalizada);
      console.log("🚀 [7] Evento mensagemRecebida emitido para lead =", data.lead_id);

      // [8] Resposta HTTP para o provedor
      return res.status(200).json({ sucesso: true });

    } catch (err) {
      console.error("❌ [X] Erro em /api/mensagens/inserir:", err);
      return res.status(500).json({ erro: err.message });
    }
  });

  return router;
};