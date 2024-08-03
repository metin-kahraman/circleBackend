const {
    PrismaClient
} = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

const findByEmailAndPassword = async (email, password) => {
    const user = await prisma.user.findFirst({
        where: {
            email,
            password
        },
    })
    if (user) {
        return user;
    }
    //return updateLastLogin(user.email)
}

const findByEmail = async (email, username, phoneNumber) => {
    const user = await prisma.user.findFirst({
        where: {
            OR: [{
                username
            }, {
                email
            }, {
                phoneNumber
            }]
        },
    });

    return user
}


const getAllUsers = async () => {
    const users = await prisma.user.findMany()

    return users
}

const checkToken = async (email, lastLogin) => {
    const user = await prisma.user.findFirst({
        where: {
            email,
            lastLogin
        },
    })

    return user
}

/*const checkToken = async (email) => {
    const user = await prisma.user.findFirst({
        where: { email ,isVerified:true},
    })

    return user
}*/



const createUser = async (email, password, name) => {
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    const user = await prisma.user.create({
        data: {
            email: email,
            password: password,
            name: name
        }
    })
    //const user = await prisma.user.create({ data: { username, email, password, lastLogin: new Date() } })
    return user
}

const updatePassword = async (email, password) => {
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);

    const user = await prisma.user.update({
        where: {
            email
        },
        data: {
            password
        }
    })
    return user
}

async function updateLastLogin(email) {
    lastLogin = new Date();
    const user = await prisma.user.update({
        where: {
            email
        },
        data: {
            lastLogin: lastLogin
        }
    })
    return user;
}

module.exports = {
    findByEmail,
    findByEmailAndPassword,
    createUser,
    updatePassword,
    checkToken,
    getAllUsers
}