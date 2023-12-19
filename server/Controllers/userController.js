const express = require("express");
const UserModel = require("../modals/userModel")
const expressAsyncHandler = require("express-async-handler");
const generateToken = require("../Config/genereteToken");
const User = require("../modals/userModel");

const loginController = expressAsyncHandler(async (req, res) => {
    const { name, password } = req.body;
    const user = await UserModel.findOne({ name });
    // console.log(await user.matchPassword(password));
    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id)
        })
    }
    else {
        throw new Error("Invalid Username or Password");
    }
});

const registerController = expressAsyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        res.send(400);
        throw Error("All necessary input fields have not been filled")
    }

    const userExist = await UserModel.findOne({ email });
    if (userExist) {
        res.send(405);
        throw new Error("User already Exists");
    }

    const userNameExist = await UserModel.findOne({ name });
    if (userNameExist) {
        res.send(406);
        throw new Error("User already Exists");
    }

    const user = await UserModel.create({ name, email, password });
    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id)
        })
    }
    else {
        res.status(400);
        throw new Error("Registration Error");
    }
});

const fetchAllUsersController = expressAsyncHandler(async (req, res) => {
    const keyword = req.query.search
        ? {
            $or: [
                { name: { $regex: req.query.search, $options: "i" } },
                { email: { $regex: req.query.search, $options: "i" } },
            ],
        }
        : {};

    const users = await UserModel.find(keyword).find({
        _id: { $ne: req.user._id },
    });
    res.send(users);
});

module.exports = { loginController, registerController, fetchAllUsersController }