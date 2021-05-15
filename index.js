const Express = require('express')
const xlsx = require('xlsx')
// const sheet = require('sheetjs')
const PORT = process.env.PORT || 80
const cors = require('cors')

const app = Express()
var db = xlsx.readFile("db.xlsx")

var table = db.Sheets['Лист2']

var data = xlsx.utils.sheet_to_json(table);

var currentsell = 0
var currentbuy = 0

function search(arr, x)  {
    let start=0, end=arr.length;
          
    // Iterate while start not meets end
    while (start<=end){
  
        // Find the mid index
        let mid=Math.floor((start + end)/2);
        console.log(mid)
        console.log(arr[mid].id)

        // If element is present at mid, return True
        if (arr[mid].id==x) return mid - 1;
  
        // Else look in left or right half accordingly
        else if (arr[mid].id < x) {
             console.log("x greater")
             start = mid + 1; }
        else {
            console.log("x lower")
             end = mid - 1;
        }
    }
   
    return false;
}

// console.log(data.length)

app.use(Express.json())
app.use(cors())
app.use(Express.urlencoded({ extended: false }))
// app.use(Express.urlencoded())

app.get("/", (req, res) => {
    console.log("get")
    res.send("HEllo wOrlD")
    res.end()
})      

app.post("/see", (req, res) => {
    console.log("see invoked")
    console.log(req.body)
    let id = Number(req.body.id)
    console.log(id) 
    found = search(data, id)
    console.log(found)
    if (typeof(found) == "number") {
        toSend = {
            Name: data[found + 1].Name,
            id: found + 1,
            count: data[found + 1].count,
            buy: data[found + 1].buy,
            sell: data[found + 1].sell
        }
        res.send( JSON.stringify(toSend))
        res.status(200)
        res.end()
    }  else {
        res.send("NOT FOUND")
        
        res.end()
    }
    
})
app.post("/pay", (req, res) => {

    console.log("pay invoked")
    // console.log(req.body)
    let arr = req.body
    console.log(arr)
    for (let i of arr) {
        if(i == 0 || i == null) {
            continue
        }

        if (data[i])
        data[i].count--
        currentbuy = currentbuy + data[i].buy
        currentsell = currentsell + data[i].sell
        data[0].sell = data[0].sell +  data[i].sell
        data[0].buy = data[0].buy + data[i].buy
    }
 
    data.forEach((item)=> {
        String(item.id)
    })
    var newws = xlsx.utils.json_to_sheet(data)
    var newwb = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(newwb, newws, "Лист2")

    xlsx.writeFile(newwb, "db.xlsx")

    res.status(200)
    res.send(true)
    res.end()

})

app.get("/report", (req, res) => {
    console.log("got report request")

    let raport = {
        todaybuy: currentbuy,
        todaysell: currentsell,
        alltimebuy: data[0].buy,
        alltimesell: data[0].sell
    }

    res.status(200)
    res.send(JSON.stringify(raport))
    res.end()

})

app.post("/add", (req, res) => {

    console.log("add invoked")
    // console.log(req.body)
    let arr = req.body
    console.log(arr)
    for (let i of arr) {
        if(i == 0 || i == null) {
            continue
        }

        if (data[i])
        data[i].count++
    }

    data.forEach((item)=> {
        String(item.id)
    })
    var newws = xlsx.utils.json_to_sheet(data)
    var newwb = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(newwb, newws, "Лист2")

    xlsx.writeFile(newwb, "db.xlsx")

    res.status(200)
    res.send(true)
    res.end()

})

app.get('/refresh', (req, res) => {
    console.log('refreshing...')

    db = xlsx.readFile("db.xlsx")

    table = db.Sheets['Лист2']

    data = xlsx.utils.sheet_to_json(table);

}) 

app.listen(PORT, () => {
    console.log("Listening on port " + PORT)
})
