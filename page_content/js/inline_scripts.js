djConfig = {"baseRelativePath":"/eprocure/app?service=asset&path=%2Fgep%2F","preventBackButtonFix":false,"parseWidgets":false} 


dojo.registerModulePath("tapestry", "/eprocure/app?service=asset&path=%2Ftapestry%2F");



dojo.require("tapestry.namespace");
tapestry.requestEncoding='UTF-8';



<!--
	function MM_swapImgRestore() { //v3.0
	  var i,x,a=document.MM_sr; for(i=0;a&&i<a.length&&(x=a[i])&&x.oSrc;i++) x.src=x.oSrc;
	}
	
	function MM_preloadImages() { //v3.0
	  var d=document; if(d.images){ if(!d.MM_p) d.MM_p=new Array();
	    var i,j=d.MM_p.length,a=MM_preloadImages.arguments; for(i=0; i<a.length; i++)
	    if (a[i].indexOf("#")!=0){ d.MM_p[j]=new Image; d.MM_p[j++].src=a[i];}}
	}
	
	function MM_findObj(n, d) { //v4.01
	  var p,i,x;  if(!d) d=document; if((p=n.indexOf("?"))>0&&parent.frames.length) {
	    d=parent.frames[n.substring(p+1)].document; n=n.substring(0,p);}
	  if(!(x=d[n])&&d.all) x=d.all[n]; for (i=0;!x&&i<d.forms.length;i++) x=d.forms[i][n];
	  for(i=0;!x&&d.layers&&i<d.layers.length;i++) x=MM_findObj(n,d.layers[i].document);
	  if(!x && d.getElementById) x=d.getElementById(n); return x;
	}
	
	function MM_swapImage() { //v3.0
	  var i,j=0,x,a=MM_swapImage.arguments; document.MM_sr=new Array; for(i=0;i<(a.length-2);i+=3)
	   if ((x=MM_findObj(a[i]))!=null){document.MM_sr[j++]=x; if(!x.oSrc) x.oSrc=x.src; x.src=a[i+2];}
	}
//-->




	if(navigator.appName == 'Microsoft Internet Explorer')
	{
	document.onkeydown = fnCheckKeysMIE;
	}
	else if(navigator.appName == 'Netscape')
	{
	document.onkeydown = fnCheckKeysNMF;
	}
	
	function fnCheckKeysNMF(event)
	{
	
	var e=event? event : window.event;
	var event_element=e.target? e.target : e.srcElement;
	
	if (event.ctrlKey && (event.keyCode==78 || event.keyCode==84 || event.which==78 || event.which==84))
	{
	return false;
	}
	
	if (event.altKey && (event.keyCode==37 || event.which==37))
	{
	return false;
	}
	
	if (event.keyCode==8 && (event_element.tagName != 'INPUT' && event_element.tagName != 'TEXTAREA'))
	{
	return false;
	}
	
	}
	
	function fnCheckKeysMIE()
	{
	
	var e=event? event : window.event;
	var event_element=e.target? e.target : e.srcElement;
	
	if (event.ctrlKey && (event.keyCode==78 || event.keyCode==84 || event.which==78 || event.which==84))
	{
	return false;
	}
	
	if (event.altKey && (event.keyCode==37 || event.which==37))
	{
	return false;
	}
	
	if (event.keyCode==8 && (event_element.tagName != 'INPUT' && event_element.tagName != 'TEXTAREA'))
	{
	return false;
	}
	
	}

	window.history.forward();
	function noBack(){ window.history.forward(); }
	
	



	// Script to view document in popup
	function popup(mylink, windowname)
	{
		if (! window.focus)return true;
		var href;
		if (typeof(mylink) == 'string')
	 		href=mylink;
		else
			href=mylink.href;
			window.open(href, "Popup", 'location=no, scrollbars=yes, toolbar=no, width=700, height=550, directories=no, menubar=no, resizable=yes, status=no, titlebar=yes');
			return false;   
	}




	var delayTime=500;
	var marqueeSpeed=1;
	var pauseTime=1 ;
	var copySpeed=marqueeSpeed;
	var pauseSpeed=(pauseTime==0)? copySpeed: 0;
	var actualHeight='';

	function ScrollMarquee()
	{
		if (parseInt(crossMarquee.style.top)>(actualHeight*(-1)+8)) 
			crossMarquee.style.top=parseInt(crossMarquee.style.top)-copySpeed+"px" ;
		else 
			crossMarquee.style.top=parseInt(marqueeheight)+8+"px";
	}

	function InitializeMarquee()
	{
		crossMarquee=document.getElementById("vmarquee");
		crossMarquee.style.top=0;
		marqueeheight=document.getElementById("marqueecontainer").offsetHeight;
		actualHeight=crossMarquee.offsetHeight;
		if (window.opera || navigator.userAgent.indexOf("Netscape/7")!=-1)
		{ 
			crossMarquee.style.height=marqueeheight+"px";
			crossMarquee.style.overflow="scroll";
			return;
		}
		setTimeout('lefttime=setInterval("ScrollMarquee()",30)', delayTime);
	}

	if (window.addEventListener)
		window.addEventListener("load", InitializeMarquee, false);
	else if (window.attachEvent)
		window.attachEvent("onload", InitializeMarquee);
	else if (document.getElementById)
		window.onload=InitializeMarquee;


	// Corrigendum
	var delayTime1=500;
	var marqueeSpeed1=1;
	var pauseTime1=1 ;
	var copySpeed1=marqueeSpeed1;
	var pauseSpeed1=(pauseTime1==0)? copySpeed1: 0;
	var actualHeight1='';

	function ScrollMarquee1()
	{
		if (parseInt(crossMarquee1.style.top)>(actualHeight1*(-1)+8)) 
		crossMarquee1.style.top=parseInt(crossMarquee1.style.top)-copySpeed1+"px" ;
		else 
		crossMarquee1.style.top=parseInt(marqueeheight1)+8+"px";
	}

	function InitializeMarquee1()
	{
		crossMarquee1=document.getElementById("vmarquee1");
		crossMarquee1.style.top=0;
		marqueeheight1=document.getElementById("marqueecontainer1").offsetHeight;
		actualHeight1=crossMarquee1.offsetHeight ;
		if (window.opera || navigator.userAgent.indexOf("Netscape/7")!=-1)
		{ 
			crossMarquee1.style.height=marqueeheight1+"px";
			crossMarquee1.style.overflow="scroll";
			return;
		}
		setTimeout('lefttime=setInterval("ScrollMarquee1()",30)', delayTime1);
	}

	if (window.addEventListener)
	window.addEventListener("load", InitializeMarquee1, false);
	else if (window.attachEvent)
	window.attachEvent("onload", InitializeMarquee1);
	else if (document.getElementById)
	window.onload=InitializeMarquee1;
	
	// Corrigendum
	var delayTime2=500;
	var marqueeSpeed2=1;
	var pauseTime2=1 ;
	var copySpeed2=marqueeSpeed2;
	var pauseSpeed2=(pauseTime2==0)? copySpeed2: 0;
	var actualHeight2='';

	function ScrollMarquee2()
	{
		if (parseInt(crossMarquee2.style.top)>(actualHeight2*(-1)+8)) 
		crossMarquee2.style.top=parseInt(crossMarquee2.style.top)-copySpeed2+"px" ;
		else 
		crossMarquee2.style.top=parseInt(marqueeheight2)+8+"px";
	}
	
	
	function InitializeMarquee2()
	{
		crossMarquee2=document.getElementById("vmarquee2");
		crossMarquee2.style.top=0;
		marqueeheight2=document.getElementById("marqueecontainer2").offsetHeight;
		actualHeight2=crossMarquee2.offsetHeight ;
		if (window.opera || navigator.userAgent.indexOf("Netscape/7")!=-1)
		{ 
			crossMarquee2.style.height=marqueeheight2+"px";
			crossMarquee2.style.overflow="scroll";
			return;
		}
		setTimeout('lefttime=setInterval("ScrollMarquee2()",30)', delayTime2);
	}

	if (window.addEventListener)
	window.addEventListener("load", InitializeMarquee2, false);
	else if (window.attachEvent)
	window.attachEvent("onload", InitializeMarquee2);
	else if (document.getElementById)
	window.onload=InitializeMarquee2;
	
	// Corrigendum
	var delayTime3=500;
	var marqueeSpeed3=1;
	var pauseTime3=1 ;
	var copySpeed3=marqueeSpeed3;
	var pauseSpeed3=(pauseTime3==0)? copySpeed3: 0;
	var actualHeight3='';

	function ScrollMarquee3()
	{
		if (parseInt(crossMarquee3.style.top)>(actualHeight3*(-1)+8)) 
		crossMarquee3.style.top=parseInt(crossMarquee3.style.top)-copySpeed3+"px" ;
		else 
		crossMarquee3.style.top=parseInt(marqueeheight3)+8+"px";
	}
	
	
	function InitializeMarquee3()
	{
		crossMarquee3=document.getElementById("vmarquee3");
		crossMarquee3.style.top=0;
		marqueeheight3=document.getElementById("marqueecontainer3").offsetHeight;
		actualHeight3=crossMarquee3.offsetHeight ;
		if (window.opera || navigator.userAgent.indexOf("Netscape/7")!=-1)
		{ 
			crossMarquee3.style.height=marqueeheight3+"px";
			crossMarquee3.style.overflow="scroll";
			return;
		}
		setTimeout('lefttime=setInterval("ScrollMarquee3()",30)', delayTime3);
	}

	if (window.addEventListener)
	window.addEventListener("load", InitializeMarquee3, false);
	else if (window.attachEvent)
	window.attachEvent("onload", InitializeMarquee3);
	else if (document.getElementById)
	window.onload=InitializeMarquee3;
		
	function hideProgress(){
		// Hide the progress bar
		hideDialog();
	}
	
	function showProgress(){
		showDialog('Important Message', 
				"Our application has been updated to support modern web standards. For the best experience, please use the latest version of Chrome, Firefox or Edge. Support for Internet Explorer and legacy browser modes has been discontinued. If you're using an outdated browser, please switch to a supported browser to continue using all features of this application. For more information, kindly visit the site compatibility page", 
				'alertclose');
	}
	//showProgress();
	
	document.addEventListener('click', function(event) {
	  const popup = document.getElementById('dialog');	  
	  // Check if the click was outside the popup
	  if (!popup.contains(event.target)) {
	    //popup.style.display = 'none'; // or any method to close the popup
	    hideProgress();
	  }
	});
	
	
	


 
       $(document).ready(function() {
            loadnicci('ContentNicci', 'vDOWF0A7F0DUpjzp');
        });
    


    if (window.jQuery) {
        jQuery.fn.jquery = ""; // hide real version
    }



    var _userSessionKey = $('#ctl01_hdnUserSession').val();
    var _rootPath = 'https://niccicms.raj.nic.in/nicci/';
    var _helplineMsg = "Please contact  Central Public Procurement Portal Helpline Number : 0120 4001002 or 0120 4001005 or 0120 4200462 Or Email : support-eproc[at]nic[dot]in";
    var _hhelplineMsg = "कृपया Central Public Procurement Portal पोर्टल हेल्पलाइन नंबर 0120 4001002 or 0120 4001005 or 0120 4200462 या हेल्पलाइन ईमेल support-eproc[at]nic[dot]in पर संपर्क करे";
    var _portalName = "Central Public Procurement Portal";
    var _financialYear = '2026-2027';
    var _regx = '';
    var _regx_api = '';
    var _regx_with_pfix = '';
    var _formatText = '';
    var _searchType = '0';
    var _greetMsg = 'Namaskaar';
    var _greetMsgH = 'नमस्कार';
    var _isBiLang = 'False';
    var _ishelpdesk = 'False';
    var _isTagSuggestionOn = 'False';
    var _searchSuggestion = '';
    var _searchSuggestionH = '';
    var _otherLang = '';
    var _transApiUrl = 'https://niccicms.raj.nic.in/niccipy/';
    var _jsonAttachLanguages = '';
    var _isUseDB = true;
    var _localTranslationList = '[{"langCode":"hi","langName":"Hindi"},{"langCode":"pa","langName":"Punjabi"},{"langCode":"ta","langName":"Tamil"},{"langCode":"ml","langName":"Malayalam"}]';
    var _uniqueclientID = '2dce197d-573b-495f-9b24-ca4461c648c5';



    $("#Niccislideshow > div:gt(0)").hide();
    var bannerCount = 0;
    function slidePrev() { clearInterval(abcd); $("#Niccislideshow > div:first").fadeIn(500).prev().fadeOut(500).end().appendTo("#Niccislideshow"); }
    var abcd = setInterval(function () { slideNext(0); }, 4000);
    $('#Niccislideshow').each(function () {
        bannerCount = ($('div', this).length);
        if (bannerCount == 1) {
            clearInterval(abcd);
            $(".zoom").on({
                'mouseout': function () { clearInterval(abcd); console.log("mouseout"); }
            });
            $(this).css('margin-bottom', '15px');
        }
    });
    function slideNext(flag) { if (flag == 1) { clearInterval(abcd); } $("#Niccislideshow > div:first").fadeOut(500).next().fadeIn(500).end().appendTo("#Niccislideshow"); }

    function saveChat() {
        var filename = 'Nicci_Convstn.txt';
        var mimeType = 'text';
        var islang_Hindi = false;
        if ($('#ctl01_chkLang').length > 0)
            islang_Hindi = $('#ctl01_chkLang').prop('checked');
        var elHtmlobj = $('#message-board').clone(true);
        var headerContent = '<head><title>NICCIChat_' + Date.now().toString() + '</title></head><div style="display:flex;justify-content: flex-end;"><div style="width:33%;text-align:right;"><img alt="" src="' + _rootPath + 'images/mili.png" style="width: 50px; border-radius: 25px; "></div><div style="width:34%;text-align:center;"><h3>NIC Chat Inteligence (NICCI)</h3></div><div style="text-align:right;width:33%;"><h5>Date: ' + formatAMPM() + '</h5></div></div>';
        $(elHtmlobj).find(".post-bot").each(function (index) {
            $(this).parent().css('justify-content', '');
            ($(this).html("<b> " + (islang_Hindi ? "निक्की: " : "NICCI: ") + " </b>" + $(this).html()));
        });
        $(elHtmlobj).find("img").each(function (index) { $(this).remove(); });
        $(elHtmlobj).find(".post-user").each(function (index) { ($(this).html("<b> " + (islang_Hindi ? "यूजर: " : "USER: ") + " </b>" + $(this).html())); });
        $(elHtmlobj).find(".timestamp").each(function (index) { $(this).html('\r\n'); });
        $(elHtmlobj).find(".tags").each(function (index) { $(this).html(islang_Hindi ? "<b> निक्की: </b> सुझाव उपलब्ध हुये \r\n" : "<b> NICCI: </b> Suggestion List Provided.\r\n"); });
        elHtml = $(elHtmlobj).html();

        var footerContent = '<div style="display:flex;justify-content: flex-end;bottom:0px !important;    position: fixed;width:100%;"><div style="text-align:center;width:25%;"></div><div style="text-align:center;width:50%;"><h3>Software Courtesy National Informatics Centre (NIC), Rajasthan</h3></div><div style="text-align:right;width:25%;"></div></div>';

        var divContents = headerContent + elHtml + footerContent;
        var printWindow = window.open('', '', 'height=800,width=600');
        printWindow.document.title = "";
        printWindow.document.write(divContents);
        printWindow.document.close();
        printWindow.print();
        printWindow.window.close();
    }
    function formatAMPM() {
        var d = new Date(),
            minutes = d.getMinutes().toString().length == 1 ? '0' + d.getMinutes() : d.getMinutes(),
            hours = d.getHours().toString().length == 1 ? '0' + d.getHours() : d.getHours(),
            ampm = d.getHours() >= 12 ? 'PM' : 'AM',
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[d.getDay()] + ' ' + months[d.getMonth()] + ' ' + d.getDate() + ' ' + d.getFullYear() + ' ' + hours + ':' + minutes + ' ' + ampm;
    }


    bindDropdown = function (jsonData) {
        var data = JSON.parse(jsonData);
        

    }



//<![CDATA[
bindDropdown('[{"langCode":"en","langName":"English","isUseDB":true,"islocTransEnable":false},{"langCode":"hi","langName":"Hindi","isUseDB":false,"islocTransEnable":true},{"langCode":"pa","langName":"Punjabi","isUseDB":false,"islocTransEnable":true},{"langCode":"ta","langName":"Tamil","isUseDB":false,"islocTransEnable":true},{"langCode":"ml","langName":"Malayalam","isUseDB":false,"islocTransEnable":true}]')//]]>



    var _bgcolor = '#eeb049';
    $('#niccidiv .post-bot').css('background', _bgcolor);
    var _btncolor = '#ff9800';
    $('#niccidiv #start-chat').css('background', _btncolor);
    var _cbRespBackColor = '#eeb049';
    $('#niccidiv #message-board .post-bot').css('background', _cbRespBackColor);
    function deviceCheck() {
        if (navigator.userAgent.match(/Android/i)
            || navigator.userAgent.match(/webOS/i)
            || navigator.userAgent.match(/iPhone/i)
            || navigator.userAgent.match(/iPad/i)
            || navigator.userAgent.match(/iPod/i)
            || navigator.userAgent.match(/BlackBerry/i)
            || navigator.userAgent.match(/Windows Phone/i)) {
            var x = document.querySelectorAll(".toggleicon");
            x[0].style.setProperty("display", "none", "important");
            var x = document.querySelectorAll(".mtoggleicon");
            x[0].style.setProperty("display", "none", "important");
            var x = document.querySelectorAll(".dragme");
            x[0].style.setProperty("display", "none", "important");
        }
    }
    deviceCheck();
    //loadJsonData();


 
		document.getElementById("login").style.display='block';
		var all = document.getElementsByClassName("Clickhere");
		for (var i = 0; i < all.length; i++) {
			all[i].style.display = 'block';
	    } 
    

<!--
tapestry.addOnLoad(function(e) {
dojo.require("tapestry.form");tapestry.form.registerForm("WebRightMenu_0");

tapestry.form.registerForm("tenderSearch");

tapestry.form.focusField('SearchDescription');});
// -->