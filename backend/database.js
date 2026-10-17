const Database=require("better-sqlite3");
const path=require("path");
const db=new Database(path.join(__dirname,"chat.db"));
db.exec(`
    CREATE TABLE IF NOT EXISTS messages(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    time TEXT NOT NULL,
    sender TEXT NOT NULL DEFAULT 'Priya',
    receiver TEXT NOT NULL DEFAULT 'Kavya'
    ) 
`);
const columns=db.pragma("table_info(messages)");
const hasId=columns.some(
    (column)=> column.name==="id"
);
if(!hasId){
    db.exec(`
        ALTER TABLE messages RENAME TO messages_old;
        CREATE TABLE messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          text TEXT NOT NULL,
          time TEXT NOT NULL
        );
        INSERT INTO messages(text,time)
        SELECT text,time FROM messages_old;
        DROP TABLE messages_old;
        `);
}
const senderColumn=db.pragma("table_info(messages)")
.some((column)=> column.name==="sender");
if(!senderColumn){
    db.exec(`
        ALTER TABLE  messages
        ADD COLUMN sender TEXT NOT NULL DEFAULT 'Priya'`);
}
const receiverColumn=db.pragma("table_info(messages)")
.some((column)=>column.name==="receiver");
if(!receiverColumn){
    db.exec(`
        ALTER TABLE messages
        ADD COLUMN receiver TEXT NOT NULL DEFAULT 'Kavya'
    `);
}
module.exports=db;