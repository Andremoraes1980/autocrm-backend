const express = require("express");
const router = express.Router();
const { salvarMensagem } = require("../services/mensagensController");

// 🔹 Rota principal para salvar mensagens vindas do provider
router.post("/inserir", async (req, res) => {
  try {
    console.log("📨 [BACKEND DEBUG] Requisição recebida em /api/mensagens/inserir");
    console.log("🧾 [BACKEND DEBUG] Corpo recebido:", req.body);

    // Validação mínima — para evitar undefined
    if (!req.body || typeof req.body !== "object") {
      console.error("⚠️ [BACKEND DEBUG] Corpo inválido na requisição:", req.body);
      return res.status(400).json({ success: false, error: "Corpo inválido na requisição" });
    }

    // Chama o controller
    const result = await salvarMensagem(req.body);

    if (result.success === false) {
      console.error("❌ [BACKEND DEBUG] Erro no salvarMensagem:", result.error);
      return res.status(500).json({ success: false, error: result.error });
    }

    console.log("✅ [BACKEND DEBUG] Mensagem salva com sucesso:", result.data);
    res.status(200).json({ success: true, data: result.data });
  } catch (error) {
    console.error("💥 [BACKEND DEBUG] Erro inesperado ao salvar mensagem:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
