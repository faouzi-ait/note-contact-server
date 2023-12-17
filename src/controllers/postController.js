const fs = require('fs');
const UserPost = require('../models/UserPost');
const cloudinary = require('../configuration/cloudinary');
const cloudinarySDK = require('cloudinary');
const paginate = require('./paginate');

exports.listAllPosts = paginate(UserPost);

exports.likePost = async (req, res, next) => {
    const userId = req.user._id;
    const postId = req.params.id;
    
    try {
        const post = await UserPost.findById(postId);

        if (!post) {
            return res.status(500).json({ success: false, message: 'Post not found' });
        }

        const alreadyLiked = post.likes.includes(userId);

        if (alreadyLiked) {
            post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
        } else {
            post.likes.push(userId);
        }

        await post.save();

        return res.status(200).json({ success: true, liked: !alreadyLiked, message: 'Like status toggled successfully' })
    } 
    catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error', error });
    }
};

exports.createPost = async (req, res) => {
    try {
        const item = {
            user: req.user._id,
            post: req.body.post
        };
        
        if (req.file) {
            const { url, id } = await cloudinary.uploads(req.file.path, 'single-upload');

            item.photo = url;
            item.publicId = id;
            fs.unlinkSync(req.file.path);
        }   
    
        const newPost = new UserPost(item);
        await newPost.save(); 

        return res.status(201).json({ success: true, message: 'Post created successfully', newPost });
    } catch (error) {
        return res.status(400).json({ error });
    }
};

exports.findSinglePost = async (req, res, next) => {
    if (!req.params.id) return res.status(500).json({ success: false, message: 'The parameter is missing' });
    
    const post = await UserPost.findOne({ _id: req.params.id });

    if (!post) {
        return res.status(500).json({ success: false, message: 'The post was not found' })
    };
    
    return res.status(200).json({ success: true, post })
};

exports.updatePostView = async (req, res, next) => {
    if (!req.params.id) return res.status(500).json({ success: false, message: 'The parameter is missing' });
    
    const post = await UserPost.findOne({ _id: req.params.id });

    if (!post) return res.status(500).json({ success: false, message: 'The post was not found' });

    post.totalViews = post.totalViews + 1;
    const savedPost = await post.save();

    return res.status(200).json({ success: true, savedPost })
};

exports.deleteSinglePost = async (req, res, next) => {
    try {
        const user = await UserPost.findOneAndDelete({ _id: req.params.id });
    
        if(user && user.publicId) {
          // await cloudinarySDK.v2.api.delete_resources([['image1', 'image2']], 
          //   (error, result) => console.log('Deletion in progress => ')
          // );
    
          await cloudinarySDK.uploader.destroy(user.publicId, 
            (error, result) => console.log('Deletion in progress => ')
          );
        }
    
        if (!user) return res.status(404).send()
        
        res.status(200).send(user);
      } catch (error) {
        res.status(500).send(error);
      }
};