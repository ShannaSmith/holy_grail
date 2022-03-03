var express = require("express");
var app = express();
var redis = require("redis");
var client = redis.createClient();
client.connect();
// serve static files from public directory
app.use(express.static("public"));

// init values
const setIntialData = async () => {
  await client.mSet("header", 0, "left", 0, "article", 0, "right", 0, "footer", 0);
  await client.mGet(
  ["header", "left", "article", "right", "footer"],
  function (err, value) {
    console.log(value);
  }
)};
setIntialData();
function data() {
  return new Promise(async (resolve, reject) => {
     await client.mGet(
        ["header", "left", "article", "right", "footer"],
        function (err, value) {
          const data = {
            header: Number(value[0]),
            left: Number(value[1]),
            article: Number(value[2]),
            right: Number(value[3]),
            footer: Number(value[4]),
          };
          err ? reject(null) : resolve(data);
        }
      );
    });
}

// get key data
app.get("/data", function (req, res) {
  data().then((data) => {
    console.log(data);
    res.send(data);
  });
});

// plus
app.get("/update/:key/:value", async (req, res) => {
  const key = req.params.key;
  let value = Number(req.params.value);
 await client.get(key, async (err, reply) =>{
    // new value
    value = Number(reply) + value;
    await client.set(key, value);

    // return data to client
    data().then((data) => {
      console.log(data);
      res.send(data);
    });
  });
});

app.listen(3000, () => {
  console.log("Running on 3000");
});

process.on("exit", function () {
  client.quit();
});
