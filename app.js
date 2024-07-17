const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// CORS configuration
const corsOptions = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: "Access-Control-Allow-Headers,Access-Control-Allow-Origin,Access-Control-Request-Method,Access-Control-Request-Headers,Origin,Cache-Control,Content-Type,X-Token,X-Refresh-Token",
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.get('/api/schedules', (req, res) => {
    axios.get('https://ymca360.org/api/external/v1/schedules', {
            headers: {
              Authorization: 'Basic Y2FwaXRhbGFyZWE6ZmRjNzdjODAzN2Y1YzliNzkzMDJhYjA5M2YyNTBlODA='
            }
    })
      .then(response => {
        res.json(response.data);
      })
      .catch(error => {
        res.status(500).send(error.message);
      });
  });

app.use(cors(corsOptions));

app.use(express.static('public'));

app.listen(3000, () => {
    console.log("App listening on port 3000");
});
