const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, checkRole } = require('../middleware/auth');
const User = require('../models/User');
const Store = require('../models/Store');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const Rating = require('../models/Rating');

const router = express.Router();

router.post('/',
  [
    auth,
    checkRole(['ADMIN']),
    body('name').isLength({ min: 20, max: 60 }),
    body('email').isEmail(),
    body('password').isLength({ min: 8, max: 16 })
      .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/),
    body('address').isLength({ max: 400 }),
    body('role').isIn(['ADMIN', 'USER', 'STORE_OWNER'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password, address, role } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        address,
        role
      });

      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.get('/',
  [auth, checkRole(['ADMIN'])],
  async (req, res) => {
    try {
      const { name, email, address, role } = req.query;
      const where = {};

      if (name) where.name = { [Op.iLike]: `%${name}%` };
      if (email) where.email = { [Op.iLike]: `%${email}%` };
      if (address) where.address = { [Op.iLike]: `%${address}%` };
      if (role) where.role = role;

      const users = await User.findAll({
        where,
        attributes: ['id', 'name', 'email', 'address', 'role'],
        include: [
          {
            model: Store,
            as: 'ownedStore',
            attributes: ['averageRating'],
            required: false
          }
        ]
      });

      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.get('/stats',
  [auth, checkRole(['ADMIN'])],
  async (req, res) => {
    try {
      const totalUsers = await User.count();
      const totalStores = await Store.count();
      const totalRatings = await Rating.count();

      res.json({
        totalUsers,
        totalStores,
        totalRatings
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router; 