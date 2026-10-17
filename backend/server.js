const express=require("express");
const cors=require("cors");
const db=require("./database");
const app=express();
app.use(cors());
app.use(express.json());
app.get("/",(req,res)=>{
    res.send("Chat application backend is running");
});
app.get("/api",(req,res)=>{
    res.json({message:"Welcome to our Chat application API"});
});
app.get("/api/messages",(req,res)=>{
    const{sender,receiver}=req.query;
    if(
        !["Priya","Kavya"].includes(sender)||
        !["Priya","Kavya"].includes(receiver)||
        sender===receiver
    ){
        return res.status(400).json({
            error:"Please select two different valid users"
        });
    }
    const messages=db.prepare(`
        SELECT * FROM messages WHERE (sender=? AND receiver=?)
        OR (sender=? AND receiver=?)
        ORDER BY id ASC`).all(sender,receiver,receiver,sender);
        res.json(messages);
});
app.post("/api/messages",(req,res)=>{
  console.log("POST request received:",req.body);
   try{
    const message=req.body.message;
    const sender=req.body.sender;
    const receiver=req.body.receiver;
    if(!message||!message.trim()){
        return res.status(400).json({
            error:"Message cannot be empty"
        });
    }
    if(!["Priya","Kavya"].includes(sender)||
        !["Priya","Kavya"].includes(receiver)||
    sender===receiver){
        return res.status(400).json({
            error:"Choose a valid sender and receiver"
        });
    }
     const time=new Date().toLocaleTimeString([],{
        hour:"2-digit",
        minute:"2-digit"
     });
     const result=db.prepare(
        `INSERT INTO messages (text,time,sender,receiver)
        VALUES (?,?,?,?)`
     ).run(message.trim(),time,sender,receiver);
     const savedMessage=db.prepare(
        "SELECT * FROM messages WHERE id=?"
     ).get(result.lastInsertRowid);
     res.json({
        receivedMessage:savedMessage
     });
    }catch(error){
        console.error("MESSAGE ERROR:",error);
        if(res.headersSent){
            return
        }
        res.status(500).json({
            error:"Could not save message"
        });
    }

});
app.delete("/api/messages/:id",(req,res)=>{
    try{
        const id=Number(req.params.id);
        const result=db.prepare(
            "DELETE FROM messages WHERE id=?"
        ).run(id);
        if(result.changes===0){
            return res.status(404).json({
                error:"Message not found"
            });
        }
        res.json({
            message:"Message deleted successfully"
        });
    } catch(error){
        console.error("DELETE MESSAGE ERROR:",error);
        res.status(500).json({
            error:"Could not delete message"
        });
        
    }
});
app.delete("/api/messages",(req,res)=>{
    const {sender,receiver}=req.query;

    if(
        !["Priya","Kavya"].includes(sender)||
        !["Priya","Kavya"].includes(receiver)||
        sender===receiver
    ){
        return res.status(400).json({
            error:"Please select two different valid users"
        });
    }

    try{
        db.prepare(`
            DELETE FROM messages
            WHERE (sender=? AND receiver=?)
            OR (sender=? AND receiver=?)
        `).run(sender,receiver,receiver,sender);

        res.json({
            message:"Conversation cleared successfully"
        });
    }catch(error){
        console.error("CLEAR CONVERSATION ERROR:",error);
        res.status(500).json({
            error:"Could not clear conversation"
        });
    }
});
app.get("/test-route",(req,res)=>{
    res.send("I am running the correct server.js file");
});
app.use((req,res)=>{
    res.status(404).json({
        error:"Route not found"
    });
});
app.listen(5000,()=>{
    console.log("Server is running on the port 5000");
});
