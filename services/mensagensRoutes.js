const express = require('express');
const { normalizarMensagem } = require('../utils/normalizarMensagem');
const { salvarMensagem } = require('../services/mensagensController');
const buscarLeadIdPorTelefone = require('../services/buscarLeadIdPorTelefone');
const { emitirParaFront } = require('../emissorFront');

module.exports = function (io) {
  const router = express.Router();

  router.post('/inserir', async (req, res) => {
    console.log("[🧭 1] [BACKEND] → Chegou requisição em /api/mensagens/inserir");
  
    try {
      // [2] Garantir leitura correta do corpo da requisição
      let data = req.body;
      let rawBody = '';
  
      if (!data || Object.keys(data).length === 0) {
        req.on('data', chunk => (rawBody += chunk));
        await new Promise(resolve => req.on('end', resolve));
        try {
          data = JSON.parse(rawBody);
        } catch (err) {
          console.error("[X] Erro ao converter rawBody:", err.message);
        }
      }
  
      console.log("[🧾 3] Payload recebido do provider:", data);
  
      // [4] Buscar ou definir lead_id
      const leadId = data.lead_id || await buscarLeadIdPorTelefone(data.telefone);
      console.log("[🔎 4] leadId obtido/buscado =", leadId);
  
      // [5] Salvar no banco
      const resultado = await salvarMensagem(data);
      if (!resultado.success) {
        console.error("[X 4A] Falha ao salvar mensagem:", resultado.error);
        return res.status(500).json(resultado);
      }
  
      console.log("[💾 4B] Mensagem salva com sucesso:", resultado.data);
  
      // [5B] Sincronizar lead_id após o salvamento
      data.lead_id = leadId || resultado.data.lead_id || null;
      console.log("[🔗 5] lead_id sincronizado =", data.lead_id);
  
      // [6] Normalizar formato para o front
      const canal = data.canal || 'WhatsApp';
      
      // Garante que o ID salvo seja refletido no objeto emitido
const mensagemNormalizada = normalizarMensagem(data, data.lead_id, canal);

// Se o Supabase retornou um ID (que é o verdadeiro), atualiza o objeto
if (resultado?.data?.id && !mensagemNormalizada.id) {
  mensagemNormalizada.id = resultado.data.id;}
  
      console.log("[📦 6] Mensagem normalizada pronta para emitir:", mensagemNormalizada);
  
      // [7] Emitir via socket centralizado
      emitirParaFront(io, data.lead_id, 'mensagemRecebida', mensagemNormalizada);
      console.log("[🚀 7] Evento 'mensagemRecebida' emitido para lead =", data.lead_id);
  
      // [8] Resposta HTTP ao provedor
      return res.status(200).json({ sucesso: true });
    } catch (err) {
      console.error("[X] Erro em /api/mensagens/inserir:", err);
      return res.status(500).json({ erro: err.message });
    }
  });

  return router;
};