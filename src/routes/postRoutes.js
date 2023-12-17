const express = require('express');
const postController = require('../controllers/postController');
const reviewController = require('../controllers/ReviewController');
const upload = require('../configuration/multer');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');

router.post('/new-post', authMiddleware, upload.single('image'), postController.createPost);
router.get('/listing-posts', postController.listAllPosts);
router.get('/single-post/:id', postController.findSinglePost);
router.get('/viewed-post/:id', postController.updatePostView);
router.post('/like-post/:id', authMiddleware, postController.likePost);
router.delete('/delete-posts/:id', authMiddleware, postController.deleteSinglePost);

router.get('/reviews', reviewController.getReviews);
router.put('/reviews', authMiddleware, reviewController.createProductReview);

module.exports = router;
