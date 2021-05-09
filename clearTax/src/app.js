require('dotenv').config();
const express = require('express')
const app = express()
const hbs = require("hbs")
const jwt = require('jsonwebtoken')
const path = require('path')
const cookieParser = require('cookie-parser')
const auth = require('./middleware/auth')

require("./db/conn")

const bcrypt = require('bcryptjs')
const Registers = require('./models/registerUsers')
const { json } = require('express');
const { Script } = require('vm');

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Server running at Port ${port}`)
})

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views")
const partial_path = path.join(__dirname, "../templates/partials")

app.use(express.static(static_path))

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partial_path);

// console.log(process.env.SECRET_KEY);
app.get('/', (req, res) => {
    res.render("index")

})

app.get('/address', (req, res) => {
    res.render("address")
})

app.get('/getstarted1', auth, (req, res) => {
    res.render("getstarted")
})

app.get('/getstarted2', auth, (req, res) => {
    res.render("getstarted")
})

app.get('/login', (req, res) => {
    res.render("login")
})

app.get('/registration', (req, res) => {
    res.render("registration")
})

app.get('/logout', auth, async (req, res) => {
    try {
        // console.log(req.verifyUser);
        req.userDetails.tokens = req.userDetails.tokens.filter((currentElement) => {
            return currentElement.token != req.token;
        })

        res.clearCookie("jwt");
        console.log("Logout Successfully");
        await req.userDetails.save();
        res.render("login", {
            invalid: "You have successfully Logged Out"
        });
    } catch (error) {
        res.status(500).send(error);
    }

})
app.post('/getstarted1', async (req, res) => {
    try {
        const email = req.body.emailid
        const password = req.body.password
        const useremail = await Registers.findOne({ email: email })
        const isMatch = await bcrypt.compare(password, useremail.password);
        const token = await useremail.generateAuthToken();
        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 300000),
            httpOnly: true
        });

        if (isMatch) {
            res.status(201).render("getstarted")
        }
        else {
            res.render("login", {
                invalid: "The username or password you entered is incorrect",
            })
        }

    } catch (error) {
        res.render("login", {
            invalid: "Some Error Occured..",
        })
    }

})

app.post("/getstarted2", async (req, res) => {
    try {
        if (req.body.pwd1 === req.body.pwd2) {
            const users = new Registers({
                firstname: req.body.name,
                phone: req.body.phone,
                email: req.body.email,
                password: req.body.pwd1,
                confirm: req.body.pwd2
            })
            console.log("password match");
            const userphone = await Registers.findOne({ phone: users.phone })
            const useremail = await Registers.findOne({ email: users.email })
            console.log(userphone);
            console.log(useremail);
            if (userphone === null && useremail === null) {
                const token = await users.generateAuthToken();
                res.cookie("jwt", token, {
                    expires: new Date(Date.now() + 300000),
                    httpOnly: true
                });
                console.log("new user");
                const registered = await users.save();
                res.status(201).render("getstarted");
            }
            else if (userphone != null) {
                res.render('registration', {
                    match_phone: "The entered Phone is already registered"
                })
            }
            else if (useremail != null) {
                res.render('registration', {
                    match_email: "The entered Email is already registered"
                })
            }
        }

        else {
            res.render('registration', {
                confirm_pwd: "Password & Confirm Password does not matched"
            })
        }
    }
    catch (error) {
        res.status(400).send("Some Error Occurred..")
    }

})

app.get('/permanent', (req, res) => {
    res.render("permanent")
})

app.get('/withoutForm16', (req, res) => {
    res.render("WithoutForm16")
})

app.get("*", (req, res) => {
    res.render('404')
})