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
// router.get("/test", (req, res) => res.json({ msg: "Post Works.." }));

//@route    POST  api/posts
//@desc     Create a post for a user
//@access   Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //Validation
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

//@route    POST  api/posts/:post_id
//@desc     Like post
//@access   Private
router.post(
  "/like/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.post_id)
        .then(post => {
          //Check if user already liked this post
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyliked: "User already liked this post" });
          }

          //Add user like to likes array
          post.likes.unshift({ user: req.user.id });
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: "No post found" }));
    });
  }
);

//@route    POST  api/posts/:post_id
//@desc     Unlike post
//@access   Private
router.post(
  "/unlike/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.post_id)
        .then(post => {
          //Check if user already not liked this post
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ notliked: "User have not yet liked this post" });
          }

          //Get remove index
          const removeIndex = post.likes
            .map(like => like.user.toString())
            .indexOf(req.user.id);

          //Splice out of array
          post.likes.splice(removeIndex, 1);

          //Save post
          post
            .save()
            .then(post => res.json(post))
            .catch(err =>
              res.status(400).json({ postnotsaved: " Post not saved!" })
            );
        })
        .catch(err => res.status(404).json({ postnotfound: "No post found" }));
    });
  }
);

//@route    POST  api/posts/comment/:post_id
//@desc     Add comment to a post
//@access   Private
router.post(
  "/comment/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //Validation
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    //Find the post
    Post.findById(req.params.post_id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        };

        //Add to omments array
        post.comments.unshift(newComment);

        //Save post
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: "Post not found" }));
  }
);

// @route   DELETE api/posts/comment/:post_id/:comment_id
// @desc    Remove comment from post
// @access  Private
router.delete(
  "/comment/:post_id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.post_id)
      .then(post => {
        // Check to see if comment exists
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ commentnotexists: "Comment does not exist" });
        }

        // Get remove index
        const removeIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        // Splice comment out of array
        post.comments.splice(removeIndex, 1);

        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: "No post found" }));
  }
);

module.exports = router;
