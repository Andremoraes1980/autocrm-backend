// Arquivo: backend/connections/socketFrontend.js

const entrarNaSala = require('../listeners/frontend/entrarNaSala');


module.exports = function socketFrontend(io, socketProvider, ultimoQrCodeDataUrlRef) {
  io.on('connection', (socket) => {
    console.log("⚡ [SOCKET FRONTEND] Nova conexão do front:", socket.id);
  
    // 🔍 Loga qualquer evento que o front envie
    socket.onAny((event, ...args) => {
      console.log("📩 [DEBUG FRONT EVENTO]", event, args);
    });
  
    // ✅ Mostra que o backend está pronto para ouvir entrarNaSala
    console.log("📡 [SOCKET FRONTEND] Aguardando evento 'entrarNaSala'...");
  
    // Mantém o listener ativo
    entrarNaSala(socket);
  
  
  
  
  
        // ======= TESTE REAL‑TIME =========
        // setTimeout(() => {
        //   const pingMsg = {
        //     lead_id,
        //     mensagem: { id: 'ping', conteudo: '🚀 Teste real‑time!' }
        //   };
        //   io.to(room).emit('mensagemRecebida', pingMsg);
        //   console.log('✅ [TESTE] servidor emitiu mensagemRecebida de teste para', room);
        // }, 2000);
        // ==================================
      
  
      socket.on('gerarQRCode', () => {
        console.log('🔄 Pedido de gerarQRCode recebido do frontend, repassando para provider...');
        socketProvider.emit('gerarQRCode');
  
        if (ultimoQrCodeDataUrlRef.value) {
          socket.emit('qrCode', { qr: ultimoQrCodeDataUrlRef.value });
          console.log('♻️ Reenviei último QR pro frontend:', socket.id);
        }
      });
  
      socket.on('disconnect', () => {
        console.log(`❌ Cliente desconectado: ${socket.id}`);
      });
    });
  };
  