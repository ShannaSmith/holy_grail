const express = require("express");
const app = express();

const redis = require("redis");
const client = redis.createClient();
client.connect();

const keys = ["header", "left", "article", "right", "footer"];

const setInitialData = async () => {
  await client.mSet([...keys.map((x) => [x, "1"])]);
  const result = await client.mGet(keys);
};
setInitialData();

function data() {
  return new Promise(async (resolve, reject) => {
    const value = await client.mGet(keys);

    const data = { ...keys };
    keys.forEach((key, i) => {
      data[key] = value[i];
    });

    resolve(data);
  });
}

app.use(express.static("client"));

app.get("/data", (_, res) => {
  data().then((data) => {
    res.send(data);
  });
});

app.get("/update/:key/:value", async (req, res) => {
  const { key, value } = req.params;
  const newValue = Number(await client.get(key)) + Number(value);
  await client.set(key, newValue.toString());

  data().then((data) => {
    res.send(data);
  });
});

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => console.log(`Running on port: ${port}...`));