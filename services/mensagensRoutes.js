const express = require("express");
const router = express.Router();
const { salvarMensagem } = require("./mensagensController");

router.post("/inserir", async (req, res) => {
  try {
    const data = await salvarMensagem(req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("❌ [BACKEND] Erro ao salvar mensagem:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
