
const initial = {
    friendProfile: 0,
    friendProfileData: {},
    chatsList: [],
    friendRequest: [],
    friendsList: [],
    friendIdsList: []
}

const friendsReducer = (state = initial, action) => {
    switch (action.type) {
        case 'SAVE_CHAT_LIST': {
            const chatsList = [...action.data]
            return {
                ...state,
                chatsList
            }
        }
        case 'UPDATE_CHAT_LIST': {
            const chatsList = [...state.chatsList]
            for(let index in chatsList) {
                // eslint-disable-next-line eqeqeq
                let newChatItem = chatsList[index]
                // eslint-disable-next-line eqeqeq
                if(newChatItem.receiverId == action.data.receiverId) {
                    newChatItem.lastMessage.type = action.data.type
                    // eslint-disable-next-line eqeqeq
                    if(action.data.senderId != localStorage.getItem('userId'))
                        newChatItem.lastMessage.status = action.data.status
                    // eslint-disable-next-line eqeqeq
                    if(action.data.type == 'text') {
                        newChatItem.lastMessage.type = 'text'
                        newChatItem.lastMessage.content = action.data.content
                        newChatItem.lastMessage.isSender = action.data.senderId === localStorage.getItem('userId') ? 1 : 0
                    }
                    chatsList.splice(index, 1)
                    chatsList.unshift(newChatItem)
                }

            }
            // eslint-disable-next-line eqeqeq
            if(!chatsList.find(value=>value.receiverId == action.data.receiverId)) {
                // eslint-disable-next-line eqeqeq
                if(action.data.senderId != localStorage.getItem('userId')){
                        action.data.sender.lastMessage.status = action.data.status
                        chatsList.unshift(action.data.sender)
                }else{
                    chatsList.unshift(action.data.receiver)
                }
            }
            return {
                ...state,
                chatsList
            }
        }
        case 'UPDATE_STATUS_CHAT_LIST': {
            const newChatList = [...state.chatsList]
            newChatList.forEach(value=>{
                // eslint-disable-next-line eqeqeq
                if(value.receiverId == action.data.receiverId && action.data.senderId == localStorage.getItem('userId')) {
                    value.lastMessage.status = action.data.status
                }
            })
            return {
                ...state,
                chatsList: newChatList
            }
        }
        case 'SAVE_FRIENDS_LIST': {
            const friendsList = [...action.data]
            const friendIdsList = [...action.data].map(value => value.id)
            return {
                ...state,
                friendsList,
                friendIdsList,
            }
        }
        case 'ADD_FRIEND_AFTER_ACCEPT': {
            let newFriendList = [...state.friendsList]
            let friendIdsList = [...state.friendIdsList]
            let data = action.data
            // eslint-disable-next-line eqeqeq
            if(data.sender.id == localStorage.getItem('userId')) {
                newFriendList.unshift(data.receiver)
                friendIdsList.push(data.receiver.id)
            // eslint-disable-next-line eqeqeq
            }else if(data.receiver.id == localStorage.getItem('userId')){
                newFriendList.unshift(data.sender)
                friendIdsList.push(data.sender.id)
            }
            return {
                ...state,
                friendsList: newFriendList,
                friendIdsList
            }
        }
        case 'SAVE_FRIEND_REQUEST': {
            const friendRequest = [...action.data]
            return {
                ...state,
                friendRequest
            }
        }
        case 'ADD_FRIEND_REQUEST': {
            let newFriendRequest = [...state.friendRequest]
            let data = action.data
            // eslint-disable-next-line eqeqeq
            if (!action.data.status && action.data.senderId != localStorage.getItem('userId'))
                newFriendRequest.unshift(data)
            return {
                ...state,
                friendRequest: newFriendRequest
            }
        }
        case 'DELETE_FRIEND_REQUEST': {
            let newFriendRequest = [...state.friendRequest]
            console.log(newFriendRequest);
            const idx = newFriendRequest.findIndex((value) => { return value.senderId == action.data.senderId && value.receiverId == action.data.receiverId })
            newFriendRequest.splice(idx, 1)
            return {
                ...state,
                friendRequest: newFriendRequest
            }
        }
        case 'SHOW_FRIEND_PROFILE': {
            return {
                ...state,
                friendProfile: action.data
            }
        }
        case 'SAVE_FRIEND_PROFILE': {
            return {
                ...state,
                friendProfileData: action.data
            }
        }
        case 'UPDATE_CHAT_INFOMATION': {
            //update infomation: Name, image
            const Id = action.data.groupId
            const groupName = action.data.groupName
            const image = action.data.image

            let chatsListTemp = [...state.chatsList]
            for (let index = 0; index < chatsListTemp.length; index++) {
                if (chatsListTemp[index].receiverId === Id) {
                    chatsListTemp[index].receiverName = groupName
                    chatsListTemp[index].image = {
                        image1: image.img1,
                        image2: image.img2
                    }
                }
            }

            return {
                ...state,
                chatsList: chatsListTemp
            }
        }
        
        case 'DELETE_FRIEND': {
            let newFriendList = [...state.friendsList]
            console.log('list friend', action.data.senderId )
            // eslint-disable-next-line eqeqeq
            if(action.data.senderId == localStorage.getItem('userId')) {
                // eslint-disable-next-line eqeqeq
                const idx = newFriendList.findIndex((value)=> value.id == action.data.receiverId)
                newFriendList.splice(idx, 1)
            // eslint-disable-next-line eqeqeq
            }else if(action.data.receiverId == localStorage.getItem('userId')){
                // eslint-disable-next-line eqeqeq
                const idx = newFriendList.findIndex((value)=> value.id == action.data.senderId)
                newFriendList.splice(idx, 1)
            }
            return {
                ...state,
                friendsList: newFriendList
            }
        }

        case 'DELETE_GROUP_CHAT': {
            let newListChat = [...state.chatsList]
            console.log(action.data)
            newListChat.forEach((Element, Index) => {
                // eslint-disable-next-line eqeqeq
                if (Element.receiverId == action.data.groupId)
                    if(action.data.isAdmin) {
                        newListChat.splice(Index, 1)
                    // eslint-disable-next-line eqeqeq
                    }else if(action.data.memberId == localStorage.getItem('userId')) {
                        newListChat.splice(Index, 1)
                    }
            })

            return {
                ...state,
                chatsList: newListChat
            }
        }

        default: {
            return {
                ...state
            }
        }
    }
}

export default friendsReducer