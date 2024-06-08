const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');


const uri = 'mongodb+srv://massimoelectron:jAwkyK2ppVvOVkuV@cluster0.0zlycwr.mongodb.net/stylist?retryWrites=true&w=majority&appName=Cluster0'

mongoose.connect(uri)
  .then(() => console.log("Connection to the database successful"))
  .catch(err => console.error("Error while connecting to database: ", err));

const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

var cors = require('cors');


app.use(cors({
  origin: [
    'http://stylistapp-0fd867af63d5.herokuapp.com',
    'https://stylistapp-0fd867af63d5.herokuapp.com'
  ],
}));

app.use(express.static(path.join(__dirname, 'public')));



//Defining the schema
const imageSchema = new mongoose.Schema({
  img_url: String
});

const commentSchema = new mongoose.Schema({
  user_first_name: String,
  user_last_name: String,
  content: String,
  creation_timestamp: String
});

const postSchema = new mongoose.Schema({
  user_id: String,
  user_firstname: String,
  user_lastname: String,
  user_image: String,
  creation_timestamp: String,
  photos: [imageSchema],
  comments: [commentSchema],
  karma: { type: Number },
  post_event: String,
  post_title: String,
  additional_info: String
});

const userSchema = new mongoose.Schema({
  user_image: String,
  first_name: String,
  last_name: String,
  num_posts: { type: Number },
  last_rating: { type: Number },
  secret_key: String
});

const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);
const Image = mongoose.model('Image', imageSchema);
const Comment = mongoose.model('Comment', commentSchema);


//multer for storing images uploaded with a post
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/post_images');
  },
  filename: function (req, file, cb) {
    cb(null, `${file.originalname}`);
  }
})
const uploadImages = multer({ storage: storage })

const userStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/user_images');
  },
  filename: function (req, file, cb) {
    cb(null, `${file.originalname}`);
  }
})
const uploadUserImages = multer({ storage: userStorage })

//ENDPOINTS

//create new post
app.post('/upload-post-details', uploadImages.array('images[]', 4), async (req, res) => {
  imageArray = []
  const uploadedImages = req.files;
  uploadedImages.forEach(element => {
    const newImage = new Image({ 'img_url': element.filename });
    imageArray.push(newImage)
  });

  var postJSON = req.body
  postJSON.photos = imageArray
  //read first name, last name and image url for the user that posted
  const filter = { _id: postJSON.user_id };
  let foundUser = await User.findOne(filter);
  postJSON.user_firstname = foundUser.first_name;
  postJSON.user_lastname = foundUser.last_name;
  postJSON.user_image = foundUser.user_image;
  //new mongodb item for post
  const newPost = new Post(postJSON);

  try {
    //save post details
    const savedPost = await newPost.save();
    //update post count for the user
    const update = { $inc: { num_posts: 1 } };

    await User.findOneAndUpdate(filter, update);
    res.status(201).json(savedPost);
  } catch (err) {
    console.error("Error saving the post:", err);
    res.status(400).json({ message: "Error saving the post" });
  }


});


//load all the posts
app.get('/posts', async (req, res) => {
  console.log('trying!')
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    console.error("Error retrieving posts:", err);
    res.status(500).json({ message: "Error retrieving posts" });
  }
});

//load post by id
app.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(id);
    res.json(post);
  } catch (err) {
    console.error("Error retrieving specified post:", err);
    res.status(500).json({ message: "Error retrieving specified post" });
  }
});

//update post karma
app.post('/posts/karma', async (req, res) => {
  try {

    //increment or decrement post karma
    console.log('working!')
    const postFilter = { _id: req.body._id };
    const postUpdate = {$set : {karma: req.body.karma}}
    await Post.findOneAndUpdate(postFilter, postUpdate);

    // increment or decrement user karma
    const userFilter = {_id: req.body.user_id}
    const userUpdate = {}
    if (req.body.prev_karma < req.body.karma){
      userUpdate = {$inc : {last_rating: 1}}
    } else if (req.body.prev_karma > req.body.karma){
      userUpdate = {$dec : {last_rating: 1}}
    }

    await User.findOneAndUpdate(userFilter, userUpdate);

  } catch (err) {
    console.error("Error saving new comment:", err)
  }
});

//add comment to post
app.post('/posts/comment', async (req, res) => {
  try {
    const postFilter = { _id: req.body._id };

    let commentArray = []
    let contentArray = req.body.content.split(',')
    let timeArray = req.body.creation_time.split(',')

    for (let i = 0; i < contentArray.length; i++) {
      let newCommentBody = {
        'user_first_name': req.body.user_first_name,
        'user_last_name': req.body.user_last_name,
        'content': contentArray[i],
        'creation_timestamp': timeArray[i]
      }

      const newComment = new Comment(newCommentBody);
      commentArray.push(newComment)
    }
    const postUpdate = {$set : {comments: commentArray}}
    await Post.findOneAndUpdate(postFilter, postUpdate);

  } catch (err) {
    console.error("Error saving new comment:", err)
  }
});

//create new user
app.post('/users', uploadUserImages.single('prof-image'), async (req, res) => {
  const uploadedImage = req.file
  var userJSON = req.body
  userJSON.user_image = uploadedImage.filename

  const newUser = new User(userJSON);
  try {
    await newUser.save().
      then(async () => {
        //load the newly saved user from the database and send info to the frontend
        res.status(201).json(newUser);
      });
  } catch (err) {
    console.error("Error creating new user:", err);
    res.status(400).json({ message: "Error creating new user" });
  }
});

//retrieve all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error("Error retrieving users:", err);
    res.status(500).json({ message: "Error retrieving users" });
  }
});

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log("Server is up!"));