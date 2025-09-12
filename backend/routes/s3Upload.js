const express = require('express');
const AWS = require('aws-sdk');

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
            const { filename, filetype } = req.query;
            const params = {
                Bucket: config.S3_BUCKET_NAME,
                Key: filename,
                Expires: 300,
                ContentType: filetype,
            };

            const uploadURL = await s3.getSignedUrlPromise('putObject', params);
            // console.log('Upload URL:'+uploadURL);

            const objectURL = `https://${config.S3_BUCKET_NAME}.s3.${config.REGION_AWS}.amazonaws.com/${filename}`;
            // console.log('Public S3 Object URL:', objectURL);


            res.send({ uploadURL, objectURL });


        } catch (err) {
            console.error('Error' + err);

        }
    });


    // To store the email, objectURL, dateTime, sbujectName to the MySql DB.
    router.post('/store-upload-metadata', async (req, res) => {
        const { email, uploadURL, objectURL, dateTime, subjectName } = req.body;

        if (!email || !objectURL || !dateTime || !subjectName) {
            return res.status(400).json({ message: 'Missing field' });
        }

        try {
            const UsersId = await db.query("SELECT id FROM users WHERE email = ?", [email]);
            const id = UsersId[0].id;

            await db.query('INSERT INTO question_papers (user_id, qp_s3_url, created_at, subjectName) VALUES (?,?,?,?)', [id, objectURL, dateTime, subjectName]);

            return res.status(200).json({ message: 'Data in MySql DB Succesfully stored' });
        } catch (error) {
            console.error('Cannot insert', error);
            return res.status(500).json({ message: 'Databse Error' });
        }
    })

    console.log("✅ S3 Upload and DB ready to upload");

    //To get recent generated history from db
    router.post('/get-questions-paper-history', async (req, res) => {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        try {

            const result = await db.query(`
                    SELECT 
                      qp.qp_s3_url AS objectUrl,
                      DATE(qp.created_at) AS created_at,  
                      qp.subjectName
                    FROM 
                      question_papers qp
                    JOIN 
                      users u ON u.id = qp.user_id
                    WHERE 
                      u.email = ?
                    ORDER BY 
                      qp.created_at DESC
                    LIMIT 3
                `,
                [email]
            );

            // console.log("DEBUG result from db.query():", result);

            if (result.length === 0) {
                return res.status(404).json({ message: 'No entries found for this email' });
            }

            res.json({ email, data: result });
        } catch (error) {
            console.error('Error fetching history:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    return router;
}