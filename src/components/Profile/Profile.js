import './Profile.css';
import CloseIcon from '@mui/icons-material/Close';
import { Paper } from '@mui/material';
import { Grid } from '@mui/material';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Profile({ toggleProfile, currentUser, setCurrentUser, userList }) {
    const [loginStatus, setLoginStatus] = useState(null)
    const handleSaveUser = () => {
        saveNewUser()
        .then(response => {
            setCurrentUser(response.data)
          })
        .catch(error => console.error('Error fetching data:', error));
    };

    function handleLogIn(){
        const names = document.getElementById('username-input').value.split(' ');
        const secretKey = document.getElementById('password-input').value;

        for (const user of userList.data){
            if ((user.first_name === names[0]) && (user.last_name === names[1]) && (user.secret_key === secretKey)){
                setCurrentUser(user)
                setLoginStatus(null)
            }
        }
    }


    const login = (
        <div className='login-div'>
            <h4>Username(First and last name)</h4>
            <input type='text' name='username-input' id='username-input'></input>
            <h4>login code</h4>
            <input type='text' name='password-input' id='password-input'></input><br />
            <div className='login-buttons'>
                <button onClick={handleLogIn} className='log-in-button'>Log In</button>
                <button className='log-in-button' onClick={handleProfileClose}>Close</button>
            </div>
            <h4><i>Confirm your details and try again if you're not redirected to your profile page afterwards</i></h4>

        </div>
    )
    const signup = (
        <div className='signup-div'>
            <h4>Username(First and last name. Can be your real or made up names)</h4>
            <input type='text' id='username-input' name='username-input'></input>
            <h4>login code</h4>
            <input type='text' id='password-input' name='password-input'></input>
            <h4>Profile image</h4>
            <input type="file" id='profile-pic' name="profile-pic" accept='image/*' /><br />
            <div className='signup-buttons'>
                <button className='log-in-button' onClick={handleSaveUser}>Sign up</button>
                <button className='log-in-button' onClick={handleProfileClose}>Close</button>
            </div>
            <h4><i>You may need to log in afterwards to see your account details</i></h4>
        </div>
    )

    function handleProfileClose() {
        toggleProfile(0);
    }
    function signingUp() {
        setCurrentUser(null)
        setLoginStatus('signup')
    }
    function loggingIn() {
        setLoginStatus('login')
        setCurrentUser(null)
    }

    async function saveNewUser() {
        const names = document.getElementById('username-input').value.split(' ')
        const userData = new FormData();
        userData.set('first_name', names[0])
        userData.set('last_name', names[1])
        userData.set('secret_key', document.getElementById('password-input').value)
        userData.set('num_posts', 0)

        const profilePic = document.getElementById('profile-pic')
        userData.append('prof-image', profilePic.files[0], profilePic.files[0].name)
        
        const dummyData = {
            'first_name': names[0],
            'last_name': names[1],
            'user_image': profilePic.files[0].name,
            'num_posts' : 0
        }
        setCurrentUser(dummyData)
        setLoginStatus(null)

        //save user details
        const response = await axios.post('/users', userData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return response
    }

    useEffect(() => {
        console.log(currentUser)
      }, []);

    var profile_img_url = `/user_images/${currentUser && currentUser.user_image}`
    return (
        <Paper className='profile' elevation={3}>
            {(!currentUser && (loginStatus === 'login') && login) ||
                (!currentUser && (loginStatus === 'signup') && signup) ||
                (!currentUser && (!loginStatus) &&
                    <div className='login-options'>
                        <button className='log-in-button' onClick={loggingIn}>Log In</button>
                        <button className='log-in-button' onClick={signingUp}>Sign Up</button>
                        <button className='log-in-button' onClick={handleProfileClose}>Close</button>
                    </div>
                ) || 
                (currentUser && !loginStatus &&
                    <Grid container spacing={2} sx={{ width: '40vw', padding: '10%' }}>
                        <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
                            <button className='sign-out-button' onClick={loggingIn}>sign out</button>
                            <div className='close-button-div' onClick={handleProfileClose}>
                                <CloseIcon />
                            </div>

                        </Grid>
                        <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: '15px' }}>
                            <img className='user-img' src={profile_img_url}></img>
                            <h3 className='user-name'>{currentUser.first_name + ' ' + currentUser.last_name}</h3>
                        </Grid>
                        <Grid item xs={6} sx={{ padding: '2%', textWrap: 'wrap' }}>Posts: <b>{currentUser.num_posts}</b></Grid>
                        <Grid item xs={6} sx={{ padding: '2%', textWrap: 'wrap' }}>Rating: <b>{currentUser.last_rating || 0}</b></Grid>
                    </Grid>
                )}
        </Paper>
    );
}

export function FullProfile({ toggleProfile, currentUser, setCurrentUser, userList }) {
    return (
        <div className='exterior-bounding-box'>
            <Profile toggleProfile={toggleProfile} currentUser={currentUser} setCurrentUser={setCurrentUser} userList={userList}/>
        </div>
    )
}
