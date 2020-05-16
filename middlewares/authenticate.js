const {User} = require("../models/user")

const authenticate = (req, res, next) => {
    let token = req.header("x-auth");
    User.findUserByToken(token).then((user) => {
        if (!user) {
            return Promise.reject('user not found')
        } else {
            req.user = user;
            req.token = token;
            next();
        }
    }).catch((error) => {
        res.status(401).send(error);
    });
}

module.exports = authenticate;
