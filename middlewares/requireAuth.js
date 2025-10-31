// autocrm-backend/middlewares/requireAuth.js
const { supabaseAnon } = require('../config/supabaseAnon.js');
const { supabaseAdmin } = require('../config/supabaseAdmin.js');

/**
 * Valida JWT com anon; busca perfil com Service Role (apenas do próprio id).
 * Retornos diagnósticos:
 * - 401: missing_token / invalid_or_expired_token
 * - 500: profile_query_failed
 * - 403: not_admin
 */
function requireAuth({ requireAdmin = true } = {}) {
  return async function (req, res, next) {
    try {
      const authHeader = req.headers.authorization || '';
      const parts = authHeader.split(' ');
      const token = parts.length === 2 ? parts[1] : null;

      if (!token) {
        return res.status(401).json({ error: 'missing_token' });
      }

      // 1) Valida o token e pega userId
      const { data: userData, error: userErr } = await supabaseAnon.auth.getUser(token);
      if (userErr || !userData?.user) {
        return res.status(401).json({ error: 'invalid_or_expired_token' });
      }
      const userId = userData.user.id;
      const email = userData.user.email || null;

      // 2) Busca perfil com Service Role, mas **somente** da própria linha
      const { data: perfil, error: perfilErr } = await supabaseAdmin
        .from('usuarios')
        .select('revenda_id, tipo')
        .eq('id', userId)
        .maybeSingle();

      if (perfilErr) {
        console.error('[requireAuth] profile_query_failed:', perfilErr);
        return res.status(500).json({ error: 'profile_query_failed', message: perfilErr.message });
      }

      if (!perfil) {
        // Mesmo com Service Role não achou linha — dados inconsistentes
        return res.status(403).json({ error: 'profile_not_found_admin_lookup', userId });
      }

      const revenda_id = perfil.revenda_id ?? null;
      const tipo = (perfil.tipo || '').toLowerCase();

      if (requireAdmin && tipo !== 'admin') {
        return res.status(403).json({ error: 'not_admin', tipo });
      }

      req.auth = { userId, email, revenda_id, tipo };
      return next();
    } catch (err) {
      console.error('[requireAuth] unexpected_error:', err);
      return res.status(500).json({ error: 'internal_auth_middleware_error' });
    }
  };
}

module.exports = { requireAuth };
