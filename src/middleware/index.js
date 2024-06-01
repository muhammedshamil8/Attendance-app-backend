const admin = require("../config/firebase");

async function decodeToken(req, res, next) {
    // Check if the 'Authorization' header exists
    if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Unauthorized - Missing Authorization header' });
    }

    // Split the 'Authorization' header to extract the token
    const tokenParts = req.headers.authorization.split(' ');

    // Check if the 'Authorization' header has the expected format
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Unauthorized - Invalid Authorization header format' });
    }

    const token = tokenParts[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);

        // console.log(decodedToken);
        if (decodedToken) {
            req.user = decodedToken;
            return next();
        }
        return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

function checkRole(role) {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized - No user found' });
        }
        const { uid } = req.user;
        const userRecord = await admin.auth().getUser(uid);
        const { customClaims } = userRecord;
        if (customClaims && customClaims.role === role) {
            console.log('Authorized');
            next();
        } else {
            console.log('Forbidden');
            res.status(403).send('Forbidden');
        }
    };
}

module.exports = {
    decodeToken,
    checkRole
};
