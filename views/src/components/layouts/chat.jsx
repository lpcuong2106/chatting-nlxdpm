import React from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setTheme, showCenter, showDialog, showFeature } from '../../redux/actions/taskbar'
import { updateShowOrderFeature, updateNewMember, updateDeleteMember } from '../../redux/actions/extension'
import { useNavigate } from 'react-router-dom'
import TaskBar from '../partials/chat/task-bar/task-bar'
import Tab from '../partials/chat/tabs/Tab'
import AddedFriendDialog from '../partials/chat/add-friends/add-friends'
import Feature from '../partials/chat/tools/feature/feature'
import CreateGroup from '../partials/chat/create-group/create-group'
import Profile from '../partials/chat/profile/profile'
import Center from '../partials/chat/center/center'
import ReceiveCall from '../partials/chat/receive-call/receive-call'
import Notification from '../partials/chat/tools/notification/notification'
import FormAddMember from '../partials/chat/extension/Another-features/add-members/form/form-add-member'
import Ask from '../partials/chat/extension/Another-features/leave-group/form-ask/ask'
import './chat.scss'
import { getFriendsList, getListChat, getGroupsList, getUserById, getUsersOnline } from '../APIs/ConnectAPI'
import { getAddGroup, getAddMember, getDeleteMember, getUpdateGroup, getDeleteGroup } from '../Sockets/socket-group'
import { addFriendAfterAccept, addFriendRequest, saveChatList, saveFriendsList, updateInfomationFriend, deleteFriend, updateChatsList, deleteGroupChat, updateStatusChatList, deleteFromFriendRequest } from '../../redux/actions/friends'
import { addGroup, deleteGroup, saveGroupsList, updateInfomationGroup } from '../../redux/actions/groups'
import { getConnection, getLogout, getUpdateProfile, sendConnection } from '../Sockets/home'
import { saveCurrentUser, saveUserOffline, saveUserOnline } from '../../redux/actions/user'
import { getRoom, getTextMessageChat, getMediaMessage, getDocumentMessage } from '../Sockets/socket-chat'
import { getAcceptFriend, getAddFriend, getDeleteFriend, getDismissFriend } from '../Sockets/socket-friend'
import { saveCurrentChat, saveMassage } from '../../redux/actions/message'
import SetNameForm from '../partials/chat/extension/Another-features/set-name-group/set-name-form/set-name-form'
import SetAvatarForm from '../partials/chat/extension/Another-features/set-avatar-group/set-avatar-form/set-avatar-form'
import { updateManagerFriend } from '../../redux/actions/extension'
import { updateNotification } from '../../redux/actions/notification'
import AskDelete from '../partials/chat/extension/Another-features/delete-group/ask-delete-group/ask-delete'
import connection from '../Sockets/socket-config'
import { getCall, getCallDown, getCallUp, getUserCallDisconnected, sendCallDown } from '../Sockets/socket-call'

//connection socket
connection()

function Chat() {
    const theme = useSelector(state => state.taskbar.theme)
    const display = useSelector(state => state.taskbar.addedForm)
    const displayFormExtension = useSelector(state => state.extension.showForm)
    const feature = useSelector(state => state.taskbar.feature)
    const isFriendProfileForm = useSelector(state => state.friends.friendProfile)
    const idChat = useSelector(state => state.message.currentChat)

    const dispatch = useDispatch()

    const navigate = useNavigate()

    //handles
    const handleClick = (e) => {
        if (!e.target.classList.value.match(/tab-friend-feature-item-show/)) {
            const display = showFeature({ ...feature, isShow: 0 })
            dispatch(display)
        }

        //hide order feature in extension component
        const hideOrderFeatureExtension = updateShowOrderFeature(null)
        dispatch(hideOrderFeatureExtension)
    }


    useEffect(() => {
        (async function () {
            //send connection
            sendConnection(localStorage.getItem('userId'))

            let themeLocal = localStorage.getItem('theme') ? localStorage.getItem('theme') : 'light-theme'
            let themeState = setTheme(themeLocal)
            dispatch(themeState)
            //call chat list API
            const chatsList = await getListChat(localStorage.getItem('userId'))
            if (chatsList && chatsList.status === 200) {
                let chatListAction = saveChatList(chatsList.data.data)
                dispatch(chatListAction)
            }
            //call friends list API
            const friendsList = await getFriendsList(localStorage.getItem('userId'))
            if (friendsList && friendsList.status === 200) {
                let friendsListAction = saveFriendsList(friendsList.data.data)
                dispatch(friendsListAction)
            }

            const groupsList = await getGroupsList(localStorage.getItem('userId'))
            if (groupsList && groupsList.status === 200) {
                let groupsListAction = saveGroupsList(groupsList.data.data)
                dispatch(groupsListAction)
            }

            const currentUser = await getUserById(localStorage.getItem('userId'))
            if (currentUser && currentUser.status === 200) {
                const user = saveCurrentUser(currentUser.data.data)
                dispatch(user)
            }

            const usersOnline = await getUsersOnline(localStorage.getItem('userId'))
            if (usersOnline && usersOnline.status === 200) {
                const users = saveUserOnline(usersOnline.data.data[0])
                dispatch(users)
            }

            //listen connection
            getConnection((data) => {
                if (data.userId !== localStorage.getItem('userId')) {
                    const userOnline = saveUserOnline(data.userId)
                    dispatch(userOnline)
                }
            })

            //logout 
            getLogout((data) => {
                if (data.userId !== localStorage.getItem('userId')) {
                    const userOffline = saveUserOffline(data.userId)
                    dispatch(userOffline)
                }
            })

            //getRoom
            getRoom((data) => {
                const status = updateStatusChatList(data)
                dispatch(status)
            })

            getAddMember((data) => {
                if (!data.groupId) return

                //luu du lieu vao redux extension
                const dataNewMember = updateNewMember(data)
                dispatch(dataNewMember)
            })

            getDeleteMember(data => {
                if (!data.groupId) return

                //luu du lieu vao redux extension
                const dataDeleteMember = updateDeleteMember(data);
                dispatch(dataDeleteMember);

                if (idChat.receiverId === data.groupId) {
                    //nhom bi xoa nen set center thanh wellcome
                    const updateCenter = showCenter(0)
                    dispatch(updateCenter)
                }

                //xoa group chat ra khoi chat list
                const deleteItem = deleteGroupChat(data)
                dispatch(deleteItem)

                //xoa group ra khoi list group
                const dataDeleteGroup = deleteGroup(data);
                dispatch(dataDeleteGroup)
            })

            getAddGroup((data) => {
                const addGroupAction = addGroup(data)
                dispatch(addGroupAction)
                const currentChat = saveCurrentChat({ receiverId: data.groupId, name: data.groupName, image: data.image })
                dispatch(currentChat)
                const center = showCenter(1)
                dispatch(center)
            })

            getUpdateGroup(data => {
                if (!data.groupName || !data.groupId || !data.image) return
                //luu thong tin nhom vua cap nhat vao redux
                const updateInfoGroup = updateInfomationGroup(data);
                dispatch(updateInfoGroup);
                const updateInfoFriend = updateInfomationFriend(data);
                dispatch(updateInfoFriend);
                //update current chat
                const updateCurrentChat = saveCurrentChat({
                    receiverId: data.groupId,
                    name: data.groupName,
                    image: {
                        image1: data.image.img1,
                        image2: data.image.img2
                    },
                    members: data.members
                })
                dispatch(updateCurrentChat)
            })

            getDeleteGroup(data => {
                if (!data.groupId) return

                //nhom bi xoa nen set center thanh wellcome
                const updateCenter = showCenter(0)
                dispatch(updateCenter)

                if (idChat.receiverId === data.groupId) {
                    //nhom bi xoa nen set center thanh wellcome
                    const updateCenter = showCenter(0)
                    dispatch(updateCenter)
                }

                //xoa group chat ra khoi chat list
                const deleteItem = deleteGroupChat(data)
                dispatch(deleteItem)

                //xoa group ra khoi list group
                const dataDeleteGroup = deleteGroup(data);
                dispatch(dataDeleteGroup)
            })

            getAddFriend(data => {
                const friendRequest = addFriendRequest(data)
                dispatch(friendRequest)

                if (data.receiverId == localStorage.getItem('userId')) {
                    const updateFriendExtension = updateManagerFriend(2);
                    dispatch(updateFriendExtension);
                } else {
                    const updateFriendExtension = updateManagerFriend(1);
                    dispatch(updateFriendExtension);
                }
            })

            getDismissFriend(data => {
                const updateFriendExtension = updateManagerFriend(0);
                dispatch(updateFriendExtension);
                // eslint-disable-next-line eqeqeq
                if (data.status == 404 && data.senderId == localStorage.getItem('userId')) {
                    const notification = updateNotification(data.msg)
                    dispatch(notification)
                } else {
                    const friendRequest = deleteFromFriendRequest(data)
                    dispatch(friendRequest)
                    // eslint-disable-next-line eqeqeq
                    if (data.senderId == localStorage.getItem('userId')) {
                        const notification = updateNotification('Hủy mời kết bạn thành công.')
                        dispatch(notification)
                    }
                }
            })

            getTextMessageChat((data) => {
                const message = saveMassage(data)
                dispatch(message)
                const chat = {
                    ...data,
                    receiver: {
                        receiverId: data.receiverId,
                        image: data.receiver.image,
                        receiverName: data.receiver.groupName,
                        lastMessage: {
                            content: data.content,
                            type: data.type,
                            // eslint-disable-next-line eqeqeq
                            isSender: data.senderId == localStorage.getItem('userId') ? 1 : 0
                        }
                    },
                    sender: {
                        receiverId: data.receiverId,
                        image: data.receiverId.indexOf('G') == 0 ? data.receiver.image : { image1: data.image, image2: '' },
                        receiverName: data.receiverId.indexOf('G') == 0 ? data.receiver.groupName : data.name,
                        lastMessage: {
                            content: data.content,
                            type: data.type,
                            // eslint-disable-next-line eqeqeq
                            isSender: data.senderId == localStorage.getItem('userId') ? 1 : 0
                        }
                    }
                }
                console.log(chat)
                const chatList = updateChatsList(chat)
                dispatch(chatList)
            })

            getMediaMessage(data => {
                const message = saveMassage(data)
                dispatch(message)
                const chat = {
                    ...data,
                    receiver: {
                        receiverId: data.receiverId,
                        image: data.receiver.image,
                        receiverName: data.receiver.groupName,
                        lastMessage: {
                            content: data.content,
                            type: data.type,
                            // eslint-disable-next-line eqeqeq
                            isSender: data.senderId == localStorage.getItem('userId') ? 1 : 0
                        }
                    }
                }
                const chatList = updateChatsList(chat)
                dispatch(chatList)
            })

            getDocumentMessage(data => {
                const message = saveMassage(data)
                dispatch(message)
                const chat = {
                    ...data,
                    receiver: {
                        receiverId: data.receiverId,
                        image: data.receiver.image,
                        receiverName: data.receiver.groupName,
                        lastMessage: {
                            content: data.content,
                            type: data.type,
                            // eslint-disable-next-line eqeqeq
                            isSender: data.senderId == localStorage.getItem('userId') ? 1 : 0
                        }
                    }
                }
                const chatList = updateChatsList(chat)
                dispatch(chatList)
            })

            getAcceptFriend(data => {
                const friendAccept = addFriendAfterAccept(data)
                dispatch(friendAccept)

                const updateFriendExtension = updateManagerFriend(3);
                dispatch(updateFriendExtension);
            })

            getDeleteFriend(data => {
                const friend = deleteFriend(data)
                dispatch(friend)

                const updateFriendExtension = updateManagerFriend(0);
                dispatch(updateFriendExtension);
            })

            getUpdateProfile(async data => {
                if (!data.status) {
                    // eslint-disable-next-line eqeqeq
                    if (data.userId == localStorage.getItem('userId')) {
                        const user = saveCurrentUser(data)
                        dispatch(user)

                        const notification = updateNotification('Thông tin đã được cập nhật.')
                        dispatch(notification)
                    }

                    const chatsList = await getListChat(localStorage.getItem('userId'))
                    if (chatsList && chatsList.status === 200) {
                        let chatListAction = saveChatList(chatsList.data.data)
                        dispatch(chatListAction)
                    }
                    //call friends list API
                    const friendsList = await getFriendsList(localStorage.getItem('userId'))
                    if (friendsList && friendsList.status === 200) {
                        let friendsListAction = saveFriendsList(friendsList.data.data)
                        dispatch(friendsListAction)
                    }

                    const groupsList = await getGroupsList(localStorage.getItem('userId'))
                    if (groupsList && groupsList.status === 200) {
                        let groupsListAction = saveGroupsList(groupsList.data.data)
                        dispatch(groupsListAction)
                    }
                }
            })

            getCall(data => {
                if (localStorage.getItem('callId')) {
                    //dang trong trang thai call, khong nhan cuoc goi khac
                    return sendCallDown({
                        senderId: localStorage.getItem('userId'),
                        receiverId: data.receiverId,
                        type: data.type,
                        status: 'user is calling'
                    })
                }
                const display = showDialog(4)
                dispatch(display)
                localStorage.setItem('callId', data.receiverId)
                localStorage.setItem('callType', data.type)
            })

            getCallUp(data => {
                localStorage.setItem('callStatus', 1)
                if (data.type == 'video') {
                    window.open(`http://localhost:3000/call/video-call/${data.receiverId}`, 'name', 'width=1000,height=600,left=250,top=100')
                } else {
                    window.open(`http://localhost:3000/call/vocal-call/${data.receiverId}`, 'name', 'width=1000,height=600,left=250,top=100')
                }
            })

            getCallDown(data => {
                if (localStorage.getItem('userId') != data.senderId) {
                    //neu nhu nguoi nhan cuoc goi dang call
                    if (data.status && data.status != 404) {
                        const showNotification = updateNotification('Người nhận đang trong cuộc gọi')
                        dispatch(showNotification)
                    }

                    localStorage.removeItem('callId')
                    localStorage.removeItem('callType')
                    if (!localStorage.getItem('callStatus')) {
                        //neu chua chap nhan cuoc goi thi dong cuoc goi
                        const display = showDialog(0)
                        dispatch(display)
                    } else {
                        localStorage.setItem('callStatus', -1)
                        if (data.type == 'video') {
                            window.open(`http://localhost:3000/call/video-call/${data.receiverId}`, 'name', 'width=1000,height=600,left=250,top=100')
                        } else {
                            window.open(`http://localhost:3000/call/vocal-call/${data.receiverId}`, 'name', 'width=1000,height=600,left=250,top=100')
                        }
                    }
                }
            })

            getUserCallDisconnected(data => {

                if (localStorage.getItem('callStatus') == 0) {
                    if (data.msg == 1) {
                        sendCallDown({
                            senderId: localStorage.getItem('userId'),
                            receiverId: localStorage.getItem('callId'),
                            type: localStorage.getItem('callType')
                        })
                        localStorage.removeItem('callId')
                        localStorage.removeItem('callType')
                        localStorage.removeItem('callStatus')
                        return
                    }
                }
                if (!localStorage.getItem('callId')) return
                if (data.receiverId != localStorage.getItem('callId')) return

                if (localStorage.getItem('callStatus') != -1) {
                    sendCallDown({
                        senderId: localStorage.getItem('userId'),
                        receiverId: localStorage.getItem('callId'),
                        type: localStorage.getItem('callType')
                    })
                    localStorage.removeItem('callId')
                    localStorage.removeItem('callType')
                    localStorage.removeItem('callStatus')
                }
            })
        })()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        document.getElementsByClassName('chat-wrapper')[0].setAttribute('data-theme', theme)
    }, [theme])

    useEffect(() => {
        if (!localStorage.getItem('accessToken')) {
            navigate('/')
        }
    })

    return (
        <div className="chat-wrapper" onClick={handleClick}>
            {/* <Loader></Loader> */}
            <Notification />
            {
                displayFormExtension === 1 ?
                    <FormAddMember />
                    :
                    displayFormExtension === 2 ?
                        <SetAvatarForm />
                        :
                        displayFormExtension === 3 ?
                            <SetNameForm />
                            :
                            displayFormExtension === 4 ?
                                <Ask />
                                : displayFormExtension === 5 ?
                                    <AskDelete /> : ''

            }
            {/* <FormAdddMember/> */}
            {
                display === 1 ?
                    <AddedFriendDialog></AddedFriendDialog>
                    :
                    display === 2 ?
                        <CreateGroup></CreateGroup>
                        :
                        display === 3 ?
                            <Profile friendProfile={isFriendProfileForm}></Profile>
                            :
                            display === 4 ?
                                <ReceiveCall></ReceiveCall> : ''

            }
            <TaskBar></TaskBar>
            <Tab></Tab>
            <Center></Center>
            {
                feature.isShow ? <Feature offset={feature.offset} group={feature.group}></Feature> : ''
            }
        </div>
    );
}

export default Chat