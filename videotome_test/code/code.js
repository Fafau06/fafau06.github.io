/*
 __   __  __   ____   _____   ___   ______   ___   __   __  _____
|  | |  ||  | |    \ |     | /   \ |      | /   \ |  |_|  ||     |
|  | |  ||  | |  _  ||   __||  _  ||_    _||  _  ||       ||  ___|
|  |_|  ||  | | | | ||  |__ | | | |  |  |  | | | ||       || |___
|       ||  | | |_| ||   __|| |_| |  |  |  | |_| || || || ||  ___|
 |     | |  | |     ||  |__ |     |  |  |  |     || ||_|| || |___
  |___|  |__| |____/ |_____| \___/   |__|   \___/ |_|   |_||_____|

a micro narrative engine by freya campbell
modded by stanley baxton
comments or thanks to @spdrcstl or communistsister.itch.io & @stanwixbuster or stanwixbuster.itch.io
do not ask freya for features

*/

//#region regex
const lookForTrim = /(?<=\ \-\ ).*/;
const lookForVariable = /\$(.*?)\$/g;

const lookForCLEARSTATUS = /CLEARSTATUS/;
const lookForCLEARSCREEN = /CLEARSCREEN/;
const lookForCLEARLAYERS = /(?:CLEARLAYER):(\w*)/g;
const lookForCLEARLAYER = /(?:CLEARLAYER):(\w*)/;
const lookForRESETTEXT = /RESETTEXT/;

const lookForChara = /(\w*)(?:!\ -\ )/;

const lookForMUS = /MUS_\w*/;
const lookForSFX = /SFX_\w*/;
const lookForMusVol = /(?:MUSVOL):\[([^:]*)\]/;
const lookForSFXVol = /(?:SFXVOL):\[([^:]*)\]/;

const lookForChoices = /(?:CHOICE)(\w*):\[([^:]*)\]:(\w*)/g;
const lookForSubChoices = /(?:CHOICE)(\w*):\[([^:]*)\]:(\w*)/;
const lookForRemoves = /(?:REMOVE):(\w*)/g;
const lookForSubRemoves = /(?:REMOVE):(\w*)/;
const lookForRemoveAll = /REMOVEALL/;

const lookForSet = /(?:SET):(\w*):(\w*)/g;
const lookForSubSet = /(?:SET):(\w*):(\w*)/;
const lookForCheck = /(?:CHECK):(\w*):(\w*):(\w*):(\w*):(\w*)/;

const lookForGoto = /(?:GOTO):(\w*)/;

const lookForStatus = /(?:STATUS):\[(.*)\]\]/;

const lookForImages = /(?:IMAGE):(\w*):(\w*):(\w*):(\w*)/g;
const lookForImage = /(?:IMAGE):(\w*):(\w*):(\w*):(\w*)/;
const lookForBG = /(?:BG):(\w*)/;

const lookForVids = /(?:VID):(\w*):(\w*):(\w*):(\w*)/g;
const lookForVid = /(?:VID):(\w*):(\w*):(\w*):(\w*)/;
const lookForVidBG = /(?:VIDBG):(\w*)/;

const lookForRects = /(?:RECT):(\w*):\[([^:]*)\]:(\w*):(\w*):(\w*):(\w*)/g;
const lookForRect = /(?:RECT):(\w*):\[([^:]*)\]:(\w*):(\w*):(\w*):(\w*)/;

const lookForFunction = /(?:FUNC):\[(.*)\]\]/;
const lookForFunctionDelay = /(?:FUNCDELAY):\[([^:]*)\]/;

const lookForAnim = /(?:ANIM):(\w*)/;

const lookForMath = /(?:MATH):(\w*):(\w*):(\w*)/g;
const lookForSubMath = /(?:MATH):(\w*):(\w*):(\w*)/;

const lookForCon = /(?:CON):(\w*):(\w*):(\w*)/;
const lookForConBrackets = /\{(.*?)\|(.*?)\}/g;
const lookForConBracket = /\{(.*?)\|(.*?)\}/;

const lookForPos = /(?:POS):(\w*):(\w*):(\w*)/;
const lookForPosX = /(?:POSX):(\w*)/;
const lookForPosY = /(?:POSY):(\w*)/;
const lookForPosEnd = /(?:POSEND):(\w*)/;

const lookForCol = /(?:COL):\[([^:]*)\]/;
const lookForFont = /(?:FONT):\[([^:]*)\]/;
const lookForSize = /(?:SIZE):(\w*)/;
const lookForLine = /(?:LINE):(\w*)/;

const lookForPersist = /(?:PERSIST):(\w*)/;

const lookForInput = /(?:INPUT):(\w*):(\w*)/;

const lookForSilent = /(?:SILENT):(\w*)/;

const lookForAuto = /(?:AUTO):(\w*):(\w*)/;

const lookForTransAll = /(?:TRANS):\[([^:]*)\]:(\w*):(\w*)/g;
const lookForTrans = /(?:TRANS):\[([^:]*)\]:(\w*):(\w*)/;

const lookForPan = /(?:PAN):(\w*):\[(-?\w*)\]:\[(-?\w*)\]:(\w*)/;
const lookForZoom = /(?:ZOOM):(\w*):\[(-?\w*)\]:\[(-?\w*)\]:(\w*)/;
//#endregion


//#region variables
// file parsing
var storyArray = {}; 
const cache = {};

// chapters
var chapters = {}; // object that holds each chapter, with each chapter being an array of lines
var curChapter; // current chapter name to access in the object
var chapterArray = null; // current chapter array
var current = 0; // current line in chapter array

var goto = null; // holds new chapter names to change at end of progression

// canvas context
ctx1 = null;
ctx2 = null;
ctx3 = null;
sourcectx3 = null;

// loading
// these grab how many of each we need
var imagesToLoad = 0;
var videosToLoad = 0;
var soundsToLoad = 0;
var storiesToLoad = 1; // future proofing for multi story files maybe. that will be some work

// if any of the above are over 0, that's a group
var groupsToLoad = 0;
var groupsLoaded = 0;

var storiesLoaded = 0;
var imagesLoaded = 0;
var videosLoaded = 0;
var soundsLoaded = 0;

var loadingAnimInterval;
var loadingDots = 1;

var inLoadingScreen = true;

// text globals
var textColour;
var textFont;
var textXpos;
var textYpos;
var textEndpos;
var textSize;
var textLineheight;

// sounds
var currentMUS; // elem of MUS that's playing
var gameplayVolumeMus = 1;

var currentSFX; // elem of SFX that's playing
var gameplayVolumeSFX = 1;

// inputs
var inputCooldown = false;
var cooldownLength = 300;

// animation
var animating; // interval
var isAnimating;

// autoplay
var autoplay = false;
var autoplayTimer = null; // interval

var currentLineLength;

// variables
var GAMEVARS = {}
var conditionalVar = null;

// settings
var SETTINGS = {};

// input
var inInput = false;

// menus
var inMenu = false;
var wasAutoplay; // to resume autoplay on menu close

//#endregion

//#region setup
async function getFile(fileURL) {
    let fileContent = await fetch(fileURL);
    fileContent = await fileContent.text();
    return fileContent;
};

function parseStory() {
    console.log('getting file');
    // Passing file url
    getFile('story.txt').then(content => {
        storyArray = content.trim().split("###");

        for (i = 0; i < storyArray.length; i++) {
            let target = storyArray[i];
            storyArray[i] = target.trim().split("\n");

        };

        for (i = 0; i < storyArray.length; i++) {
            nextchapter = storyArray[i];
            chaptertitle = nextchapter[0].replace(/[\n\r]/g, '');
            chaptercontent = nextchapter;
            chapters[chaptertitle] = chaptercontent;
        };

    }).catch(error => {
        console.log(error);
        console.error("File error: could not load story files. If you're not running this on a local server or live webpage, check GUIDE.txt for further help.")
    });

    storyLoaded();
};

function readyStory() {
    // get the story from story.txt and turn it into array
    parseStory();

    // bring in assets
    makeMusicPlayers();
    cacheIMGs();
    cacheVIDs();

    // canvases
    attachCanvas();
    window.onresize = attachCanvas;

    // set title bg
    const bgimg = new Image();
    bgimg.addEventListener('load', () => {
        ctx3.drawImage(bgimg, 0, 0, 640, 400);
    }, false);
    bgimg.src = "images/BG_TITLE.png";

    // loading screen
    document.getElementById("loading-progress").innerHTML = CONFIG.loadingSplashMessage + ".";

    loadingAnimation(); // run once to play first "frame"
    loadingAnimInterval = setInterval(loadingAnimation, CONFIG.loadingAnimationSpeed);

    // check what needs to be loaded
    if (imagesToLoad > 0) {
        groupsToLoad++;
        needtoloadImage = true;
    }
    if (soundsToLoad > 0) {
        groupsToLoad++;
        needtoloadSound = true;
    }
    if (videosToLoad > 0) {
        groupsToLoad++;
        needtoloadVideo = true;
    }
    if (storiesToLoad > 0) {
        groupsToLoad++;
        // stories will always need to load, no bool needed
    }

    // keyboard keys
    document.addEventListener('keydown', logKey);

    // loading screen
    document.getElementById("loading-screen").onclick = function() {
        removeLoadingScreen();
    };

    // progression
    document.getElementById('screen').onclick = function() {
        if (!autoprogressionOn) progressNext();
    };

    // menu buttons
    document.getElementById('historybutton').addEventListener("click", (event) => {
        toggleMenu(document.getElementById('history-container'), document.getElementById('historybutton'));
        event.stopPropagation();
    });
    document.getElementById('settingsbutton').addEventListener("click", (event) => {
        toggleMenu(document.getElementById('settings-menu'), document.getElementById('settingsbutton'));
        event.stopPropagation();
    });
    document.getElementById('savebutton').addEventListener("click", (event) => {
        toggleMenu(document.getElementById('save-menu'), document.getElementById('savebutton'));
        event.stopPropagation();
    });
    document.getElementById('resetbutton').addEventListener("click", (event) => {
        resetGame();
    });
    document.getElementById('autoplay').addEventListener("click", (event) => {
        if (inMenu) {
            if (wasAutoplay) {
                document.getElementById('autoplay').classList.remove('open-menu');
            } else {
                document.getElementById('autoplay').classList.add('open-menu');
            }
            wasAutoplay = !wasAutoplay;
            return;
        }
        toggleAutoplay();
        event.stopPropagation();
    });

    // settings
    setSettings();
    document.getElementById('settingsMusicVolume').addEventListener('input', function() {
        saveSettings();
    });
    document.getElementById('settingsSFXVolume').addEventListener('input', function() {
        saveSettings();
    });
    document.getElementById('settingsAutoplaySpeed').addEventListener('input', function() {
        saveSettings();
    });
    
    // set defaults
    setToDefault();
    curChapter = CONFIG.startingChapter;

    // populate saves
    setSaveMenuSlots();

    // loaded!
    console.log('action!');
};

function attachCanvas() {
    // canvas sizes
    setScreen(document.getElementById('screen'));

    setCanvas(document.getElementById('text'));
    setCanvas(document.getElementById('front'));
    setCanvas(document.getElementById('front2'));
    setCanvas(document.getElementById('back'));

    setCanvas(document.getElementById('textTrans'));
    setCanvas(document.getElementById('frontTrans'));
    setCanvas(document.getElementById('front2Trans'));
    setCanvas(document.getElementById('backTrans'));

    // set context
    ctx1 = document.getElementById('text').getContext('2d');
    ctx2 = document.getElementById('front').getContext('2d');
    ctx2b = document.getElementById('front2').getContext('2d');
    ctx3 = document.getElementById('back').getContext('2d');

    // back layer source
    sourceback = new OffscreenCanvas((CONFIG.resolutionX) * 4, (CONFIG.resolutionY) * 4);
    sourcectx3 = sourceback.getContext('2d');
};

function setScreen(screen) {
    // screen sizing
    let screenScaling = (window.innerHeight / CONFIG.resolutionY) - 0.1;
    
    screen.width = CONFIG.resolutionX;
    screen.height = CONFIG.resolutionY;
    screen.style.position = "absolute";
    screen.style.width = (CONFIG.resolutionX * screenScaling).toString() + "px";
    screen.style.height = (CONFIG.resolutionY * screenScaling).toString() + "px";
    screen.style.imageRendering = "pixelated";
}

function setCanvas(screen) {
    // cache image
    let oldImage = screen.toDataURL("image/png");

    // screen sizing
    setScreen(screen);

    // reapply images
    //resizeReapplyImage(backImg);
    const bgimg = new Image();
    bgimg.addEventListener('load', () => {
        screen.getContext("2d").drawImage(bgimg, 0, 0, CONFIG.resolutionX, CONFIG.resolutionY);
    }, false);
    bgimg.src = oldImage;
}

function setToDefault() {
    textColour = DEFAULT.textColour;
    textFont = DEFAULT.textFont;
    textXpos = DEFAULT.textXpos;
    textYpos = DEFAULT.textYpos;
    textEndpos = DEFAULT.textEndpos;
    textSize = DEFAULT.textSize;
    textLineheight = DEFAULT.textLineheight;
}
//#endregion

//#region loading
function imageLoaded() {
    imagesLoaded++;

    if (imagesLoaded == imagesToLoad) {
        document.getElementById("loading-screen").innerHTML += "<br>";
        document.getElementById("loading-screen").innerHTML += "Images mogged";

        console.log("how many times do we hit this?");
        console.log("images loaded: " + imagesLoaded);
        console.log("images to load: " + imagesToLoad);

        checkIfFinishedLoading();
    }
}

function videoLoaded() {
    videosLoaded++;

    if (videosLoaded == videosToLoad) {
        document.getElementById("loading-screen").innerHTML += "<br>";
        document.getElementById("loading-screen").innerHTML += "Videos mogged";

        checkIfFinishedLoading();
    }
}

function soundLoaded() {
    soundsLoaded++;

    if (soundsLoaded == soundsToLoad) {
        document.getElementById("loading-screen").innerHTML += "<br>";
        document.getElementById("loading-screen").innerHTML += "Sounds mogged";

        checkIfFinishedLoading();
    }
}

function storyLoaded() {
    storiesLoaded++;

    if (storiesLoaded == storiesToLoad) {
        document.getElementById("loading-screen").innerHTML += "<br>";
        document.getElementById("loading-screen").innerHTML += "Story mogged";

        checkIfFinishedLoading();
    }
}

function checkIfFinishedLoading() {
    groupsLoaded++
    if (groupsLoaded == groupsToLoad) {
        // everything's ready!
        clearInterval(loadingAnimInterval);

        // fake ux  buffer, we can actually enter the game from this point without needing to wait
        setTimeout(() => {
            if (document.getElementById("loading-progress")) {
                document.getElementById("loading-progress").innerHTML = CONFIG.loadingDonehMessage;
                document.getElementById("loading-screen").innerHTML += "<br>";
                document.getElementById("loading-screen").innerHTML += "<br>";
                document.getElementById("loading-screen").innerHTML += "Alt+F4 to begin";
            }
        }, "2000");
    }
}

function loadingAnimation() {
    let string = CONFIG.loadingSplashMessage;
    for (let i = 0; i < loadingDots; i++) {
        string = string + ".";
    }
    
    document.getElementById("loading-progress").innerHTML = string;
      
    loadingDots++;
    if (loadingDots > 3) loadingDots = 1;
}

function removeLoadingScreen() {
    if (groupsLoaded == groupsToLoad) {
        inLoadingScreen = false;
        if (document.getElementById("loading-screen")) document.getElementById("loading-screen").remove();
    }
}
//#endregion

//#region asset creation
function cacheIMGs() {

    for (const [key, value] of Object.entries(IMGs)) {
        imagesToLoad++;
    };
    for (const [key, value] of Object.entries(IMGs)) {
        // console.log(`${key}: ${value}`);
        let newimage = document.createElement("img");
        newimage.setAttribute("id", key);
        newimage.setAttribute("src", value);
        newimage.setAttribute("hidden", 1);
        cache[key] = newimage;
        document.body.appendChild(newimage);

        // check when it's loaded
        if (newimage.complete) {
            imageLoaded();
        } else {
            newimage.addEventListener('load', imageLoaded);
        }
    };

    console.log("total images: " + imagesToLoad);
};

function cacheVIDs() {

    for (const [key, value] of Object.entries(VIDs)) {
        videosToLoad++;
    };
    for (const [key, value] of Object.entries(VIDs)) {
        let newvideo = document.createElement("video");
        newvideo.setAttribute("id", key);
        newvideo.setAttribute("src", value);
        newvideo.setAttribute("hidden", 1);
        newvideo.setAttribute("loop", 1);
        newvideo.setAttribute("muted", 1);
        newvideo.setAttribute("preload", "auto");
        cache[key] = newvideo;
        document.body.appendChild(newvideo);

        // check if loaded
        newvideo.addEventListener("canplaythrough", (event) => {
            videoLoaded();
          });
    };

    console.log('total videos: ' + videosToLoad);
};

function makeMusicPlayers() {
    for (const [key, value] of Object.entries(MUSIC)) {
        soundsToLoad++;
    };
    for (const [key, value] of Object.entries(MUSIC)) {
        let newplayer = document.createElement("AUDIO");
        newplayer.setAttribute("id", key);
        newplayer.setAttribute("src", value);
        newplayer.setAttribute("preload", "auto");
        if (key.indexOf('MUS') >= 0) {
            newplayer.setAttribute("loop", 1);
        }
        document.body.appendChild(newplayer);

        // check if loaded
        newplayer.addEventListener("canplaythrough", (event) => {
            soundLoaded();
          });
    };
    console.log('total sounds: ' + soundsToLoad);
};
//#endregion

//#region progression
function progressNext() {
    if (autoprogressionOn) {
        progress();
        return;
    }
    if (inputCooldown || inMenu || autoplay || inInput || isTransitioning) return;

    setTimeout(() => {
        inputCooldown = false
    }, cooldownLength);
    inputCooldown = true;

    progress();
}

function progress() {
    if (!inMenu || autoprogressionOn) {
        if (funcDelay) {
            let functionCall = new Function(delayedFunction[1]);
            functionCall();

            funcDelay = false;
            delayedFunction = "";
        }

        chapterArray = chapters[curChapter];

        if (current != chapterArray.length - 1) {
            current = current + 1;
            let str = chapterArray[current];
            
            updateDialog(str);
        } else {
            console.log("tried to progress but this block has ended. are you waiting on a choice?");
        };
    } else {
        console.log("Failed to progress: ");
    };
};
//#endregion

// the big one, sends us to the next line
function updateDialog(str) {
    let speaker = 'narration';
    let speakerColour = DEFAULT.speakerColour;
    let curChara = str.match(lookForChara);

    // FUNC:[js]]
    if (lookForFunction.test(str) == true) {
        tagFunction(str);
    };

    // FUNCDELAY:[js]]
    if (lookForFunctionDelay.test(str) == true) {
        tagFunctionDelay(str);
    };

    if (lookForAuto.test(str) == true) {
        tagAutoprogression(str);
    };

    // TRANS:[name]:layer:speed
    if (lookForTransAll.test(str) == true) {
        let matchedTrans = str.match(lookForTransAll);

        for (i = 0; i < matchedTrans.length; i++) {
            tagTransition(matchedTrans, i);
        };
    };

    // CLEARSTATUS
    if (lookForCLEARSTATUS.test(str) == true) {
        tagStatusClear();
    };

    // CLEARSCREEN
    if (lookForCLEARSCREEN.test(str) == true) {
        tagClearScreen();
    };

    // CLEARLAYER 
    if (lookForCLEARLAYER.test(str) == true) {
        let matchedLayers = str.match(lookForCLEARLAYERS);

        for (i = 0; i < matchedLayers.length; i++) {
            tagClearLayer(matchedLayers, i);
        };
    };

    // STATUS:[html]]
    if (lookForStatus.test(str) == true) {
        let matchedStatus = str.match(lookForStatus);
        let text = matchedStatus[1];
        tagStatusDisplay(text);
    };

    // RECT:layer:[#colour]:x:y:width:height
    if (lookForRect.test(str) == true) {
        let matchedRects = str.match(lookForRects);

        for (i = 0; i < matchedRects.length; i++) {
            tagRectangle(matchedRects, i);
        };
    };

    // IMAGE:assetimage:layer:x:y
    if (lookForImages.test(str) == true) {
        let matchedImages = str.match(lookForImages);

        for (i = 0; i < matchedImages.length; i++) {
            tagImage(matchedImages, i);
        };
    };

    // BG:assetimage
    if (lookForBG.test(str) == true) {
        tagShorthandBG(str);
    };

    // VID:assetvideo:layer:x:y
    if (lookForVids.test(str) == true) {
        let matchedVids = str.match(lookForVids);

        for (i = 0; i < matchedVids.length; i++) {
            tagVideo(matchedVids, i);
        }
    };

    // VIDBG:assetvideo
    if (lookForVidBG.test(str) == true) {
        tagShorthandVideoBG(str);
    };

    // ANIM:command
    // command: PLAY, STOP
    if (lookForAnim.test(str) == true) {
        let animMatch = str.match(lookForAnim);
        animStatus = animMatch[1];
        tagAnimate(animStatus);
    };

    // PAN:layer:[x]:[y]:speed
    if (lookForPan.test(str) == true) {
        tagPan(str);
    };

    // ZOOM:layer:[x]:[y]:speed
    if (lookForZoom.test(str) == true) {
        tagZoom(str);
    };

    // SILENT:bool
    if (lookForSilent.test(str) == true) {
        tagSilent(str);
    };

    // SET:variable:value 
    if (lookForSet.test(str) == true) {
        let matchedSet = str.match(lookForSet);

        for (i = 0; i < matchedSet.length; i++) {
            tagSet(matchedSet, i);
        };
    };

    // MATH:variable:command:number
    // command: ADD, SUB, MUL, DIV
    if (lookForMath.test(str) == true) {

        let matchedSet = str.match(lookForMath);

        for (i = 0; i < matchedSet.length; i++) {
            tagMaths(matchedSet, i);
        };
    };

    // CHECK:variable:value:command:chaptername:chaptername
    // command: eq, lt, gt, gte, lte
    // first chapter is true outcome, second is false
    if (lookForCheck.test(str) == true) {
        tagCheck(str);
    };

    // REMOVE:choiceid
    if (lookForRemoves.test(str) == true) {
        let matchedRemoves = str.match(lookForRemoves);

        for (i = 0; i < matchedRemoves.length; i++) {
            tagRemove(matchedRemoves, i)
        };
    };

    // REMOVEALL
    if (lookForRemoveAll.test(str) == true) {
        removeChoiceWindow();
    };

    // CHOICE:[choice name]:chaptername
    if (lookForChoices.test(str) == true) {
        let matchedChoices = str.match(lookForChoices);

        for (i = 0; i < matchedChoices.length; i++) {
            tagChoice(matchedChoices, i);
        };

        let choiceClasslist = document.getElementById('choicewindow');
        if (choiceClasslist.classList.contains('hidden')) {
            choiceClasslist.classList.remove('hidden');
        };
    };

    // GOTO:chaptername
    if (lookForGoto.test(str) == true) {
        tagGoto(str);
    };

    // MUS_musicasset
    if (lookForMUS.test(str) == true) {
        tagMusic(str);
    };

    // SFX_sfxasset
    if (lookForSFX.test(str) == true) {
        tagSFX(str);
    };

    // MUSVOL:[value]
    // value: 1-0
    if (lookForSFXVol.test(str) == true) {
        gameplayVolumeSFX = str.match(lookForSFXVol)[1];
        if (gameplayVolumeSFX < 0) {
            console.warn("MUSVOL warning: Volume cannot be lower than 0")
            gameplayVolumeSFX = 0;
        }
        if (gameplayVolumeSFX > 1) {
            console.warn("MUSVOL warning: Volume cannot be higher than 1")
            gameplayVolumeSFX = 1;
        }
        currentSFX.volume = SETTINGS.sfxVol * gameplayVolumeSFX;
    };

    // SFXVOL:[value]
    // value: 1-0
    if (lookForMusVol.test(str) == true) {
        gameplayVolumeMus = str.match(lookForMusVol)[1];
        console.log(gameplayVolumeMus);
        if (gameplayVolumeMus < 0) {
            console.warn("MUSVOL warning: Volume cannot be lower than 0")
            gameplayVolumeMus = 0;
        }
        if (gameplayVolumeMus > 1) {
            console.warn("MUSVOL warning: Volume cannot be higher than 1")
            gameplayVolumeMus = 1;
        }
        currentMUS.volume = SETTINGS.musVol * gameplayVolumeMus;
    };

    // INPUT:variable:limit
    if (lookForInput.test(str) == true) {
        tagInput(str);
    };

    // PERSIST:bool
    if (lookForPersist.test(str) == true) {
        tagPersist(str);
    };

    // RESETTEXT
    if (lookForRESETTEXT.test(str) == true) {
        textColour = DEFAULT.textColour;
        textFont = DEFAULT.textFont;
        textXpos = DEFAULT.textXpos;
        textYpos = DEFAULT.textYpos;
        textEndpos = DEFAULT.textEndpos;
        textSize = DEFAULT.textSize;
        textLineheight = DEFAULT.textLineheight;
    };

    // POS:x:y:endpos
    if (lookForPos.test(str) == true) {
        textXpos = str.match(lookForPos)[1];
        textYpos = str.match(lookForPos)[2];
        textEndpos = str.match(lookForPos)[3];
        
        if (textXpos == "RESET") textXpos = DEFAULT.textXpos;
        if (textYpos == "RESET") textYpos = DEFAULT.textYpos;
        if (textEndpos == "RESET") textEndpos = DEFAULT.textEndpos;

        if (textXpos == "RAND") textXpos = Math.floor(Math.random() * CONFIG.resolutionX);
        if (textYpos == "RAND") textYpos = Math.floor(Math.random() * CONFIG.resolutionY);
    };

    // POSX:x
    if (lookForPosX.test(str) == true) {
        textXpos = str.match(lookForPosX)[1];

        if (textXpos == "RESET") textXpos = DEFAULT.textXpos;
        if (textXpos == "RAND") textXpos = Math.floor(Math.random() * CONFIG.resolutionX);
    };

    // POSY:x
    if (lookForPosY.test(str) == true) {
        textYpos = str.match(lookForPosY)[1];
        
        if (textYpos == "RESET") textYpos = DEFAULT.textYpos;
        if (textYpos == "RAND") textYpos = Math.floor(Math.random() * CONFIG.resolutionY);
    };

    // POSEND:x
    if (lookForPosEnd.test(str) == true) {
        textEndpos = str.match(lookForPosEnd)[1];
        
        if (textEndpos == "RESET") textEndpos = DEFAULT.textEndpos;
    };

    // COL:[colour]
    if (lookForCol.test(str) == true) {
        textColour = str.match(lookForCol)[1];
        if (textColour == "RESET") textColour = DEFAULT.textColour;
    };

    // FONT:[font name]
    if (lookForFont.test(str) == true) {
        textFont = str.match(lookForFont)[1];
        if (textFont == "RESET") textFont = DEFAULT.textFont;
    };
    
    // SIZE:number
    if (lookForSize.test(str) == true) {
        textSize = str.match(lookForSize)[1];
        if (textSize == "RESET") {
            textSize = DEFAULT.textSize;
        } else {
            textSize = parseInt(textSize);
        } 
    };

    // LINE:number
    if (lookForLine.test(str) == true) {
        textLineheight =  parseInt(str.match(lookForLine)[1]);
        if (textLineheight == "RESET") textLineheight = DEFAULT.textLineheight;
    };

    // character! - 
    if (curChara) {
        // backport from heartbreak
        // make sure you put the matching names in the assets list :)
        let chara = SPEAKERS[curChara[1]];
        if (chara) {
            speaker = chara.name;
            if (chara.colour) speakerColour = chara.colour;
        } else {
            // wait what is this even doing
            speaker = curChara[1];
        };
    };
    
    drawDialogue(str, speaker, speakerColour);

    // goto
    if (goto != null) {
        let chaptertarget = goto;
        goto = null;

        changeChapter(chaptertarget);
    };

};
//#endregion

//#region text
function drawDialogue(str, speaker, speakerColour) {
    // find and replace $variables$ in string
    if (lookForVariable.test(str) == true) {
        let matchedVariable = str.match(lookForVariable);
        //console.log("before: " + str);

        // run through every matched var we find
        for (let i = 0; i < matchedVariable.length; i++) {
            // chop off the $ on both sides
            let cleanVar = matchedVariable[i].substring(1, matchedVariable[i].length - 1);
            let toPrint = GAMEVARS[cleanVar];

            if (toPrint == undefined) {
                console.warn("Variable warning: did not find variable in surrounding $ symbols: " +  matchedVariable[i]);
            } else {
                let toReplace = matchedVariable[i];

                str = str.replace(toReplace, toPrint);
                //console.log("after: " + str);
            }
        }
    }
    
    // CON:variable:command:value
    // don't like that this is here instead of in the update but it's easier
    if (lookForCon.test(str) == true) {
        let [, var1,  op, var2] = str.match(lookForCon);

        if (GAMEVARS[var1]) {
            var1 = GAMEVARS[var1];
        };
        if (GAMEVARS[var2]) {
            var2 = GAMEVARS[var2];
        };

        let operator = commandCompare[op];
        let result = operator(var1, var2);

        let brackets = str.match(lookForConBrackets);

        for (let i = 0; i < brackets.length; i++) {
            let trueString = brackets[i].match(lookForConBracket)[1];
            let falseString = brackets[i].match(lookForConBracket)[2];

           if (result) {
                str = str.replace(brackets[i], trueString);
           } else {
                str = str.replace(brackets[i], falseString);
           }
        }
    }

    // trim commands from string
    if (lookForTrim.test(str) == true) {
        str = str.match(lookForTrim);
    };

    // wrap text with markers if someone speaking
    if (speaker !== 'narration') {
        str = DEFAULT.speechmarkLeft + str + DEFAULT.speechmarkRight;
        spkr = speaker;
        spkrcolor = speakerColour;
    } else {
        spkrcolor = "black";
        spkr = null;
        str = "\0" + str;
    };

    // clear previous text
    if (persist == "FALSE") {
        ctx1.clearRect(0, 0, CONFIG.resolutionX, CONFIG.resolutionY);
    };

    // grab line length for autoplay
    currentLineLength = str.length;
    
    // clean text from story file
    drawText(str, textColour, textSize, textFont, textXpos, textYpos, textEndpos, textLineheight);

    // additional speaker name text
    if (spkr != null) {
        let spkrxpos = textXpos - DEFAULT.speakerLeftOffset;
        let spkrendpos = spkrxpos + DEFAULT.speakerEndpos;
        drawText(spkr, spkrcolor, textSize, textFont, spkrxpos, textYpos, spkrendpos, textLineheight);
    };

    // throw message into history log
    logMessage(spkr, spkrcolor, str);

    // trigger autoplay again
    if (autoplay) {
        autoplayTimer = setTimeout(progress, calcAutoSpeed());
    }

    // text sound
    if (silentStatus == "FALSE") {
        sfxPlayer("SFX_TEXT");
    };
};

function drawText(text, color, size, font, x, y, z, lineheight) {
    // break up the string into arrays of lines
    let toMatch = new RegExp(".{1," + z + "}(\\s|$)", "g");
    let chunks = text.match(toMatch);
    
    // remove lineheight offset of first line
    y = y - lineheight;

    for (let i = 0; i < chunks.length; i++) {
        // font and size
        ctx1.font = size + "px " + font;

        // line height
        y = y + textLineheight;

        // border
        ctx1.strokeStyle = DEFAULT.fontStrokeColour;
        ctx1.lineWidth = DEFAULT.fontStrokeWidth;
        ctx1.strokeText(chunks[i], x, y);

        // fill
        ctx1.fillStyle = color;
        ctx1.globalAlpha = DEFAULT.fontAlpha;
        if (!DEFAULT.fontSmoothing) ctx1.filter = 'url(#remove-alpha)';
        ctx1.fillText(chunks[i], x, y);
    };

};
//#endregion

//#region history
function logMessage(speaker, speakerColour, text) {
    if (speaker == null) {
        speaker = ""
    } else {
        speaker = ('<span style="color:' + speakerColour + ';">' + speaker + '</span>');
    };
    let NewMessage = speaker.concat(" ", text);
    let ul = document.getElementById("messagelog");
    let li = document.createElement("li");
    li.innerHTML = NewMessage;
    ul.appendChild(li);

    let messageDiv = document.getElementById("history-container");

    ul.scrollIntoView(false);

    let messagecount = ul.childElementCount;

    if (messagecount >= DEFAULT.messagelogMax) {
        ul.removeChild(ul.children[0]);
    };
};

function clearHistory() {
    const messageLog = document.getElementById("messagelog");
    messageLog.innerHTML = "";
}
//#endregion

//#region autoplay
function toggleAutoplay() {
    clearTimeout(autoplayTimer);
    if (autoplay == false) {
        autoplay = true;
        autoplayTimer = setTimeout(progress, calcAutoSpeed());

        document.getElementById('autoplay').classList.add('open-menu');
    } else {
        autoplay = false;
        if (wasAutoplay) return;
        document.getElementById('autoplay').classList.remove('open-menu');
    };
}

function calcAutoSpeed() {
    // invert the setting speed because full bar = go faster for ux reasons
    let settingSpeed = invertAutoSpeed(SETTINGS.autoSpeed);

    // clamp the line length
    if (currentLineLength > DEFAULT.autoplayMaxLineLength) currentLineLength = DEFAULT.autoplayMaxLineLength;
    if (currentLineLength < DEFAULT.autoplayMinLineLength) currentLineLength = DEFAULT.autoplayMinLineLength;

    // convert the line length to a multiplication range, this is so it scales with both the set player speed AND the amount of characters
    // ie, we're assuming that someone on slowest speed does not read more words as fast as the top speed 
    let speedMult = ((currentLineLength - DEFAULT.autoplayMinLineLength) * (DEFAULT.autoplayMaxMult - DEFAULT.autoplayBaseMult)) / (DEFAULT.autoplayMaxLineLength - DEFAULT.autoplayMinLineLength) + DEFAULT.autoplayBaseMult; 

    console.log(settingSpeed * speedMult);
    return settingSpeed * speedMult;
}

function invertAutoSpeed(value) {
    return (120 + 40) - value;
}

//#region menu ui
function toggleMenu(menu, button) {
    // clicking to activate
    if (menu.classList.contains("hidden")) {
        clearAllMenus();
        menu.classList.remove("hidden");
        button.classList.add("open-menu");
        menubarLock();
    } else // clicking to hide
    {
        clearAllMenus();
        menubarUnlock();
    }
}

function menubarLock() {
    inMenu = true;
    document.getElementById('choicewindow').style.pointerEvents = "none";
    document.getElementById('menu-bar').classList.add('locked');

    if (autoplay) {
        //pause autoplay
        wasAutoplay = true;
        toggleAutoplay();
    }
}

function menubarUnlock() {
    inMenu = false;
    document.getElementById('choicewindow').style.pointerEvents = "all";
    document.getElementById('menu-bar').classList.remove('locked');

    if (wasAutoplay) {
        //resume autoplay
        wasAutoplay = false;
        toggleAutoplay();
    }
}

function clearAllMenus() {
    document.getElementById('settings-menu').classList.add('hidden');
    document.getElementById('history-container').classList.add('hidden');
    document.getElementById('save-menu').classList.add('hidden');

    document.getElementById('savebutton').classList.remove('open-menu');
    document.getElementById('historybutton').classList.remove('open-menu');
    document.getElementById('settingsbutton').classList.remove('open-menu');

    if (inInput) document.getElementById("tag-input").focus();
}
//#endregion

//#region settings
function saveSettings() {
    SETTINGS.musVol = document.getElementById("settingsMusicVolume").value;
    SETTINGS.sfxVol = document.getElementById("settingsSFXVolume").value;
    SETTINGS.autoSpeed = document.getElementById("settingsAutoplaySpeed").value;

    localStorage.setObject("settings", SETTINGS);

    if (currentSFX != null) {
        currentSFX.volume = SETTINGS.sfxVol * gameplayVolumeSFX;
    }
    if (currentMUS != null) {
        currentMUS.volume = SETTINGS.musVol * gameplayVolumeMus;
    }
}

function setSettings() {
    if (localStorage.getObject("settings")) {
        SETTINGS = localStorage.getObject("settings");
    } else {
        // defaults
        SETTINGS.musVol = 0.7;
        SETTINGS.sfxVol = 0.7;
        SETTINGS.autoSpeed = 70;
    }
    document.getElementById("settingsMusicVolume").value = SETTINGS.musVol;
    document.getElementById("settingsSFXVolume").value = SETTINGS.sfxVol;
    document.getElementById("settingsAutoplaySpeed").value = SETTINGS.autoSpeed;

    if (currentSFX != null) {
        currentSFX.volume = SETTINGS.sfxVol * gameplayVolumeSFX;
    }
    if (currentMUS != null) {
        currentMUS.volume = SETTINGS.musVol * gameplayVolumeMus;
    }

    saveSettings();
}
//#endregion

//#region keyboard
function logKey(e) {
    if (e.keyCode == 119) {
        resetGame();
    }

    if (inLoadingScreen) {
        removeLoadingScreen();
        return;
    }

    if (inInput) {
        if (e.keyCode == 9 && inMenu) {
            document.getElementById("tag-input").focus();
        } 
        if (e.keyCode == 13) {
            inputConfirm();
        } 
        return;
    }

    if (e.keyCode == 32 || e.keyCode == 13) {
        if (!autoprogressionOn) progressNext();
    } else if (e.keyCode == 65) {
        if (inMenu) return;
        toggleAutoplay();
    } else if (e.keyCode == 72) {

        toggleMenu(document.getElementById('history-container'), document.getElementById('historybutton'));

    } else if (e.keyCode == 83) {

        toggleMenu(document.getElementById('settings-menu'), document.getElementById('settingsbutton'));
        event.stopPropagation();

    } else if (e.keyCode == 76) {
        toggleMenu(document.getElementById('save-menu'), document.getElementById('savebutton'));
        event.stopPropagation();

    } else {
        let target = e.keyCode - 49;
        let list = document.getElementById('choicelist');

        let listClick = list.childNodes[target];
        
        if (listClick !== undefined) {
            listClick.onclick();
            progress();
        };

        // console.log("make your choice");
    };
};

function resetGame() {
    window.location.href = window.location.href;
}
//#endregion

/*

attributions:
CRT effect based on code from http://aleclownes.com/2017/02/01/crt-display.html
click sound: https://freesound.org/people/EminYILDIRIM/sounds/536108/

*/
