import './Post.css';
import Grid from '@mui/material/Grid';
import { useState } from 'react';
import axios from 'axios';

export default function Post({ setPostView, postData, setCurrentPost, currentUser }) {
    const [imageIndex, setImageIndex] = useState(0);
    const [voteState, setVoteState] = useState('none');
    const [timeoutVal, setTimeoutVal] = useState(0)
    const [prevKarma, setPrevKarma] = useState(null)

    async function updateKarmaInDB() {
        let karmaData = new FormData();
        karmaData.set('_id', postData._id)
        karmaData.set('karma', postData.karma)
        karmaData.set('prev_karma', prevKarma)
        karmaData.set ('user_id', currentUser._id)

        await axios.post('/posts/karma', karmaData, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            }
        })
    }

    function upVote() {
        setPrevKarma(postData.karma)
        if (voteState === 'none') {
            postData.karma = postData.karma + 1
            setVoteState('upvote')
        } else if (voteState === 'downvote') {
            postData.karma = postData.karma + 2
            setVoteState('upvote')
        } else {
            postData.karma = postData.karma - 1
            setVoteState('none')
        }

        if(timeoutVal){
            clearTimeout(timeoutVal)
        }
        
        setTimeoutVal(setTimeout(updateKarmaInDB, 4000))

    }

    function downVote() {
        setPrevKarma(postData.karma)
        if (voteState === 'none') {
            postData.karma = postData.karma - 1
            setVoteState('downvote')
        } else if (voteState === 'downvote') {
            postData.karma = postData.karma + 1
            setVoteState('none')
        } else {
            postData.karma = postData.karma - 2
            setVoteState('downvote')
        }

        if(timeoutVal){
            clearTimeout(timeoutVal)
        }

        setTimeoutVal(setTimeout(updateKarmaInDB, 4000))

    }


    const imgArray = postData.photos;
    let imageURL = `/post_images/${imgArray[imageIndex].img_url}`
    let pfpURL = `/user_images/${postData.user_image}`

    function decreaseImageIndex() {
        if (imageIndex > 0) {
            setImageIndex(imageIndex - 1);
        }
    }

    function increaseImageIndex() {
        if ((imageIndex + 1) < imgArray.length) {
            setImageIndex(imageIndex + 1);
        }
    }

    function handleOpenPost() {
        setCurrentPost(postData)
        setPostView(1)
    }

    let firstName = ''
    let lastName = ''
    let content = ''

    if (postData.comments.length > 0) {
        firstName = postData.comments[0].user_firstname
        lastName = postData.comments[0].user_lastname
        content = postData.comments[0].content
    }

    return (
        <div className='post'>
            <div className='post-header'>
                <img src={pfpURL} className='post-user-img'></img>
                <h3 className='post-user-name'>{postData.user_firstname + ' ' + postData.user_lastname}</h3>
                <div className='post-age'><i> {postData.creation_timestamp || 'date'}</i></div>
            </div>
            <div className='post-content'>
                <div className='post-text'>
                    <h2 className='post-title'>{postData.post_title || '[No Title]'}</h2>
                    <br/><br/>
                    <h1 className='post-event'>{postData.post_event || '✌🏼'}</h1>
                </div>
                <div className='image-section'>
                    <div className='image-div'>
                        {(imageIndex > 0) && <div className='prev-image' onClick={decreaseImageIndex}>previous item</div>}
                        <img src={imageURL} className='post-img'></img>
                        {(imageIndex < imgArray.length - 1) && <div className='next-image' onClick={increaseImageIndex}>next item</div>}
                    </div>
                    <div className='upvote-downvote'>
                        <button className='upvote-button' onClick={upVote}>upvote</button>
                        <div className='karma-count'><b>{postData.karma || 0}</b></div>
                        <button className='downvote-button' onClick={downVote}>downvote</button>
                    </div>
                </div>
            </div>
            <div className='comment-section' onClick={handleOpenPost}>
                <h4 className='comments-heading'>Comments (click to see all comments or post your own if logged in)</h4>
                <div><b>{(firstName + ' ' + lastName + ' ') || ''}</b><i>{(content) || 'no comments yet'}</i></div>
            </div><br />
        </div>
    );
}

