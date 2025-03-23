const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { studentId, email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 8);
        
        const user = await User.create({
            studentId,
            email,
            password: hashedPassword,
            role
        });

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        console.log("-----");
        console.log(user);
        console.log(password);
        if (!(await bcrypt.compare(password, user.password))) {
            throw new Error('Invalid login credentials');
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;