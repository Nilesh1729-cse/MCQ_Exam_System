/**
 * Single place that turns thrown/next(err) errors into JSON responses.
 * Mounted last in server.js so every route benefits automatically.
 */
function notFoundHandler(req, res) {
  res.status(404).json({ message: `No route for ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'That record already exists.' });
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Something went wrong on our end.' : err.message;
  res.status(status).json({ message });
}

module.exports = { notFoundHandler, errorHandler };
