import express from "express";
const app = express();
app.use(express.json()); // application/json
app.use((error, req, res, next) => {
    console.log(error);
});
app.listen(3000);
