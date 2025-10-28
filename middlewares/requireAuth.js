// autocrm-backend/middlewares/requireAuth.js
const { supabaseAnon } = require('../config/supabaseAnon.js');

/**
 * Lê Bearer token, valida no Supabase e carrega revenda/tipo do usuário na tabela "usuarios".
 * Coloca em req.auth = { userId, email, revenda_id, tipo }
 */
function requireAuth({ requireAdmin = true } = {}) {
  return async function (req, res, next) {
    try {
      const authHeader = req.headers.authorization || '';
      const parts = authHeader.split(' ');
      const token = parts.length === 2 ? parts[1] : null;

      if (!token) {
        return res.status(401).json({ error: 'Missing Authorization Bearer token' });
      }

      const { data: userData, error: userErr } = await supabaseAnon.auth.getUser(token);
      if (userErr || !userData?.user) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      const userId = userData.user.id;
      const email = userData.user.email || null;

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

module.exports = { requireAuth };
