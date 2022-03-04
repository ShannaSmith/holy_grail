var express = require("express");
var app = express();
var redis = require("redis");
var client = redis.createClient();
client.connect();
// serve static files from public directory
app.use(express.static("public"));

// init values
const setIntialData = async () => {
  console.log('setIntialData')
  await client.mSet(
    'header',
    0,
    'left',
    0,
    'article',
    0,
    'right',
    0,
    'footer',
    0
  )
  await client.mGet(
    ['header', 'left', 'article', 'right', 'footer'],
    function (err, value) {
      console.log(value)
    }
  )
}
setIntialData()
const data = async () => {
  console.log('data')

  // Option 1
  // return client.mGet(['header', 'left', 'article', 'right', 'footer'])

  //Option 2
  const value = await client.mGet([
    'header',
    'left',
    'article',
    'right',
    'footer',
  ])
  const data = {
    header: Number(value[0]),
    left: Number(value[1]),
    article: Number(value[2]),
    right: Number(value[3]),
    footer: Number(value[4]),
  }
  return Promise.resolve(data)
}

// get key data
app.get('/data', async (req, res) => {
  //Option 1
  // data().then(value => {
  //   const data = {
  //     header: Number(value[0]),
  //     left: Number(value[1]),
  //     article: Number(value[2]),
  //     right: Number(value[3]),
  //     footer: Number(value[4]),
  //   }
  //   res.send(data)
  // })

  //Option 2
  const dataObj = await data()
  res.send(dataObj)
})

// plus
app.get('/update/:key/:value', async (req, res) => {
  const { key, value } = req.params

  // get the actual value for that key
  const currentValue = await client.get(key)
  console.log('currentValue', currentValue)

  await client.set(key, Number(currentValue) + Number(value))

  const dataObj = await data()
  res.send(dataObj)
})

app.listen(3000, () => {
  console.log("Running on 3000");
});

process.on("exit", function () {
  client.quit();
});
