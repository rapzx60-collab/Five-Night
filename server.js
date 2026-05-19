require('dotenv').config();

const express = require('express');
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended:true }));

/* STATIC */

app.use(express.static(path.join(__dirname, '../public')));

/* STORAGE */

const upload = multer({
    dest:'/tmp'
});

/* FILE */

const STOCK_FILE = '/tmp/stocks.json';
const VOUCHER_FILE = '/tmp/voucher.json';

/* AUTO CREATE */

if(!fs.existsSync(STOCK_FILE)){

    fs.writeFileSync(
        STOCK_FILE,
        '[]'
    );

}

if(!fs.existsSync(VOUCHER_FILE)){

    fs.writeFileSync(
        VOUCHER_FILE,
        '[]'
    );

}

/* HOME */

app.get('/',(req,res)=>{

    res.sendFile(
        path.join(
            __dirname,
            '../public/Login&Registrasi.html'
        )
    );

});

/* GET STOCK */

app.get('/api/stocks',(req,res)=>{

    try{

        const data = fs.readFileSync(
            STOCK_FILE,
            'utf8'
        );

        res.json(JSON.parse(data));

    }catch(err){

        console.log(err);

        res.json([]);

    }

});

/* SAVE STOCK */

app.post('/api/stocks',(req,res)=>{

    try{

        fs.writeFileSync(
            STOCK_FILE,
            JSON.stringify(
                req.body,
                null,
                2
            )
        );

        res.json({
            success:true
        });

    }catch(err){

        console.log(err);

        res.json({
            success:false
        });

    }

});

/* GET VOUCHERS */

app.get('/api/vouchers',(req,res)=>{

    try{

        const data = fs.readFileSync(
            VOUCHER_FILE,
            'utf8'
        );

        let vouchers = JSON.parse(data);

        const today =
        new Date().setHours(
            0,0,0,0
        );

        vouchers = vouchers.filter(v=>{

            const expired =
            new Date(v.expired)
            .setHours(0,0,0,0);

            return expired >= today;

        });

        fs.writeFileSync(
            VOUCHER_FILE,
            JSON.stringify(
                vouchers,
                null,
                2
            )
        );

        res.json(vouchers);

    }catch(err){

        console.log(err);

        res.json([]);

    }

});

/* SAVE VOUCHERS */

app.post('/api/vouchers',(req,res)=>{

    try{

        fs.writeFileSync(
            VOUCHER_FILE,
            JSON.stringify(
                req.body,
                null,
                2
            )
        );

        res.json({
            success:true
        });

    }catch(err){

        console.log(err);

        res.json({
            success:false
        });

    }

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
                message:'File tidak ditemukan'
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

        await fetch(

            `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPhoto`,

            {
                method:'POST',
                body:form
            }

        );

        fs.unlinkSync(req.file.path);

        res.json({
            success:true,
            message:'Terkirim ke Telegram 🚀'
        });

    }catch(err){

        console.log(err);

        res.json({
            success:false,
            message:'Gagal mengirim'
        });

    }

});

/* EXPORT */

module.exports = app;
