const express = require('express');
const app = express();

const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');
const cors = require('cors');
const DB = require('./config')
const authRouter = require('./routes/auth')
const verifyJWT = require('./routes/verify')

app.use(
    cors({
        origin: "*",
        credentials: true,
    })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/auth', authRouter)
app.use(verifyJWT);

const ServerPORT = 5000;


app.get('/api/workouts', async function (req, res, next) {
    const userId = req.query.id
    console.log('userId', userId)
    let response = await DB.from("workouts").select("*").eq('userId', userId);
    console.log(response.data)
    if (response.data)
        res.json(response.data)
    else res.json([])

});

app.post('/api/new-workout', async (req, res, next) => {
    console.log('Submit called, userId = ' + req.body.userId);
    console.log('Request: ',req.body)
    if (!req.body.userId) return res.sendStatus(401);
    let exists = await DB.from("workouts").select('*').eq('title', req.body.title)
    if (exists.data.length > 0)
        return res.sendStatus(500)
    const lastRow = await DB.from("workouts")
        .select('*')
        .order("id", { ascending: false })
        .limit(1);
    console.log(lastRow.data[0])
    let added
    if (lastRow.data.length > 0) {
        added = await DB.from("workouts").insert({
            id: lastRow.data[0].id + 1,
            ...req.body,
        });
    } else {
        added = await DB.from("workouts").insert({
            id: 1,
            ...req.body,
        });
    }
    res.json(added)
})

app.delete("/api/delete/:id", async (req, res, next) => {
    console.log(`Delete called id = ${req.params.id}`)
    let deleted = await DB.from("workouts").delete().eq("id", req.params.id)
    res.json(deleted)
});


app.listen(ServerPORT, () => {
    console.log("listening on port " + ServerPORT);
})

