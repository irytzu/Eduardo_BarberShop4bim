exports.exigeLogin = (req, res, next) =>
  req.session.usuario ? next() : res.status(401).json({ erro: 'Faça login' });

exports.exigeAdmin = (req, res, next) =>
  req.session.usuario?.papel === 'admin'
    ? next()
    : res.status(403).json({ erro: 'Apenas administrador' });
