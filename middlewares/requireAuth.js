// autocrm-backend/middlewares/requireAuth.js
import { supabaseAnon } from '../config/supabaseAnon.js';

/**
 * Lê Bearer token, valida com Supabase e carrega revenda/tipo do usuário.
 * Coloca os dados em req.auth = { userId, email, revenda_id, tipo }
 * Por padrão, exige tipo "admin".
 */
export function requireAuth({ requireAdmin = true } = {}) {
  return async function (req, res, next) {
    try {
      const authHeader = req.headers.authorization || '';
      const [, token] = authHeader.split(' '); // "Bearer <token>"

      if (!token) {
        return res.status(401).json({ error: 'Missing Authorization Bearer token' });
      }

      // Valida token e obtém user
      const { data: userData, error: userErr } = await supabaseAnon.auth.getUser(token);
      if (userErr || !userData?.user) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      const userId = userData.user.id;
      const email = userData.user.email || null;

      // Carrega revenda_id e tipo na tabela "usuarios"
      const { data: perfil, error: perfilErr } = await supabaseAnon
        .from('usuarios')
        .select('revenda_id, tipo')
        .eq('id', userId)
        .maybeSingle();

      if (perfilErr) {
        return res.status(500).json({ error: `Failed to load user profile: ${perfilErr.message}` });
      }

      const revenda_id = perfil?.revenda_id ?? null;
      const tipo = (perfil?.tipo || '').toLowerCase();

      if (requireAdmin && tipo !== 'admin') {
        return res.status(403).json({ error: 'Only admin users can perform this action.' });
      }

      req.auth = { userId, email, revenda_id, tipo };
      return next();
    } catch (err) {
      console.error('[requireAuth] Unexpected error:', err);
      return res.status(500).json({ error: 'Internal auth middleware error' });
    }
  };
}
