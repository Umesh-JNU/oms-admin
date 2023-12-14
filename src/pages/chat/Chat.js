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

  const [client, setClient] = useState();
  const [convSID, setConvSID] = useState();
  const [conversation, setConversation] = useState();
  console.log({ client, convSID });

  const [loadingMsg, setLoadingMsg] = useState(false);
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState();

  const getFormattedMsg = async (message) => {
    const { body, attributes, author, media, type, timestamp } = message.state;
    // console.log({ body, attributes, author, media, type, timestamp })

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

  const getAllParticipants = async (allConv) => {
    const participants = [];
    for (let conv of allConv.items) {
      const convPart = await conv.getParticipants();
      for (let p of convPart) {
        console.log({ p, userInfo });
        if (p.identity !== userInfo._id) {
          const obj = {
            sid: p.conversation?.sid,
            avatar: p.attributes?.profile_img,
            alt: 'img',
            title: p.attributes?.name,
          };

          const ttl = await conv.getMessagesCount();
          const unread = ttl - (p.lastReadMessageIndex ? p.lastReadMessageIndex : 0);
          participants.push(unread > 0 ? { ...obj, unread } : obj);
        }
      }
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

  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState();
  const [chatID, setChatId] = useState();

  console.log({ chats })

  useEffect(() => {
    const handleNewMessage = async (message) => {
      const formattedMsg = await formatMessage(message, OBJ);
      console.log("messageAdded event", { message, formattedMsg });
      setMessages((prev) => [...prev, formattedMsg]);
    };

    if (conversation) {
      conversation.getMessages().then(async (messages) => {
        const message = messages.items[5];

        // advance the conversation's last read message index to the current read horizon - won't allow you to move the marker backwards
        const a = await conversation.advanceLastReadMessageIndex(message.index);

        // set last read message index of the conversation to a specific message
        const b = await conversation.updateLastReadMessageIndex(message.index);

        // Mark all messages read
        // const c = await conversation.setAllMessagesRead();

        // Mark all messages unread
        // const d = await conversation.setAllMessagesUnread();
        console.log({ a, b, })
      }).catch(err => console.log("EEERRRRRRRRRRRRRRRRRR", { err }));

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

          const allConv = await twiClient.getSubscribedConversations();
          const participants = await getAllParticipants(allConv);
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

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get(
          `/api/admin/chats/all`,
          { headers: { Authorization: token } }
        );

        setChats(data.chats);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        toast.error(error.response.data.error.message, toastOptions);
      }
    })();
  }, [token]);

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
      setChatId(data.chat._id);
    } catch (error) {
      toast.error(error.response.data.error.message, toastOptions);
    }
  };

  const sendMessage = async (inputValue) => {
    // console.log({ t: typeof inputValue, inputValue })

    if (!inputValue) {
      return;
    }
    try {
      if (typeof inputValue === 'object') {
        const sentMediaMsg = await conversation.prepareMessage().addMedia(inputValue).setAttributes({ authorName: `${userInfo.firstname} ${userInfo.lastname}`, content_type: inputValue.contentType }).build().send();
        // console.log({ sentMediaMsg })
      } else {
        await conversation.sendMessage(inputValue, {
          authorName: `${userInfo.firstname} ${userInfo.lastname}`
        })

        const unread = await conversation.getUnreadMessagesCount();
        const msg = await conversation.getMessages();
        // console.log({ msg, unread });
      }

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