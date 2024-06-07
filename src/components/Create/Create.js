import './Create.css';
import React, { useState } from 'react';
import axios from 'axios';




function Create({ toggleNewPost, currentUser, setNewPost}) {
    const BACKEND_URL = 'https://stylistfinal-bb70481d4105.herokuapp.com' 
    //postData is the payload that will be sent to the backend
    const postData = new FormData();

    function captureFirstImage() {
        const buttonElement = document.getElementById('image-one')
        buttonElement.addEventListener('change', (event) => {
            postData.append('images[]', event.target.files[0], event.target.files[0].name)
        });

    }

    function captureSecondImage() {
        const buttonElement = document.getElementById('image-two')
        buttonElement.addEventListener('change', (event) => {
            postData.append('images[]', event.target.files[0], event.target.files[0].name)
        });
    }

    function captureThirdImage() {
        const buttonElement = document.getElementById('image-three')
        buttonElement.addEventListener('change', (event) => {
            postData.append('images[]', event.target.files[0], event.target.files[0].name)
        });
    }

    function captureFourthImage() {
        const buttonElement = document.getElementById('image-four')
        buttonElement.addEventListener('change', (event) => {
            postData.append('images[]', event.target.files[0], event.target.files[0].name)
        });
    }

    //capture the remainder of the details of a post that isn't the images
    function captureNonImageDetails() {
        postData.set('creation_timestamp', new Date(Date.now()).toLocaleString());
        if (currentUser) {
            postData.set('user_id', currentUser._id);
        }
        postData.set('karma', 0);
        postData.set('post_event', document.getElementById('post-event').value);
        postData.set('post_title', document.getElementById('post-title').value);
        postData.set('additional_info', document.getElementById('additional-info').value);

    }


    async function uploadToServer() {
        captureNonImageDetails();
        toggleNewPost(0);
        await axios.post(`${BACKEND_URL}/upload-post-details`, postData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(response => {
                console.log('Details uploaded successfully:', response.data);
                setNewPost(Date.now())
            })
            .catch(error => {
                console.error('Error uploading details:', error);
            });
    }

    function handleClose() {
        toggleNewPost(0);
    }
    return (
        <div className='new-post-outer'>
            <div className='new-post'>
                <h2 className='post-page-title'>Let's see what you got! </h2>
                <h4 >Post title</h4>
                <input type='text' style={{ width: '400px' }} id='post-title' required></input><br /><br />
                <h4>Upload (a) picture(s) of your outfit</h4>
                <form encType="multipart/form-data">
                    <input type="file" name="item-one" accept='image/*' id='image-one' onClick={captureFirstImage} />
                    <input type="file" name="item-two" accept='image/*' id='image-two' onClick={captureSecondImage} />
                    <input type="file" name="item-three" accept='image/*' id='image-three' onClick={captureThirdImage} />
                    <input type="file" name="item-four" accept='image/*' id='image-four' onClick={captureFourthImage} />
                </form>
                <br />
                <h4>Type in at least 1 emoji to describe the event that you'll be attending in this outfit</h4>
                <input type='text' style={{ width: '300px' }} id='post-event' required></input><br /><br />
                <h4>Any additional information for those that will be helping you to pick an outfit (if applicable)?</h4>
                <textarea rows="4" cols="40" id='additional-info'></textarea>
                <div className='button-area'>
                    <button className='button-instance' id='button-one' onClick={uploadToServer}>create post</button>
                    <button className='button-instance' id='button-two' onClick={handleClose}>cancel</button>
                </div>
            </div>
        </div>

    );
}

export default Create;