/**
 * Authentication Middleware
 * Checks if user is logged in via session
 */

function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'Authentication required' });
    }
}

function optionalAuth(req, res, next) {
    // Just pass through, session data will be available if logged in
    next();
}

module.exports = { requireAuth, optionalAuth };
