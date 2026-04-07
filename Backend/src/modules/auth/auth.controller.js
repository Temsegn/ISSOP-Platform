const authService = require('./auth.service');

class AuthController {
  async register(req, res) {
    const { user, token } = await authService.register(req.body);

    res.status(201).json({
      status: 'success',
      data: { user, token },
    });
  }

  async login(req, res) {
    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);

    res.status(200).json({
      status: 'success',
      data: { user, token },
    });
  }

  async getMe(req, res) {
    res.status(200).json({
      status: 'success',
      data: { user: req.user },
    });
  }
}

module.exports = new AuthController();
