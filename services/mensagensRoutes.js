const express = require("express");
const router = express.Router();
const { salvarMensagem } = require("../services/mensagensController");

// 🔹 Rota principal para salvar mensagens vindas do provider
router.post("/inserir", async (req, res) => {
  try {
    console.log("📨 [BACKEND DEBUG] → Chegou requisição em /api/mensagens/inserir");
console.log("🔹 Método:", req.method);
console.log("🔹 URL:", req.originalUrl);
console.log("🔹 Headers:", req.headers);

try {
  console.log("🔹 Tipo do body:", typeof req.body);
  console.log("🔹 Conteúdo do req.body:", req.body);
} catch (err) {
  console.error("⚠️ Erro ao imprimir req.body:", err);
}

let rawBody = "";
req.on("data", (chunk) => {
  rawBody += chunk;
});
req.on("end", () => {
  console.log("🔹 Conteúdo bruto recebido (rawBody):", rawBody);
});


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
