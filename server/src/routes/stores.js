const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, checkRole } = require('../middleware/auth');
const Store = require('../models/Store');
const Rating = require('../models/Rating');
const User = require('../models/User');
const { Op } = require('sequelize');

const router = express.Router();

router.post('/',
  [
    auth,
    checkRole(['ADMIN']),
    body('name').isLength({ min: 1, max: 100 }),
    body('email').isEmail(),
    body('address').isLength({ max: 400 }),
    body('ownerId').isUUID()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, address, ownerId } = req.body;

      const owner = await User.findByPk(ownerId);
      if (!owner || owner.role !== 'STORE_OWNER') {
        return res.status(400).json({ message: 'Invalid store owner' });
      }

      const store = await Store.create({
        name,
        email,
        address,
        ownerId
      });

      res.status(201).json(store);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.get('/',
  auth,
  async (req, res) => {
    try {
      const { name, address } = req.query;
      const where = {};

      if (name) where.name = { [Op.iLike]: `%${name}%` };
      if (address) where.address = { [Op.iLike]: `%${address}%` };

      const stores = await Store.findAll({
        where,
        include: [
          {
            model: Rating,
            where: { userId: req.user.id },
            required: false,
            attributes: ['rating']
          }
        ]
      });

      res.json(stores);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.get('/:id/ratings',
  [auth, checkRole(['STORE_OWNER'])],
  async (req, res) => {
    try {
      const store = await Store.findByPk(req.params.id);
      
      if (!store || store.ownerId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const ratings = await Rating.findAll({
        where: { storeId: req.params.id },
        include: [
          {
            model: User,
            attributes: ['name', 'email']
          }
        ]
      });

      res.json(ratings);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router; 