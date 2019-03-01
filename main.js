const fs = require('fs');
const {app, BrowserWindow, protocol, ipcMain} = require('electron')
const path = require('path')
const url = require('url')
const windowName = "main"
const pretty = require("util").format

const USE_IPC_WITH_PYTHON = false
let myPort, myAddress

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const myFormat = printf(info => {
  return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});

const logger = createLogger({
  format: combine(
    label({ label: 'Display App' }),
    timestamp(),
    myFormat,
    
    ),
    
transports: [
  new transports.Console({ level: 'debug'}), 
  new transports.File({
    filename: 'combined.log',
    level: 'silly',
  })]
});

logger.info("booting Display App")


const connectionConfig = JSON.parse(fs.readFileSync('config/connection.json', 'utf8'));
myPort = connectionConfig.port
logger.info(pretty("Listening on:", myPort))

let FAKE_EVENTS = false;
let timeNoBodyInFrontOfCamera = 5 * 1000
let timePaulInFrontOfCamera = 5 * 1000

if (FAKE_EVENTS) {
  createFakeEvents()
  logger.info(pretty("FAKE EVENTS"))
}


function createFakeEvents() {
  setInterval(() => {
    setTimeout(() => {
      let msg =  {
        "face_id": "paul.sonnentag@gmail.com",
        "heading": "Hallo Paul,",
        "text": "dein Meeting FGS Besprechung ist in Area 51, gehe im Treppenhaus nach oben und dann biege links ab!",
      }

      logger.info(pretty("Creating Fake Greeting..."))
      win.webContents.send('new-session' , msg);
    }, timeNoBodyInFrontOfCamera);

    setTimeout(() => {
      logger.info(pretty("Stopping Fake Greeting..."))
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
    logger.info(pretty("app is now running in fullscreen mode"));
  }

  if ("debug" == splittedArg[0])
  {
    debug = true;
    logger.info(pretty("app is now running in debug mode"));
  }

  if ("port" == splittedArg[0])
  {
    myPort = splittedArg[1]
    logger.info(pretty("app is now running with different port " + myPort));
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

logger.info(pretty("listening on port: ", myPort))
let connection =  io.listen(myPort)

connection.sockets.on('connection', function (socket) { 
  logger.info(pretty("connection to internal handler"))

  socket.emit("msg", "Hello from Display")

  socket.on('msg', msg => {
    logger.info(pretty("got message", msg))
  })
  
  socket.on("newSession", (msg) => {
    logger.info(pretty("newSession", msg))
    win.webContents.send('new-session' , msg);
  })
  
  
  socket.on("stopSession", (msg) => {
    logger.info(pretty("stopSession", msg))
    win.webContents.send('stop-session' , {"face_id": msg});
  })
  
  
  socket.on("updatePosition", (msg) => {
    logger.info(pretty("updatePosition", msg))
    win.webContents.send('position' , {"position": msg.position, "framesize": msg.framesize});
  })
})

ipcMain.on('asynchronous-message', (event, arg) => {
  logger.info(pretty(arg))
  event.sender.send('asynchronous-reply', 'hello from electron')
})
