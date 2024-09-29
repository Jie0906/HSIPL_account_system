const errorHandler = (err, req, res, next) => {
  console.error(err.stack)

  const status = err.status || 500 
  const message = err.message || 'Internal Server Error' 

  switch (status) {
    case 400:
      res.status(400).json({
        error: {
          message: message || 'Bad Request',
          status: 400
        }
      })
      break
    case 401:
      res.status(401).json({
        error: {
          message: message || 'Unauthorized',
          status: 401
        }
      })
      break
    case 403:
      res.status(403).json({
        error: {
          message: message || 'Forbidden',
          status: 403
        }
      })
      break
    case 404:
      res.status(404).json({
        error: {
          message: message || 'Not Found',
          status: 404
        }
      })
      break
    case 409:
      res.status(409).json({
        error: {
          message: message || 'Conflict',
          status: 409
        }
      })
      break
    case 413:
      res.status(413).json({
        error: {
          message: message || 'Payload Too Large',
          status: 413
        }
      });
      break;
    case 415:
      res.status(415).json({
        error: {
          message: message || 'Unsupported Media Type',
          status: 415
        }
      });
      break;
    case 429:
      res.status(429).json({
        error: {
          message: message || 'Too Many Requests',
          status: 429
        }
      });
      break;
    case 500:
      res.status(500).json({
        error: {
          message: message || 'Internal Server Error',
          status: 500
        }
      });
      break;
    case 502:
      res.status(502).json({
        error: {
          message: message || 'Bad Gateway',
          status: 502
        }
      });
      break;
    case 503:
      res.status(503).json({
        error: {
          message: message || 'Service Unavailable',
          status: 503
        }
      });
      break;
    case 504:
      res.status(504).json({
        error: {
          message: message || 'Gateway Timeout',
          status: 504
        }
      });
      break;
    default:
      res.status(status).json({
        error: {
          message: message,
          status: status
        }
      })
      break
  }
}
const notFoundHandler = (req, res, next) => {
  const error = new Error('Not Found')
  error.status = 404
  next(error)
}

module.exports = { errorHandler, notFoundHandler }
