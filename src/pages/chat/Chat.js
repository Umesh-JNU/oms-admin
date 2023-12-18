import React, { useContext, useEffect, useState } from 'react'
import { Store } from "../../states/store";
import { motion } from "framer-motion";

import { Client } from '@twilio/conversations';

import { toast } from "react-toastify";
import { toastOptions } from "../../utils/error";
import { Col, Row } from 'react-bootstrap';
import { ChatList } from 'react-chat-elements';
import { AutocompleteSearch, LoadingBox } from '../../components'
import Message from './Message';
import axiosInstance from '../../utils/axiosUtil';

const LIST = 'MULTIPLE_MESSAGE';
const OBJ = 'SINGLE_MESSAGE';

const Chat = () => {
  const { state } = useContext(Store);
  const { token, userInfo } = state;

  const [user, setUser] = useState();
  const [chats, setChats] = useState();
  const [client, setClient] = useState();
  const [convSID, setConvSID] = useState();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState();
  const [loadingMsg, setLoadingMsg] = useState(false);
  console.log({ chats, client, convSID });

  const getFormattedMsg = async (message) => {
    const { body, author, media, type, timestamp } = message.state;
    // console.log({ body, author, media, type, timestamp })

    const obj = {
      position: author === userInfo?._id ? "right" : "left",
      type: 'text',
      text: body,
      title: author === userInfo?._id ? `${userInfo.firstname} ${userInfo.lastname}` : `${user.title}`,
      date: new Date(timestamp)
    }

    if (media && type === 'media') {
      const { contentType, filename } = media.state;
      const cType = contentType.split('/')[0] === 'image' ? 'photo' : 'file';

      // console.log({ filename, contentType, cType });
      const uri = await media.getContentTemporaryUrl();

      return {
        ...obj,
        type: cType,
        text: cType === 'photo' ? '' : filename,
        data: {
          uri,
          status: { click: false, loading: 0 }
        }
      }
    }

    return obj;
  }

  const formatMessage = async (msgList, instaneType) => {
    console.log({ msgList, instaneType })

    switch (instaneType) {
      case LIST:
        return !msgList || msgList.length === 0 ? [] : await Promise.all(msgList.map(async (msg) => await getFormattedMsg(msg)));

      case OBJ:
        return await getFormattedMsg(msgList);

      default:
        toast.error("Something Went Wrong", toastOptions);
        break;
    }
  };

  const getAllParticipants = async (allConv, online) => {
    const participants = [];
    for (let conv of allConv.items) {
      const convPart = await conv.getParticipants();
      let userPart, adminPart;
      for (let p of convPart) {
        // await p.update({ lastReadMessageIndex: 0 });
        console.log({ p, userInfo });
        if (p.identity !== userInfo._id) {
          userPart = p;
        } else {
          adminPart = p;
        }
      }

      const obj = {
        sid: userPart.conversation?.sid,
        pid: userPart.sid,
        avatar: userPart.attributes?.profile_img,
        alt: 'img',
        title: userPart.attributes?.name,
      };

      const LIU = userPart.state.lastReadMessageIndex;
      const LIA = adminPart.state.lastReadMessageIndex;
      const ttl = await conv.getMessagesCount();

      const unread = online ? (ttl - LIA) : (LIU - LIA);
      console.log({ unread, LIU, LIA, a: LIU - LIA, t: ttl - LIA })
      participants.push(unread > 0 ? { ...obj, unread } : obj);
    }

    return participants;
  };

  useEffect(() => {
    if (client && convSID) {
      (async () => {
        const conv = await client.getConversationBySid(convSID);

        setLoadingMsg(true);
        const convMessage = await conv.getMessages();
        const formattedMsgList = await formatMessage(convMessage.items, LIST);
        setMessages(formattedMsgList);
        setConversation(conv);
        setLoadingMsg(false);
        // conv.on('messageAdded', async (message) => {
        //   const formattedMsg = await formatMessage(message, OBJ);
        //   console.log("messageAdded event", { message, formattedMsg });
        //   setMessages((prev) => [...prev, formattedMsg]);
        // });
        console.log({ conv, convMessage, formattedMsgList });
      })();
    }
  }, [client, convSID]);

  useEffect(() => {
    const handleNewMessage = async (message) => {
      const formattedMsg = await formatMessage(message, OBJ);
      console.log("messageAdded event", { message, formattedMsg });
      setMessages((prev) => [...prev, formattedMsg]);
    };

    if (conversation) {
      console.log("Attaching messageAdded event handler");
      conversation.on('messageAdded', handleNewMessage);
    }

    return () => {
      // Clean up the event handler when the component unmounts
      if (conversation) {
        console.log("Detaching messageAdded event handler");
        conversation.off('messageAdded', handleNewMessage);
      }
    };
  }, [conversation]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get(
          `/api/admin/chat/access-token`,
          { headers: { Authorization: token } }
        );

        console.log({ data })
        if (data.access_token) {
          const twiClient = new Client(data.access_token);
          twiClient.on('initialized', () => {
            console.log("Client Initialized");
            setClient(twiClient);
          })
          twiClient.on('initFailed', (error) => {
            toast.error(error.message, toastOptions);
          })
          twiClient.on("tokenAboutToExpire", async (time) => {
            try {
              const res = await axiosInstance.get(
                `/api/admin/chat/access-token`,
                { headers: { Authorization: token } }
              );

              twiClient = await twiClient.updateToken(res.data.access_token)
            } catch (error) {
              toast.error(error.message, toastOptions);
            }
          });
          const allConv = await twiClient.getSubscribedConversations();
          const participants = await getAllParticipants(allConv);

          twiClient.on('messageAdded', async () => {
            const allParts = await getAllParticipants(allConv, true);
            console.log("ON ADDED", { allParts });
            setChats(allParts)
          });
          console.log("PARTICIPANT", participants);
          setChats(participants);
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
        toast.error(error.response.data.error.message, toastOptions);
      }
    };
    fetchChats();
  }, []);

  const userHandler = async (user) => {
    if (!user) {
      toast.error("Invalid User", toastOptions);
      return;
    }

    try {
      // create conversation
      const { data } = await axiosInstance.post(
        '/api/admin/chat/create/?isAdmin=true',
        { userId: user._id },
        { headers: { Authorization: token } }
      );

      setChats(prev => [data.chat, ...prev]);
      setUser(data.chat.user);
      // setChatId(data.chat._id);
    } catch (error) {
      toast.error(error.response.data.error.message, toastOptions);
    }
  };

  const sendMessage = async (inputValue) => {
    if (!inputValue) { return; }

    try {
      if (typeof inputValue === 'object') {
        await conversation.prepareMessage().addMedia(inputValue).build().send();
      } else {
        await conversation.sendMessage(inputValue);
      }
      await axiosInstance.put("/api/admin/chat/read-horizon", {
        convSID, user: user.pid
      }, {
        headers: { Authorization: token }
      })

    } catch (err) {
      toast.error(err.response.data.error.message, toastOptions);
    }
  };

  return (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: "0%" }}
      transition={{ duration: 0.75, ease: "easeInOut" }}
      exit={{ x: "100%" }}
      style={{ flex: 1 }}
    >
      <Row className='h-100' style={{ margin: 0, backgroundColor: '#d3d0d0' }}>
        <Col md={5} className='h-100' style={{ borderRight: '1px solid #000', paddingTop: '5px' }}>
          <div style={{ height: '8%' }}>
            <AutocompleteSearch onSelect={userHandler} searchType="user" />
          </div>
          <div className='chat-list-box h-68 overflow-auto'>
            {loading ? <LoadingBox /> : <ChatList
              className='chat-list'
              dataSource={chats ? chats : []}
              onClick={(chat) => {
                setUser(chat);
                setConvSID(chat.sid);
              }}
            />}
          </div>
        </Col>

        <Col className='p-0 h-100 d-flex flex-column justify-content-between'>
          <Message reciever={user} loading={loadingMsg} messageList={messages} sendMessageToConv={sendMessage} />
        </Col>
      </Row>
    </motion.div>
  )
}

export default Chat