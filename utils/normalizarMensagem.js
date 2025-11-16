const { randomUUID } = require('crypto');

function normalizarMensagem(payload = {}, leadId, canal = 'WhatsApp') {
  const base = payload.data || payload.mensagem || payload;

  return {
    id: base.id ?? randomUUID(),
    lead_id: leadId,
    mensagem: base.body || base.mensagem || '',
    tipo: base.tipo || 'texto',
    canal,
    remetente: base.telefone || base.remetente || null,
    criado_em: base.criado_em || new Date().toISOString(),
    direcao: base.direcao || 'entrada'
  };
}

module.exports = { normalizarMensagem };
