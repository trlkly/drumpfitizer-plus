// ==UserScript==
// @name        Drumpfitizer Plus
// @namespace   trlkly
// @include     *
// @version     0.0.9
// @grant       none
// @run-at      document-start
// @updateURL   https://openuserjs.org/install/BigTSDMB/Drumpfitizer_Plus.user.js
// @downloadURL https://openuserjs.org/install/BigTSDMB/Drumpfitizer_Plus.user.js
// ==/UserScript==

function siteCheck() { //list of words in URL to hide until script is finished 
	var sites = [ 'fivethirtyeight', 'foxnews', 'talkingpointsmemo' ];
	return ( window.location.href.search(new RegExp(sites.join('|'),'i')) != -1 );
}

function checkWords() { //list of words in URL or title that hide page until script finished
	var words = ['republican', 'primary', 'election', 'rubio', 'cruz', 'clinton','sanders','bernie', 'hillary', 'democrat', 'president']
	var regex = new RegExp(words.join('|'),'i')
	return document.title.search(regex) != -1 || window.location.href.search(regex) != -1;
}

function textReplace(text) { //function that actually replaces words. Modified from Drumpfinator
	if (typeof text != 'undefined') {
		        //console.log (text)
//redundant	text = text.replace(/Trump\b/g, 'Drumpf');
//redundant	text = text.replace(/\bTRUMP\b/g, 'DRUMPF');
            text = text.replace(/\bTRUMP(S|ED|ed|ING|ing)?\b/g, 'DRUMPF$1');
			text = text.replace(/\bTrump(S|ed|ing)?\b/g, 'Drumpf$1');
//redundant	text = text.replace(/\bMake America Great Again\b/g, 'Make Donald Drumpf Again');
			text = text.replace(/\bMake America Great Again(!?)\b/g, 'Make Donald Drumpf Again$1');
/*new*/		text = text.replace(/\b#MakeAmericaGreatAgain\b/g, '#MakeDonaldDrumpfAgain');
/*new*/		text = text.replace(/Trump2016/gi, 'Drumpf2016');
			text = text.replace(/donald(j?)trump\b/g, 'donald$1drumpf');
//redundant	text = text.replace(/donaldtrump\b/g, 'donalddrumpf');
//redundant	text = text.replace(/\brealdonaldtrump\b/g, 'realdonalddrumpf');
			text = text.replace(/DonaldTrump/g, 'DonaldDrumpf');
/*new*/		text = text.replace(/\b(donald[ -]*)(j?[ -]*)trump/g, '$1$2drumpf');
			text = text.replace(/trump([ -]*)(tower)\b/gi, 'drumpf$1$2');
/*new*/		text = text.replace(/T-R-U-M-P/gi, 'd-r-u-m-p-f'); 
			return text;
	}
	return null;
}

function testSpellCheckOnFirefox (node) {
	if (typeof window.InstallTrigger != 'undefined') {
		return (!node.spellcheck)
	}
	return true;
}

function textNodeReplace(node) {   //faster node walker (for finding text to replace). 
	if (!node) node = document.body; 
	var walk = document.createTreeWalker(node,NodeFilter.SHOW_TEXT,null,false);
	while (walk.nextNode()) {
		var nodeType = walk.currentNode.parentNode.nodeName;
		if (nodeType != 'STYLE' && nodeType != 'LINK' && nodeType != 'SCRIPT' 
		  && nodeType != 'TEXTAREA' && !walk.currentNode.parentNode.isContentEditable
		  && testSpellCheckOnFirefox (walk.currentNode.parentNode)) { //DO NOT AFFECT TEXT BOXES!!!
			walk.currentNode.textContent = textReplace(walk.currentNode.nodeValue);
		}
	}

	if (style) { //unhides the page if it's been hidden
		style.parentNode.removeChild(style);
//		console.log(style.textContent)
		style = null;
	}
}

function hoverTextReplace(node) { //replaces text in tooltips. 
	if (!node) node = document.body;
	var walk = document.createTreeWalker(node,NodeFilter.SHOW_ELEMENT,null,false);
	while (walk.nextNode()) {
		if (walk.currentNode.getAttribute('title')) {
			walk.currentNode.setAttribute( 'title', textReplace(walk.currentNode.getAttribute('title')) );
		} 
		if (walk.currentNode.getAttribute('alt')) {
			walk.currentNode.setAttribute( 'alt', textReplace(walk.currentNode.getAttribute('alt')) );
		}
	}
}

function titleTextReplace() { //replaces text in title. Includes lowercase 'trump' 
	var oldTitle = document.title;
	if (window.location.href.search(/dictionary/i) == -1 //excudes dictionaries
	  && document.title.search(/dictionary/i) == -1 )  { 
		if (document.title) {
			document.title = document.title.replace(/trump/g, 'drumpf');
			document.title = textReplace(document.title); 
		} else if (typeof window.InstallTrigger != 'undefined') { //using Firefox;
			document.title = 'Connecting...\u200E';
		}
	} 
/*	console.log ((document.readyState == 'loading') +' '+ 
			(window.location.href.search(/trump/i) != -1) +' '+ (document.title != oldTitle)
			+' '+ siteCheck() +' '+ checkWords() + '');/**/
	if (!style && document.readyState == 'loading' && ( /*history.length == 1 
			||*/ window.location.href.search(/trump/i) != -1 || document.title != oldTitle
			|| siteCheck() || checkWords() ) ) {  //hides pages suspected to have "Trump" on them
		style = document.createElement('style'); 
		style.setAttribute('id', 'drumpf23434');
		style.textContent = '* { visibility: hidden !important; background-color: #FFF; }';
		document.head.appendChild(style);
//		console.log('before');
		var timer = new Date(); setTimeout(function fallback() { //fallback for iframe issues
			if (new Date() - timer < 5000 ) { 
				setTimeout(fallback, 5000 - (new Date()-timer)); 
				return; 
			}
			if (document.getElementById('drumpf23434')) {
				document.head.removeChild(document.getElementById('drumpf23434'));
			}
		}, 5000); /**/
//		console.log('after');
	}
}

function unblankTitle() { //if the title got blanked out because it wasn't ready
  if (document.title && document.title.search(/\u200E$/) != -1) {
		if (document.head.getElementsByTagName('title')[1]) {
			document.title = document.head.getElementsByTagName('title')[1].textContent;
			titleTextReplace();
		} else if (document.readyState != 'loading') { //no original title even after page loaded
			document.title = '';
		}
  }	
}

//Main script execution starts here

var style; //needed to hide pages if necessary.
titleTextReplace();
setTimeout(unblankTitle, 7); //if the title wasn't ready
setTimeout(unblankTitle, 50); 
setTimeout(unblankTitle, 100);
setTimeout(unblankTitle, 150);

window.addEventListener('DOMContentLoaded', main) //run the main script once DOM is loaded
if (document.readyState != 'loading') { main() } //run if DOM is already loaded.
window.addEventListener('load', main); //run again after page is completely loaded, just in case

function main() {
  unblankTitle();
	textNodeReplace(document.body);
	setTimeout(textNodeReplace, 1000);
	hoverTextReplace(document.body);
	setTimeout(hoverTextReplace, 1500);	
}

//old naive way--kept for historical reasons
//document.body.innerHTML = document.body.innerHTML.replace(/Trump|TRUMP/g, 'Drumpf');
