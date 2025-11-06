// backend/services/mensagensController.js
const supabase = require("../config/supabase");

// === Função de sanitização profissional ===
// Mantém apenas os campos válidos da tabela mensagens
function sanitizeMensagem(dados) {
    const permitidos = [
      "lead_id",
      "mensagem",
      "canal",
      "tipo",
      "direcao",
      "telefone_cliente",
      "vendedor_id",
      "revenda_id",
      "remetente",
      "remetente_id",
      "arquivo_url",
      "nome_arquivo",
      "arquivos",
    ];
  
    const limpo = {};
    for (const k of permitidos) {
      if (dados[k] !== undefined) limpo[k] = dados[k];
    }
    return limpo;
  }
  

/**
 * Salva uma nova mensagem no Supabase.
 * Aceita mensagens com ou sem lead vinculado (lead_id pode ser null).
 * 
 * Fluxo:
 * 1️⃣ Recebe os dados do provider (whatsapp)
 * 2️⃣ Salva na tabela "mensagens"
 * 3️⃣ Retorna a mensagem salva (ou erro)
 */

async function salvarMensagem({
    canal = "WhatsApp Cockpit",
    telefone,
    body,
    vendedor_id = null,
    revenda_id = null,
    lead_id = null,
    nome_cliente = null,
  }) {
    try {
      console.log("💾 [BACKEND DEBUG] Tentando salvar mensagem no Supabase...");
      console.log("🧾 Dados recebidos:", {
        canal,
        telefone,
        body,
        vendedor_id,
        revenda_id,
        lead_id,
        nome_cliente,
      });
  
      if (!supabase) {
        console.error("❌ [BACKEND DEBUG] Supabase não inicializado!");
        throw new Error("Supabase client indefinido.");
      }
  
      // === Preparar dados ===
      const dados = {
        canal,
        direcao: "entrada",
        telefone_cliente: telefone,
        mensagem: body,
        vendedor_id,
        revenda_id,
        lead_id,
        remetente: telefone,
        remetente_nome: nome_cliente || telefone,
        lida: false,
        tipo: "texto",
      };
  
      // === Sanitização ===
      const camposPermitidos = [
        "canal",
        "direcao",
        "telefone_cliente",
        "mensagem",
        "vendedor_id",
        "revenda_id",
        "lead_id",
        "remetente",
        "remetente_nome",
        "lida",
        "tipo",
      ];
  
      const dadosSanitizados = {};
      for (const campo of camposPermitidos) {
        if (dados[campo] !== undefined) dadosSanitizados[campo] = dados[campo];
      }
  
      console.log("🧹 [BACKEND DEBUG] Dados limpos antes de salvar:", dadosSanitizados);
  
      // === Inserção no Supabase ===
      const { data, error } = await supabase
        .from("mensagens")
        .insert([dadosSanitizados])
        .select()
        .single();
  
      if (error) {
        console.error("❌ [BACKEND DEBUG] Erro Supabase insert:", error);
        return { success: false, error };
      }
  
      console.log("✅ [BACKEND DEBUG] Mensagem salva com sucesso:", data);
      return { success: true, data };
  
    } catch (err) {
      console.error("💥 [BACKEND DEBUG] Exceção inesperada:", err);
      return { success: false, error: err.message };
    }
  }
  
  

/**
 * Retorna mensagens por telefone (opcional)
 */
async function buscarMensagensPorTelefone(telefone) {
  console.log("🔎 [BACKEND DEBUG] Buscando mensagens para:", telefone);
  const { data, error } = await supabase
    .from("mensagens")
    .select("*")
    .eq("telefone_cliente", telefone)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ [BACKEND DEBUG] Erro ao buscar mensagens:", error);
    return { success: false, error };
  }

  return { success: true, data };
}

module.exports = {
  salvarMensagem,
  buscarMensagensPorTelefone,
};
