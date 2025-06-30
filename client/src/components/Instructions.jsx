import React, {useEffect, useState} from 'react';
import "../style/ib.css";
import InstructionImg from "../imgs/ins-img.png"

const Instructions = () => {    
    const instructions = [
        {
            id: 1,
            instruction: "Solve",
            info: "Answer as many integrals as you can. Each one earns you points, the more accurate and consistent, the better. It’s just you vs. the integrals."
        },
        {
            id: 2,
            instruction: "Rank up",
            info: "As you solve, you climb the leaderboard alongside peers from top universities. Your rank updates in real time."
        },
        {
            id: 3,
            instruction: "See who can come on top",
            info: "At the end of the month, the top scorers along with the full leaderboard are announced."
        }
    ]


    return (
        <div className="ins__container">
            <div className='ib__main'>
                <div className="main__heading">
                    <div id="heading__info">Introductory Information</div>
                    <div id="heading__title">How it works</div>
                </div>
                <div className="main__instructions">
                    {instructions.map(({ id, instruction, info }) => (
                        <div key={id} className="instruction">
                            <div className="instruction__id-title">
                                <div>{id}</div>
                                <div>{instruction}</div>
                            </div>
                            <div>{info}</div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="img">
                <img src={InstructionImg} />
            </div>
        </div>
    );
}

export default Instructions;
