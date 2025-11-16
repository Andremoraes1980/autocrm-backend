// backend/services/mensagensRoutes.js
const express = require('express');
const { normalizarMensagem } = require('../utils/normalizarMensagem');
const { salvarMensagem } = require('./mensagensController');
const buscarLeadIdPorTelefone = require('./buscarLeadIdPorTelefone');
const { emitirParaFront } = require('./emissorFront');

module.exports = function (io) {
  const router = express.Router();

  router.post('/inserir', async (req, res) => {
    console.log("🛰️ [BACKEND] → Chegou requisição em /api/mensagens/inserir");

    try {
      let data = req.body;
      let rawBody = '';

      if (!data || Object.keys(data).length === 0) {
        req.on('data', (chunk) => (rawBody += chunk));
        await new Promise((resolve) => req.on('end', resolve));
        try {
          data = JSON.parse(rawBody);
        } catch (err) {
          console.error("⚠️ Erro ao converter rawBody:", err.message);
        }
      }

      console.log("📦 Payload recebido do provider:", data);

      // Buscar ou definir lead_id
      const leadId = data.lead_id || await buscarLeadIdPorTelefone(data.telefone);

      // Salvar no banco
      const resultado = await salvarMensagem(data);
      if (!resultado.success) {
        console.error("❌ Falha ao salvar mensagem:", resultado.error);
        return res.status(500).json(resultado);
      }

      // Normalizar formato para o front
      const mensagemNormalizada = normalizarMensagem(data, leadId, data.canal || 'WhatsApp');
      console.log("📤 Mensagem normalizada pronta para emitir:", mensagemNormalizada);

      // Emitir via socket centralizado
      emitirParaFront(io, leadId, 'mensagemRecebida', mensagemNormalizada);

      res.status(200).json({ sucesso: true });
    } catch (err) {
      console.error("❌ Erro em /api/mensagens/inserir:", err);
      res.status(500).json({ erro: err.message });
    }
  });

  return router;
};
