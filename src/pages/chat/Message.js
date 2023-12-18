import React, { useEffect, useRef, useState } from 'react'

import { toast } from "react-toastify";
import { toastOptions } from "../../utils/error";
import { IoMdSend } from "react-icons/io";
import { ImAttachment } from "react-icons/im";
import { LoadingBox } from '../../components'
import { Button, ChatItem, Input, MessageList } from 'react-chat-elements';

const readFileAsBlob = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const arrayBuffer = reader.result;
      const blob = new Blob([arrayBuffer], { type: file.type });
      resolve(blob);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
};

export default function Message({ reciever, loading, messageList, sendMessageToConv }) {
  console.log({ reciever })
  const inputRef = useRef(null);
  const inputFileRef = useRef(null);
  const messageBoxRef = useRef(null);
  const [inputValue, setInputValue] = useState();

  useEffect(() => {
    if (messageBoxRef.current && !loading) {
      // messageBoxRef.current.scrollIntoView({ behaviour: 'smooth' });
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  }, [messageList, loading]);

  const sendMessage = async () => {
    inputRef.current.value = '';
    inputRef.current.focus();
    inputFileRef.current.value = '';

    await sendMessageToConv(inputValue);
    setInputValue('');
  };

  const fileChangeHandler = async (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      try {
        const fileBlob = await readFileAsBlob(selectedFile);
        console.log({ fileBlob })
        // Send the media message
        setInputValue({
          contentType: selectedFile.type,
          filename: selectedFile.name,
          media: fileBlob,
        });
        inputRef.current.value = selectedFile.name;

      } catch (error) {
        console.log(error);
        toast.error('Error preparing message', toastOptions);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent the default behavior of the Enter key
      sendMessage();
    }
  };

  const onDownLoad = ({ data }) => {
    // console.log({ data, url: data.uri }, "file download");
    const anchorlink = document.createElement("a");
    anchorlink.href = data.uri;
    anchorlink.setAttribute("download", 'file.pdf');
    anchorlink.click();
  };

  return (reciever ?
    <>
      <div style={{ borderBottom: '1px solid #000' }}>
        <ChatItem {...reciever} className='msg-box-top' />
      </div>

      <div className='msg-box' ref={messageBoxRef}>
        {loading ? <LoadingBox /> : <MessageList
          className='message-list'
          lockable={true}
          toBottomHeight={'100%'}
          onDownload={onDownLoad}
          dataSource={messageList} />}
      </div>

      <div className='d-flex align-items-center p-2' style={{ position: 'relative', backgroundColor: '#fff' }}>
        <div>
          <label htmlFor="file-input" className='rce-button'>
            <ImAttachment size={20} />
          </label>
          <input type='file' id='file-input' style={{ display: 'none' }} ref={inputFileRef} onChange={fileChangeHandler} onKeyPress={sendMessage} />
        </div>
        <div style={{ width: '100%' }}>
          <Input
            placeholder='Type here...'
            referance={inputRef}
            autofocus={true}
            multiline={true}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.trim())}
            onKeyPress={handleKeyPress}
            rightButtons={
              <Button
                onClick={sendMessage}
                title="Send"
                icon={{
                  float: 'right',
                  size: 20,
                  component: <IoMdSend />
                }}
              />
            }
          />
        </div>
      </div>
    </> : <></>
  )
}

