const PORT = 5000;

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const DatabaseService = require('./core/services/database-service');
const swaggerUi = require('swagger-ui-express'),
  swaggerDocument = require('./swagger.json');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());

const dbservice = new DatabaseService();

app.get('/message', async (req, res) => {
  const allMessages = await dbservice.getAllMessages();
  res.json(allMessages);
});

app.post('/message', async (req, res) => {
  const { message, fromUser } = req.body;
  await dbservice.addMessageToDB(message, fromUser);
  res.json(true);
});

app.delete('/message', async (req, res) => {
  const { id } = req.body;
  await dbservice.deleteMessage(id);
  res.json(true);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));
