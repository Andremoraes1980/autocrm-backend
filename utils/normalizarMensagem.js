const { randomUUID } = require('crypto');

/**
 * Normaliza o formato de mensagens para manter consistência entre os canais
 * (WhatsApp, OLX, Webchat etc.) e com o front-end do CRM.
 */
function normalizarMensagem(payload = {}, leadId = null, canalPadrao = 'WhatsApp Cockpit') {
  const p = payload || {};
  const base = p.data || p.mensagem || p; // tolera variações de formato

  return {
    id: base.id ?? randomUUID(),                        // sempre gera um ID único
    lead_id: leadId,                                    // vem da rota ou do lookup
    remetente: base.remetente ?? base.telefone ?? p.telefone ?? null,
    remetente_id: base.remetente_id ?? null,
    vendedor_id: base.vendedor_id ?? null,
    mensagem: base.mensagem ?? base.texto ?? base.body ?? '',
    canal: base.canal ?? canalPadrao,                   // WhatsApp, OLX, etc.
    tipo: base.tipo ?? 'texto',
    direcao: base.direcao ?? 'entrada',
    lida: Boolean(base.lida ?? false),
    criado_em: base.criado_em ?? new Date().toISOString(),
  };
}

module.exports = { normalizarMensagem };