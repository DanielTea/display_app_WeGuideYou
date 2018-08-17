const fs = require('fs');
const {app, BrowserWindow, protocol, ipcMain} = require('electron')
const path = require('path')
const url = require('url')
const windowName = "main"

const USE_IPC_WITH_PYTHON = false
let myPort, myAddress

try {
  // throw new Error("Dude delete this line if you are working at home")
  const connectionConfig = JSON.parse(fs.readFileSync('config/connection.json', 'utf8'));
  myPort = connectionConfig.port
  myAddress = connectionConfig.address
  console.log("Connection to:", myAddress, myPort)  
} catch (error) {
  console.log(error)
  console.log("Falling back to standart address...") 
  myPort = 1337
  myAddress = "127.0.0.1"
  console.log("Connection to:", myAddress, myPort) 
}


let debug = false;
let fullscreen = false;
let browserAlive = false;
let isConnected = false;

// taking care of commandline args
var arguments = process.argv.slice(2);
arguments.forEach(function(value,index, array) {
  let splittedArg = value.split("=");

  if ("fullscreen" == splittedArg[0] || "fs" == splittedArg[0])
  {
    fullscreen = true;
    console.log("app is now running in fullscreen mode");
  }

  if ("debug" == splittedArg[0])
  {
    debug = true;
    console.log("app is now running in debug mode");
  }

  if ("port" == splittedArg[0])
  {
    myPort = splittedArg[1]
    console.log("app is now running with different port " + myPort);
  }
});



let win

function createWindow () {
  win = new BrowserWindow({width: 1280, height: 720, title: "WeGuideYou"})

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true,
    name: windowName
  }))

  if (debug)
  {
    win.webContents.openDevTools();
  }

  if (fullscreen)
  {
    win.setFullScreen(true)
  }

  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

let io = require('socket.io-client')

const address =  "http://" + myAddress + ":" + myPort
console.log("connecting to: ", address)
let connection =  io.connect(address)

connection.on('connect', function (socket) {
  console.log("display received connection")

  connection.on("msg", msg => {
      console.log("got message", msg)
    })

  connection.on("newSession", (msg) => {
    console.log("newSession", msg)
    win.webContents.send('new-session' , msg);
  })


  connection.on("stopSession", (msg) => {
    console.log("stopSession", msg)
    win.webContents.send('stop-session' , {"face_id": msg});
  })


  connection.on("updatePosition", (msg) => {
    console.log("updatePosition", msg)
    win.webContents.send('position' , msg.position);
  })
})


// teste die verbindung zum browser window
ipcMain.on('asynchronous-message', (event, arg) => {
  console.log(arg) // prints "ping"
  event.sender.send('asynchronous-reply', 'hello from electron')
})
