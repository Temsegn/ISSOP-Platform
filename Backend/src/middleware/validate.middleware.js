const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation Error',
      errors: error.errors.map(err => ({
        field: err.path[1], // Assuming it's in body, query or params
        message: err.message,
      })),
    });
  }
};

module.exports = validate;
