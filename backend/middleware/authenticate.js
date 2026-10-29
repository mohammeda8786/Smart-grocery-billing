const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authorization = req.get('authorization') || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload || typeof payload === 'string' || typeof payload.sub !== 'string') {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    req.userId = payload.sub;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }
};

module.exports = authenticate;
