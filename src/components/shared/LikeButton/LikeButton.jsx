import React from 'react';
import AuthUserContext from '../../../contexts/AuthUserContext';
import { DB } from '../../../lib';

const LikeButton = ({
    trailId,
    toggleLoginBox
}) => {

    const toggleLike = (e, userData, isLogin, trailId) => {
        e.preventDefault()
        if (isLogin) {
            let isLiked = false
            userData.likeList.forEach(likeItem => {
                if (likeItem.id === trailId) {
                    isLiked = true
                }
            })

            if (isLiked) {
                const newLikeList = userData.likeList.filter(likeItem => likeItem.id !== trailId)
                DB.ref('users').doc(userData.id)
                    .update({
                        like_list: newLikeList
                    })

                DB.ref('trails').doc(trailId)
                    .get()
                    .then(doc => {
                        const trailLikeUserList = doc.data().like_users
                        const newTrailLikeUserList = trailLikeUserList.filter(likeUserId => likeUserId !== userData.id)
                        DB.ref('trails').doc(trailId)
                            .update({
                                like_users: newTrailLikeUserList
                            })
                    })

            } else {
                const newLikeList = userData.likeList
                newLikeList.push({
                    id: trailId,
                    timestamp: new Date()
                })

                DB.ref('users').doc(userData.id)
                    .update({
                        like_list: newLikeList
                    })

                DB.ref('trails').doc(trailId)
                    .get()
                    .then(doc => {
                        const trailLikeUserList = doc.data().like_users
                        trailLikeUserList.push(userData.id)
                        DB.ref('trails').doc(trailId)
                            .update({
                                like_users: trailLikeUserList
                            })
                    })
            }
        } else {
            toggleLoginBox()
        }
    }

    return (
        <AuthUserContext.Consumer>{
            ({
                userData,
                isLogin
            }) => {
                let isLiked = false
                userData.likeList.forEach(likeItem => {
                    if (likeItem.id === trailId) {
                        isLiked = true
                    }
                })

                return (
                    <div className="like-button">
                        <i className={`far fa-heart ${isLiked ? 'active' : ''}`}
                            onClick={(e) => toggleLike(e, userData, isLogin, trailId)}
                            name={trailId}>
                        </i>
                    </div>
                )
            }

        }
        </AuthUserContext.Consumer>
    )
}

export default LikeButton;