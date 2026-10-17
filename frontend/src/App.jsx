import { useState,useEffect } from 'react';
import './App.css';
function App() {
  const [message,setMessage]=useState('');
  const [sender, setSender] = useState('Priya');
  const [receiver, setReceiver] = useState('Kavya');
  const [messages,setMessages]=useState([]);
  const[sending,setSending]=useState(false);
  const [sendError, setSendError] = useState('');
  const[loadError,setLoadError]=useState('');
  
  useEffect(()=>{
    let isActive=true;
    
    async function loadMessages(){
      try{
        const response=await fetch(
        `http://localhost:5000/api/messages?sender=${sender}&receiver=${receiver}`
        );
        if(!response.ok){
          if(sender===receiver){
            setLoadError('Please select a different receiver.');
            return;
          }
          throw new Error('Failed to load messages');
        }
        const data=await response.json();
        if(isActive){
          setMessages(data);
          setLoadError('');
        }
      }catch(error){
        console.error('Error loading messages:',error);
        if(isActive){
          setLoadError('Could not load messages.Please check your backend.');
        }
      }
    }
    loadMessages();
    const intervalId=setInterval(loadMessages,3000);
    return ()=>{
      isActive=false;
      clearInterval(intervalId);
    };
  },[sender,receiver]);
      
  async function handleSend(){
    if (message.trim()==='') return;
    if(sender===receiver){
      alert('Please select a different receiver.');
      return;
    }
    setSending(true);
    setSendError('');
    const newMessage={
      text:message,
      time:new Date().toLocaleTimeString([],{
        hour:'2-digit',
        minute:'2-digit'
      })
    };
  try{
    const response=await fetch(
      'http://localhost:5000/api/messages',
      {
        method:'POST',
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify({
          message:newMessage.text,
          sender:sender,
          receiver:receiver
        })
      }
    );
    if(!response.ok){
      throw new Error('Failed to send message');
    }
    const data =await response.json();
    setMessages(previousMessages=>[
      ...previousMessages,
      data.receivedMessage
    ]);
    setMessage('');
  } catch(error){
    console.error('Error sending message:',error);
    setSendError('Could not send the message.Please check your backend.');
  }finally{
    setSending(false);
  }
}
  async function handleDelete(id){
    const confirmed=window.confirm("Are you sure you want to delete this message?");
  
  if(!confirmed) return;
  try{
    const response=await fetch(
      `http://localhost:5000/api/messages/${id}`,
      {
        method:'DELETE'
      }
    );
    if(!response.ok){
      throw new Error('Failed to delete message');
    }
    setMessages(previousMessages=>
      previousMessages.filter(msg=> msg.id!==id)
    );
  } catch(error){
    console.error('Error deleting message:',error);
    alert('Could not delete the message.');
  }
}

async function handleClear(){
    const confirmed=window.confirm(
        'Are you sure you want to delete all messages in this conversation?'
    );

    if(!confirmed) return;

    try{
        const response=await fetch(
            `http://localhost:5000/api/messages?sender=${encodeURIComponent(sender)}&receiver=${encodeURIComponent(receiver)}`,
            {
                method:'DELETE'
            }
        );

        if(!response.ok){
            throw new Error('Failed to clear conversation');
        }

        setMessages([]);
    }catch(error){
        console.error('Error clearing conversation:',error);
        alert('Could not clear messages. Please try again.');
    }
}

  return (
    <div className="chat-app">
      <h1>My Chat App 💬</h1>
      <div className="user-selection">
        <label>
          Sending as:
          <select value={sender} onChange={(event)=>setSender(event.target.value)}>
            <option value="Priya">Priya</option>
            <option value="Kavya">Kavya</option>
          </select>
        </label>
        <label>
          Sending to:
          <select value={receiver} onChange={(event)=>setReceiver(event.target.value)}>
            <option value="Priya">Priya</option>
            <option value="Kavya">Kavya</option>
          </select>
        </label>
      </div>

      <div className="chat-box">
        {messages.length===0 ? (
          <p className="empty-chat">No Messages yet. Start Chatting!</p>
        ):(
         
          
messages.map((msg,index)=>(
  <div
    className={
      typeof msg === "string"
        ? "sent"
        : msg.sender === sender
          ? "sent"
          : "received"
    }
    key={typeof msg === "string" ? index : msg.id}
  >
    <span>
      {typeof msg === "string" ? msg : `${msg.sender}: ${msg.text}`}
    </span>

    {typeof msg !== "string" && (
      <div className="message-actions">
        <small>{msg.time}</small>
        <button onClick={() => handleDelete(msg.id)}>Delete</button>
      </div>
    )}
  </div>
))

)}
</div>        
      
       {loadError && (
        <p className="error-message">
          {loadError}
        </p>
      )}   
      
      {sendError&&(
        <p style={{color:'red',backgroundColor:'#ffe6e6',border:'1px solid red',padding:'10px',
          borderRadius:'6px',margin:'10px 0'}}>{sendError}</p>
        )}

      <input type="text" placeholder="Type a message..." value={message} onChange={(event)=>setMessage(event.target.value)} 
        onKeyDown={(event)=>{
          if(event.key==='Enter'){
            handleSend();
          }
        }}
        />

      <button className="send" onClick={handleSend}disabled={sending}>{sending ?'Sending...':'Send'}</button>
      <button  className="clear-button" onClick={handleClear}>Clear Chat</button>
    </div>
  );
}

export default App;