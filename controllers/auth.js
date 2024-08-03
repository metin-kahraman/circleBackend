const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');



const userService = require('../services/user');

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
const login = asyncHandler(async (req, res, next) => {

    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
        return next(new ErrorResponse('Please provide an email and password', 400));
    }

    const user = await userService.findByEmailAndPassword(email)

    if (!user) {
        return next(new ErrorResponse('Email is incorrect', 401));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return next(new ErrorResponse('Password is incorrect', 401));
    }

    sendTokenResponse(user, 200, res);
});

// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public
const register = asyncHandler(async (req, res, next) => {
    console.log(req.body);
    const { email, password, name} = req.body;

    // Validate email & password
    if (!email || !password || !name ) {
        return next(new ErrorResponse('Check required fields', 400));
    }

    // Is the user registered ?
    const user = await userService.findByEmail(email)

    if (user) {
        return next(new ErrorResponse('User already registered', 409));
    }
    
    //If the user is not registered, it creates a new user.
    const newUser = await userService.createUser(email, password, name)
    delete newUser.password
    
    res.status(201).json({
        success: true,
        data: newUser,
    });
});

// @desc      Log user logout / clear cookie
// @route     POST /api/v1/auth/logout
// @access    Public
const logout = asyncHandler(async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        data: {},
    });
});

// @desc      Get current logged in user
// @route     GET /api/v1/auth/me
// @access    Private
const getMe = asyncHandler(async (req, res, next) => {
    // user is already available in req due to the protect middleware
    const user = req.user;

    res.status(200).json({
        success: true,
        data: user,
    });
});

const getAllUsers = asyncHandler(async (req, res, next) => {
    // user is already available in req due to the protect middleware
    const user = req.user;

    if(user.isMC)
    {
        const data = await userService.getAllUsers();
        return res.status(200).json({
            success: true,
            data: data,
        });
    }
    res.status(200).json({
        success: false,
        data: data,
    });


});



// @desc      Update password
// @route     PUT /api/v1/auth/updatepassword
// @access    Private
const updatePassword = asyncHandler(async (req, res, next) => {

    const user = await userService.findByEmail(req.user.email)

    // Check current password
    const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
    
    if (!isMatch) {
        return next(new ErrorResponse('Not match the old password', 401));
    }

    let newPassword = req.body.newPassword;

    //Update New Password
    const newPasswordUser = await userService.updatePassword(user.email,newPassword)

    //sendTokenResponse(newPasswordUser , 200, res);
    
    res.status(200).json({
        success: true
    });

});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = jwt.sign({ email: user.email}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

    const options = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
        ),
        //httpOnly: true,
    };

    res.cookie('token', token)
    res.status(statusCode).json({
        success: true,
        token,
        me:{
            "email": user.email,
            "name": user.name
        }
    });

};

module.exports = {
    login,
    register,
    logout,
    getMe,
    updatePassword,
    getAllUsers
}