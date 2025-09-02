const express = require('express');
const router = express.Router();
const axios = require('axios');


module.exports = function(  config) {
const SLACK_WEBHOOK_URL = config.SLACK_WEBHOOK_URL;
router.post("/slack-alert", async (req, res) => {
  const { fullName, email, subject, message } = req.body;
  try {
    await axios.post(SLACK_WEBHOOK_URL, {
      text: `*Support Alert Received*`,
      attachments: [
        {
          color: "#36A64F",
          fields: [
            { title: "Name", value: fullName, short: true },
            { title: "Email", value: email, short: true },
            { title: "Purpose", value: subject, short: true },
            { title: "Message", value: message, short: true },
          ]
        }
      ]
    });
    res.status(200).send({ ok: true });
  } catch (error) {
    console.error("Slack error", error);
    res.status(500).send({ error: "Failed to send Slack alert" });
  }
});
 return router;
};