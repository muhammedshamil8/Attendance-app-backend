const express = require('express');
var cors = require('cors');
const middleware = require('./middleware');
const app = express();
const port = 5000;

app.use(cors())


app.use(middleware.decodeToken);

app.get('/', (req, res) => {
    res.send('Hello World!');
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