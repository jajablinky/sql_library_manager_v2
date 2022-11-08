const express = require('express');
const router = express.Router();
const { Book } = require("../models");

/* GET home page. */
router.get('/', async (req, res, next) => {
  // res.render('index', { title: 'Express' });
  const books = await Book.findAll();
  res.json(books)
});

module.exports = router;
