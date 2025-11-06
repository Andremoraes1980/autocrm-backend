// backend/services/mensagensController.js
const supabase = require("../config/supabase");

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
  canal = "whatsapp",
  origem = "entrada",
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
      origem,
      telefone,
      body,
      vendedor_id,
      revenda_id,
      lead_id,
      nome_cliente,
    });

    // Verifica se o Supabase está inicializado
    if (!supabase) {
      console.error("❌ [BACKEND DEBUG] Supabase não inicializado!");
      throw new Error("Supabase client indefinido.");
    }

    // Faz o insert
    const { data, error } = await supabase
      .from("mensagens")
      .insert([
        {
          canal: canal || "whatsapp",
          direcao: origem || "entrada",
          telefone_cliente: telefone,
          mensagem: body,
          vendedor_id: vendedor_id || null,
          revenda_id: revenda_id || null,
          lead_id: lead_id || null,
          nome_cliente: nome_cliente || telefone,
          origem: "whatsapp",
          status_leitura: "recebida",
        },
      ])
      .select()
      .single();

    // Verifica retorno
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
