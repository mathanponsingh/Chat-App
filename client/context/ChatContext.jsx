import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext()

export const ChatProvider = ({children}) =>{

    const [messages,setMessages] = useState([])
    const [users,setUsers] = useState([])
    const [selectedUser,setSelectedUser] = useState(null)
    const [unseenMessages,setUnseenMessages] = useState({})

    const { socket, axios } = useContext(AuthContext)


    // get users for sidebar

    const getUsers = async()=>{
        try {
            const {data} = await axios.get('/api/messages/users');
            if(data.success){
                setUsers(data.users)
                setUnseenMessages(data.unseenMessage)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // get messages

    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            if(data.success){
                setMessages(data.messages)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    
    // Send message

    const sendMessage = async (messageData) => {
        try {
            console.log(selectedUser._id);
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`,messageData)
            console.log(data);
            if(data.success){
                setMessages((prev)=>[...prev,data.newMessage])
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const subscribeToMessages = async () => {
        if(!socket)return;
        socket.on("newMessage",(newMessage)=>{
            if(selectedUser && newMessage.senderId === selectedUser._id){
                newMessage.seen = true;
                setMessages((prev)=>[...prev,newMessage])
                axios.put(`/api/messages/mark/${newMessage._id}`);
            }
            else{
                setUnseenMessages((prev)=>({
                    ...prev,
                    [newMessage.senderId] : prev[newMessage.senderId] ? prev[newMessage.senderId]+1 : 1
                }))
            }
        })
    }

    // unsubscribe

    const unsubscribeFromMessages = ()=>{
        if(socket)socket.off("newMessage")
    }

    useEffect(()=>{
        subscribeToMessages()
        return()=>unsubscribeFromMessages()
    },[socket, selectedUser])

    const value = {
      messages,
      users,
      selectedUser,
      getUsers,
      setMessages,
      sendMessage,
      setSelectedUser,
      unseenMessages,
      setUnseenMessages,
      getMessages,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}