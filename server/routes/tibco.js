const express = require('express')
const tibco = express.Router();
const _ = require('lodash');


var ObjectID = require('mongodb').ObjectID;

tibco.get('/getsolution', (req, res, next) => {
    const requestDb = req.app.locals.db.collection("cegoogler");
    requestDb.find().toArray((err, result) => {
        if (err) {
            res.status(400).send({ 'error': err })
        }
        if (result === undefined || result.length === 0) {
            res.status(400).send({ 'error': 'No Result Found in database' })
        } else {
            res.status(200).send(result)
        }
    })
})
tibco.get('/search', async (req, res, next) => {
    const requestDb = req.app.locals.db.collection("cegoogler");
    let response;
    try {
        response = await requestDb.find({ title: { $regex: new RegExp('^' + req.query.keyword.toUpperCase()) } }).toArray();
        if (response === undefined || response.length === 0) {
            res.status(400).send({ 'error': 'No Result found in database' })
        } else {

            res.status(200).send(response);
        }
    } catch (error) {
        res.status(400).send({ 'error': error })
    }
})
tibco.post("/getsolution", (req, res) => {
    const requestDb = req.app.locals.db.collection("cegoogler");

    const body = {
        'title': req.body.title,
        'error_decription': req.body.error_decription,
        'solution': req.body.error_decription
    };
    requestDb.insertOne(body, (err, result) => {
        if (err) {
            res.status(400).send({ 'error': err })
        }
        res.status(200).send({ message: "Request created successfully" })
    })
});

module.exports = tibco

