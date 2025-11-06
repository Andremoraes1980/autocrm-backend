const supabase = require("../config/supabase");

async function salvarMensagem({ canal, origem, from, body, telefone, vendedor_id, revenda_id, nome_cliente }) {
  console.log("💾 [BACKEND] Salvando mensagem recebida via", canal);

  const { data, error } = await supabase
    .from("mensagens")
    .insert([
      {
        canal,
        direcao: origem,
        telefone_cliente: telefone,
        mensagem: body,
        vendedor_id,
        revenda_id,
        nome_cliente,
        origem: "whatsapp",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

module.exports = { salvarMensagem };

