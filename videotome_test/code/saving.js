// backported/modified from heartbreak
//#region saving
function saveGame(slotNumber) {
    let saveSLOT = {};

	saveSLOT.storyArray = storyArray;

    saveSLOT.curChapter = curChapter;
    saveSLOT.current = current;
    saveSLOT.goto = goto;

    saveSLOT.textColour = textColour;
    saveSLOT.textFont = textFont;
    saveSLOT.textXpos = textXpos;
    saveSLOT.textYpos = textYpos;
    saveSLOT.textEndpos = textEndpos;
    saveSLOT.textSize = textSize;
    saveSLOT.textLineheight = textLineheight;

    saveSLOT.isAnimating = isAnimating;

    saveSLOT.GAMEVARS = GAMEVARS;

    saveSLOT.persist = persist;

    saveSLOT.silentStatus = silentStatus;
    saveSLOT.funcDelay = funcDelay;
    saveSLOT.delayedFunction = delayedFunction;

    saveSLOT.inInput = inInput;
    saveSLOT.inputVariable = inputVariable;
    saveSLOT.inputLength = inputLength;

    saveSLOT.autoprogressionOn = autoprogressionOn;
    saveSLOT.autoprogressionLeft = autoprogressionLeft;
    saveSLOT.autoprogressionSpeed = autoprogressionSpeed;

    // get history log
    saveSLOT.history = document.getElementById("messagelog").innerHTML;

    // save choices
	saveSLOT.choices = {};

    let choiceList = document.getElementsByClassName("choiceListLi");
    for (i = 0; i < choiceList.length; i++) {	
        saveSLOT.choices[i] = {};
        saveSLOT.choices[i].id = choiceList[i].id;
        saveSLOT.choices[i].content = choiceList[i].childNodes[0].innerHTML;
        saveSLOT.choices[i].destination = choiceList[i].attributes[1].value; // DON'T KNOW. AFWUL. EVIL
    }

    // check if current sounds are playing
    if (currentMUS) {
        if (!currentMUS.paused) {
            saveSLOT.currentMUS = currentMUS.getAttribute("id");
            saveSLOT.currentMUSTime = currentMUS.currentTime;
        }
    }

    if (currentSFX) {
        if (!currentSFX.paused) {
            saveSLOT.currentSFX = currentSFX.getAttribute("id");
            saveSLOT.currentSFXTime = currentSFX.currentTime;
        } 
    }

    // save canvases
	saveSLOT.canvases = {};
	let canvasList = document.getElementsByTagName("canvas");
	for (i = 0; i < canvasList.length; i++) {
		saveSLOT.canvases[i] = {};
		saveSLOT.canvases[i].canvasName = canvasList[i].id;
		saveSLOT.canvases[i].canvasContent = canvasList[i].toDataURL("image/png");
	}

    // videos
    // this was all so elegant and then
    saveSLOT.vidplayingOnFront1 = vidplayingOnFront1;
    saveSLOT.vidplayingOnFront2 = vidplayingOnFront2;
    saveSLOT.vidplayingOnBack = vidplayingOnBack;
    saveSLOT.vidBackName = vidBackName;
    saveSLOT.vidFront1Name = vidFront1Name;
    saveSLOT.vidFront2Name = vidFront2Name;

    saveSLOT.vidBackX = vidBackX;
    saveSLOT.vidBackY = vidBackY;
    saveSLOT.vidFrontX = vidFrontX;
    saveSLOT.vidFrontY = vidFrontY;
    saveSLOT.vidFront2X = vidFront2X;
    saveSLOT.vidFront2Y = vidFront2Y;

    // defaults can be changed at runtime, so this needs to be saved too
    saveSLOT.DEFAULT = DEFAULT;

    localStorage.setObject("save" + slotNumber, saveSLOT);
    console.log("saved to slot " + slotNumber);
    console.log(saveSLOT);

    if (slotNumber == "auto") {
        document.getElementById("save-slot-title-auto").innerHTML = "autosave";
        document.getElementById("save-slot-title-auto").classList.remove("no-save");

        document.getElementById("save-slot-load-auto").classList.remove("hidden");
        document.getElementById("save-slot-thumb-auto").style.backgroundImage = "url('" + findBackCanvas(saveSLOT) + "')";
        
        document.getElementById("save-slot-load-auto").addEventListener("click", (event) => {
            loadGame("auto");
        });
    } else {
        if (document.getElementById("save-slot-thumb-" + slotNumber)) { // not dummy slot, replace thumbnail
            document.getElementById("save-slot-thumb-" + slotNumber).style.backgroundImage = "url('" + findBackCanvas(saveSLOT) + "')";
        }
    }
}

//#region loading
function loadGame(slotNumber) {
    // stop the music
    if (currentMUS != null) currentMUS.pause();
    if (currentSFX != null) currentSFX.pause();

    // curtain 
    inLoadingScreen = true;
    toggleMenu(document.getElementById('save-menu'), document.getElementById('savebutton'));

    document.getElementById("saveload-screen").classList.add("loading");
    loadingDots = 1;

    let loadingAnim = setInterval(function() {
        let string = "Loading";
        for (let i = 0; i < loadingDots; i++) {
            string = string + ".";
        }
        
        document.getElementById("saveload-progress").innerHTML = string;
          
        loadingDots++;
        if (loadingDots > 3) loadingDots = 1;
    }, CONFIG.loadingAnimationSpeed);

    
    setTimeout(() => {
        clearInterval(loadingAnim);
        document.getElementById("saveload-screen").classList.remove("loading");
        inLoadingScreen = false;
    }, "3000");

    // disable autoplay no matter what
    clearTimeout(autoplayTimer);
    document.getElementById('autoplay').classList.remove('open-menu');
    autoplay = false;
    wasAutoplay = false;

    // --- ACTUAL LOADING BELOW THIS POINT
    // get save
    let saveSLOT = localStorage.getObject("save" + slotNumber);
    if (saveSLOT == null) return;
    console.log(saveSLOT);

    // load defaults
    DEFAULT = saveSLOT.DEFAULT;

    // clear out the current situation, reset everything to default
    setToDefault();
    stopVideo("back");
    stopVideo("front");
    stopVideo("front2");

    // set story position
	curChapter = saveSLOT.curChapter;
	chapterArray = chapters[curChapter];
	current = saveSLOT.current; 
    goto = saveSLOT.goto;

    // set text attributes
    textColour = saveSLOT.textColour;
    textFont = saveSLOT.textFont;
    textXpos = saveSLOT.textXpos;
    textYpos = saveSLOT.textYpos;
    textEndpos = saveSLOT.textEndpos;
    textSize = saveSLOT.textSize;
    textLineheight = saveSLOT.textLineheight;

    // other tags
    persist = saveSLOT.persist;
    silentStatus = saveSLOT.silentStatus;
    funcDelay = saveSLOT.funcDelay;
    delayedFunction = saveSLOT.delayedFunction;

    // input tag
    inInput = saveSLOT.inInput;
    inputVariable = saveSLOT.inputVariable;
    inputLength = saveSLOT.inputLength;

    if (inInput) {
        document.getElementById("tag-input").classList.remove("hidden");
        document.getElementById("tag-input").focus();
        document.getElementById("tag-input").maxLength = inputLength;
    }
    
    document.getElementById("tag-input").value = "";

    // play current mus and sfx
    setTimeout(() => {
        if(saveSLOT.currentMUS) {
            musicPlayer(saveSLOT.currentMUS);
            currentMUS.currentTime = saveSLOT.currentMUSTime;
        } 
        if(saveSLOT.currentSFX) {
            sfxPlayer(saveSLOT.currentSFX);
            currentSFX.currentTime = saveSLOT.currentSFXTime;
        } 
    }, "3000");

    // autoprogression
    autoprogressionOn = saveSLOT.autoprogressionOn;
    autoprogressionLeft = saveSLOT.autoprogressionLeft;
    autoprogressionSpeed = saveSLOT.autoprogressionSpeed;

    setTimeout(() => {
        if (autoprogressionOn == true) {
            autoprogressionInterval = setInterval(() => {
                autoprogressLoop();
            }, autoprogressionSpeed);
        }
    }, "3000");

    // run animation
    setTimeout(() => {
        if(saveSLOT.isAnimating == true) animateLayers();
    }, "3000");

    // set vars
    GAMEVARS = saveSLOT.GAMEVARS;

    // clear and replace canvases
    for (const [key, value] of Object.entries(saveSLOT.canvases)) {
        let targetCanvas = document.getElementById(value.canvasName);
        let targetCanvasCtx = targetCanvas.getContext("2d");
        let savedCanvasImage = new Image();
        savedCanvasImage.src = value.canvasContent;
        savedCanvasImage.onload = function () {
            targetCanvasCtx.clearRect(0, 0, CONFIG.resolutionX, CONFIG.resolutionY);
              targetCanvasCtx.drawImage(savedCanvasImage, 0, 0);
          }
    }

    // load choices
		if (saveSLOT.choices != {}) {
            let list = document.getElementById('choicelist');
            list.innerHTML = "";

			for (const [key, value] of Object.entries(saveSLOT.choices)) {
	    		let item = document.createElement("li");
	    		item.setAttribute('id', value.id);
	    		item.setAttribute('data-destination', value.destination);
	    		item.classList.add("choiceListLi");
                item.innerHTML = "<a href='#' class='choiceListItem'>"+value.content+"</a>";
                item.onclick = function() {
                    changeChapter(value.destination);
                    removeChoiceWindow();
                };
	    		list.appendChild(item);
                choicewindow.classList.remove('hidden');
    		}
		}
    
    // load video
    if (saveSLOT.vidplayingOnFront2 == true) {
        playVideo(saveSLOT.vidFront2Name, "front2", saveSLOT.vidFront2X, saveSLOT.vidFront2Y);
    }
    if (saveSLOT.vidplayingOnFront1 == true) {
        playVideo(saveSLOT.vidFront1Name, "front", saveSLOT.vidFrontX, saveSLOT.vidFrontY);
    }
    if (saveSLOT.vidplayingOnBack == true) {
        playVideo(saveSLOT.vidBackName, "back", saveSLOT.vidBackX, saveSLOT.vidBackY);
    }    

    // set history log
    document.getElementById("messagelog").innerHTML = saveSLOT.history;
}

//#region menu loading
function setSaveMenuSlots() {
    // autoplay
    let autosaveSLOT = localStorage.getObject("saveauto");
    if (autosaveSLOT) {
        document.getElementById("save-slot-load-auto").addEventListener("click", (event) => {
            loadGame("auto");
        });

        document.getElementById("save-slot-thumb-auto").style.backgroundImage = "url('" + findBackCanvas(autosaveSLOT) + "')";

    } else {
        document.getElementById("save-slot-title-auto").innerHTML = "no autosave";
        document.getElementById("save-slot-title-auto").classList.add("no-save");

        document.getElementById("save-slot-load-auto").classList.add("hidden");

        console.log("no autosave found");
    }

    // slots
    let saveSlots = {};
    let slotNumber = 0;

    while (true) { // PLAYING WITH FIRE BABY
        slotNumber++;
        let saveSLOT = localStorage.getObject("save" + slotNumber);
        if (saveSLOT) {
            console.log("save found: " + slotNumber);

            newSaveSlot(slotNumber, saveSLOT)

            saveSlots[slotNumber] = saveSLOT;
        } else {
            // no more slots
            // this assumes, from how the menu adds new save slots, that every  save name is numbered sequentially. if you manually save something outside of the menu i assume you know what you're doing

            dummySaveSlot(slotNumber);
            break;
        }
    }
}

function newSaveSlot(slotNumber, saveSLOT) {
    let container = document.getElementById("save-slot-container");

    // slot container
    let newslotDiv = document.createElement("div");
    newslotDiv.classList.add("save-slot");
    newslotDiv.id = "save-slot-" + slotNumber;

    // thumbanail
    let newThumbnail = document.createElement("div");
    newThumbnail.id = "save-slot-thumb-" + slotNumber;
    newThumbnail.style.backgroundImage = "url('" + findBackCanvas(saveSLOT); + "')";

    // title
    let newTitle = document.createElement("div");
    newTitle.innerHTML = "slot " + slotNumber;

    // save
    let newSave = document.createElement("div");
    newSave.id = "save-slot-save-" + slotNumber;
    newSave.innerHTML = "save";
                    
    newSave.addEventListener("click", (event) => {
        saveGame(slotNumber);
    });
                    
    // load
    let newLoad = document.createElement("div");
    newLoad.id = "save-slot-load-" + slotNumber;
    newLoad.innerHTML = "load";
                    
    newLoad.addEventListener("click", (event) => {
        loadGame(slotNumber);
    });
        
    // add slot
    container.appendChild(newslotDiv);
        
    // divider
    let spanDivider = document.createElement("span");
    spanDivider.innerHTML = " / "
        
    // add items to slots
    newslotDiv.appendChild(newThumbnail);
    newslotDiv.appendChild(newTitle);
    newslotDiv.appendChild(newSave);
    newslotDiv.appendChild(spanDivider);
    newslotDiv.appendChild(newLoad);
}

function dummySaveSlot(slotNumber) {
    let container = document.getElementById("save-slot-container");

    // slot container
    let newslotDiv = document.createElement("div");
    newslotDiv.classList.add("save-slot");
    newslotDiv.id = "save-slot-dummy";
                
    // thumbanail
    let newThumbnail = document.createElement("div");
                
    // title
    let newTitle = document.createElement("div");
    newTitle.innerHTML = "slot " + slotNumber;
                
    // save
    let newSave = document.createElement("div");
    newSave.id = "save-slot-save-" + slotNumber;
    newSave.innerHTML = "save";
                
    newSave.addEventListener("click", (event) => {
        saveGame(slotNumber);
        replaceSaveSlot(slotNumber);
    });
    
    // add slot
    container.appendChild(newslotDiv);
    
    
    // add items to slots
    newslotDiv.appendChild(newThumbnail);
    newslotDiv.appendChild(newTitle);
    newslotDiv.appendChild(newSave);
}

function replaceSaveSlot(slotNumber) {
    document.getElementById("save-slot-dummy").remove();
    newSaveSlot(slotNumber, localStorage.getObject("save" + slotNumber));
    dummySaveSlot(slotNumber + 1)
}

function findBackCanvas(saveSLOT) {
    // bah
    for (let i = 0; i < Object.keys(saveSLOT.canvases).length; i++) {
        if (saveSLOT.canvases[i].canvasName == "back") {
            return saveSLOT.canvases[i].canvasContent;
        }
    }
}