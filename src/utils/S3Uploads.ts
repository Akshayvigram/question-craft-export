import { useState } from "react";
import axios from 'axios';
import { generatePDF } from "./pdfGenerator"



// const [uploding, setUploading] = useState(false);
export const S3Upload = async (config, token) => {
    const api_token = localStorage.getItem("apiToken");
    try {

        // console.log(config);
        console.log("Token:" + token);


        const paperData = typeof config === "string" ? JSON.parse(config) : config;
        const subjectName = paperData.subjectName;
        console.log("Subject Name: "+subjectName);


        // const filename = (config?.subjectName || 'Question Paper') + ".pdf";
        const now = new Date();

        const filename = `${subjectName.replace(/\s+/g, '_')}_${token}.pdf`;

        console.log("File Name: "+filename);

        // console.log(filename);

        const blob = await generatePDF("question-paper-content", filename);


        const file = new File([blob], filename, { type: blob.type });
        console.log("File.name: "+file.name);
        console.log("File.type: "+file.type);

        const payload = {
            filename: file.name,
            filetype: file.type
        };

        // const response = await axios.get(`https://vinathaal.azhizen.com/api/get-upload-url`, {
        const response = await axios.get(`https://vinathaal.azhizen.com/api/get-upload-url`, {
            params: payload,
            headers: {
                'Authorization': `Bearer ${api_token}`
            }
        });

        const uploadUrl = response.data.uploadURL;
        console.log(uploadUrl);

        const ObjectUrl = response.data.objectURL;
        console.log(ObjectUrl);


        await axios.put(uploadUrl, blob, {
            headers: {
                'Content-Type': 'application/pdf',
            },
        });

        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const email = user?.email;

        const istoffset = 5.5 * 60 * 60 * 1000;
        const isTime = new Date(now.getTime() + istoffset);

        const dateTime = isTime.toISOString().replace('T', ' ').slice(0, 19);

        console.log("Frontend Data", {
            email,
            uploadURL: uploadUrl,
            objectURL: ObjectUrl,
            subjectName: subjectName,
            dateTime,
        });
        

        await axios.post("https://vinathaal.azhizen.com/api/store-upload-metadata", {
        email,
        uploadURL: uploadUrl,
        objectURL: ObjectUrl,
        subjectName: subjectName,
        dateTime,
    }, {
        headers: {
            'Authorization': `Bearer ${api_token}`
        }
    })
    .then(res => {
        console.log(res.data.message);
    })
    .catch(err => {
        console.error('❌ Error storing upload metadata:', err);
    });

    } catch (err) {
        console.error('❌ Upload failed:', err);
    }
} 
