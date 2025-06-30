// import React, { useEffect, useState } from 'react';
// import LeadershipUserDisplay from './LeadershipUserDisplay';
// import { border, fontFamily, fontSize, fontWeight, height } from '@mui/system';
// import "../style/leadershipsmall.css"
// import EastIcon from '@mui/icons-material/East';

// const LeadershipSmall = (loader) => {

//     // const [users, setUsers] = useState([]);

//     const users = [
//         { id: 1, name: 'Alice', points: 95 },
//         { id: 2, name: 'Bob', points: 89 },
//         { id: 3, name: 'Charlie', points: 92 },
//         { id: 4, name: 'Diana', points: 88 },
//         { id: 5, name: 'Eve', points: 91 },
//         { id: 6, name: 'Frank', points: 87 },
//         { id: 7, name: 'Anne', points: 68},
//         { id: 6, name: 'Frank', points: 87 },
//         // { id: 8, name: 'George', points: 75},
//         // { id: 9, name: 'Rebeca', points: 96},
//     ];

//     const colorPalette = [
//         "#6C5CE7", // Soft Purple
//         "#00B894", // Aqua Green
//         "#74B9FF", // Sky Blue
//         "#55EFC4", // Mint
//         "#FAB1A0", // Soft Coral
//         "#FF7675", // Warm Pink
//         "#E17055", // Orange Tan
//         "#FD79A8", // Candy Pink
//         "#A29BFE", // Lavender
//       ];
      

//     const sortedUsers = [...users].sort((a, b) => b.points - a.points);
//     const numColumns = 3; // Number of columns
//     const columns = Array.from({ length: numColumns }, () => []);


//     sortedUsers.forEach((user, index) => {
//         columns[index % numColumns].push(user);
//     });

//     // sortedUsers.forEach((user, index) => {
//     //     columns[index % 3].push(user);
//     // });
//     return (
//         <>
//             <div className='leader-heading'>
//                 <div id="heading__title">Leaderboard</div>
//                 <div id="heading__seeall">
//                     <div>See all</div>
//                     <EastIcon style={{fontSize: '13px'}} />
//                 </div>
//             </div>
//             <div className="leader-container" >
//                 {columns.map((col, idx) => (
//                     <div className={`column`} id={`col-${idx}`} key={idx}>
//                         { 
//                         col.map((user, i) => {
//                             const globalIndex = sortedUsers.findIndex(u => u.id === user.id);
//                             return (
//                             <LeadershipUserDisplay
//                                     key={user.id}
//                                     idx={globalIndex}
//                                     user={user}
//                                     color={colorPalette[globalIndex % colorPalette.length]}
//                                     loader={loader}
//                                 />
//                             )})}
//                     </div>
//                 ))}
//             </div>  
//         </>
//     );
// }

// export default LeadershipSmall

import React from 'react';

import LeadershipUserDisplay from './LeadershipUserDisplay';
import "../style/leadershipsmall.css";
import EastIcon from '@mui/icons-material/East';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { red, pink, purple, deepPurple, indigo, blue, lightBlue, cyan, teal, green, lightGreen, lime, yellow, amber, orange, deepOrange, brown, blueGrey } from '@mui/material/colors';

const colorArray = [
    red,
    pink,
    purple,
    deepPurple,
    indigo,
    blue,
    lightBlue,
    cyan,
    teal,
    green,
    lightGreen,
    lime,
    yellow,
    amber,
    orange,
    deepOrange,
    brown,
    blueGrey
  ];
  
const shades = [500, 600, 700, 800, 900, "A200", "A400", "A700"]
const LeadershipSmall = (loader) => {
    // const users = [
    //     { id: 1, name: 'Alice', points: 95 },
    //     { id: 2, name: 'Bob', points: 89 },
    //     { id: 3, name: 'Charlie', points: 92 },
    //     { id: 4, name: 'Diana', points: 88 },
    //     { id: 5, name: 'Eve', points: 91 },
    //     { id: 6, name: 'Frank', points: 87 },
    //     { id: 6, name: 'Frank', points: 87 },
    //     // Test with fewer than 9 users
    // ];

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    
    
    useEffect(() => {
        const fetchTopUsers = async () => {
          try {
            const response = await fetch('/api/top-users');
            const data = await response.json();
            console.log(data)

            const usersWithColors = assignColors(data);
            setUsers(usersWithColors);

            // setUsers(data);
          } catch (err) {
            console.error("Failed to fetch leaderboard:", err);
          } finally {
            setLoading(false);
          }
        };
    
        fetchTopUsers();
      }, []);
    
      const assignColors = (userList) => {
        return userList.map((user, index) => {
          if (!user) return null; // handle empty slots if any
          console.log(`userColor_${user.email}`);
          
          let storedColor = localStorage.getItem(`userColor_${user.email}`);
    
          if (!storedColor) {
            // Pick a color and shade based on index
            const colorObj = colorArray[index % colorArray.length];
            const shade = shades[index % shades.length];
            storedColor = colorObj[shade];
            localStorage.setItem(`userColor_${user.email}`, storedColor);
          }
    
          return { ...user, color: storedColor };
        });
      };
    


    const colorPalette = [
        "#6C5CE7", "#00B894", "#74B9FF", 
        "#55EFC4", "#FAB1A0", "#FF7675",
        "#E17055", "#FD79A8", "#A29BFE"
    ];

    // Sort users and pad array to 9 elements
    const sortedUsers = [...users].sort((a, b) => b.points - a.points);
    const paddedUsers = Array(9).fill(null).map((_, i) => sortedUsers[i] || null);

    // Create 3 columns with 3 items each
    const columns = [
        paddedUsers.slice(0, 3),
        paddedUsers.slice(3, 6),
        paddedUsers.slice(6, 9)
    ];

    if (loading) return <div className="leader-loading">Loading leaderboard...</div>;


    return (
        <>
            <div className='leader-heading'>
                <div id="heading__title">Leaderboard</div>
                <Link to="/leaderboard" style={{textDecoration: 'none'}}>
                <div id="heading__seeall">
                    <div>See all</div>
                    <EastIcon style={{fontSize: '13px'}} />
                </div>
                </Link>
            </div>
            <div className="leader-container" >
                {columns.map((column, colIndex) => (
                    <div className="column" key={colIndex}>
                        {column.map((user, index) => (
                            user ? (
                                <LeadershipUserDisplay 
                                    key={user.id}
                                    idx={colIndex * 3 + index}
                                    user={user}
                                    color={user.color}
                                    loader={loader}
                                />
                            ) : (
                                <div 
                                    key={`empty-${colIndex}-${index}`} 
                                    className="empty-slot"
                                    style={{
                                        height: '60px',

                                        // visibility: 'hidden',
                                        border: '1px solid blue'
                                    }}
                                />
                            )
                        ))}
                    </div>
                ))}
            </div>  
        </>
    );
}

export default LeadershipSmall;

