const mongoose = require("mongoose");
const Schema = mongoose.Schema
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const _ = require("lodash")
const SECRET_KEY = '497DCF8A12BDFC37F2B2056FE8CE1FD0A7FEF52EE83DEC10F307015226256D44';

const UserSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        minlength: 4
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        required: true,
        minlength: 6
    },
    password: {
        type: String,
        trim: true,
        required: true,
        minlength: 8
    },
    tokens: [{
        access: {
            type: String,
            required: true,
        },
        token: {
            type: String,
            required: true
        }
    }]
})

UserSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    return _.pick(userObject, ["_id", "email", "name"]);
}

UserSchema.methods.generateAuthToken = function () {
    const user = this;
    const access = "auth"
    const token = jwt.sign({
        _id: user._id,
        access
    }, SECRET_KEY).toString()
    user.tokens.push({access, token});
    return user.save().then(() => {
        return token
    })
}

UserSchema.methods.removeToken = function (token) {
    const user = this;
    return user.update({
        $pull: {
            tokens: {token}
        }
    })
}

UserSchema.pre("save", function (next) {
    const user = this;
    if (user.isModified("password")) {
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err);
                user.password = hash;
                next();
            })
        })
    } else {
        next()
    }
})

UserSchema.statics.findUserByCredentials = function (email, password) {
    const User = this;
    return User.findOne({email}).then((user) => {
        if (!user) {
            Promise.reject();
        } else {
            return new Promise((resolve, reject) => {
                bcrypt.compare(password, user.password, (err, res) => {
                    if (res) {
                        resolve(user);
                    } else {

                        reject();
                    }
                })
            })
        }
    })
}

UserSchema.statics.findUserByToken = function (token) {
    const User = this;
    let decoded;
    try {
        decoded = jwt.verify(token, SECRET_KEY)
    } catch (e) {
        return Promise.reject(e);
    }
    return User.findOne({
        "_id": decoded._id,
        "tokens.token": token,
        "tokens.access": "auth",
    })
}

const User = mongoose.model('User', UserSchema, 'users')

module.exports = {User};
