const fs = require('fs');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { generateServiceProviderMetadata } = require('@node-saml/passport-saml');
const SamlStrategy = require('@node-saml/passport-saml').Strategy;

const saml_options = {
    callbackUrl: 'rfmd-spud.woc.noaa.gov/login/callback',
    entryPoint: '',
    issuer: 'spud-saml',
    idpCert: '',
    privateKey: fs.readFileSync('./privateKey.pem', 'latin1'),
    publicCert: '',
    decryptionPvk: '',
    signatureAlgorithm: 'sha256',
    digestAlgorithm: '',
    additionalParams: {},
    passReqToCallback: false,
    allowCreate: false,
    signMetadata: true,
    name: 'saml',
    wantAssertionsSigned: true,
    wantAuthnResponseSigned: true,
};
const sessionOptions = {
    secret: ' secret spud ',
    resave: false,
    saveUninitialized: true,
    cookie: {}
};
const PORT = process.env.PORT || 7007;
const FILE_EXT = ['.css', '.html', '.js'];


passport.use(new SamlStrategy(saml_options));
// const app = express();
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({extended: true}));
// app.use(session(sessionOptions));
// app.use(passport.session());

// app.listen(PORT, () => {
//     console.log('App listening on PORT', PORT);
// });
console.log(generateServiceProviderMetadata(new SamlStrategy(saml_options)));