import './Navbar.css';
import Grid from '@mui/material/Grid';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import GavelIcon from '@mui/icons-material/Gavel';
import CreateIcon from '@mui/icons-material/Create';



function Navbar({ toggleProfile, toggleNewPost, currentUser }) {
    function handleProfileOpen() {
        toggleProfile(1);
    }

    function handleNewPost() {
        toggleNewPost(1);
    }

    return (
        <div className='navbar'>
            <div className='our-logo'>FitCheck</div>
            <div className='profile-and-norms'>
                {currentUser && <div className='create-post-button' onClick={handleNewPost}>
                    <CreateIcon /> new post
                </div>}
                <div className='profile-toggle' onClick={handleProfileOpen}>
                    <AccountCircleIcon /> profile
                </div>
            </div>
        </div>
    );
}

export default Navbar;
