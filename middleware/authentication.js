module.exports = (req, res, next) => {
    if (!req.session.isAuthenticated) {
        req.session.redirectTo = req.url
        console.log(req.url);
        return res.redirect('/login');
    }
    next();
}