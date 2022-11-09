const express = require("express");
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

/* GET routes showing full list of books and the create new book form */

//redirect to list of books as home page
router.get("/", async (req, res) => {
  // const books = await Book.findAll();
  // res.json(books);
  res.redirect("/books");
});

//full list of books
router.get("/books", async (req, res) => {
  const books = await Book.findAll();
  res.render("index", { books });
});

/* Show and post new book to database */

router.get("/books/new", (req, res) => {
  const books = await Book.findAll();
  res.render("new-book", { books });
});

router.post("/books/new", asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect("/books/" + book.id);
  } catch (error) {
    if (error.name === "SequelizeValidationError") { // checking the error
      book = await Book.build(req.body);
      res.render("books/new", { book, errors: error.errors, title: "New book" })
  } else {
      throw error; // error caught in the asyncHandler's catch block
  }
}
}));
/* show and update book details by their id */

router.get(
  "/books/:id",
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      res.render("update-book", { book });
    } else {
      res.sendStatus(404);
    }
  })
);

router.post("/books/:id", asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if(book) {
      await book.update(req.body);
      res.redirect("/books/" + book.id); 
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id; // make sure correct book gets updated
      res.render("books/edit", { book, errors: error.errors, title: "Edit Book" })
    } else {
      throw error;
    }
  }
}));

router.post("/books/:id/delete", asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    await book.destroy();
    res.redirect("/books");
  } else {
    res.sendStatus(404);
  }
}));

module.exports = router;
