/*
 __   __  __   ____   _____   ___   ______   ___   __   __  _____
|  | |  ||  | |    \ |     | /   \ |      | /   \ |  |_|  ||     |
|  | |  ||  | |  _  ||   __||  _  ||_    _||  _  ||       ||  ___|
|  |_|  ||  | | | | ||  |__ | | | |  |  |  | | | ||       || |___
|       ||  | | |_| ||   __|| |_| |  |  |  | |_| || || || ||  ___|
 |     | |  | |     ||  |__ |     |  |  |  |     || ||_|| || |___
  |___|  |__| |____/ |_____| \___/   |__|   \___/ |_|   |_||_____|

a micro narrative engine by freya campbell
comments or thanks to @spdrcstl or communistsister.itch.io
do not ask me for features

*/

// variables set below. kinda messy but yolo

//#region regex
const lookForTrim = /(?<=\ \-\ ).*/;

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

const lookForRects = /(?:RECT):(\w*):\[([^:]*)\]:(\w*):(\w*):(\w*):(\w*)/g;
const lookForRect = /(?:RECT):(\w*):\[([^:]*)\]:(\w*):(\w*):(\w*):(\w*)/;

const lookForFunction = /(?:FUNC):\[(.*)\]\]/;
const lookForFunctionDelay = /(?:FUNCDELAY):\[([^:]*)\]/;

const lookForAnim = /(?:ANIM):(\w*)/;

const lookForPersist = /(?:PERSIST):(\w*)/;

const lookForSilent = /(?:SILENT):(\w*)/;

const lookForAuto = /(?:AUTO):(\w*):(\w*)/;

const lookForText = /(?:TEXT):\[([^:]*)\]:(\w*):(\w*):(\w*)/;

const lookForPan = /(?:PAN):(\w*):\[(-?\w*)\]:\[(-?\w*)\]:(\w*)/;
const lookForZoom = /(?:ZOOM):(\w*):\[(-?\w*)\]:\[(-?\w*)\]:(\w*)/;
//#endregion

//#region variables
// --- chapters
var chapters = {}; // object that holds each chapter, with each chapter being an array of lines
var curChapter; // current chapter name to access in the object

var chapterArray = null; // current chapter array
var current = 0; // current line in chapter array

var choiceStatus = false; // checks if a choice is present

var goto = null; // holds new chapter names to change at end of progression

var cameFromCheck = false;

var inputCooldown = false;
var cooldownLength = 300;
var clear = false;

// --- loading
const cache = {};
var inLoadingScreen = true;
var gameLoaded = false;

// these grab how many of each we need
var imagesToLoad = 0;
var soundsToLoad = 0;
var storiesToLoad = 1; // future proofing for multi story files maybe

// if the above (except stories) are over 0, that's a group
var groupsToLoad = 0;
var groupsLoaded = 0;

var storiesLoaded = 0;
var imagesLoaded = 0;
var soundsLoaded = 0;

// ... animation
var loadingAnimInterval;
var loadingDots = 1;

// --- canvas
canvas1 = null;
ctx1 = null;
canvas2 = null;
ctx2 = null;
canvas2b = null;
ctx2b = null;
canvas3 = null;
ctx3 = null;
sourcecanvas3 = null;
sourcectx3 = null;
textpos = null;

// --- variables
var GAMEVARS = {};

// settings
var SETTINGS = {};

// --- autoplay
var autoplay = false;
var autoplayTimer = null; // interval

var currentLineLength;

// --- sounds
var currentMUS; // elem of MUS that's playing
var gameplayVolumeMus = 1;

var currentSFX; // elem of SFX that's playing
var gameplayVolumeSFX = 1;

// --- menus
var inMenu = false;
var wasAutoplay; // to resume autoplay on menu close
//#endregion

//#region setup
async function getFile(fileURL) {
    let fileContent = await fetch(fileURL);
    fileContent = await fileContent.text();
    return fileContent;
};

function readyStory() {
    // get the story from story.txt and turn it into array
    parseStory();

    makeMusicPlayers();
    cacheIMGs();

    // loading screen
    document.getElementById("loading-progress").innerHTML = CONFIG.loadingSplashMessage + ".";

    loadingAnimation(); // run once to play first "frame"
    loadingAnimInterval = setInterval(loadingAnimation, CONFIG.loadingAnimationSpeed);

    // canvases
    attachCanvas();

    // defaults
	curChapter = CONFIG.startingChapter;

    // set title bg
    let bgimg = new Image();
    bgimg.addEventListener('load', () => {
        ctx3.drawImage(bgimg, 0, 0, 640, 400);
    }, false);
    bgimg.src = cache[DEFAULT.defaultBG].src;

    // keys and clicks
    document.addEventListener('keydown', logKey);
    document.getElementById('screen').onclick = function() {
        if (!autoprogressionOn) nextLine();
    };
    document.getElementById("loading-screen").onclick = function() {
        removeLoadingScreen();
        clearTimeout(loadingDoneTimeout);
    };

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

    // menu buttons
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
        if (!autoplay) progress();
        toggleAutoplay();
        event.stopPropagation();
	});
    document.getElementById('historybutton').addEventListener("click", (event) => {
        toggleMenu(document.getElementById('messagecontainer'), document.getElementById('historybutton'));
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

    // save load menu
    document.getElementById('savegame').addEventListener('click', function() {
        toggleMenu(document.getElementById('save-menu'), document.getElementById('savesbutton'))
        save();
    });
    document.getElementById('loadgame').addEventListener('click', function() {
        toggleMenu(document.getElementById('save-menu'), document.getElementById('savesbutton'))
        load();
    });

    console.log('action!');
};

function parseStory() {
    console.log('getting file');
    loadingLine("Loading story", "story");
    
    getFile('story.txt').then(content => {
        let storyArray = content.trim().split("###");
        if (CONFIG.debugLogs) console.groupCollapsed("retrieved file");
		if (CONFIG.debugLogs) console.info(storyArray);

        for (i = 0; i < storyArray.length; i++) {
            let target = storyArray[i];
            storyArray[i] = target.trim().split("\n");

        };

		if (CONFIG.debugLogs) console.info("split file:");
		if (CONFIG.debugLogs) console.info(storyArray);

        for (i = 0; i < storyArray.length; i++) {
            nextchapter = storyArray[i];
            chaptertitle = nextchapter[0].replace(/[\n\r]/g, '');
            chaptercontent = nextchapter;
            chapters[chaptertitle] = chaptercontent;
        };
        if (CONFIG.debugLogs) console.groupEnd();

    storyLoaded();

    }).catch(error => {
		console.log(error);
        console.error("Unable to load story.txt file.");
    });

    if (CONFIG.debugLogs) console.info("chapter object:");
	if (CONFIG.debugLogs) console.info(chapters);
};

function setCanvas(screen) {
    // cache image
    let oldImage = screen.toDataURL("image/png");

    // screen sizing
    setScreen(screen);

    // reapply images
    let bgimg = new Image();
    bgimg.addEventListener('load', () => {
        screen.getContext("2d").drawImage(bgimg, 0, 0, CONFIG.resolutionX, CONFIG.resolutionY);
    }, false);
    bgimg.src = oldImage;
}

function setScreen(screen) {

    // absolute canvas width
    screen.width = CONFIG.resolutionX;
    screen.height = CONFIG.resolutionY;

    // permanent menu bar for touchscreen devices
    if (window.navigator.maxTouchPoints > 1) {
        document.getElementById('menu-bar').classList.add('touch');
    }
      
}

function attachCanvas() {
    // canvas sizes
    setScreen(document.getElementById('screen'));

    setCanvas(document.getElementById('text'));
    canvas1 = document.getElementById('text');

    setCanvas(document.getElementById('front'));
    canvas2 = document.getElementById('front');

    setCanvas(document.getElementById('front2'));
    canvas2b = document.getElementById('front2');

    setCanvas(document.getElementById('back'));
    canvas3 = document.getElementById('back');

    // set context
    ctx1 = document.getElementById('text').getContext('2d');
    ctx2 = document.getElementById('front').getContext('2d');
    ctx2b = document.getElementById('front2').getContext('2d');
    ctx3 = document.getElementById('back').getContext('2d');

    // back layer source
    sourceback = new OffscreenCanvas((CONFIG.resolutionX) * 4, (CONFIG.resolutionY) * 4);
    sourcectx3 = sourceback.getContext('2d');
};
//#endregion

//#region loading

	function loadingLine(string, id) {
        if(id != "story") groupsToLoad++; // stories are not part of the loading groups since they're all done before sounds and audio

        let loadingscreen = document.getElementById("loading-screen");

		let item = document.createElement("SPAN");
		item.setAttribute("id", "loadingline-" + id)
		item.classList.add("toload");
		item.innerHTML = string;

		loadingscreen.appendChild(item);
		loadingscreen.appendChild(document.createElement("BR"));
	}

function imageLoaded() {
    imagesLoaded++;
    
    if (imagesLoaded == imagesToLoad) loadedText("images", "Images loaded");
}

function soundLoaded() {
    soundsLoaded++;

    if (soundsLoaded == soundsToLoad) loadedText("sounds", "Sounds loaded");
}

function storyLoaded() {
    storiesLoaded++;

    if (storiesLoaded == storiesToLoad) loadedText("story", "Story loaded");
}

function loadedText(id, text) {
	document.getElementById("loadingline-" + id).classList.remove("toload");
	document.getElementById("loadingline-" + id).innerHTML = text;

    if(id != "story") groupsLoaded++; // stories are not part of the loading groups since they're all done before sounds and audio

	checkIfFinishedLoading();
}

var loadingDoneTimeout;
function checkIfFinishedLoading() {
    
    if (groupsLoaded == groupsToLoad && storiesLoaded == storiesToLoad) {
        // everything's ready!
        clearInterval(loadingAnimInterval);
		gameLoaded = true;

        // fake ux  buffer, we can actually enter the game from this point without needing to wait
        loadingDoneTimeout = setTimeout(() => {
            document.getElementById("loading-progress").innerHTML = CONFIG.loadingDoneMessage;
            document.getElementById("loading-screen").innerHTML += `<span id="loadingline-done">${CONFIG.loadingPrompt}</span>`;
        }, "1000");
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
    if (gameLoaded) {
        inLoadingScreen = false;
        if (document.getElementById("loading-screen")) document.getElementById("loading-screen").remove();
    }
}
//#endregion

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
        // pause autoplay
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
    document.getElementById('messagecontainer').classList.add('hidden');
    document.getElementById('save-menu').classList.add('hidden');

    document.getElementById('savebutton').classList.remove('open-menu');
    document.getElementById('historybutton').classList.remove('open-menu');
    document.getElementById('settingsbutton').classList.remove('open-menu');
}
//#endregion

//#region keyboard
function logKey(e) {
    if (inLoadingScreen) {
        removeLoadingScreen();
        return;
    }

    if (e.keyCode == 32 || e.keyCode == 13) {
        if (!autoprogressionOn) nextLine();
    } else if (e.keyCode == 65) {
        if (inMenu) {
            if (wasAutoplay) {
                document.getElementById('autoplay').classList.remove('open-menu');
            } else {
                document.getElementById('autoplay').classList.add('open-menu');
            }
            wasAutoplay = !wasAutoplay;
            return;
        }
        if (!autoplay) progress();
        toggleAutoplay();
        event.stopPropagation();
    } else if (e.keyCode == 72) {

        toggleMenu(document.getElementById('messagecontainer'), document.getElementById('historybutton'));

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
        } else {
            if (CONFIG.debugLogs) console.warn("key does not equal a current choice number, skipping");
        }
    };
};
//#endregion

//#region asset creation
function makeMusicPlayers() {
    soundsToLoad = Object.keys(MUSIC).length;

    if (soundsToLoad > 0) {
        if (CONFIG.debugLogs) console.groupCollapsed("sounds found");
        loadingLine("Loading sounds", "sounds");
    }

    for (let [key, value] of Object.entries(MUSIC)) {
        if (CONFIG.debugLogs) console.log(`${key}: ${value}`);
        var newplayer = document.createElement("AUDIO");
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

    if (CONFIG.debugLogs) console.groupEnd();
	console.log('music loaded');
};

function cacheIMGs() {
    imagesToLoad = Object.keys(IMGs).length;

    if (imagesToLoad > 0) {
        if (CONFIG.debugLogs) console.groupCollapsed("images found");
        loadingLine("Loading images", "images");
    }

    for (let [key, value] of Object.entries(IMGs)) {
        if (CONFIG.debugLogs) console.log(`${key}: ${value}`);
        var newimage = document.createElement("img");
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
    if (CONFIG.debugLogs) console.groupEnd();

	console.log('images loaded');
	if (CONFIG.debugLogs) console.info(cache);
};
//#endregion

//#region progression
function changeChapter(target) {
    curChapter = target;
    current = 0;

    let list = document.getElementById('choicelist');
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    };

    // auto hide choice window on chapter change. pretty sure this is wanted in most cases
    document.getElementById('choicewindow').classList.add('hidden');
};

function nextLine() {
    if (autoprogressionOn) {
        progress();
        return;
    }
    if (inputCooldown || inMenu || autoplay) return;

    setTimeout(() => {
        inputCooldown = false
    }, cooldownLength);
    inputCooldown = true;

    progress();
}

function progress() {
    if (!inMenu || autoprogressionOn) {
        chapterArray = chapters[curChapter];

        if (current != chapterArray.length - 1) {
            current++;
            let str = chapterArray[current];
            
            updateDialog(str);
        }
    } else {
        console.log("Failed to progress");
    };
};

// the big one, sends us to the next line
function updateDialog(str) {
    let speaker = 'narration';
    let speakerColour = DEFAULT.speakerColour;
    let curChara = str.match(lookForChara);

    // FUNC:[js]]
    if (lookForFunction.test(str) == true) {
        tagFunction(str);
    }

    // AUTO:linenumber:speed
    if (lookForAuto.test(str) == true) {
        tagAutoprogression(str);
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

    // character! - 
    if (curChara) {
        // backport from heartbreak
        // make sure you put the matching names in the assets list :)
        let chara = SPEAKERS[curChara[1]];
        if (chara) {
            speaker = chara;
        }
    };

    // grab line length for autoplay
    currentLineLength = str.length;
    
    // TEXT:[colour]:xpos:ypos:endpos
    if (lookForText.test(str) == true) {
        let font = str.match(lookForText)[1];
        let xpos = str.match(lookForText)[2];
        xpos = parseInt(xpos, 10);
        let ypos = str.match(lookForText)[3];
        ypos = parseInt(ypos, 10);
        let endpos = str.match(lookForText)[4];
        endpos = parseInt(endpos, 10);
        drawDialogue(str, speaker, font, xpos, ypos, endpos);
    } else {
        drawDialogue(str, speaker, DEFAULT.textColour, DEFAULT.textXpos, DEFAULT.textYpos, DEFAULT.textEndpos);
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

    // PERSIST:bool
    if (lookForPersist.test(str) == true) {
        tagPersist(str);
    };
    // goto
    if (goto != null) {
        let chaptertarget = goto;
        goto = null;

        changeChapter(chaptertarget);
    };

};
//#endregion

//#region render dialogue
function drawDialogue(str, speaker, font, xpos, ypos, endpos) {
    // TRIM COMMANDS FROM STRING
    if (lookForTrim.test(str) == true) {
        str = str.match(lookForTrim).toString();
    };

    // UPDATE DIALOG
    if (persist == "FALSE") {
        // get rid of old text with full layer clear
        ctx1.clearRect(0, 0, 640, 400);
    };

    // draw speaker name text
    if (speaker != "narration") {
        drawText(speaker.name, speaker.colour, xpos - DEFAULT.speakerLeftOffset, ypos, DEFAULT.speakerEndpos);
        str = DEFAULT.speechmarkLeft + str + DEFAULT.speechmarkRight;
    };

    // draw dialogue text
    drawText(str, font, xpos, ypos, endpos);

    logMessage(speaker, str);

    // trigger autoplay again
    if (autoplay) {
        autoplayTimer = setTimeout(progress, calcAutoSpeed());
    }

    // text sound

    if (silentStatus == "FALSE") {

        sfxPlayer("SFX_TEXT");

    };
    // goto happens at end to prevent blank lines

};

function drawText(text, color, x, y, z) {
    // break up the string into arrays of lines
    let toMatch = new RegExp(".{1," + z + "}(\\s|$)", "g");
    let chunks = text.match(toMatch);

    if (chunks == null) {
        chunks = [""];
        return;
    } 

    // remove lineheight offset of first line
    y = y - DEFAULT.textLineheight;

    for (let i = 0; i < chunks.length; i++) {
        // font and size
        ctx1.font = DEFAULT.textSize + "px " + DEFAULT.textFont;

        // line height
        y = y + DEFAULT.textLineheight;

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

function logMessage(speaker, text) {
    let spkr = speaker.name;

    if (spkr == undefined) {
        spkr = ""
    }

    speaker = ('<span style="color:' + speaker.colour + ';">' + spkr + '</span>');
    let NewMessage = speaker.concat(" ", text);
    let ul = document.getElementById("messagelog");
    let li = document.createElement("li");
    li.innerHTML = NewMessage;
    ul.appendChild(li);

    let messageDiv = document.getElementById("messagecontainer");

    ul.scrollIntoView(false);

    let messagecount = ul.childElementCount;

    if (messagecount >= 20) {
        ul.removeChild(ul.children[0]);
    };
};

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


function toggleAutoplay() {
	if (inMenu) return;

    clearTimeout(autoplayTimer);
    if (autoplay == false) {
        autoplay = true;
        
        autoplayTimer = setTimeout(progress, calcAutoSpeed());

		document.getElementById("autoplay").classList.add("open-menu");
    } else {
        autoplay = false;
        if (wasAutoplay) return;
	    document.getElementById("autoplay").classList.remove("open-menu");
    };
}

//#region autoplay
function calcAutoSpeed() {
    // invert the setting speed because full bar = go faster for ux reasons
    let settingSpeed = invertAutoSpeed(SETTINGS.autoSpeed);

    // clamp the line length
    if (currentLineLength > DEFAULT.autoplayMaxLineLength) currentLineLength = DEFAULT.autoplayMaxLineLength;
    if (currentLineLength < DEFAULT.autoplayMinLineLength) currentLineLength = DEFAULT.autoplayMinLineLength;

    // convert the line length to a multiplication range, this is so it scales with both the set player speed AND the amount of characters
    // ie, we're assuming that someone on slowest speed does not read more words as fast as the top speed 
    let speedMult = ((currentLineLength - DEFAULT.autoplayMinLineLength) * (DEFAULT.autoplayMaxMult - DEFAULT.autoplayBaseMult)) / (DEFAULT.autoplayMaxLineLength - DEFAULT.autoplayMinLineLength) + DEFAULT.autoplayBaseMult; 

    if(CONFIG.debugLogs) console.info(settingSpeed * speedMult);
    return settingSpeed * speedMult;
}

function invertAutoSpeed(value) {
    return (120 + 40) - value;
}
//#endregion

function resetGame() {
    window.location.href = window.location.href;
}

// saving extensions 
Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}


/*

attributions:
CRT effect based on code from http://aleclownes.com/2017/02/01/crt-display.html
click sound: https://freesound.org/people/EminYILDIRIM/sounds/536108/

*/