const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Get Post model
const Post = require("../../models/Post");

//Get Profile model
const Profile = require("../../models/Profile");

//Get User model
const User = require("../../models/User");

//Get validation
const validatePostInput = require("../../validation/post");

//@route    GET api/posts/test
//@desc     Tests posts route
//@access   Public
router.get("/test", (req, res) => res.json({ msg: "Post Works.." }));

//@route    POST  api/posts
//@desc     Create a post for a user
//@access   Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    newPost
      .save()
      .then(post => res.json(post))
      .catch(err => res.status(400).json(err));
  }
);

//@route    GET  api/posts
//@desc     Get al posts
//@access   Public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => {
      res.json(posts);
    })
    .catch(err => res.status(404).json({ nopostsfound: "No posts found" }));
});

//@route    GET  api/posts/:id
//@desc     Get post by post id
//@access   Public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(posts => {
      res.json(posts);
    })
    .catch(err =>
      res.status(404).json({ nopostfound: "No post found for this ID" })
    );
});

//@route    DELETE  api/posts/:id
//@desc     Delete post by post id
//@access   Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (post.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ notauthorized: "User not authorized" });
          }

          post.remove().then(() => res.json({ success: true }));
        })
        .catch(err => res.status(404).json({ postnotfound: "No post found!" }));
    });
  }
);

module.exports = router;
