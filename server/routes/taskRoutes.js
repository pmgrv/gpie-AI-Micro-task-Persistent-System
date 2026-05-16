const express = require('express');
const router = express.Router();

const {
  getTasks,
  priceTask,
  submitWork,
  reviewTask,
  getStats
} = require('../controllers/taskController');

router.get('/list', getTasks);
router.post('/price', priceTask);
router.post('/submit', submitWork);
router.post('/review', reviewTask);
router.get('/stats', getStats);

module.exports = router;