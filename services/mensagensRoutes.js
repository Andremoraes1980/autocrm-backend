const express = require("express");
const router = express.Router();
const { salvarMensagem } = require("../mensagensController");

router.post("/inserir", async (req, res) => {
  console.log("📨 [BACKEND DEBUG] → Chegou requisição em /api/mensagens/inserir");

  try {
    // Se o body veio vazio, tenta recuperar o corpo bruto manualmente
    let data = req.body;
    if (!data || Object.keys(data).length === 0) {
      let rawBody = "";
      req.on("data", (chunk) => {
        rawBody += chunk;
      });
      await new Promise((resolve) => req.on("end", resolve));

      console.log("🔹 rawBody recebido:", rawBody);

      try {
        data = JSON.parse(rawBody);
      } catch (err) {
        console.error("⚠️ Erro ao converter rawBody para JSON:", err.message);
      }
    }

    console.log("🧾 [BACKEND DEBUG] Dados finais a salvar:", data);

    if (!data || Object.keys(data).length === 0) {
      throw new Error("Corpo inválido na requisição (vazio após parse)");
    }

    const resultado = await salvarMensagem(data);
    return res.status(200).json({ success: true, data: resultado });
  } catch (error) {
    console.error("❌ [BACKEND DEBUG] Erro ao salvar mensagem:", error);
    return res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
