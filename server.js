import express from 'express';
import mongoose from 'mongoose';
import Messages from './dbmessages.js';
import Pusher from 'pusher';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 9000;


const pusher = new Pusher({
    appId: '1088507',
    key: 'f75c5d8880e10edcb095',
    secret: '0c075ccbcbaab4e1e8dc',
    cluster: 'ap2',
    encrypted: true
  });

app.use(express.json());
app.use(cors());

const connection_url = 'mongodb+srv://admin:Miroh123@cluster0.5xm89.mongodb.net/whatssappdb?retryWrites=true&w=majority';

mongoose.connect(connection_url,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true,
})

const db = mongoose.connection;

db.once("open",()=>{

    console.log("Connected");

    const msgCollection = db.collection("messagecontents");
    const changeStream = msgCollection.watch();
    
    changeStream.on("change", (change)=>{
        console.log(change);

        if(change.operationType=='insert')
        {
            const msgdetails = change.fullDocument;
            pusher.trigger("messages","inserted",{
                name:msgdetails.name,
                message:msgdetails.message,
                timestamp:msgdetails.timestamp,
                received:msgdetails.received
            });
        }
        else{
            console.log("Err trigering Pusher");
        }
    });
});

app.get('/',(req,res)=>res.status(200).send('hello'));

app.get('/messages/sync',(req,res)=>{
    Messages.find((err,data)=>{
        if(err)
        res.status(500).send(err);
        else
        res.status(200).send(data);
    })
})

app.post('/messages/new',(req,res)=>{
    const dbmsg = req.body;

    Messages.create(dbmsg,(err,data)=>{
        if(err)
        res.status(500).send(err);
        else
        res.status(201).send(data);
    })
})


app.listen(port,()=>console.log("listening..."));