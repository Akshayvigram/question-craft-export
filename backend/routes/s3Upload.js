const express = require('express');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const cors = require('cors');
const { Key } = require('lucide-react');

module.exports = function S3Upload(config, db) {
    const router = express.Router();

    const s3 = new AWS.S3({
        region: config.REGION_AWS,
        credentials: {
            accessKeyId: config.ACCESS_KEY_ID_AWS,
            secretAccessKey: config.SECRET_ACCESS_KEY_AWS,
        },
    });

    // S3 File Uploads
    router.get('/get-upload-url', async (req, res) => {
        try {
            const { filename, filetype} = req.query;
            const params = {
                Bucket: config.S3_BUCKET_NAME,
                Key: filename,
                Expires: 300,
                ContentType: filetype,
            };

            const uploadURL = await s3.getSignedUrlPromise('putObject', params);
            console.log('Upload URL:'+uploadURL);

            const objectURL = `https://${config.S3_BUCKET_NAME}.s3.${config.REGION_AWS}.amazonaws.com/${filename}`;
            console.log('Public S3 Object URL:', objectURL);


            res.send({uploadURL, objectURL});
            
            
        } catch (err) {
            console.error('Error'+ err);
            
        }
    });


    router.post('/store-upload-metadata', async (req, res)=> {
        const { email, uploadURL, objectURL, dateTime} = req.body;

        console.log("Backend Data", {
            email, uploadURL, objectURL, dateTime
        });
        

        if (!email || !uploadURL || !objectURL || !dateTime) {
            return res.status(400).json({message: 'Missing field'});
        }

        try {
            const query = 'INSERT INTO question_papers (qp_s3_url, created_at) VALUES (?,?)';
            await db.execute(query, [objectURL, dateTime]);
            // alert("Data Stored in DB")

            return res.status(200).json({message: 'Succesfully stored'});
        } catch (error) {
            console.error('Cannot insert', error);
            return res.status(500).json({message: 'Databse Error'});
        }
    })

    return router;
}