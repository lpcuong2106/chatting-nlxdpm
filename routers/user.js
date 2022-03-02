const express = require('express')

const userController = require('../controllers/user.controller')

const router = express.Router()

//get user 
router.get('/', userController.search);

//searchid
router.get('/:id', userController.searchById);

// template
router.put('/template', userController.setTemplate);
router.get('/template/:userId', userController.getTemplate);


//search user
// router.get('/search-user/:email', userController.searchUser);//search

// put user 
// router.put('/:id', userController.update);

module.exports = router