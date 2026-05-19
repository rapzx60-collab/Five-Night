const express = require('express');
const multer = require('multer');
const FormData = require('form-data');
const cors = require('cors');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended:true
}));

/* STATIC FILE */

app.use(express.static(__dirname));

/* MULTER */

const upload = multer({
    dest:'/tmp'
});

/* HOME */

app.get('/',(req,res)=>{

    res.sendFile(
        path.join(
            __dirname,
            'Login&Registrasi.html'
        )
    );

});

/* SEND TELEGRAM */

app.post(
    '/send',
    upload.single('photo'),
    async(req,res)=>{

    try{

        if(!req.file){

            return res.json({
                success:false,
                message:'Foto tidak ditemukan'
            });

        }

        const form = new FormData();

        form.append(
            'chat_id',
            process.env.CHAT_ID
        );

        form.append(
            'photo',
            fs.createReadStream(
                req.file.path
            )
        );

        form.append(
            'caption',
            req.body.caption || ''
        );

        form.append(
            'parse_mode',
            'HTML'
        );

        const response = await fetch(

            `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPhoto`,

            {
                method:'POST',
                body:form
            }

        );

        const result =
        await response.json();

        console.log(result);

        fs.unlinkSync(req.file.path);

        res.json({
            success:true,
            message:'Berhasil dikirim 🚀'
        });

    }catch(err){

        console.log(err);

        res.status(500).json({
            success:false,
            message:'Server Error',
            error:String(err)
        });

    }

});

/* TEST */

app.get('/test',(req,res)=>{

    res.send('SERVER ONLINE 🚀');

});

/* EXPORT */

module.exports = app;
