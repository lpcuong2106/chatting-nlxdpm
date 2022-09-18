import React from 'react'
import './started-center.scss'

function StartedCenter() {
    return (
        <div className="started-center-wrapper">
            <div className="started-center">
                <div className="started-center-start">
                    <p>Bắt đầu cuộc trò chuyện ngay thôi nào!</p>
                </div>
                <div className="started-center-logo">
                    <img src="/img/Logos/logo-merry-chat.png" alt="" />
                </div>
                <div className="started-center-slogan">
                    <p>Chia sẻ niềm vui, gắn kết cuộc sống</p>
                </div>
                <div className="started-center-panner">
                    <p>Hãy để Kaito Chat kết nối chúng ta lại gần nhau hơn.</p>
                </div>
            </div>
        </div>
    );
}

export default StartedCenter;