function save() {

	let saveGame = {};
	saveGame.GAMEVARS = GAMEVARS;
	saveGame.curChapter = curChapter;
	saveGame.currentPosition = current; // should really rename current to be a clearer var name
	saveGame.status = document.getElementById('statuswindow').innerHTML;
	saveGame.choiceStatus = choiceStatus;
	saveGame.choices = {};
	
	saveGame.canvasText = canvas1.toDataURL();
	saveGame.canvasFront = canvas2.toDataURL();
	saveGame.canvasFront2 = canvas2b.toDataURL();
	saveGame.canvasBack = canvas3.toDataURL();

	if (currentMUS != null) {
		saveGame.MUS = currentMUS;
	} else {
		saveGame.MUS = null;
	}
	if (saveGame.choiceStatus == true) {
		let choiceList = document.getElementsByClassName("choiceListLi");
		for (i = 0; i < choiceList.length; i++) {
			console.log(choiceList[i]);
			saveGame.choices[i] = {};
			saveGame.choices[i].id = choiceList[i].id;
			saveGame.choices[i].content = choiceList[i].innerHTML;
			saveGame.choices[i].destination = choiceList[i].dataset.destination;
			console.log(saveGame.choices[i].destination);
		}
	}
	let saveName = "VTSupersave" + CONFIG.Name;
	if (localStorage.getItem(saveName) === null) {
  		localStorage.setItem(saveName, JSON.stringify(saveGame));
	} else {
		if (confirm("Overwrite save?") == true) {
  			localStorage.setItem(saveName, JSON.stringify(saveGame));
		} else {
  			// idk something
  		}
  	}

  	console.log(saveGame);
};

function load() {

	/// hrrrrngh look. it works

	console.log("loadin");

	let saveName = "VTSupersave" + CONFIG.Name;
	if (localStorage.getItem(saveName) === null ) {
		alert("No save game found </3");
		return;
	} else {
		let saveGame = JSON.parse(localStorage.getItem(saveName));
		console.log(saveGame);

		Object.assign(GAMEVARS, saveGame.GAMEVARS);

		curChapter = saveGame.curChapter;
		chapterArray = chapters[curChapter];
		current = saveGame.currentPosition; // should really rename current to be a clearer var name

		if (saveGame.status != null && saveGame.status != "") {
			document.getElementById('statuswindow').innerHTML = saveGame.status;
			document.getElementById('statuswindow').classList.remove('hidden');
		} else {
			document.getElementById('statuswindow').innerHTML = null;
			document.getElementById('statuswindow').classList.add('hidden');
		}

		movecancel = true;

		ctx1.clearRect(0, 0, 640, 400);
		ctx2.clearRect(0, 0, 640, 400);
		ctx2b.clearRect(0, 0, 640, 400);
		ctx3.clearRect(0, 0, 640, 400);

		drawSavedImageToCanvas(saveGame.canvasText, ctx1);
		drawSavedImageToCanvas(saveGame.canvasFront, ctx2);
		drawSavedImageToCanvas(saveGame.canvasFront2, ctx2b);
		drawSavedImageToCanvas(saveGame.canvasBack, ctx3);

		if (saveGame.MUS != null) musicPlayer(saveGame.MUS);
		
		if (choiceStatus == true) {
			choicewindow.classList.add('hidden');
			let list = document.getElementById('choicelist');
    		while (list.firstChild) {
            	list.removeChild(list.firstChild);
        	}
		}
		if (saveGame.choiceStatus == true) {
			choiceStatus = true;
			choicewindow.classList.remove('hidden');
			for (const [key, value] of Object.entries(saveGame.choices)) {
				let list = document.getElementById('choicelist');
	    		let item = document.createElement("li");
	    		item.setAttribute('id', value.id);
	    		item.setAttribute('data-destination', value.destination);
	    		item.classList.add("choiceListItem");
	    		item.innerHTML = value.content;
	    		let target = value.destination;
	    		item.onclick = function() {changeChapter(target); choiceStatus = false};
	    		list.appendChild(item);
    		}
		}
	}
};

function drawSavedImageToCanvas(data, context) {
    var img = new window.Image();
    img.addEventListener("load", function () {
        context.drawImage(img, 0, 0);
    });
    img.setAttribute("src", data);
};