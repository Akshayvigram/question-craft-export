const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });


module.exports = function EncryptPDF() {
    const router = express.Router();

    router.use(bodyParser.raw({ type: "application/pdf", limit: "50mb" }));


    router.post("/encrypt-pdf", upload.single("pdf"), async (req, res) => {
        try {
            if (!req.file) return res.status(400).send("No PDF uploaded");

            const pdfBuffer = req.file.buffer;
            const userPassword = req.body.password;
            const ownerPassword = "owner123";

            // 👉 If no password given, just send back the original PDF
            if (!userPassword) {
                res.set({
                    "Content-Type": "application/pdf",
                    "Content-Disposition": "attachment; filename=Question_Paper.pdf",
                });
                return res.send(pdfBuffer);
            }

            // 👉 Otherwise encrypt using qpdf
            const inputPath = path.join(__dirname, `temp_input_${Date.now()}.pdf`);
            const outputPath = path.join(__dirname, `temp_encrypted_${Date.now()}.pdf`);

            fs.writeFileSync(inputPath, pdfBuffer);

            const cmd = `qpdf --encrypt ${userPassword} ${ownerPassword} 256 -- "${inputPath}" "${outputPath}"`;

            exec(cmd, (error) => {
                if (error) {
                    console.error("qpdf error:", error);
                    return res.status(500).send("Encryption failed");
                }

                const encryptedBuffer = fs.readFileSync(outputPath);
                res.set({
                    "Content-Type": "application/pdf",
                    "Content-Disposition": "attachment; filename=Encrypted_Question_Paper.pdf",
                });
                res.send(encryptedBuffer);

                fs.unlinkSync(inputPath);
                fs.unlinkSync(outputPath);
            });

        } catch (err) {
            console.error("Encryption error:", err);
            res.status(500).send("Encryption failed");
        }
    });

    console.log("✅ PDF Encryption router ready (Windows-compatible)");
    return router;
};
