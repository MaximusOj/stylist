import './App.css';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import Profile from './components/Profile/Profile';
import Post from './components/Post/Post';
import Navbar from './components/Navbar/Navbar';
import { FullProfile } from './components/Profile/Profile';
import { useState, useEffect } from 'react';
import FullPost from './components/FullPost/FullPost';
import Create from './components/Create/Create';
import { List } from '@mui/material';
import { ListItem } from '@mui/material';
import Divider from '@mui/material';

function App({currentUser, setCurrentUser}) {
  let norms = ['No insults and/or hate speech', 'No commenting on body types, appearances, etc.', 'Users must provide feedback to accompany negative ratings of posts from other users', 'Users are only allowed to comment once on a person’s post (option to edit comment available)', 'Users are only allowed to post twice a day', 'Do not compare users to other users or people in real life']
  let list_items = [];

  norms.forEach(function (norm) {
    list_items.push(<li>{norm}</li>)
  });

  const [profileView, setProfileView] = useState(0);
  const [postView, setPostView] = useState(0);
  const [newPost, toggleNewPost] = useState(0);
  const [allPosts, setAllPosts] = useState(0);
  const [userList, setUserList] = useState(null);
  const [foundNewPost, setNewPost] = useState(null);
  const [currentPost, setCurrentPost] = useState(null)
  const [newComment, setNewComment] = useState(0)

  async function fetchPosts() {
    try {
      const response = await axios.get('http://localhost:3001/posts')
      return response
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  async function fetchUsers() {
    try {
      const response = await axios.get('http://localhost:3001/users')
      return response
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }


  const handlePostFetch = () => {
    fetchPosts()
      .then(posts => {
        let testDiv = (
          <div className="post-list-div">
            {posts.data.map(post => (
              <Post currentUser={currentUser} setCurrentPost={setCurrentPost} setPostView={setPostView} postData={post} />
            ))}
          </div>)
        setAllPosts(testDiv);
      })
      .catch(error => console.error('Error fetching data:', error));
  };

  const handleUserFetch = () => {
    fetchUsers()
      .then((users) => {
        setUserList(users)
      }).catch(error => console.error('Error fetching data:', error));
  }

  async function saveNewComment() {
    if (currentPost) {
      let commentData = new FormData()
      let timeArray = []
      let contentArray = []
      let firstName = ''
      let lastName = ''

      for (const comment of currentPost.comments) {
        timeArray.push(comment.creation_timestamp)
        contentArray.push(comment.content)

        if (!firstName) {
          firstName = comment.user_first_name
        }

        if (!lastName) {
          lastName = comment.user_last_name
        }

        commentData.set('_id', currentPost._id)
        commentData.set('user_first_name', firstName)
        commentData.set('user_last_name', lastName)
        commentData.set('content', contentArray)
        commentData.set('creation_time', timeArray)
      }

      await axios.post('http://localhost:3001/posts/comment', commentData, {
        headers: {
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Content-Type': 'application/json'
        }
      })
    }
  }

  useEffect(() => {
    saveNewComment();
  }, [newComment]
  )

  useEffect(() => {
    console.log('using effect')
    handleUserFetch();
    handlePostFetch();
  }, [foundNewPost]);

  return (
    <div className='home-container'>
      {newPost && <Create toggleNewPost={toggleNewPost} currentUser={currentUser} setNewPost={setNewPost} />}
      {postView && <FullPost newComment={newComment} setNewComment={setNewComment} setCurrentPost={setCurrentPost} currentPost={currentPost} toggleFullPost={setPostView} currentUser={currentUser} userList={userList} />}
      {profileView && <FullProfile toggleProfile={setProfileView} userList={userList} currentUser={currentUser} setCurrentUser={setCurrentUser} />}
      <Navbar toggleNewPost={toggleNewPost} toggleProfile={setProfileView} currentUser={currentUser} />
      <div className='content-section'>
        <div className='norms-section'>
          <ul>
            {list_items}
          </ul>
        </div>
        <div className='feed-section'>
          {allPosts}
        </div>
      </div>
      <div className='footer'>Footer content</div>
    </div>
  );
}

export default App;
