const createError = require("http-errors");
const express = require("express");
const router = express.Router();
const { Book } = require("../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const asyncHandler = (cb) => {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

/* GET routes showing full list of books and the create new book form */

//redirect to list of books as home page
router.get("/", async (req, res) => {
  res.redirect("/books/?page=1&limit=3");
});

//full list of books
router.get("/books", async (req, res) => {
  const books = await Book.findAll();
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const bookResults = {};

      bookResults.next = {
        page: page + 1,
        limit: limit,
      }
      bookResults.prev = {
        page: page - 1,
        limit: limit,
      }

    bookResults.results = books.slice(startIndex, endIndex);

    res.render("index", { bookResults });

});

//search
router.post("/books", async (req, res) => {
  let term = req.query.term;
  const books = await Book.findAll({
    where: {
      [Op.or]: {
        title: {
          [Op.like]: `%${term}%`,
        },
        author: {
          [Op.like]: `%${term}%`,
        },
        genre: {
          [Op.like]: `%${term}%`,
        },
        year: {
          [Op.like]: `%${term}%`,
        },
      },
    },
  });

  res.render("search", { books });
});

/* Show and post new book to database */

router.get("/books/new", async (req, res) => {
  const books = await Book.findAll();
  res.render("new-book", { books, title: "Books" });
});

router.post(
  "/books/new",
  asyncHandler(async (req, res) => {
    let book;
    try {
      book = await Book.create(req.body);
      res.redirect("/books");
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        // checking the error
        book = await Book.build(req.body);
        res.render("new-book", { book, errors: error.errors });
      } else {
        throw error; // error caught in the asyncHandler's catch block
      }
    }
  })
);
/* show and update book details by their id */

router.get(
  "/books/:id",
  asyncHandler(async (req, res, next) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      res.render("update-book", { book });
    } else {
      next(createError(404));
    }
  })
);

router.post(
  "/books/:id",
  asyncHandler(async (req, res) => {
    let book;
    try {
      book = await Book.findByPk(req.params.id);
      if (book) {
        await book.update(req.body);
        res.redirect("/books");
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        book = await Book.build(req.body);
        book.id = req.params.id; // make sure correct book gets updated
        res.render("update-book", { book, errors: error.errors });
      } else {
        throw error;
      }
    }
  })
);

router.post(
  "/books/:id/delete",
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      await book.destroy();
      res.redirect("/books");
    } else {
      res.sendStatus(404);
    }
  })
);

module.exports = router;
