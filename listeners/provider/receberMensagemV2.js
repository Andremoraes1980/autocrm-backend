// backend/listeners/provider/receberMensagemV2.js
const buscarLeadIdPorTelefone = require('../../services/buscarLeadIdPorTelefone');

module.exports = function receberMensagemV2(socketProvider, io) {
  console.log('🧪 [V2] receberMensagemV2() carregado — registrando listener');

  socketProvider.on('mensagemRecebida', async (payload) => {
    console.log('🧪 [V2] mensagemRecebida DISPAROU — payload:', payload);

    const { lead_id, telefone, mensagem } = payload || {};

    if (lead_id) {
      io.to(`lead-${lead_id}`).emit('mensagemRecebida', payload);
      console.log('🧪 [V2] emitido para sala:', `lead-${lead_id}`);
      return;
    }

    // Fallback por telefone
    const telefoneBusca =
      telefone || mensagem?.from || mensagem?.telefone || mensagem?.telefone_cliente;

    if (!telefoneBusca) {
      console.warn('🧪 [V2] payload sem lead_id e sem telefone — não foi possível emitir.');
      return;
    }

    try {
      const leadIdBanco = await buscarLeadIdPorTelefone(telefoneBusca);
      if (leadIdBanco) {
        io.to(`lead-${leadIdBanco}`).emit('mensagemRecebida', { ...payload, lead_id: leadIdBanco });
        console.log('🧪 [V2] emitido por telefone para sala:', `lead-${leadIdBanco}`);
      } else {
        console.warn('🧪 [V2] telefone não localizado no banco:', telefoneBusca);
      }
    } catch (err) {
      console.error('🧪 [V2] erro ao buscar lead por telefone:', err?.message || err);
    }
  });
};
