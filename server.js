const express = require('express');
var cors = require('cors');
const middleware = require('./src/middleware');
const app = express();
const port = 5000;

app.use(cors())


app.get('/', (req, res) => {
    res.send('Hello World!');
}
);

app.get('/testing', (req, res) => {
    res.send('yes it is working!');
}
);


app.use(middleware.decodeToken);

app.get('/checking', (req, res) => {
    res.send('The token is valid!');
}
);


app.get('/api/todos', (req, res) => {
    return res.json({
        todos: [
            { id: 1, text: 'Learn React' },
            { id: 2, text: 'Learn Node.js' },
            { id: 3, text: 'Learn Express' },
        ]
    });
}
);


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}
);