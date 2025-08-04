import { useState } from "react";
import axios from 'axios';
import { generatePDF } from "./pdfGenerator"



// const [uploding, setUploading] = useState(false);
export const S3Upload = async (config, token) => {
    try {

        console.log(config);
        console.log(token);


        const paperData = typeof config === "string" ? JSON.parse(config) : config;
        const subjectName = paperData.subjectName;
        console.log(subjectName);


        // const filename = (config?.subjectName || 'Question Paper') + ".pdf";
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-'); // ISO format with safe characters

        const filename = `${subjectName.replace(/\s+/g, '_')}_${token}.pdf`;

        console.log(filename);

        // console.log(filename);

        const blob = await generatePDF("question-paper-content", filename);


        const file = new File([blob], filename, { type: blob.type });
        console.log(file.name);
        console.log(file.type);

        const payload = {
            filename: file.name,
            filetype: file.type
        };

        // const response = await axios.get(`https://vinathaal.azhizen.com/api/get-upload-url`, {
        const response = await axios.get(`http://localhost:3001/api/get-upload-url`, {
            params: payload
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
        // const timestamp = new Date().toISOString();
        alert('✅ File uploaded to S3 successfully!' + file.name);

        const istoffset = 5.5 * 60 * 60 * 1000;
        const isTime = new Date(now.getTime() + istoffset);

        const dateTime = isTime.toISOString().replace('T', ' ').slice(0, 19);

        console.log("Frontend Data", {
            email,
            uploadURL: uploadUrl,
            objectURL: ObjectUrl,
            dateTime,
        });
        

        await axios.post("http://localhost:3001/api/store-upload-metadata", {
            email,
            uploadURL: uploadUrl,
            objectURL: ObjectUrl,
            dateTime,
        })



    } catch (err) {
        console.error('❌ Upload failed:', err);
        alert('Failed to upload file');
    }

    alert('File Generated Succesfully');
} 
