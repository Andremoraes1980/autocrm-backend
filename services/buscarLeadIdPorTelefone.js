const supabase = require('../config/supabase');

async function buscarLeadIdPorTelefone(telefone) {
  // Remove caracteres não numéricos
  const tel = telefone.replace(/\D/g, "");

  const { data, error } = await supabase
    .from('leads')
    .select('id')
    .ilike('telefone', `%${tel}%`)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  // Compatível com ambas as estruturas de retorno do Supabase
  const leadId = data?.id ?? data?.data?.id ?? null;

  return leadId;
}

module.exports = buscarLeadIdPorTelefone;