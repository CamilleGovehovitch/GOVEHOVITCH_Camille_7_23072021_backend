const express = require('express');

const router = express.Router();

const mysqlConnection = require('../connection/connection-db');

const topicsController = require('../controllers/topicsController');

router.get('/', topicsController.getTopics);
router.post('/', topicsController.createTopic);
router.put('/:id', topicsController.modifyTopic);
router.delete('/:id', topicsController.deleteTopic);

module.exports = router;
 