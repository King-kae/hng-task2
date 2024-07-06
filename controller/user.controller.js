const User = require("../models/userModel.js");
const jwt = require("jsonwebtoken")
const Organisation = require('../models/orgModel.js')
const bcrypt = require("bcryptjs")
const { v4: uuidv4 } = require('uuid');

const register = async (req, res) => {

    const { firstName, lastName, email, password } = req.body
    // Validation

    try {
        if (!firstName || !lastName || !email || !password) {
            return res.status(422).json({
                errors: [
                    { field: "firstName", message: "First name is required" },
                    { field: "lastName", message: "Last name is required" },
                    { field: "email", message: "Email is required" },
                    { field: "password", message: "Password is required" }
                ]
            });
        }
        

        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            const errors = [];
            errors.push({
                field: 'email',
                message: 'Email must be unique'
            });
            return res.status(422).json({ errors });
        }

        const userId = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new User({
            userId,
            firstName,
            lastName,
            email,
            password: hashedPassword
        })


        const orgId = uuidv4()
        const orgName = `${firstName}'s Organisation`;
        const newOrg = new Organisation({ orgId, name: orgName });

        newUser.organisations.push(newOrg._id);
        newUser.createdOrganisations.push(newOrg._id)

        await newOrg.save();
        await newUser.save()
        const token = jwt.sign({ userId: newUser.userId }, process.env.JWT_SECRET, { expiresIn: '1h' })
        res.status(201).send({
            status: 'success',
            message: "Registration successful",
            data: {
                accessToken: `${token}`,
                user: {
                    userId: newUser.userId,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    email: newUser.email
                }
            }
        })
    } catch (err) {
        res.send({
            status: "Bad request",
            message: "Registration unsuccessful",
            statusCde: 400,
            data: err.message
        })
    }
}

const login = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(422).json({
            errors: [
                { field: "email", message: "Email is required" },
                { field: "password", message: "Password is required" }
            ]
        })
    }

    try {

        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({
                status: "Bad request",
                message: "Authentication failed, user not found",
                statusCode: 401
            })
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if (!isPasswordCorrect) {
            return res.status(400).json({
                status: "Bad request",
                message: "Authentication failed, password is incorrect",
                statusCode: 401
            })
        }

        const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' })
        res.status(200).send({
            status: 'success',
            message: "Login successful",
            data: {
                accessToken: `${token}`,
                user: {
                    userId: user.userId,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email
                }
            }
        })

    } catch (err) {
        res.status(422).json({
            status: "Bad request",
            message: `Authentication failed: ${err.message}`,
            statusCode: 401
        })
    }
}

const getUserById = async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await User.findOne({ userId })
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        res.status(200).send({
            status: 'success',
            message: "User found",
            data: {
                user: {
                    userId: user.userId,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone
                }
            }
        })
    } catch (err) {
        res.status(500).json({
            message: "Internal server error",
            data: err.message
        })

    }
}

module.exports = {
    register,
    login,
    getUserById
}