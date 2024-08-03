var express = require('express');
var router = express.Router();

/* GET users listing. */
const { login, register, logout, getMe, updatePassword ,getAllUsers } = require('../controllers/auth')
const { protect } = require('../middleware/auth')
router.route('/login').post(login);
router.route('/register').post(register);
router.route('/me').post(protect, getMe);
router.route('/getallusers').get(protect, getAllUsers);

module.exports = router;

