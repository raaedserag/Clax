const mongoose = require('mongoose');
const db = require('../models/db');

var complaintSchema=new mongoose.Schema({
    // id:{
    //     unique,

    // },
    // user_id:{
        

    // },
    text:{
        type:String

    },
    trip:{

    },
    date:{
        type:Date,
        default:Date.now

    },
    status:{

        type:Boolean
    }






    })
    const Complaint=mongoose.model('Complaint',complaintSchema);

    // async function createComplaint(){
    //     const complaint = new Complaint({

    //         text:'test text3',
    //         trip:'trip test3',
    //         status:true
    //     });
    //     await db.connect();
    //     const result=await complaint.save();
    //     await db.close();
    //     console.log(result);

    // }
    // createComplaint();  
    



    module.exports.Complaint=Complaint