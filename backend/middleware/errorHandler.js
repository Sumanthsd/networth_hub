export function errorHandler(err, req, res, next) {
  // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  if (status >= 500) {
    console.error(err);
  } else {
    console.warn(`${req.method} ${req.originalUrl} -> ${status}: ${err.message}`);
  }
  const message =
    status === 500 ? 'Internal server error' : err.message || 'Error';
  res.status(status).json({ message });
}

