import React from 'react';
import ProgressBar from './ProgressBar';
import "../style/leadershipsmall.css"

const LeadershipUserDisplay = ({ idx, user, color, loader }) => {
    return (
        <div className="leader-userdisplay">
            <div className='leader-id-pic'>
                <div>{idx+1}</div>
                <div style={{backgroundColor: `${color}`}} className='leader-user-profile-pic'>{user.name === "" ? "UN" : `${user.name[0]}${user.name[1]}`.toUpperCase()}</div>
            </div>
            <div className='leader-bar-pts'>
                <ProgressBar value={user.points} max={1000} />
                <div>{user.points} pts</div>
            </div>
        </div>
    );
};


export default LeadershipUserDisplay;

