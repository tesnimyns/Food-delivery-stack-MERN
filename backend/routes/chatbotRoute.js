import express from 'express';
import dialogflow from '@google-cloud/dialogflow';
import { v4 as uuid } from 'uuid';

const chatbotRouter = express.Router();

// Ton identifiant et credentials (clé JSON exportée de Dialogflow)
import CREDENTIALS from '../key.json' assert { type: "json" };
const projectId = CREDENTIALS.project_id;

const sessionClient = new dialogflow.SessionsClient({
  credentials: {
    private_key: CREDENTIALS.private_key,
    client_email: CREDENTIALS.client_email
  }
});

chatbotRouter.post('/dialogflow', async (req, res) => {
  const sessionId = uuid();
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: req.body.message,
        languageCode: 'fr',
      },
    },
  };

  const responses = await sessionClient.detectIntent(request);
  const result = responses[0].queryResult;
  res.json({ reply: result.fulfillmentText });
});

export default chatbotRouter;
