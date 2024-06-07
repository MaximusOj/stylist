import './FullPost.css';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useEffect, useState } from 'react';

function FullPost({ toggleFullPost, currentPost, currentUser, setCurrentPost, newComment, setNewComment }) {
    // let postData = {}
    
    // if (currentPost){
    //     for (const [key, value] of currentPost){
    //         postData[key] = value
    //     }
    // }
    
    const [imageIndex, setImageIndex] = useState(0);
    const imgArray = currentPost.photos;
    const [voteState, setVoteState] = useState('none');
    const [timeoutVal, setTimeoutVal] = useState(0)
    const [prevKarma, setPrevKarma] = useState(null)
    
    let imageURL = `/post_images/${imgArray[imageIndex].img_url}`
    let pfpURL = `/user_images/${currentPost.user_image}`

    async function updateKarmaInDB() {
        let karmaData = new FormData();
        karmaData.set('_id', currentPost._id)
        karmaData.set('karma', currentPost.karma)
        karmaData.set('prev_karma', prevKarma)
        karmaData.set ('user_id', currentUser._id)

        await axios.post('http://stylistfinal-bb70481d4105.herokuapp.com/posts/karma', karmaData, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            }
        })
    }

    function upVote() {
        setPrevKarma(currentPost.karma)
        if (voteState === 'none') {
            currentPost.karma = currentPost.karma + 1
            setVoteState('upvote')
        } else if (voteState === 'downvote') {
            currentPost.karma = currentPost.karma + 2
            setVoteState('upvote')
        } else {
            currentPost.karma = currentPost.karma - 1
            setVoteState('none')
        }

        if(timeoutVal){
            clearTimeout(timeoutVal)
        }
        
        setTimeoutVal(setTimeout(updateKarmaInDB, 4000))

    }

    function downVote() {
        setPrevKarma(currentPost.karma)
        if (voteState === 'none') {
            currentPost.karma = currentPost.karma - 1
            setVoteState('downvote')
        } else if (voteState === 'downvote') {
            currentPost.karma = currentPost.karma + 1
            setVoteState('none')
        } else {
            currentPost.karma = currentPost.karma - 2
            setVoteState('downvote')
        }

        if(timeoutVal){
            clearTimeout(timeoutVal)
        }

        setTimeoutVal(setTimeout(updateKarmaInDB, 4000))

    }

    let commentDiv = (
        <div className='all-comments'>
            {currentPost.comments.map(comment => (
                <div><h3>{comment.user_first_name + ' ' + comment.user_last_name}</h3> <i>{' ' + comment.content}</i></div>
            ))}
        </div>
    )
    function handleClosePost() {
        toggleFullPost(0)
    }
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

    async function handleNewComment() {
        let updatedComment = {
            'user_first_name': currentUser.first_name,
            'user_last_name': currentUser.last_name,
            'content': document.getElementById('new-comment').value,
            'creation_timestamp': Date.now()
        }

        let newPost = currentPost
        newPost.comments.push(updatedComment)
        setCurrentPost(newPost)
        console.log(newPost)
        setNewComment(!newComment)
        document.getElementById('new-comment').value = ''
    }
    useEffect(() => { }, [currentPost])
    return (
        <div className='full-screen-post'>
            <div className='inner-div'>
                <div className='image-title-etc'>
                    <div className='close-button-outer-div' onClick={handleClosePost}>
                        close
                        <div className='close-button-div-fp'>
                            <CloseIcon />
                        </div>
                    </div>
                    <div className='full-post-header'>
                        <img src={pfpURL} className='full-post-user-img'></img>
                        <div className='full-post-user-name'><b>{currentPost.user_firstname + ' ' + currentPost.user_lastname + ' . '}</b></div>
                        <div className='full-post-age'><i> {currentPost.creation_timestamp || 'date'}</i></div>
                    </div>
                    <h2 className='full-post-title'>{currentPost.post_title || '[No Title]'}</h2>
                    <h1 className='full-post-event'>{currentPost.post_event || '✌🏼'}</h1>
                    <div className='image-section-div-fp'>
                    {(imageIndex > 0) && <div className='prev-image-fp' onClick={decreaseImageIndex}>previous item</div>}
                        <img src={imageURL} className='post-image-fp'></img>
                        {(imageIndex < imgArray.length - 1) && <div className='next-image-fp' onClick={increaseImageIndex}>next item</div>}
                    </div>
                    <div className='upvote-downvote-fp'>
                        <button className='upvote-button-fp' onClick={upVote}>upvote</button>
                        <div className='karma-count-fp'><b>{currentPost.karma || 0}</b></div>
                        <button className='downvote-button-fp' onClick={downVote}>downvote</button>
                    </div>
                    {/* <div className='my-wardrobe'>
                        <h4>In my wardrobe:</h4>
                        <div>shirts : red</div>
                        <div>shoes: yellow</div>
                        <div>socks: blue</div>
                    </div> */}
                </div>
                <div className='comment-section-fp'>
                    <h2>Comments</h2>
                    <div><i><b>OP: </b>{currentPost.additional_info}</i></div><br />
                    {commentDiv}
                    {currentUser &&
                        (<>
                            <h3>your comment:</h3>
                            <textarea id="new-comment" name="new-comment" rows="4" cols="40"></textarea>
                            <button className='new-comment' onClick={handleNewComment}>post comment</button>
                        </>

                        )
                    }

                </div>
            </div>
        </div>
    );
}

export default FullPost;
