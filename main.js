const fs = require('fs');
const {app, BrowserWindow, protocol, ipcMain} = require('electron')
const path = require('path')
const url = require('url')
const windowName = "main"

const USE_IPC_WITH_PYTHON = false
let myPort, myAddress


const connectionConfig = JSON.parse(fs.readFileSync('config/connection.json', 'utf8'));
myPort = connectionConfig.port
console.log("Listening on:", myPort)  

let FAKE_EVENTS = true;
let timeNoBodyInFrontOfCamera = 10 * 1000
let timePaulInFrontOfCamera = 5 * 1000

if (FAKE_EVENTS) {
  createFakeEvents()
}


function createFakeEvents() {
  setInterval(() => {
    setTimeout(() => {
      let msg =  {
        "face_id": "paul.sonnentag@gmail.com",
        "heading": "Hallo Paul,",
        "text": "dein Meeting FGS Besprechung ist in Area 51, gehe im Treppenhaus nach oben und dann links",
      }

      console.log("Creating Fake Greeting...")
      win.webContents.send('new-session' , msg);
    }, timeNoBodyInFrontOfCamera);

    setTimeout(() => {
      console.log("Stopping Fake Greeting...")
      win.webContents.send('stop-session' , {"face_id": "paul.sonnentag@gmail.com"});
    }, timeNoBodyInFrontOfCamera + timePaulInFrontOfCamera);
  }, timeNoBodyInFrontOfCamera + timePaulInFrontOfCamera + 1)
}

let debug = false;

let fullscreen = false;

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
  win = new BrowserWindow({width: 1920, height: 1080, title: "WeGuideYou"})

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

let io = require('socket.io')

console.log("connecting to: ", myPort)
let connection =  io.listen(myPort)

connection.sockets.on('connection', function (socket) { 
  console.log("connection to internal handler")

  socket.emit("msg", "Hello from Display")

  socket.on('msg', msg => {
    console.log("got message", msg)
  })
  
  socket.on("newSession", (msg) => {
    console.log("newSession", msg)
    win.webContents.send('new-session' , msg);
  })
  
  
  socket.on("stopSession", (msg) => {
    console.log("stopSession", msg)
    win.webContents.send('stop-session' , {"face_id": msg});
  })
  
  
  socket.on("updatePosition", (msg) => {
    console.log("updatePosition", msg)
    win.webContents.send('position' , {"position": msg.position, "framesize": msg.framesize});
  })
})

ipcMain.on('asynchronous-message', (event, arg) => {
  console.log(arg) 
  event.sender.send('asynchronous-reply', 'hello from electron')
})
