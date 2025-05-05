const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const Rating = require('../models/Rating');
const Store = require('../models/Store');
const { sequelize } = require('../config/database');

const router = express.Router();

router.post('/',
  [
    auth,
    body('storeId').isUUID(),
    body('rating').isInt({ min: 1, max: 5 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { storeId, rating } = req.body;
      const userId = req.user.id;

      const store = await Store.findByPk(storeId);
      if (!store) {
        return res.status(404).json({ message: 'Store not found' });
      }

      const transaction = await sequelize.transaction();

      try {
        const [userRating, created] = await Rating.findOrCreate({
          where: { userId, storeId },
          defaults: { rating },
          transaction
        });

        if (!created) {
          await userRating.update({ rating }, { transaction });
        }

        const averageRating = await Rating.findOne({
          where: { storeId },
          attributes: [
            [sequelize.fn('AVG', sequelize.col('rating')), 'average']
          ],
          transaction
        });

        await store.update(
          { averageRating: averageRating.getDataValue('average') },
          { transaction }
        );

        await transaction.commit();
        res.json({ message: 'Rating submitted successfully' });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.put('/:storeId',
  [
    auth,
    body('rating').isInt({ min: 1, max: 5 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { storeId } = req.params;
      const { rating } = req.body;
      const userId = req.user.id;

      const transaction = await sequelize.transaction();

      try {
        const userRating = await Rating.findOne({
          where: { userId, storeId },
          transaction
        });

        if (!userRating) {
          await transaction.rollback();
          return res.status(404).json({ message: 'Rating not found' });
        }

        await userRating.update({ rating }, { transaction });

        const averageRating = await Rating.findOne({
          where: { storeId },
          attributes: [
            [sequelize.fn('AVG', sequelize.col('rating')), 'average']
          ],
          transaction
        });

        await Store.update(
          { averageRating: averageRating.getDataValue('average') },
          { where: { id: storeId }, transaction }
        );

        await transaction.commit();
        res.json({ message: 'Rating updated successfully' });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router; 