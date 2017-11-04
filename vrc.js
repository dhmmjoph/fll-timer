/**************************************************************
/
/           GOLBAL VARIABLES
/
/*************************************************************/
var AUTON_VALUE = 15;
var TELEOP_VALUE = 105
var RESET_VALUE = AUTON_VALUE;
var count=RESET_VALUE;
var isRunning = false;
var counter = null;
var current_mode = "auton";
var current_event = 'match';

/**************************************************************
/
/           GET HTML ELEMENTS
/
/*************************************************************/
var display = document.getElementById("timer_display");
var mode_display = document.getElementById("mode_display");
var playStartSound = document.getElementById("start_sound");
var play30SecsSound = document.getElementById("30_second_warning");
var playEndSound = document.getElementById("time_up_sound");
var playAutonEndSound = document.getElementById("end_auton_sound");
var optionsButton = document.getElementById("options_button");
var optionsPanel = document.getElementById("options_wrapper");
var startButtonText = document.getElementById("start_pause");
var selectEvent = document.getElementById("select_event");
var skipAuton = document.getElementById("skip_auton");

/**************************************************************
/
/           INITIALIZE SOME ELEMENTS
/
/*************************************************************/
//hide the options panel by default
optionsPanel.style.display = "none";
optionsButton.innerHTML = "Show Options"
//initialize the start button text
startButtonText.innerHTML = "Start";
//initialize the display
display.innerHTML = secsToClock(RESET_VALUE);
mode_display.innerHTML = "Autonomous";


/**************************************************************
/
/           MAIN TIMER FUNCTION
/             Called once per second by setInterval() when
/             the timer is running.
/
/*************************************************************/
function timer(){
  count=count-1;
  if (count <= 0)
  {
     clearInterval(counter);
     //counter ended, do something here
     display.innerHTML = secsToClock(0);
     if (current_mode == "auton" && playAutonEndSound.checked){
      f_playAutonEndSound();
     }
     else if(current_mode == "teleop" && playEndSound.checked){
      f_playEndSound();
     }
     if (current_mode === "auton"){
      prepareForTeleop();
     }
     else{
      resetAfter5Seconds();
     }
     return;
  }

  //update the time on the display
  var time = secsToClock(count);
  display.innerHTML = time;

  //play sound effect, if any
  if (count === 30 && play30SecsSound.checked && current_mode != "auton"){
    f_play30SecondWarning();
  }
};

/**************************************************************
/
/           PREPAREFORTELEOP
/            Prepares the timer for tele-op after autonomous
/            is over.
/
/*************************************************************/
function prepareForTeleop(){
  RESET_VALUE = TELEOP_VALUE;
  pause();
  count = RESET_VALUE;
  display.innerHTML = secsToClock(count);
  mode_display.innerHTML = "Driver Control";
  current_mode = "teleop";
}

/**************************************************************
/
/           START, PAUSE, RESET, TOGGLE
/            Control when to start, pause, and reset the 
/            timer.
/
/*************************************************************/
function start(){
  //play the "start" sound effect, if applicable
  if (count === RESET_VALUE && playStartSound.checked){
    f_playStartSound();
  }
  if (!isRunning){
    isRunning = true;
    counter = setInterval(timer, 1000);
    startButtonText.innerHTML = "Pause";
  }
}

function pause(){
  clearInterval(counter);
  startButtonText.innerHTML = "Start";
  isRunning = false;
}

function reset(){
  pause();
  if (current_event == 'match'){
    current_mode = "auton"
    RESET_VALUE = AUTON_VALUE;
    mode_display.innerHTML = "Autonomous";
    if (skipAuton.checked){
      prepareForTeleop();
    }
  }
  else{
    current_mode = "teleop";
    RESET_VALUE = TELEOP_VALUE;
    mode_display.innerHTML = "Skills Challenge";
  }
  count = RESET_VALUE;
  display.innerHTML = secsToClock(count);
}

function toggle(){
  if (isRunning){
    pause();
  }
  else{
    start();
  }
}

function updateEvent(){
  var selected_event = selectEvent.value;
  if (selected_event == 'vrc'){
    current_event = 'match';
    AUTON_VALUE = 15;
    TELEOP_VALUE = 105;
    reset();
  }
  else if (selected_event == 'vexu'){
    current_event = 'match';
    AUTON_VALUE = 45;
    TELEOP_VALUE = 75;
    reset();
  }
  else if (selected_event == 'skills'){
    current_event = 'skills';
    TELEOP_VALUE = 60;
    reset();
  }
}

/**************************************************************
/
/           RESET AFTER 5 SECONDS
/             Called after the timer ends. Waits 5 seconds,
/             then calls reset().
/
/*************************************************************/
function resetAfter5Seconds(){
  var fiveCount = 5;
  function silentCountdown(){
    console.log("silent countdown");
    fiveCount=fiveCount-1;
    if (fiveCount <=0){
      reset();
      clearInterval(countdown);
      return;
    }
  }
  var countdown = setInterval(silentCountdown, 1000);
}

/**************************************************************
/
/           SECONDS TO CLOCK FUNCTION
/             Converts a number of seconds (e.g. 67) to a
/             clock display format (e.g. 1:07).
/
/*************************************************************/
function secsToClock(time){
  var secs = time % 60;
  if (secs < 10){//force 2-digit display of seconds
    secs = "0" + secs;
  }
  var mins = Math.floor(time / 60);
  return mins + ":" + secs;
}

/**************************************************************
/
/           SOUND-PLAYING FUNCTIONS
/             Play the currently-selected sound in each category.
/
/*************************************************************/
function f_playStartSound(){
  var chosenSound = document.getElementById("select_start_sound").value;
  if (chosenSound === "charge"){
    var startSound = new Audio("/sounds/charge.mp3");
  }
  else if (chosenSound === "mariokart"){
    var startSound = new Audio("/sounds/mario_kart.mp3");
  }
  startSound.play();
}

function f_play30SecondWarning(){
  var chosenSound = document.getElementById("select_30secs_sound").value;
  if (chosenSound === "laser"){
    var warningSound = new Audio("/sounds/laser.mp3");
  }
  else if (chosenSound === "church_bell"){
    var warningSound = new Audio("/sounds/church_bell.mp3");
  }
  warningSound.play();
}

function f_playEndSound(){
  var chosenSound = document.getElementById("select_end_sound").value;
  if (chosenSound === "buzzer"){
    var endSound = new Audio("/sounds/buzzer.mp3");
  }
  else if (chosenSound === "ding"){
      var endSound = new Audio("/sounds/four_ding.mp3");
  }
  endSound.play();
}

function f_playAutonEndSound(){
  var sound = new Audio("/sounds/pause.mp3");
  sound.play();
}
/**************************************************************
/
/           TOGGLE OPTIONS
/             Show or hide the options panel
/
/*************************************************************/
function toggleOptions(){
  if (optionsPanel.style.display === "none"){
    optionsPanel.style.display = "block";
    optionsButton.innerHTML = "Hide Options"
  }
  else{
    optionsPanel.style.display = "none";
    optionsButton.innerHTML = "Show Options"
  }
}

/**************************************************************
/
/           KEY LISTENER
/             Listens for keypresses and performs the
/             appropriate actions.
/
/*************************************************************/
document.addEventListener('keypress', function(event) {
    if(event.key == ' ' || event.key == "Spacebar") {
        toggle();
    }
    else if (event.key == 'r'){
      reset();
    }
});







