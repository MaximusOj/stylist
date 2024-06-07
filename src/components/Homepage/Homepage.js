import './Homepage.css';
import App from '../../App';
import { useState } from 'react';

function Homepage() {
    const [currentUser, setCurrentUser] = useState(null);
    return (
        <div className='main-container'>
            <App currentUser={currentUser} setCurrentUser={setCurrentUser}/>
        </div>
    )
}

export default Homepage;
