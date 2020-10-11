import mongoose from 'mongoose';

const whatsapp_schema = mongoose.Schema({
    name:String,
    message:String,
    timestamp:String,
    received:Boolean,
});

export default mongoose.model('messagecontents',whatsapp_schema);
