const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userRegistration = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true,
        unique: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true,
    },
    confirm: {
        type: String,
        required: true,
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }]
})

userRegistration.methods.generateAuthToken = async function () {
    try {
        const token = jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY)
        this.tokens = this.tokens.concat({ token: token })
        await this.save();
        return token
    } catch (error) {
        res.send("the error part")
        console.log("error part");
    }
}

userRegistration.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
        this.confirm = await bcrypt.hash(this.password, 10);
    }
    next();
})

const Register = new mongoose.model("User", userRegistration)
module.exports = Register;