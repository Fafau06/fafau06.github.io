SUPER VIDEOTOME

(another) less micro narrative engine by freya campbell
additional code by stanwixbuster & bagenzo

version 1.1

    ~ABOUT~

Super Videotome is a small narrative engine for makine web based games. It features a layered canvas system to allow the user(s) to display text and image at arbitrary positions on the screen, layered on top of each other, and with the images animating between two frames. It also allows choices.

Super Videotome's internal resolution is 640x400, but will scale to fit the screen size on first opening. All images should be sized to match the internal resolution.

    ~FILE GUIDE~

code.js - this is the core engine for the game.
story.txt - this is where you will write your script. an example script is provided.
assets.js - set up your images and music here
stylesheet.css - edit the CSS here
index.html - this is the page that will update and display your game.
/images - stick your background images in here.
/music - stick your music and sound effects here
favicon.ico - replace this with your desired game icon
+fonts

    ~HOW TO USE~

Super Videotome is based around a simple scripting language that I designed to be able to write as fast as possible.
You can press spacebar or enter to progress text and display the next line, or else press a to enable autoplay (autoplay status is visible in the top right of the dialogue box).
Pressing L will bring up the message log to view past text.
Dialogue may persist on screen or be seen one line at a time.
Choices can be navigated using the top row of numbers. (for some reason this doesn't work right now?? its on my to fix list lmao sob)

story.txt contains the entire game, separated into blocks by ###.
The format of each block must be the following:

FirstLineIdentifier
text here
(as much text as you want)
###

Blocks can end with a GOTO, CHECK, or CHOICE as their final line before ###, which will redirect them to another block based on the FirstLineIdentifier.
If a block does not end with any of the above, the game will end and loop back to the beginning.

Each line of text can be plain text, or else can have any number of commands before the text to display.
Non-printed commands are separated from the text by " - ", being space hyphen space.
The following commands are available:

    C! - 
replace C with a letter or other identifier as set up in assets.js. This will then display the speaker's name & associated colour to the left of the dialogue, and wrap the dialogue in quotes . 
The example game has one set up: emily (E!), and Narrator as the fallback. Narrator will not display a speaker's name.
To set up extra characters, edit the identifier and name in assets.js, then add the appropriate css class to stylesheet.css. 

    CLEARSCREEN - 
This will totally clear the image layers and text layer. 

    CLEARLAYER:layername - 
This will clear the specified layer. Valid replacements for "layername" are front, front2, back, text. Note that if PERSIST is not set, the text layer will be automatically cleared on each new line.

    IMAGE:imagename:layername:x:y - 
This will display an image on a layer with the top left corner aligned with the x and y coordinates you specify.
"imagename" should equal one of the images set up in assets.js. 
"layername" should equal either front, front2, back, text.
images will not scale, so if you want a fullscreen image, then the x and y coordinates should be 0 and 0 and the image file dimensions should be 640x400.

    RECT:layername:[colour]:x:y:sizex:sizey - 
Draws a solid rectangle of the specified colour and size at the specified position.
"colour" will recognise either a hex colour (e.g. #690069) or a html colour word (red, green, white, etc).
"layername" should equal either front, front2, back, text.

    TEXT:[colour]:x:y:z - 
This will override the default text position and colour to display it at a position and colour you specify. It will be placed on the text layer, always* in front of any images.
"colour" will recognise either a hex colour (e.g. #690069) or a html colour word (red, green, white, etc).
x and y will place the start location of the MAIN text; if you also provide a character tag using the C! - command, it will place this to the left of your dialogue, so position accordingly.

(The Z digit will set the position that your text is meant to end, and attempt to compress it to match. This is pretty janky atm and doesn't work well wit hthe built in line breaking, so to be honest I recommend setting a high number and ignoring. I'll be addressing it in future.)

*if you have PERSIST active, then text may be overlaid by an image on a subsequent line of dialogue if that image is manually placed on the text layer. This is unlikely to be done by accident.

    PERSIST:value - 
Sets the text to either persist on screen ("TRUE") or be cleared with each new line ("FALSE").
If you are not manually specifying different text locations with each line using the TEXT command, then this will cause each new line to overlap the old one in a mess.

    ANIM:value - 
Starts or stops the canvas animating. Accepted values are "PLAY" or "STOP", with unrecognised values also functioning as STOP.
The animation itself simply alternates visibility of layers front and front2. To set up animation frames, you would have to draw to each layer using the IMAGE command, and then activate ANIM. Super Videotome currently only supports 2 frame animations. If you find the speed of the animation too fast or slow, look for the hardcoded "animtime" const in code.js and change it to a value that suits you.

(A further expansion on the animation system is planned)

    MUS_musicname - 
Starts or resumes a looping background music. Replace musicname with the reference you set up in assets.js.

    SFX_sfxname - 
Plays a one-shot sound effect. Replace sfxname with the reference you set up in assets.js. Note that entries prefixed MUS_ will play as background music and SFX_ will play as oneshots.

    CHOICE#:[text]:target - 
Displays a choice for each # in the top right, with "text" as the choice text and the FirstLineIdentifier of the block to go to as "target".
Choices are clickable or else can be accessed via associated top row number button.
Choices are *not* a blocker, and the story can continue without clicking them.
Pleaes note that the text field cannot contain a colon (:) for reasons.

    REMOVE:choicetext
Removes a choice from the choice menu.

    STATUS:[status text or html]] - 
Displays a persistent status block in the top right that will stay on screen until cleared.
The contents inside the [ ]] block can be either plain text, or else raw html. As such it is the only command to allow : in the text field, and to close with a double right square bracket.
As this field allows raw html, you can add images, iframes, whatever. play with at your own risk.

    CLEARSTATUS - 
Empties and hides the status box.

    SET:variable:value - 
Sets a user-definable variable to a value.

    CHECK:variable1:variable2:operator:outcome1:outcome2 - 
This one's a little more complex. Variable1 and Variable2 can be either strings/numbers, or else a reference to a user-defined variable set earlier in the script.
operator is the logical operator you want to check, picked from the below list:
gt : greater than
lt : less than
eq : equal to (used for checking strings)
gte : greater than or equal to
lte : less than or equal to
Outcome1 and Outcome2 are the first line identifiers of the chapter you wish to be redirected to.

    GOTO:target
Redirects the player to the Block whose FirstLineIdentifier equals target.

    FUNC:[javascript]
Utility command to execute any bespoke javascript code as written by the user. Use at own risk.


The following two "camera commands" have a dependency on prior commands being executed; the PAN and ZOOM commands require a secondary background layer to be drawn to first, the sourceback layer. This is created by default at 1560x1600 resolution, with the lower left corner of the initial 640x400 visible area being 0,0. Draw to this as you would with either the IMAGE or RECT commands, e.g. IMAGE:BG_STATIONWIDE:sourceback:0:0

These commands are a work in progress so should not be expected to be 100% robust. I'm trying :(

    PAN:back:[x value]:[y value]:time
Pans the back layer image in the direction(s) specified, where +X is moving the background to the right and +Y is moving the background up, over the time in millisecond specified. X and Y support negative numbers e.g. PAN:back:[-320]:[-200]:2000.

    ZOOM:back:[320]:[200]:5000
Zooms the back layer image, where X is affecting the horizontal zoom and Y the vertical zoom, over the time in milliseconds.
This command can be a bit counterintuitive; a positive number is zooming OUT, so based on a default underlying image size of 640x400, a zoom command of 640:400 would effectively zoom out 100% to quadruple the visible area. A zoom IN is therefore possible with negative numbers. Zooming to 0 or negative of total visible area will clamp at 1 pixel X and Y values as a minimum, so do your calculations based on this.

Camera command notes: 
Camera commands are currently hardcoded to affect the background only. Using a layername other than "back" is likely to have unforseen consequences. I'm working on supporting moving other layers but it needs a bit more thought. 
Camera commands will wipe the background layer every animation frame, as if the CLEARLAYER command was run. This is to allow transparent backgrounds to be movable; if you would prefer smear trails, you can probably find the section in code.js to disable.
Two PAN or two ZOOM commands in a row will cache and play the second after the first, if the first has not yet finished. A third command within the timeframe of the first command's duration may work but may have unforseen consequences including compound magnitude.
Simultaneous or hetero-queued PAN and ZOOM commands are not currently supported, though they are in the works; they will interrupt each other in unprecidtable ways or may cause premature completion of the opposite command.



You can chain commands together on one line like so:

IMAGE:FG_MIKU:front2:90:0 - non formatted text goes here

CLEARSCREEN IMAGE:FG_MIKU:front:10:20 MUS_musicname SFX_sfxname SET:variable:value CHOICE1:Yes:Block3 CHOICE2:No:Block4 CHOICE3:Idk:Block5 C! - Your line of dialogue spoken by C goes here

You must always include " - " as the final part of any command block, or else the commands will not be cleared from the printed text.
Also, if you are using a character speaking tag, this must be the final command.

    ~OFFLINE TESTING~

Due to CORS restrictions for browser based engines like this, to test play a videotome game offline you will need to run it on a server.
I find the easiest method is to launch a python server.

Right Shift + Right Click in your game directory
Open PowerShell window here
Type "python -m http.server 8000" and press enter
Open your web browser and navigate to "localhost:8000/"

Any other method of running a local server will also suffice, as will uploading builds to your hosting platform of choice (e.g. itch.io) and testing from there.


    ~RELEASING~

Make sure index.html is still called the same thing.
Zip up your whole game into a .zip file and upload to your game hosting provider of choice.
Alternatively you could copy the directory structure verbatim onto a bespoke website if you really wanted to.

   ~CREDITS~

Super Videotome is by Freya Campbell (twitter.com/spdrcstl, communistsister.itch.io). 

Super Videotome is released free of charge under a CC BY-NC-ND Licence:
Attribution-NonCommercial-ShareAlike

This license lets others remix, adapt, and build upon your work non-commercially, as long as they credit you and license their new creations under the identical terms. 

CRT screen effect based on code from http://aleclownes.com/2017/02/01/crt-display.html
New line sound contains a sample from https://freesound.org/people/EminYILDIRIM/sounds/536108/

Additionally, if you are a terf or tory, you may not use this engine in any way shape or form, and I instead request you go fuck yourself.

    ~CHANGELIST~

v0.1 - made the initial prototype version
v0.2 - jam edits
v0.3 - fixed chrome blurry text
v0.4 - fixed broken choice & remove tags
v0.5 - added pan and zoom commands, plus arbitrary js command (thanks jazz!)
v1.1 - selection of features from stanwixbuster's Videotome ADV Modded merged; code beautification; better screen scaling thanks to bagenzo