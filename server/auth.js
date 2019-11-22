const OktaJwtVerifier = require('@okta/jwt-verifier');

const oktaJwtVerifier = new OktaJwtVerifier({
    issuer: 'https://dev-337333.oktapreview.com/oauth2/default', // required
    clientId: '0oafkl686pfl21cP10h7'
});

module.exports = (req, res, next) => {

    const authHeader = req.headers.authorization || '';
    const match = authHeader.match(/Bearer (.+)/);
    if (!match) {
        return res.status(403).send({
            "error": true,
            "message": 'No token provided.'
        });
    }
    const accessToken = match[1];
    const expectedAud = 'api://default';
    oktaJwtVerifier.verifyAccessToken(accessToken, expectedAud)
        .then(jwt => {
            // the token is valid (per definition of 'valid' above)
            next();
        })
        .catch(err => {
            // a validation failed, inspect the error
            return res.status(401).json({ "error": true, "message": 'Unauthorized access.' });

        });
}

