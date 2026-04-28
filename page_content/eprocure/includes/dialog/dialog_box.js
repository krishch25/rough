// global variables //
var TIMER = 5;
var SPEED = 10;
var WRAPPER = 'content';

// calculate the current window width //
function pageWidth() {
  return window.innerWidth != null ? window.innerWidth : document.documentElement && document.documentElement.clientWidth ? document.documentElement.clientWidth : document.body != null ? document.body.clientWidth : null;
}

// calculate the current window height //
function pageHeight() {
  return window.innerHeight != null? window.innerHeight : document.documentElement && document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body != null? document.body.clientHeight : null;
}

// calculate the current window vertical offset //
function topPosition() {
  return typeof window.pageYOffset != 'undefined' ? window.pageYOffset : document.documentElement && document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop ? document.body.scrollTop : 0;
}

// calculate the position starting at the left of the window //
function leftPosition() {
  return typeof window.pageXOffset != 'undefined' ? window.pageXOffset : document.documentElement && document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft ? document.body.scrollLeft : 0;
}

// build/show the dialog box, populate the data and call the fadeDialog function //
function showDialog(title,message,type,autohide) {
	if(!type) {
	type = 'error';
	}
	var dialog;
	var dialogheader;
	var dialogclose;
	var dialogtitle;
	var dialogcontent;
	var dialogmask;
	var domainUrl;
	if(!document.getElementById('dialog')) {
	dialog = document.createElement('div');
	dialog.id = 'dialog';
	dialogheader = document.createElement('div');
	dialogheader.id = 'dialog-header';
	dialogtitle = document.createElement('div');
	dialogtitle.id = 'dialog-title';
	dialogclose = document.createElement('div');
	dialogclose.id = 'dialog-close'
	dialogcontent = document.createElement('div');
	dialogcontent.id = 'dialog-content';
	dialogmask = document.createElement('div');
	dialogmask.id = 'dialog-mask';
	document.body.appendChild(dialogmask);
	document.body.appendChild(dialog);
	dialog.appendChild(dialogheader);
	dialogheader.appendChild(dialogtitle);
	dialogheader.appendChild(dialogclose);
	dialog.appendChild(dialogcontent);;
	dialogclose.setAttribute('onclick','hideDialog()');
	dialogclose.title = 'Close';
	dialogclose.onclick = hideDialog;
	} else {
	dialog = document.getElementById('dialog');
	dialogheader = document.getElementById('dialog-header');
	dialogtitle = document.getElementById('dialog-title');
	dialogclose = document.getElementById('dialog-close');
	dialogcontent = document.getElementById('dialog-content');
	dialogmask = document.getElementById('dialog-mask');
	dialogmask.style.visibility = "visible";
	dialog.style.visibility = "visible";
	}
	dialog.style.opacity = .00;
	dialog.style.filter = 'alpha(opacity=0)';
	dialog.alpha = 0;
	var width = pageWidth();
	var height = pageHeight();
	var left = leftPosition();
	var top = topPosition();
	var dialogwidth = dialog.offsetWidth;
	var dialogheight = dialog.offsetHeight;
	var topposition = top + (height / 3) - (dialogheight / 2);
	var leftposition = left + (width / 2) - (dialogwidth / 2);
	dialog.style.top = (topposition + 100) + "px";
	dialog.style.left = (leftposition + 90) + "px";
	dialog.style.borderWidth=1;
	dialogheader.className = type + "header";
	dialogtitle.innerHTML = title;
	dialogcontent.className = type;
	dialogcontent.innerHTML = message;
	dialogheader.style.width = dialogcontent.offsetWidth; // setting the header width as same as content width
	//dialogheader.style.width = "466px"; // setting the header width as same as content width

	// Confirm box
	if(type == "prompt"){
		dialog.style.top= topposition + "px";
		dialog.style.left= leftposition + "px";
	}

	var content = document.getElementById(WRAPPER);
	if(top>0 && content!==null){
		dialogmask.style.height = (content.offsetHeight+100) + 'px';		
	} else if(content!==null) {
		dialogmask.style.height = content.offsetHeight + 'px';
	}	
	
	dialog.timer = setInterval("fadeDialog(1)", TIMER);
	if(autohide) {
		dialogclose.style.visibility = "hidden";
		window.setTimeout("hideDialog()", (autohide * 1000));
	} else {
		dialogclose.style.visibility = "visible";
	}

	if(type == 'progress'){
		dialogcontent.style.paddingLeft = "55px";
		dialogcontent.style.height="80px";
		dialogcontent.style.width = "368px";
		dialogclose.style.visibility = "hidden";
	}
	else if(type == 'alert'){
		dialogcontent.style.paddingLeft = "55px";
		dialogcontent.style.height="68px";
		dialogcontent.style.width = "368px";
		dialogclose.style.visibility = "hidden";
	
		// link 
		var divSpace = document.createElement('div');
		var link = document.createElement("a");
		domainUrl = document.getElementById('domainUrl').value;
	    domainUrl = domainUrl.replace("S","");
         
		link.setAttribute("href", domainUrl+"?service=restart");
		link.appendChild(document.createTextNode('Cancel'));
		link.className = 'linkblack';
		
		// setting the alignment
		divSpace.setAttribute('align', 'right');
		divSpace.appendChild(link);

		dialogcontent.appendChild(divSpace);
	}
	else if(type == 'alertclose'){
		
		dialogheader.id = 'dialog-headerclose';
		dialogcontent.id = 'dialog-contentclose';
		dialog.style.left = (leftposition - 80) + "px";		
		dialog.style.width = "640px";
		dialogheader.style.width = "633px";
		
		dialogcontent.style.paddingLeft = "15px";
		dialogcontent.style.height="112px";
		dialogcontent.style.width = "620px";
		dialogclose.style.visibility = "hidden";
	
		// link 
		var divSpace = document.createElement('div');
			
		var button = document.createElement("button");
		button.setAttribute("onclick", "hideDialog()");
		button.appendChild(document.createTextNode('Close'));
		button.className = 'alertbutclose';
		//button.style.color = 'red';
		//button.style.backgroundColor = '#E39872';
		
		// setting the alignment
		divSpace.setAttribute('align', 'center');
		divSpace.appendChild(button);

		dialogcontent.appendChild(divSpace);
	}
	
	
}

// hide the dialog box //
function hideDialog() {
  var dialog = document.getElementById('dialog');
  clearInterval(dialog.timer);
  dialog.timer = setInterval("fadeDialog(0)", TIMER);
}

// fade-in the dialog box //
function fadeDialog(flag) {
  if(flag == null) {
    flag = 1;
  }
  var dialog = document.getElementById('dialog');
  var value;
  if(flag == 1) {
    value = dialog.alpha + SPEED;
  } else {
    value = dialog.alpha - SPEED;
  }
  dialog.alpha = value;
  dialog.style.opacity = (value / 100);
  dialog.style.filter = 'alpha(opacity=' + value + ')';
  if(value >= 99) {
    clearInterval(dialog.timer);
    dialog.timer = null;
  } else if(value <= 1) {
    dialog.style.visibility = "hidden";
    document.getElementById('dialog-mask').style.visibility = "hidden";
    clearInterval(dialog.timer);
  }
}