// autocrm-backend/services/adminUsers.js
import express from 'express';
import { requireAuth } from '../middlewares/requireAuth.js';
import { supabaseAdmin } from '../config/supabaseAdmin.js';

const router = express.Router();

/**
 * POST /admin/users
 * Body esperado:
 * {
 *   nome: string,
 *   email: string,
 *   senha: string,
 *   telefone?: string,
 *   tipo?: 'vendedor' | 'gerente' | 'admin',
 *   ativo?: boolean
 * }
 * - Usa req.auth.revenda_id do admin autenticado.
 * - Cria usuário no Auth (Service Role) e upsert na tabela `usuarios`.
 * - NÃO retorna session/token.
 */
router.post('/', requireAuth({ requireAdmin: true }), async (req, res) => {
  try {
    const { nome, email, senha, telefone = '', tipo = 'vendedor', ativo = true } = req.body || {};
    const revenda_id = req?.auth?.revenda_id ?? null;

    if (!revenda_id) {
      return res.status(400).json({ error: 'Admin sem revenda vinculada. Não foi possível determinar revenda_id.' });
    }
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Campos obrigatórios: nome, email, senha.' });
    }

    // 1) Cria usuário no AUTH (Service Role). NÃO retorna session.
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true, // marque como confirmado (ajuste se preferir convite)
    });

    if (createErr) {
      // Possível conflito de e-mail já existente
      return res.status(409).json({ error: `Auth createUser falhou: ${createErr.message}` });
    }

    const newUserId = created?.user?.id;
    if (!newUserId) {
      return res.status(500).json({ error: 'Auth não retornou o ID do novo usuário.' });
    }

    // 2) Upsert na tabela `usuarios` com o mesmo ID do Auth
    const perfil = {
      id: newUserId,
      nome: String(nome).trim(),
      email: String(email).trim().toLowerCase(),
      telefone: String(telefone || '').trim(),
      tipo: String(tipo || 'vendedor').toLowerCase(),
      ativo: Boolean(ativo),
      revenda_id,
    };

    const { error: perfilErr } = await supabaseAdmin
      .from('usuarios')
      .upsert(perfil, { onConflict: 'id' });

    if (perfilErr) {
      // rollback (opcional): deletar usuário do auth se o perfil falhar
      // await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return res.status(500).json({ error: `Falha ao salvar perfil: ${perfilErr.message}` });
    }

    return res.status(201).json({ ok: true, user_id: newUserId });
  } catch (err) {
    console.error('[POST /admin/users] erro inesperado:', err);
    return res.status(500).json({ error: 'Erro interno ao criar usuário.' });
  }
});

export default router;
