const express = require('express');
const router = express.Router();
const { Book } = require("../models");

const asyncHandler = (cb) => {
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch (error) {
      next(error);
    }
  }
};

/* GET home page. */
router.get('/', asyncHandler (async (req, res) => {
  const books = await Book.findAll();
  res.json(books);
}));

module.exports = router;
