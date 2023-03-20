const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const port = process.env.PORT || 5000;

require('./chatSocket')(server);


app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/pages/index.html'));
});

server.listen(port, () => {
    console.log(`Server listening at port ${port}`);
});


