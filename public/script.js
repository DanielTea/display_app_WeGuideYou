
const {ipcRenderer} = require('electron')

const path = require("path");
const WidgetManager = require('./public/widgets/');

const widgetManager = new WidgetManager({
  rootElement: document.getElementById('widgets'),
  slideWidgets: [
    {
      type: 'info-box',
      duration: 8,
      data: {
        template: `
          <h1>Welcome to DS HUB</h1>
          <p style='width: 500px'>
           I am the Facial Guidance System (FGS), nice to see you!
          </p>
        `
      },
    },
    // {
    //   type: 'info-box',
    //   duration: 8,
    //   data: {
    //     template: `
    //       <h1>I'm a face recognition...</h1>
    //       <p style='width: 500px'>
    //         ...but not an access control system
    //       </p>
    //     `
    //   },
    // },
    {
      type: 'info-box',
      duration: 8,
      data: {
        template: `
        <h1>I'm here to help you...</h1>
        <p style='width: 500px'>
        ...I'll give you hints on how to find your meeting room.
        </p>
        `
      },
    },
    {
      type: 'info-box',
      duration: 8,
      data: {
        template: `
        <h1>How to use me…</h1>
        <p style='width: 500px'>
        …its easy
        book a meeting room in the OWP22 and agree to the face recognition in MyWima.
        </p>
        `
      },
    },
    // {
    //   type: 'info-box',
    //   duration: 8,
    //   data: {
    //     template: `
    //     <h1>Only if you agree….</h1>
    //     <p style='width: 500px'>
    //     ...I'll learn your lovely face from your intranet picture.
    //     (Intranet->MyWima)
    //     </p>
    //     `
    //   },
    // },
    // {
    //   type: 'info-box',
    //   duration: 8,
    //   data: {
    //     template: `
    //     <h1>WoOoOSSH What kind of technique is that? </h1>
    //     <p style='width: 500px'>
    //     I am an artificial intelligence able to learn faces and guide you to your meeting room.
    //     </p>
    //     `
    //   },
    // },
    // {
    //   type: 'info-box',
    //   duration: 8,
    //   data: {
    //     template: `
    //     <h1>Not only for Dreso's</h1>
    //     <p style='width: 500px'>
    //     I will also be able to guide external guests, too
    //     </p>
    //     `
    //   },
    // },
    {
        type: 'info-box',
        duration: 30,
        data: {
          template: `
            <h1>Coming soon…</h1>
            <p style='width: 500px'>
              ...I'll rise to life in the next few days, you will be informed.
            </p>
          `
        },
      },
    
  ],
  
  mainWidget: {
    type: 'weather',
    duration: 60,
    data: {
     location: 'stuttgart,de',
      apiKey: '8ad8bde5afdafc253d1e2b6645fb1c01'
    }
  }
})

let greetingInProcess = false
let currentPerson;
let deletionTimeout;

let parent = getEl(".inner")[0];
let hello = document.createElement("h1");
let extraText = document.createElement("h2");
parent.appendChild(hello);
parent.appendChild(extraText);

const FADE_STEPS = 20;

// TESTS
console.log("Hello world")
// teste die verbindung zum electron
ipcRenderer.on('asynchronous-reply', (event, arg) => {
  console.log(arg)
});

ipcRenderer.send('asynchronous-message', 'hello from frontend');

particlesJS.load('particles-js', 'public/particles.json', function() {
  console.log('callback - particles.js config loaded');
});

setTimeout(() => {
  putParticleEffectIntoTheMiddle()
}, 5000)

function putParticleEffectIntoTheMiddle() {
  let particleCanvas = getEl("#particles-js > canvas")[0]

  const x = particleCanvas.getAttribute("width") / 4
  const y = particleCanvas.getAttribute("height") / 4

  console.log("BUBBLE", x, y)
  triggerParticleBubble(x,y)


}

function setPositionForParticleEffect(x,y) {
  window.pJSDom[0].pJS.interactivity.mouse.click_pos_x = 1000
  window.pJSDom[0].pJS.interactivity.mouse.click_pos_y = 500
}

function setModeForParticleEffect(mode) {
  const modes = ["push", "repulse", "bubble"]
  if (modes.includes(mode)) {
    window.pJSDom[0].pJS.interactivity.events.onclick.mode = mode
  } else {
    throw new Error("Invalid mode " + mode)
  }
}

function dispatchFakeMouseEventForParticleJs(type, x, y) {
  var particles = getEl('.particles-js-canvas-el')[0];
  var evt = mouseEvent(type, x, y, x, y);
 
  dispatchEvent(particles, evt);
}

function triggerParticlePush(count,x,y) {
  try {
    setModeForParticleEffect("push")
  } catch (error) {
    console.log(error.message)
    return
  }

  window.pJSDom[0].pJS.fn.modes.pushParticles(count, {"pos_x": x, "pos_y": y})
  
  console.log("triggering push at", x, y)
}

function triggerParticleBubble(x,y) {
  try {
    setModeForParticleEffect("bubble")
  } catch (error) {
    console.log(error.message)
    return
  }

  dispatchFakeMouseEventForParticleJs("mousemove", x,y)
  // console.log("triggering bubble at", x, y)
}

function setParticleOpacity(opacity) {
  window.pJSDom[0].pJS.particles.opacity.value = opacity;  
}


function startNewGreeting(message) {  // let personIsActive = false

  // when greeting is shown pause widget manager
  widgetManager.pause()

  greetingInProcess = true;
  currentPerson = message.face_id;
  clearTimeout(deletionTimeout);

  getEl(".outer-square")[0].classList.remove("rotate")
  getEl(".inner-square")[0].classList.add("whiter")
  getEl("#text")[0].classList.add("invisible");

  hello.textContent = message.heading
  hello.setAttribute("id", "headline")
  setTimeout(function () {
  hello.classList.add("make-visible")
  }, 0);

  setTimeout(function() {
    extraText.textContent = message.text
    extraText.setAttribute("id", "extratext");
    setTimeout(function () {
      extraText.classList.add("make-visible")
    }, 0);
  }, 500)

  getEl(".wrapper")[0].classList.add("start-bg-animation");
  
}

function deleteGreeting() {
  console.log("shutting down last greeting");

  // when greeting is hidden unpause widget manager with a little bit delay
  setTimeout(() => { widgetManager.unpause() }, 500)

  let hello = getEl("#headline")[0]
  let extraText = getEl("#extratext")[0]

  getEl(".outer-square")[0].classList.add("rotate");
  getEl(".inner-square")[0].classList.remove("whiter")
  getEl("#text")[0].classList.remove("invisible");
  getEl(".wrapper")[0].classList.remove("start-bg-animation");

  if (hello != null && extraText != null)
  {
    hello.classList.remove("make-visible")
    setTimeout(() => { extraText.classList.remove("make-visible") }, 500);

  }

  deletionTimeout = setTimeout(function () {
    let hello1 = getEl("#headline")[0]
    let extraText1 = getEl("#extratext")[0]
    if (hello1 != null && extraText1 != null)
    {
      hello1.textContent = "";
      extraText1.textContent = "";

    }
  }, 500);

  greetingInProcess = false;
  currentPerson == undefined;
}


ipcRenderer.on("position", (event, arg) => {
  if (greetingInProcess) {
    let correctedPosition = correctPosition(arg.position.x0, arg.position.y0, arg.position.x1, arg.position.y1, arg.framesize)
    stepper.updateStepper(correctedPosition.x, correctedPosition.y)
  }
})

function correctPosition(x0, y0, x1, y1, framesize) {

  let middle_x = (x0 + x1) / 2 
  let middle_y = (y0 + y1) / 2
  
  let particleCanvas = getEl("#particles-js > canvas")[0]

  let scaled_pos_x = particleCanvas.getAttribute("width") - middle_x / framesize.width * particleCanvas.getAttribute("width")
  let scaled_pos_y = middle_y / framesize.height * particleCanvas.getAttribute("height")

  console.log(middle_x, scaled_pos_x)
  console.log(middle_y, scaled_pos_y)
  console.log(particleCanvas.getAttribute("width"))
  console.log(particleCanvas.getAttribute("height"))

  return { x: scaled_pos_x, y: scaled_pos_y}
}


let movingParticleEffects = {
  effectFrameCounter: 0,
  effectFrameCounterSamePosition: 0,
  usageFrames: 5,
  countParticlesPerPush: 2,
  distanceThresholdToLastPosition: 20,
  
  triggerEffects(x,y) {
    triggerParticleBubble(x,y)
    this.effectFrameCounter = this.effectFrameCounter > 1000 ? 1 : this.effectFrameCounter + 1
    if (this.effectFrameCounter % this.usageFrames == 0) {
      this.pushAndDeleteParticles(x,y)
    }
  },

  lastPosition: {"x": 0, "y": 0},
  
  pushAndDeleteParticles(x,y) {
    let distanceToLastPosition = this.getDistanceBetweenPositions(x,y, this.lastPosition.x, this.lastPosition.y) 
    
    if (distanceToLastPosition > this.distanceThresholdToLastPosition) {
      this.lastPosition.x = x
      this.lastPosition.y = y
      triggerParticlePush(this.countParticlesPerPush,x,y)
      window.pJSDom[0].pJS.fn.modes.removeParticles(this.countParticlesPerPush)

    } else {
      this.effectFrameCounterSamePosition = this.effectFrameCounterSamePosition > 1000 ? 1 : this.effectFrameCounterSamePosition + 1
      
      if (this.effectFrameCounterSamePosition % (this.usageFrames * 3) == 0) {
        triggerParticlePush(this.countParticlesPerPush,x,y)
        for (let i = 0; i < this.countParticlesPerPush; i++) {
          window.pJSDom[0].pJS.fn.modes.removeParticles(1)
        }
      }

    }
    
  },

  getDistanceBetweenPositions(x0,y0, x1, y1) {
    let deltaX = x0 - x1
    let deltaY = y0 - y1

    return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
  }

}

let stepper = {
  animationStep: 5,
  currentPosition: {x: 0, y: 0},
  targetPosition:  {x: 0, y: 0},
  started: false,

  getLengthOfCoordinates(x,y) {
      return Math.sqrt(x*x + y*y) 
  },

  normalizeCoordinates(x,y) {
      return {x: x / stepper.getLengthOfCoordinates(x,y),
              y: y / stepper.getLengthOfCoordinates(x,y)}
  },

  getDistanceFromTarget() {
      let targetVector = stepper.getTargetVector()
      
      return stepper.getLengthOfCoordinates(targetVector.x, targetVector.y)
  },

  getTargetVector() {
      let delta_x  = stepper.targetPosition.x - stepper.currentPosition.x
      let delta_y  = stepper.targetPosition.y - stepper.currentPosition.y

      return {"x": delta_x, "y": delta_y}
  },

  calculateDeltas(x,y) {
      let normalizedVector = stepper.normalizeCoordinates(x, y)

      return {"x": normalizedVector.x * stepper.animationStep, 
              "y": normalizedVector.y * stepper.animationStep}

  },

  getStartPosition() {
      // just taking the middle of the canvas
      let particleCanvas = getEl("#particles-js > canvas")[0]
      let top = particleCanvas.getAttribute("height") / 2
      let left = particleCanvas.getAttribute("width") / 2
            
      return {x: left, y: top}
  },

  updateStepper(x,y) {
      if (!stepper.started) {
          console.log("starting stepper")
          
          stepper.currentPosition = stepper.getStartPosition()
          stepper.targetPosition = {"x": x, "y": y}
          bubbleFader.bubblesFadeIn()
          stepper.started = true

          window.requestAnimationFrame(stepper.steppingStepper)

      } else {
          console.log("updating stepper")
          stepper.targetPosition = {"x": x, "y": y}
      }
  },


  steppingStepper() {

    if (greetingInProcess) {

      // check distance to target, if to small, stay at the same place, other wise interpolate towards the target
      if (Math.abs( stepper.getDistanceFromTarget() ) < stepper.animationStep) {

        stepper.updateStateAndPosition(stepper.currentPosition.x, stepper.currentPosition.y)

        window.requestAnimationFrame(stepper.steppingStepper)
        return

      } else {
        let targetVector = stepper.getTargetVector() // creates vector from stepper.currentPosition to stepper.target Position
        let deltas = stepper.calculateDeltas(targetVector.x, targetVector.y) // normalizes the vector and multiplies it with stepper.animationStep
  
        let newCoordinates = {"x": parseFloat( stepper.currentPosition.x ) + parseFloat( deltas.x ),
                              "y": parseFloat( stepper.currentPosition.y ) + parseFloat( deltas.y ) }
  
        stepper.updateStateAndPosition(newCoordinates.x, newCoordinates.y)
  
        window.requestAnimationFrame(stepper.steppingStepper)
      }
    } else {
      console.log("greeting is over, terminating recursion...")

      stepper.started = false
      stepper.stopStepping()
      bubbleFader.bubblesFadeOut()
      return
    }
  },
  currentStopStep: 0,

  stopStepping() {
    if (!stepper.started) {
      if (stepper.currentStopStep < FADE_STEPS) {
  
        stepper.currentStopStep = stepper.currentStopStep + 1
        stepper.updateStateAndPosition(stepper.currentPosition.x, stepper.currentPosition.y)
        window.requestAnimationFrame(stepper.stopStepping)
  
      } else {
        console.log("Finished stop stepping")
        triggerParticleBubble(9999,9999)
        stepper.currentStopStep = 0
      }
    }
  },

  updateStateAndPosition(x,y) {
      stepper.currentPosition = {"x": x, "y": y}
      movingParticleEffects.triggerEffects(x,y)
  },
}

let bubbleFader = {
  fadeSteps: FADE_STEPS,
  currentFadeIn: 0,
  currentFadeOut: 0,
  fadeInStarted: false,
  fadeOutStarted: false,
  

  bubblesFadeIn: function() {
    let targetSize = window.pJSDom[0].pJS.tmp.obj.mode_bubble_size
    let currentSize = window.pJSDom[0].pJS.interactivity.modes.bubble.size

    if (!bubbleFader.fadeInStarted) {
      console.log("starting fadeIn....")
      bubbleFader.currentFadeIn = 0
      bubbleFader.fadeInStarted = true

      window.pJSDom[0].pJS.interactivity.modes.bubble.size = 0
      window.requestAnimationFrame(bubbleFader.bubblesFadeIn)
    } else {
      if (bubbleFader.currentFadeIn < bubbleFader.fadeSteps) {
        
        bubbleFader.currentFadeIn = bubbleFader.currentFadeIn + 1
        let newSize = targetSize / bubbleFader.fadeSteps * bubbleFader.currentFadeIn
        
        console.log("current size:", currentSize, "target", targetSize, "newSize", newSize)
        window.pJSDom[0].pJS.interactivity.modes.bubble.size = newSize

        window.requestAnimationFrame(bubbleFader.bubblesFadeIn)

      } else {
        console.log("fade completed...")
        bubbleFader.currentFadeIn = 0
        bubbleFader.fadeInStarted = false
      }   
    }
  },

  bubblesFadeOut: function() {
    let targetSize = 0
    let currentSize = window.pJSDom[0].pJS.interactivity.modes.bubble.size

    if (!bubbleFader.fadeOutStarted) {
      console.log("starting fadeOut....")
      bubbleFader.currentFadeOut = 0
      bubbleFader.fadeOutStarted = true

      window.pJSDom[0].pJS.interactivity.modes.bubble.size = currentSize
      window.requestAnimationFrame(bubbleFader.bubblesFadeOut)
    } else {
      if (bubbleFader.currentFadeOut < bubbleFader.fadeSteps) {
        
        bubbleFader.currentFadeOut = bubbleFader.currentFadeOut + 1
        let newSize = currentSize - ( currentSize / bubbleFader.fadeSteps * bubbleFader.currentFadeOut )
        
        console.log("current size:", currentSize, "target", targetSize, "newSize", newSize)
        window.pJSDom[0].pJS.interactivity.modes.bubble.size = newSize

        window.requestAnimationFrame(bubbleFader.bubblesFadeOut)

      } else {
        console.log("fade completed...")
        bubbleFader.currentFadeOut = 0
        bubbleFader.fadeOutStarted = false
      }

    }
  }
}






ipcRenderer.on("new-session", (event, arg) => {

  console.log(arg)

  if (greetingInProcess)
  {
    console.log("another greeting in process");
    deleteGreeting()
    setTimeout(function () {
      startNewGreeting(arg);
    }, 200);
  }
  else
  {
    startNewGreeting(arg);
  }
});

ipcRenderer.on("stop-session", (event, arg) => {
  if (arg != null && arg.hasOwnProperty("face_id"))
  {
    if (arg.face_id == currentPerson)
    {
      console.log("Stopping session " + arg.name);
      deleteGreeting();
    }
    else
    {
      console.log("wanting to delete person not shown");
    }
  }
  else {
    console.log("got the fucking error");
    console.log(arg);
  }
})



function getEl(sel)
{
  return document.querySelectorAll(sel)
}

function mouseEvent(type, sx, sy, cx, cy) {
  var evt;
  var e = {
    bubbles: true,
    cancelable: (type != "mousemove"),
    view: window,
    detail: 0,
    screenX: sx, 
    screenY: sy,
    clientX: cx, 
    clientY: cy,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    button: 0,
    relatedTarget: undefined
  };
  if (typeof( document.createEvent ) == "function") {
    evt = document.createEvent("MouseEvents");
    evt.initMouseEvent(type, 
      e.bubbles, e.cancelable, e.view, e.detail,
      e.screenX, e.screenY, e.clientX, e.clientY,
      e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
      e.button, document.body.parentNode);
  } else if (document.createEventObject) {
    evt = document.createEventObject();
    for (prop in e) {
    evt[prop] = e[prop];
  }
    evt.button = { 0:1, 1:4, 2:2 }[evt.button] || evt.button;
  }
  return evt;
}

function dispatchEvent (el, evt) {
  if (el.dispatchEvent) {
    el.dispatchEvent(evt);
  } else if (el.fireEvent) {
    el.fireEvent('on' + type, evt);
  }
  return evt;
}