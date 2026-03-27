export function errorHandler(err, req, res, next) {
  // eslint-disable-line no-unused-vars
  console.error(err);
  const status = err.status || 500;
  const message =
    status === 500 ? 'Internal server error' : err.message || 'Error';
  res.status(status).json({ message });
}

