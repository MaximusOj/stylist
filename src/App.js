import './App.css';
import axios from 'axios';
import Post from './components/Post/Post';
import Navbar from './components/Navbar/Navbar';
import { FullProfile } from './components/Profile/Profile';
import { useState, useEffect } from 'react';
import FullPost from './components/FullPost/FullPost';
import Create from './components/Create/Create';


function App({currentUser, setCurrentUser}) {

  const BACKEND_URL = 'https://stylistapp-0fd867af63d5.herokuapp.com' 

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
      const response = await axios.get(`${BACKEND_URL}/posts`)
      return response
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  async function fetchUsers() {
    try {
      const response = await axios.get(`${BACKEND_URL}/posts`)
      return response
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }


  useEffect(() => {
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
  
        await axios.post(`${BACKEND_URL}/posts/comment`, commentData, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          }
        })
      }
    }

    saveNewComment();
  }, [newComment, currentPost]
  )

  useEffect(() => {
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

    handleUserFetch();
    handlePostFetch();
  }, [foundNewPost, currentUser]);

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
