
//#region variables

// check if a video is playing on a canvas, and what its name is
var vidplayingOnFront1 = false;
var vidplayingOnFront2 = false;
var vidplayingOnBack = false;
var vidBackName = "";
var vidFront1Name = "";
var vidFront2Name = "";
// coords for saving. don't like it but there's no other solution
var vidBackX;
var vidBackY;
var vidFrontX;
var vidFrontY;
var vidFront2X;
var vidFront2Y;

// functions for CHECK
const commandCompare = {
    "gt": (a, b) => a > b,
    "lt": (a, b) => a < b,
    "eq": (a, b) => a == b,
    "gte": (a, b) => a >= b,
    "lte": (a, b) => a <= b
};

// persist
var persist = "FALSE";

// silent
var silentStatus = "FALSE";

// function
var funcDelay = false;
var delayedFunction = "";

//input
var inputVariable;
var inputLength;

// transition
var isTransitioning;

// pam & zoom
var target = 0;

var sourcex = 0;
var sourcey = 0;
var newx = 0;
var newy = 0;
var sourcewidth = 640;
var sourceheight = 400;
var panning = "FALSE";
var waitForPan;
var starttime;
var zm_sourcex = 0;
var zm_sourcey = 0;
var zm_newx = 0;
var zm_newy = 0;
var zm_sourcewidth = 640;
var zm_sourceheight = 400;
var zm_newwidth = 0;
var zm_newheight = 0;
var zoomies = "FALSE";
var waitForZoom;
var zm_starttime;

//auto progression
var autoprogressionOn = false;
var autoprogressionLeft = 0;
var autoprogressionSpeed = 0;
var autoprogressionInterval;

//#endregion

//#region status
function tagStatusDisplay(text) {
    // this seems underwhelming currently
    string = text;
    document.getElementById('statuswindow').innerHTML = text;
    document.getElementById('statuswindow').classList.remove('hidden');
};

function tagStatusClear() {
    document.getElementById('statuswindow').innerHTML = null;
    document.getElementById('statuswindow').classList.add('hidden');
}
//#endregion

//#region clear
function tagClearScreen() {
    ctx1.clearRect(0, 0, 640, 400);
    ctx2.clearRect(0, 0, 640, 400);
    ctx2b.clearRect(0, 0, 640, 400);
    ctx3.clearRect(0, 0, 640, 400);
    sourcectx3.clearRect(0, 0, 640, 400);
    stopVideo("back");
    stopVideo("front");
    stopVideo("front2");
}

function tagClearLayer(matchedLayers, i) {
    let str = matchedLayers[i];
    let layer = str.match(lookForCLEARLAYER)[1];

    let ctx = document.getElementById(layer).getContext('2d');

    stopVideo(layer);
    ctx.clearRect(0, 0, 640, 400);
}
//#endregion

//#region rectangle
function tagRectangle(matchedRects, i) {
    
    let str = matchedRects[i];
    let layer = str.match(lookForRect)[1];
    let color = str.match(lookForRect)[2];
    let x = str.match(lookForRect)[3];
    let y = str.match(lookForRect)[4];
    let width = str.match(lookForRect)[5];
    let height = str.match(lookForRect)[6];
    let ctx = null;

    if (layer == "sourceback") {
        ctx = sourcectx3
    } else {
        ctx = document.getElementById(layer).getContext('2d');
    };

    // randoms
    if (x == "RAND") x = Math.floor(Math.random() * CONFIG.resolutionX);
    if (y == "RAND") y = Math.floor(Math.random() * CONFIG.resolutionX);
    if (width == "RAND") width = Math.floor(Math.random() * CONFIG.resolutionX);
    if (height == "RAND") height = Math.floor(Math.random() * CONFIG.resolutionX);
    
    ctx.fillStyle = color;

    stopVideo(layer);
    ctx.fillRect(x, y, width, height);
}
//#endregion

//#region images
function tagImage(matchedImages, i) {
    let str = matchedImages[i];
    let id = str.match(lookForImage)[1];
    let layer = str.match(lookForImage)[2];
    let imgx = str.match(lookForImage)[3];
    let imgy = str.match(lookForImage)[4];

    let ctx = null;

    if (layer == "sourceback") {
        ctx = sourcectx3
    } else {
        ctx = document.getElementById(layer).getContext('2d');
    };

    img = document.getElementById(id);

    if (imgx == "RAND") imgx = Math.floor(Math.random() * CONFIG.resolutionX);
    if (imgy == "RAND") imgy = Math.floor(Math.random() * CONFIG.resolutionY);
    
    stopVideo(layer);
    ctx.drawImage(img, imgx, imgy);
}

function tagShorthandBG(str) {
    let id = str.match(lookForBG)[1];
    let img = document.getElementById(id);

    ctx = document.getElementById("back").getContext('2d');

    stopVideo("back");
    ctx.drawImage(img, 0, 0);
}
//#endregion

//#region function
function tagFunction(str) {
    let matchedCode = str.match(lookForFunction);
    console.log(matchedCode);
    var functionCall = new Function(matchedCode[1]);
    functionCall();
}

function tagFunctionDelay(str) {
    delayedFunction = str.match(lookForFunctionDelay);
    funcDelay = true;
}
//#endregion

//#region video
function tagVideo(matchedVids, i) {
    let str = matchedVids[i];
    let id = str.match(lookForVid)[1];
    let layer = str.match(lookForVid)[2];
    let vidX = str.match(lookForVid)[3];
    let vidY = str.match(lookForVid)[4];

    if (vidX == "RAND") vidX = Math.floor(Math.random() * CONFIG.resolutionX);
    if (vidY == "RAND") vidY = Math.floor(Math.random() * CONFIG.resolutionY);

    stopVideo(layer);
    playVideo(id, layer, vidX, vidY);
}

function tagShorthandVideoBG(str) {
    let id = str.match(lookForVidBG)[1];

    stopVideo("back");
    playVideo(id, "back", 0, 0);
}

function playVideo(id, layer, vidX, vidY) {
    let ctx = null;
    let vid = document.getElementById(id);

	let oldCanv = document.getElementById(layer).toDataURL("image/png");
    let oldCanvasImage = new Image();
    oldCanvasImage.src = oldCanv;

    if (layer == "back") {
        vidplayingOnBack = true;
        vidBackName = id;
        console.log("vid on back: " + vidBackName);

        vidBackX = vidX;
        vidBackY = vidX;
    } else if (layer == "front") {
        vidplayingOnFront1 = true;
        vidFront1Name = id;
        console.log("vid on front: " + vidFront1Name);

        vidFrontX = vidX;
        vidFrontY = vidX;
    } else if (layer == "front2") {
        vidplayingOnFront2 = true;
        vidFront2Name = id;
        console.log("vid on front2: " + vidFront2Name);

        vidFront2X = vidX;
        vidFront2Y = vidX;
    }

    if (layer == "sourceback") {
        ctx = sourcectx3
    } else {
        ctx = document.getElementById(layer).getContext('2d');
    };

    function step() {
        if (vid.paused) return;
        
        ctx.drawImage(oldCanvasImage, 0, 0); // draw previous frame, includes the alpha

        ctx.drawImage(vid, vidX, vidY); // draw next frame of video
        requestAnimationFrame(step);
    }
    requestAnimationFrame(step);

    vid.play();
}

function stopVideo(layer) {
    if (layer == "back") {
        vidplayingOnBack = false;
        if (vidBackName) document.getElementById(vidBackName).pause();
    } else if (layer == "front") {
        vidplayingOnFront1 = false;
        if (vidFront1Name) document.getElementById(vidFront1Name).pause();
    } else if (layer == "front2") {
        vidplayingOnFront2 = false;
        if (vidFront2Name) document.getElementById(vidFront2Name).pause();
    }
}
//#endregion

//#region animation
function animateLayers() {
    if (isAnimating) {
        console.warn("ANIM warning: Animation is already playing, skipping.");
        return;
    }

    isAnimating = true;
    animating = setInterval(function() {

        let canvas = document.getElementById("front");
        let hidden = canvas.getAttribute("hidden");

        if (hidden) {
            canvas.removeAttribute("hidden");
        } else {
            canvas.setAttribute("hidden", "hidden");
        };

        let canvas2 = document.getElementById("front2");
        let hidden2 = canvas2.getAttribute("hidden");

        if (hidden2) {
            canvas2.removeAttribute("hidden");
        } else {
            canvas2.setAttribute("hidden", "hidden");
        };

    }, DEFAULT.animtime);
}

function tagAnimate(command) {
    if (command == "PLAY") {
        animateLayers();
    } else if (command == "STOP") {
        isAnimating = false;

        clearInterval(animating);

        let canvas = document.getElementById("front");
        canvas.removeAttribute("hidden");

        let canvas2 = document.getElementById("front2");
        canvas2.setAttribute("hidden", "hidden");
    } else {
        console.log("unrecognised animation command. stopping");
        clearInterval(animating);

        let canvas = document.getElementById("front");
        canvas.removeAttribute("hidden");

        let canvas2 = document.getElementById("front2");
        canvas2.setAttribute("hidden", "hidden");
    };
};
//#endregion

//#region maths
function tagMaths(matchedSet, i) {
    let toset = matchedSet[i];

    let target = toset.match(lookForSubMath)[1];
    let operation = toset.match(lookForSubMath)[2];
    let value = toset.match(lookForSubMath)[3];

    if (GAMEVARS[value]) {
        value = GAMEVARS[value];
    };

    let oldVal = GAMEVARS[target];
    let newVal;

    if (operation == "ADD") {
        newVal = parseFloat(oldVal) + parseFloat(value);
    } else if (operation == "SUB") {
        newVal = parseFloat(oldVal) - parseFloat(value);
    } else if (operation == "MUL") {
        newVal = parseFloat(oldVal) * parseFloat(value);
    } else if (operation == "DIV") {
        newVal = parseFloat(oldVal) / parseFloat(value);
    } else {
        console.warn("MATH warning: Did not recognise operation name");
    }

    GAMEVARS[target] = newVal;
    console.log(GAMEVARS);
}
//#endregion

//#region pan
function tagPan(str) {
    let panlayer = str.match(lookForPan)[1];
    let panx = str.match(lookForPan)[2];
    let pany = str.match(lookForPan)[3];
    let pantime = str.match(lookForPan)[4];

    console.log(panlayer, panx, pany, pantime);

    if (panning == "FALSE") {
        panning = "TRUE";
        requestAnimationFrame(function(timestamp) {
            starttime = timestamp || new Date().getTime()
            pan(timestamp, panlayer, panx, pany, pantime);
        })
    } else {
        // check every second for current pan to finish then trigger new one?
        waitForPan = setInterval(function() {
            if (panning == "FALSE") {
                panning = "TRUE";
                requestAnimationFrame(function(timestamp) {
                    starttime = timestamp || new Date().getTime()
                    pan(timestamp, panlayer, panx, pany, pantime);
                })
                clearInterval(waitForPan);
            };
        }, 1000);
    };
}
function pan(timestamp, layer, x, y, time) {

    x = Number(x);
    y = Number(y);

    var timestamp = timestamp || new Date().getTime()
    var runtime = timestamp - starttime;
    var progress = runtime / time;

    progress = Math.min(progress, 1)

    let addx = Number((x * progress).toFixed(0));
    let addy = Number((y * progress).toFixed(0));
    newx = sourcex + addx;
    newy = sourcey + addy;
    // toFixed should clamp movement to the pixel grid...

    target = document.getElementById(layer).getContext('2d');
    //should all canvases have an offscreen canvas source layer called the same thing with source prepended?
    //atm only back does... panning front layer should be supported but test it first

    let areaToDraw = sourcectx3.getImageData(newx, newy, sourcewidth, sourceheight);
    target.clearRect(0, 0, CONFIG.resolutionX, CONFIG.resolutionY);
    target.putImageData(areaToDraw, 0, 0);

    if (runtime < time) {
        panning = "TRUE";
        requestAnimationFrame(
            function(timestamp) {
                pan(timestamp, layer, x, y, time);
            });
    } else {

        // finish animation, reset new base source coordinates for tracking movement % for next command
        panning = "FALSE";
        sourcex = Number(newx);
        sourcey = Number(newy);
        console.log("sourcex is now ", newx);
        console.log("sourcey is now ", newy);
    };
};
//#endregion

//#region zoom
function tagZoom(str) {
    let zoomlayer = str.match(lookForZoom)[1];
    let zoomx = str.match(lookForZoom)[2];
    let zoomy = str.match(lookForZoom)[3];
    let zoomtime = str.match(lookForZoom)[4];

    console.log(zoomlayer, zoomx, zoomy, zoomtime);

    if (zoomies == "FALSE") {
        zoomies = "TRUE";
        requestAnimationFrame(function(timestamp) {
            zm_starttime = timestamp || new Date().getTime()
            zoom(timestamp, zoomlayer, zoomx, zoomy, zoomtime);
        })
    } else {
        // check every second for current zoom to finish then trigger new one
        waitForZoom = setInterval(function() {
            if (zoomies == "FALSE") {
                zoomies = "TRUE";
                requestAnimationFrame(function(timestamp) {
                    zm_starttime = timestamp || new Date().getTime()
                    zoom(timestamp, zoomlayer, zoomx, zoomy, zoomtime);
                })
                clearInterval(waitForZoom);
            };
        }, 1000);
    };
}

function zoom(timestamp, layer, x, y, zoomtime) {

    x = Number(x);
    y = Number(y);

    var timestamp = timestamp || new Date().getTime()
    var zm_runtime = timestamp - zm_starttime;
    var zm_progress = zm_runtime / zoomtime;

    zm_progress = Math.min(zm_progress, 1)

    let addx = Number((x * zm_progress).toFixed(0)); // % of 640
    let addy = Number((y * zm_progress).toFixed(0)); // % of 400
    zm_newx = zm_sourcex - (0.5 * addx); // - 50% of % of 640 = add to both sides
    zm_newy = zm_sourcey - (0.5 * addy); // - 50% of % of 400 = add to both sides
    zm_newwidth = zm_sourcewidth + addx; // add % of 640 to width
    if (zm_newwidth <= 0) {
        zm_newwidth = 1
    }; // janky workaround to avoid div by 0
    zm_newheight = zm_sourceheight + addy; // add % of 400 to height
    if (zm_newheight <= 0) {
        zm_newheight = 1
    }; // janky workaround to avoid div by 0
    //console.log("draw area is ", zm_sourcex, zm_sourcey, zm_newwidth, zm_newheight);

    //make new canvas
    let temptarget = new OffscreenCanvas(zm_newwidth, zm_newheight);
    temptarget_ctx = temptarget.getContext('2d');
    temptarget_ctx.imageSmoothingEnabled = false;
    temptarget_ctx.drawImage(sourceback, zm_newx, zm_newy, zm_newwidth, zm_newheight, 0, 0, zm_newwidth, zm_newheight);
    //retarget to desired draw layer
    target = document.getElementById(layer).getContext('2d');
    target.imageSmoothingEnabled = false;
    //copy temp offscreen canvas onto draw layer
    target.clearRect(0, 0, CONFIG.resolutionX, CONFIG.resolutionY);
    target.drawImage(temptarget, 0, 0, zm_newwidth, zm_newheight, 0, 0, CONFIG.resolutionX, CONFIG.resolutionY);

    //console.log(zm_runtime, time);

    if (zm_runtime < zoomtime) {

        zoomies = "TRUE";
        console.log("reporting", zoomies);
        requestAnimationFrame(
            function(timestamp) {
                zoom(timestamp, layer, x, y, zoomtime);
            });
    } else {

        // finish animation, reset new base source coordinates for tracking movement % for next command
        zoomies = "FALSE";
        zm_sourcex = Number(zm_newx);
        zm_sourcey = Number(zm_newy);
        zm_sourcewidth = Number(zm_newwidth);
        zm_sourceheight = Number(zm_newheight);
        target.imageSmoothingEnabled = true;

    };

};
//#endregion

//#region silent
function tagSilent(str) {
    let silentMatch = str.match(lookForSilent);
    silentStatus = silentMatch[1];
}
//#endregion

//#region set
function tagSet(matchedSet, i) {
    let toset = matchedSet[i];
    let target = toset.match(lookForSubSet)[1];
    let value = toset.match(lookForSubSet)[2];
    GAMEVARS[target] = value;
}
//#endregion

//#region choice
function tagChoice(matchedChoices, i) {
    let str = matchedChoices[i];
    let id = str.match(lookForSubChoices)[1];
    let text = str.match(lookForSubChoices)[2];
    let destination = str.match(lookForSubChoices)[3];

    updateChoices(id, text, destination);
    console.log("Choice hit: id is " + id + ", text is " + text + ", destination is " + destination);

    showChoiceWindow();
}


function updateChoices(id, text, destination) {
    // seems fine
    let list = document.getElementById('choicelist');
    let item = document.createElement("LI");
    item.setAttribute('id', id);
    item.setAttribute('destination', destination);
    item.setAttribute('class', "choiceListLi");
    item.innerHTML = "<a href='#' class='choiceListItem'>"+text+"</a>";
    item.onclick = function() {
        changeChapter(destination);
        removeChoiceWindow();
    };
    list.appendChild(item);
    // console.log(list.childNodes);
 };

function showChoiceWindow() {
    let choiceClasslist = document.getElementById('choicewindow');
    if (choiceClasslist.classList.contains('hidden')) {
        choiceClasslist.classList.remove('hidden');
     };
}

function removeChoiceWindow() {
    let list = document.getElementById('choicelist');
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    };

    document.getElementById('choicewindow').classList.add('hidden');
}
//#endregion

//#region check and goto
function tagCheck(str) {
        if (DEFAULT.removeChoiceAtBlockEnd) removeChoiceWindow();

        let check = str;
        let [, var1, var2, op, out1, out2] = check.match(lookForCheck)

        if (GAMEVARS[var1]) {
            var1 = GAMEVARS[var1];
        };
        if (GAMEVARS[var2]) {
            var2 = GAMEVARS[var2];
        };

        let operator = commandCompare[op];
        let result = operator(var1, var2);

        if (result) {
            goto = out1;
        } else {
            goto = out2;
        };
}

function tagGoto(str) {
    let gototarget = str.match(lookForGoto);
    goto = gototarget[1];
    if (DEFAULT.removeChoiceAtBlockEnd) removeChoiceWindow();
}

function changeChapter(target) {
    curChapter = target;
    current = 0;
    choiceStatus = false;

    if (DEFAULT.autosaveAll) {
        saveGame("auto");
    } else if (curChapter.endsWith("_SAVE")) {
        saveGame("auto");
    }
    
    if (DEFAULT.removeChoiceAtBlockEnd) removeChoiceWindow();
};
//#endregion

//#region remove
function tagRemove(matchedRemoves, i) {
    // console.log(i, matchedRemoves.length);
    let str = matchedRemoves[i];
    let text = str.match(lookForSubRemoves)[1];

    removeChoices(text);
}

function removeChoices(text) {
    choice = document.getElementById(text);
    if (choice == null) {
        console.warn("REMOVE warning: choiceid not found, skipping");
        return;
    } 
    choice.remove();

    let choicelist = document.getElementById('choicelist');
    if (choicelist.childNodes.length < 1) {
        let choicewindow = document.getElementById('choicewindow');
        choicewindow.classList.add('hidden');
    };
};
//#endregion

//#region music
function tagMusic(str) {
    // could be a bit more fully featured in future
    let curMUS = str.match(lookForMUS);
    let track = curMUS[0];
    musicPlayer(track);
}

function musicPlayer(track) {
    let sounds = document.getElementsByTagName('audio');
    for (i = 0; i < sounds.length; i++) sounds[i].pause();

    track = document.getElementById(track);
    track.volume = SETTINGS.musVol * gameplayVolumeMus;
    track.play();
    currentMUS = track;
    // console.log('playing music');
};
//#endregion

//#region sfx
function tagSFX(str) {
    // cheap and cheerful. maybe we want more checks and variables here in future
    let curSFX = str.match(lookForSFX);
    let track = curSFX[0];
    sfxPlayer(track);
}

function sfxPlayer(track) {
    track = document.getElementById(track);
    track.currentTime = 0;
    if (track != "SFX_TEXT") {
        currentSFX = track;
        track.volume = SETTINGS.sfxVol * gameplayVolumeSFX;
    } else {
        track.volume = SETTINGS.sfxVol;
    }
    track.play();
};
//#endregion

//#region persist
function tagPersist(str) {
    let persistVal = str.match(lookForPersist);
    if (persistVal[1] == "TRUE" || persistVal[1] == "FALSE") {
        persist = persistVal[1];
        console.log(persist);
    } else {
        console.warn("Persist warning: Did not recieve TRUE or FALSE, skipping.");
    };
}
//#endregion

//#region input
function tagInput(str) {
    document.getElementById("tag-input").value = "";

    inputVariable = str.match(lookForInput)[1];
    inputLength = str.match(lookForInput)[2];

    document.getElementById("tag-input").classList.remove("hidden");
    document.getElementById("tag-input").focus();
    document.getElementById("tag-input").maxLength = inputLength;

    document.getElementById("screen").style.cursor = "not-allowed";
    inInput = true;
}


function inputConfirm() {
    let newInput = document.getElementById("tag-input").value;
    if (newInput.length < 1) return;

    document.getElementById("tag-input").classList.add("hidden");

    
    document.getElementById("screen").style.cursor = "auto";
    inInput = false;

    GAMEVARS[inputVariable] = document.getElementById("tag-input").value;
    progressNext();
}
//#endregion

//#region transitions
function tagTransition(str, i) {
    document.getElementById("screen").style.cursor = "not-allowed";

    let transitionData = str[i];
    console.log(transitionData);

    let style = transitionData.match(lookForTrans)[1];
    let layer = transitionData.match(lookForTrans)[2];
    let speed = transitionData.match(lookForTrans)[3];

    isTransitioning = true;
    
    let sourceCanvas = document.getElementById(layer); // grab the original canvas...
    let targetElem = document.getElementById(layer + "Trans");
    let target = document.getElementById(layer + "Trans").getContext("2d");
    target.drawImage(sourceCanvas, 0, 0); // then draw it to a dummy canvas

    let ctx = document.getElementById(layer + "Trans").getContext("2d");

    // will get messy. clean up later
    if (style == "scatter") {
        eraseRandomPixels(100, ctx, speed);
    } else { // class animation
        transitionClass(targetElem, ctx, speed, style, layer)
    }
}

// yoinked from heartbreak
async function eraseRandomPixels(repeats, ctx, speed) {
    repeats = repeats - 1;

    for (i = 0; i < 1000; i++){
        ctx.clearRect(Math.random()*CONFIG.resolutionX-8, Math.random()*CONFIG.resolutionY-8,100-repeats,100-repeats);  
    }; 

    if (repeats >= 80) {
        setTimeout(() => {
            eraseRandomPixels(repeats, ctx, speed);
        }, speed);

    } else {
        ctx.clearRect(0,0,CONFIG.resolutionX,CONFIG.resolutionY);
        repeats = 100;
        isTransitioning = false;
        document.getElementById("screen").style.cursor = "auto";
    }
};

async function transitionClass(targetElem, ctx, speed, transClass) {
    targetElem.style.transitionDuration = speed + "ms";
    targetElem.style.animationDuration = speed + "ms";
    targetElem.classList.add(transClass);

    setTimeout(() => {
        ctx.clearRect(0,0,CONFIG.resolutionX,CONFIG.resolutionY);
        targetElem.classList.remove(transClass);
        isTransitioning = false;
        document.getElementById("screen").style.cursor = "auto";
    }, speed);
}
//#endregion

//#region autoprogression
function tagAutoprogression(str) {
    document.getElementById("screen").style.cursor = "not-allowed";
    
    autoprogressionOn = true;
    autoprogressionLeft = str.match(lookForAuto)[1];
    autoprogressionSpeed = str.match(lookForAuto)[2];

    autoprogressionInterval = setInterval(() => {
        autoprogressLoop();
    }, autoprogressionSpeed);
    
    if (autoplay) {
        //pause autoplay
        wasAutoplay = true;
        toggleAutoplay();
    }
}

function autoprogressLoop() {
    document.getElementById("screen").style.cursor = "not-allowed";
    progress();

    autoprogressionLeft--
    if (autoprogressionLeft == 0) {
        clearInterval(autoprogressionInterval);
        autoprogressionOn = false;
        document.getElementById("screen").style.cursor = "auto";

        if (wasAutoplay) {
            //resume autoplay
            wasAutoplay = false;
            toggleAutoplay();
        }
    }
}