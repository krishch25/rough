/*****************************************************************
* Application	: NIC - GeP
* Time			: 13-08-07
*****************************************************************
* Desc			It contains the all general functions required for
				the data validations in the UI.
******************************************************************/



/**
* @method	isEmpty
*
* It checks the given value is empty or not
* @param string value
*
*/
function isEmpty(s){
	return (s == "" || s.length == 0);
}


/**
* @method	isEmail
*
* It checks the given value possess the email address heuristics
* @param string value
*
*/
function isEmail(sVal){
	// if the value is empty
	if(isEmpty(sVal))
		return false;

	// Pattern for email heuristics
	var sPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/;
//	var sPattern = /^[a-zA-Z][\w\.-]*[a-zA-Z0-9]@[a-zA-Z0-9][\w\.-]*[a-zA-Z0-9]\.[a-zA-Z][a-zA-Z\.]*[a-zA-Z]$/;

	// Tests the value against the pattern
	if(sPattern.test(sVal)){
		return true; // valid email
	}

	return false; // in-valid email.
}

function isSameDigitMobileNo(sVal){
	// if the value is empty
	if(isEmpty(sVal))
		return false;

	// Pattern for email heuristics
	var sPattern = /(\d)\1{9}/;
//	var sPattern = /^[a-zA-Z][\w\.-]*[a-zA-Z0-9]@[a-zA-Z0-9][\w\.-]*[a-zA-Z0-9]\.[a-zA-Z][a-zA-Z\.]*[a-zA-Z]$/;

	// Tests the value against the pattern
	if(sPattern.test(sVal)){
		return true; // in-valid email
	}

	return false; // valid email.
}


/**
* @method	isInRange
*
* It checks the given value length is within the specified range.
* @param string value
* @param string length
*
*/
function isValidPassword(sVal){
	// if the value is empty
	if(isEmpty(sVal))
		return false;

	var sPattern = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!,@,#,$,^,*,_,~])/;

	// Checks the value length is within the specified range.
	if(!sPattern.test(sVal)){
		return false;
	}

	return true; 
}



/**
* @method	compare
*
* It compares the two string values and returns true/false
* @param string value 1
* @param string value 2
*
*/
function compare(sStr1, sStr2){
	// Matches the second value in first 
	if(sStr2.search(sStr1) != -1){
		return true;
	}

	return false;
}

/**
* Checks the input value is a valid PAN number or not
*
* @param string val
*/
function isPAN(sVal){

	// RegEx pattern
	var sPattern = /^\w{5}\d{4}\w{1}$/;

	// Check across the reqex pattern
	if(sPattern.test(sVal)){
		return true;
	}

	return false;
}

	/**
	* Validate the date field. 
	* It validates based on the first date should be less than the second date.
	*
	* @param string Date 1
	* @param string Date 2
	*/
	function compareDate(strDate1, strDate2) {
		
		// Instantiating object of dates with mm/dd/yyyy format.		
		var obDate1 = new Date(formatDate(strDate1));
		var obDate2 = new Date(formatDate(strDate2));
		
		// Date.parse() returns the date in milliseconds
		if(obDate1.getTime() > obDate2.getTime()) {
			return false;
		}
		else{
			return true;
		}
	}
	
	/**
	* Validate the date field. 
	* It validates based on the first date should be less than the second date.
	*
	* @param string Date 1
	* @param string Date 2
	*/
	function checkDateDiff(strDate1, strDate2) {
		// Instantiating object of dates with mm/dd/yyyy format.		
		var obDate1 = new Date(formatDate(strDate1));
		var obDate2 = new Date(formatDate(strDate2));

		var fDateTime = obDate1.getTime();
		var sDateTime = obDate2.getTime();

		// compare two dates time
		if((fDateTime - sDateTime) > 0 ) {
			return true;
		}
		else{
			return false;
		}
	}

	/**
	* It formats the date and returns it in MM/dd/yyyy format
	*/
	function formatDate(strDate){
		var arrPart = new String(strDate).split("/");
		var strReturn;

		if(arrPart){
			strReturn = arrPart[1]+"/"+arrPart[0]+"/"+arrPart[2];
		}
		return strReturn;
	}

	/**
	* Extracts the date parts of two given dates and calculate 
	* the difference between the specific part.
	*/
	function dateDiff(sDate, eDate, part){
		var date1 = new Date(formatDate(sDate));
		var date2 = new Date(formatDate(eDate));
		
		var diff;
		var oneDay = 1000 * 60 * 60 * 24;

		switch(part){
			case 'D':// Day
				diff = Math.ceil((date2.getTime() - date1.getTime())/ oneDay);
				break;
			case 'M':// Month
				diff = date2.getMonth() - date1.getMonth();
				break;
			case 'Y':// Year
				diff = date2.getFullYear() - date1.getFullYear();
				break;
		}
		
		return diff;
	}



/**
* It opens the pop up window based on the given anchor object
*/

	function openPopUp(obElm, sFeature) {
	
		var sLink;
		
		if(typeof(obElm) == 'string') {		
			sLink = obElm;
		}
		else{
			sLink = obElm.href;
			
			var obWin = window.open(sLink, "Popup", sFeature);
			
			obWin.focus();
			
			if(!obWin.opener) obWin.opener = _self;
			
			return false;
		}
	
	}

	/**
	* It opens the pop up window based on the given anchor object
	*/
	function openModel(obElm, sFeature) {
	
		var sLink;
		
		if(typeof(obElm) == 'string') {		
			sLink = obElm;
		}
		else{
			sLink = obElm.href;
			
			window.showModalDialog(sLink, window, sFeature);

			return false;
		}
	}
	
	/**
* It opens the pop up window based on the given anchor object
*/

	function openPopUpWithSubmit(obElm, sFeature, formName, componentName){
		var sLink;
		var filePath = parent.window.document.getElementById(componentName).value;

		if(filePath == '' || filePath == null){
			alert('Please Select File To Sign');
			return false;
		}
		
		var pattern = new RegExp();
		pattern.compile("\&");
		if(pattern.test(filePath)) {
			alert("Special Characters '\&' Not Allowed In File Path");
			return false;
		}
		
		if(typeof(obElm) == 'string'){
			sLink = obElm;
		}
		else{
			sLink = obElm.href;
			sLink = sLink+"&filePath="+filePath;
			var obWin = window.open(sLink, "Popup", sFeature);
			
			obWin.focus();
			
			if(!obWin.opener) obWin.opener = _self;
			
			return false;
		}
	
	}
	
	//To Enable File Read Object form Local Directory from remote
	function filePathRead(Object,componentName){
		 if (Object.files) {
			try {
				netscape.security.PrivilegeManager.enablePrivilege('UniversalFileRead')
			}
			catch (err) {
				//need to set signed.applets.codebase_principal_support to true
				alert(err);
			}
		}
		
		parent.window.document.getElementById(componentName).value = Object.value;
	}
	
	String.prototype.trim = function() {
    	return this.replace(/^\s+|\s+$/g,"");
    }
    
    
	    
	/**
	* It encrypts the given value using hash method.
	* 
	* @param string password
	* @param string salt
	* @return string encrypted password
	*/
	function encryptPwd(strPwd, strHdnSalt){
		
		// Generate hash of the given password
		if(isEmpty(strPwd) || isEmpty(strHdnSalt))
			return null;
		
		var strEncPwd;
			
		var strPwdHash = hex_md5(strPwd);
		
		var strSalt = strHdnSalt.substring(1, strHdnSalt.length);
		
		// Merge the salt with hash
		var strMerged = strSalt +""+ strPwdHash;
		
		// Hash again with the salt
		strEncPwd = hex_md5(strMerged);
		
		return strEncPwd;
	}
	
	function encryptShaPwd(strPwd, strHdnSalt){
		
		// Generate hash of the given password
		if(isEmpty(strPwd) || isEmpty(strHdnSalt))
			return null;
		
		var strEncPwd;
			
		var strPwdHash = HashCode512(strPwd);
		
		var strSalt = strHdnSalt.substring(1, strHdnSalt.length);
		
		// Merge the salt with hash
		var strMerged = strSalt +""+ strPwdHash;
		
		// Hash again with the salt
		strEncPwd = HashCode512(strMerged);
		
		return strEncPwd;
	}
    
    
    /**
    * Text area text counter method.
    */
	function textCounter(obField,cntfield,maxLimit) {
		if (obField.value.length > maxLimit){ // if too long...trim it!
			obField.value = obField.value.substring(0, maxLimit);
			// otherwise, update 'characters left' counter
		}
		else{
			if(cntfield){
				cntfield.value = maxLimit - obField.value.length;	
			}
		}
	}
	
	/**
    * Text area text counter method.
    */
	function textMaxLen(obField,maxLimit) {
		if (obField.value.length > maxLimit){ // if too long...trim it!
			obField.value = obField.value.substring(0, maxLimit);
		}
	}
	
	//Getting Current Date 
	//Written By Jana
	
	function getCurrDate() {
	
		var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth()+1;//January is 0!
		var yyyy = today.getFullYear();
			
		if(dd<10) {
			dd='0'+dd;
		}
			
		if(mm<10) {
			mm='0'+mm;
		}
			
		var today = dd+'/'+mm+'/'+yyyy;
		
		return today;
	}
	
	
	/**
	* It counts the text area characters and restricts when the maxlimit is reached.
	*/
	function textCounter(field,cntfield,maxlimit) {
		if (field.value.length > maxlimit){
			 // if too long...trim it!
			field.value = field.value.substring(0, maxlimit);
		}
		// otherwise, update 'characters left' counter
		else{	
			cntfield.innerText = cntfield.textContent = field.value.length;
		}
	}
	
	
	/**
	 * Checks the given value contains any special characters or not.
	 * 
	 */
	 function isSpecialChar(val){
	 	// Pattern
		var strPattern = /[^a-z A-Z 0-9 \/ \- _. , \s]/g;
		
		if(strPattern.test(val)) {
			return true;
		}
		
		return false;
	 }
	 
	
	/**
	* String reverse method.
	*/	

	String.prototype.reverse = function(){
		splitext = this.split("");
		revertext = splitext.reverse();
		alert("array:"+revertext);
		reversed = revertext.join("");
		return reversed;
	}


	/*
	Cross-Browser Split 0.3
	By Steven Levithan <http://stevenlevithan.com>
	MIT license
	Provides a consistent cross-browser, ECMA-262 v3 compliant split method
*/

String.prototype._$$split = String.prototype._$$split || String.prototype.split;

String.prototype.split = function (s /* separator */, limit) {
	// if separator is not a regex, use the native split method
	if (!(s instanceof RegExp))
		return String.prototype._$$split.apply(this, arguments);

	var	flags = (s.global ? "g" : "") + (s.ignoreCase ? "i" : "") + (s.multiline ? "m" : ""),
		s2 = new RegExp("^" + s.source + "$", flags),
		output = [],
		origLastIndex = s.lastIndex,
		lastLastIndex = 0,
		i = 0, match, lastLength;

	/* behavior for limit: if it's...
	- undefined: no limit
	- NaN or zero: return an empty array
	- a positive number: use limit after dropping any decimal
	- a negative number: no limit
	- other: type-convert, then use the above rules
	*/
	if (limit === undefined || +limit < 0) {
		limit = false;
	} else {
		limit = Math.floor(+limit);
		if (!limit)
			return [];
	}

	if (s.global)
		s.lastIndex = 0;
	else
		s = new RegExp(s.source, "g" + flags);

	while ((!limit || i++ <= limit) && (match = s.exec(this))) {
		var emptyMatch = !match[0].length;

		// Fix IE's infinite-loop-resistant but incorrect lastIndex
		if (emptyMatch && s.lastIndex > match.index)
			s.lastIndex--;

		if (s.lastIndex > lastLastIndex) {
			// Fix browsers whose exec methods don't consistently return undefined for non-participating capturing groups
			if (match.length > 1) {
				match[0].replace(s2, function () {
					for (var j = 1; j < arguments.length - 2; j++) {
						if (arguments[j] === undefined)
							match[j] = undefined;
					}
				});
			}

			output = output.concat(this.slice(lastLastIndex, match.index));
			if (1 < match.length && match.index < this.length)
				output = output.concat(match.slice(1));
			lastLength = match[0].length; // only needed if s.lastIndex === this.length
			lastLastIndex = s.lastIndex;
		}

		if (emptyMatch)
			s.lastIndex++; // avoid an infinite loop
	}

	// since this uses test(), output must be generated before restoring lastIndex
	output = lastLastIndex === this.length ?
		(s.test("") && !lastLength ? output : output.concat("")) :
		(limit ? output : output.concat(this.slice(lastLastIndex)));
	s.lastIndex = origLastIndex; // only needed if s.global, else we're working with a copy of the regex
	return output;
};

	/**
	 * textarea is reference to that object, replaceWith is string that will replace the encoded return
	 * */
	function escapeVal(textarea){ 
		//character to replace
		var replaceWith = '';
		textarea.value = escape(textarea.value); 
		//encode textarea string's carriage returns
	
		for(i=0; i<textarea.value.length; i++){ 
			//loop through string, replacing carriage return encoding with HTML break tag
	
			if(textarea.value.indexOf("%0D%0A") > -1){ 
				//Windows encodes returns as \r\n hex
				textarea.value=textarea.value.replace("%0D%0A",replaceWith)
			}
			else if(textarea.value.indexOf("%0A") > -1){ 
				//Unix encodes returns as \n hex
				textarea.value=textarea.value.replace("%0A",replaceWith)
			}
			else if(textarea.value.indexOf("%0D") > -1){ 
				//Macintosh encodes returns as \r hex
				textarea.value=textarea.value.replace("%0D",replaceWith)
			}
		}
	
		textarea.value = unescape(textarea.value); //unescape all other encoded characters
	}



//		x = new String('This is a test.');
//		document.write(x.reverse());

/*
 * Date Format 1.2.2
 * (c) 2007-2008 Steven Levithan <stevenlevithan.com>
 * MIT license
 * Includes enhancements by Scott Trenda <scott.trenda.net> and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */
var dateFormat = function () {
	var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip = /[^-+\dA-Z]/g,
		pad = function (val, len) {
			val = String(val);
			len = len || 2;
			while (val.length < len) val = "0" + val;
			return val;
		};

	// Regexes and supporting functions are cached through closure
	return function (date, mask, utc) {
		var dF = dateFormat;

		// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
		if (arguments.length == 1 && (typeof date == "string" || date instanceof String) && !/\d/.test(date)) {
			mask = date;
			date = undefined;
		}

		// Passing date through Date applies Date.parse, if necessary
		date = date ? new Date(date) : new Date();
		if (isNaN(date)) throw new SyntaxError("invalid date");

		mask = String(dF.masks[mask] || mask || dF.masks["default"]);

		// Allow setting the utc argument via the mask
		if (mask.slice(0, 4) == "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}

		var	_ = utc ? "getUTC" : "get",
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			m = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			M = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			L = date[_ + "Milliseconds"](),
			o = utc ? 0 : date.getTimezoneOffset(),
			flags = {
				d:    d,
				dd:   pad(d),
				ddd:  dF.i18n.dayNames[D],
				dddd: dF.i18n.dayNames[D + 7],
				m:    m + 1,
				mm:   pad(m + 1),
				mmm:  dF.i18n.monthNames[m],
				mmmm: dF.i18n.monthNames[m + 12],
				yy:   String(y).slice(2),
				yyyy: y,
				h:    H % 12 || 12,
				hh:   pad(H % 12 || 12),
				H:    H,
				HH:   pad(H),
				M:    M,
				MM:   pad(M),
				s:    s,
				ss:   pad(s),
				l:    pad(L, 3),
				L:    pad(L > 99 ? Math.round(L / 10) : L),
				t:    H < 12 ? "a"  : "p",
				tt:   H < 12 ? "am" : "pm",
				T:    H < 12 ? "A"  : "P",
				TT:   H < 12 ? "AM" : "PM",
				Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
				o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
				S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
			};

		return mask.replace(token, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	};
}();

// Some common format strings
dateFormat.masks = {
	"default":      "ddd mmm dd yyyy HH:MM:ss",
	shortDate:      "m/d/yy",
	mediumDate:     "mmm d, yyyy",
	longDate:       "mmmm d, yyyy",
	fullDate:       "dddd, mmmm d, yyyy",
	shortTime:      "h:MM TT",
	mediumTime:     "h:MM:ss TT",
	longTime:       "h:MM:ss TT Z",
	isoDate:        "yyyy-mm-dd",
	isoTime:        "HH:MM:ss",
	isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
	isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
	dayNames: [
		"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	],
	monthNames: [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
		"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
	]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
	return dateFormat(this, mask, utc);
};

var th = ['','thousand','lakh', 'crore'];
var dg = ['zero','one','two','three','four', 'five','six','seven','eight','nine']; 
var tn = ['ten','eleven','twelve','thirteen', 'fourteen','fifteen','sixteen', 'seventeen','eighteen','nineteen']; 
var tw = ['twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety']; 

function toWords(s, wordField){
	s = s.toString(); s = s.replace(/[\, ]/g,''); 
	if (s != String(parseFloat(s))) return 'not a number'; var x = s.indexOf('.'); 
	if (x == -1) x = s.length; if (x > 15) return 'too big'; var n = s.split(''); var str = ''; 
	var sk = 0; 
	
	for (var i=0; i < x; i++) {
		if ((x-i)%3==2) {
			if (n[i] == '1') {
				str += tn[Number(n[i+1])] + ' '; i++; sk=1;
			} 
			else if (n[i]!=0) {
				str += tw[n[i]-2] + ' ';sk=1;
			}
		} 
		else if (n[i]!=0) {
			str += dg[n[i]] +' '; 
			if ((x-i)%3==0) str += 'hundred ';sk=1;
		} 
		
		if ((x-i)%3==1) {
			if (sk) str += th[(x-i-1)/3] + ' ';sk=0;
		}
		
	} 
	if (x != s.length) {
		var y = s.length; str += 'point '; 
		for (var i=x+1; i<y; i++) 
			str += dg[n[i]] +' ';
	} 

	// setting in the span element
	wordField.innerText = wordField.textContent = str.replace(/\s+/g,' ');
	
//	return str.replace(/\s+/g,' ');
}
	
//price text-box allow numeric and allow 2 decimal points only
function extractNumber(obj, decimalPlaces, allowNegative)
{
	var temp = obj.value;
	
	// avoid changing things if already formatted correctly
	var reg0Str = '[0-9]*';
	if (decimalPlaces > 0) {
		reg0Str += '\\.?[0-9]{0,' + decimalPlaces + '}';
	} else if (decimalPlaces < 0) {
		reg0Str += '\\.?[0-9]*';
	}
	reg0Str = allowNegative ? '^-?' + reg0Str : '^' + reg0Str;
	reg0Str = reg0Str + '$';
	var reg0 = new RegExp(reg0Str);
	if (reg0.test(temp)) return true;

	// first replace all non numbers
	var reg1Str = '[^0-9' + (decimalPlaces != 0 ? '.' : '') + (allowNegative ? '-' : '') + ']';
	var reg1 = new RegExp(reg1Str, 'g');
	if(reg1.test(temp)) {
		alert("Please enter numeric values or decimals only");
		temp = temp.replace(reg1, '');
		obj.value = temp;
		return false;
	}
	if (allowNegative) {
		// replace extra negative
		var hasNegative = temp.length > 0 && temp.charAt(0) == '-';
		var reg2 = /-/g;
		temp = temp.replace(reg2, '');
		if (hasNegative) temp = '-' + temp;
	}
	
	if (decimalPlaces != 0) {
		var reg3 = /\./g;
		var reg3Array = reg3.exec(temp);
		if (reg3Array != null) {
			// keep only first occurrence of .
			//  and the number of places specified by decimalPlaces or the entire string if decimalPlaces < 0
			var reg3Right = temp.substring(reg3Array.index + reg3Array[0].length);
			reg3Right = reg3Right.replace(reg3, '');
			reg3Right = decimalPlaces > 0 ? reg3Right.substring(0, decimalPlaces) : reg3Right;
			temp = temp.substring(0,reg3Array.index) + '.' + reg3Right;
		}
	}
	
	obj.value = temp;
}
function blockNonNumbers(obj, e, allowDecimal, allowNegative)
{
	var key;
	var isCtrl = false;
	var keychar;
	var reg;
		
	if(window.event) {
		key = e.keyCode;
		isCtrl = window.event.ctrlKey
	}
	else if(e.which) {
		key = e.which;
		isCtrl = e.ctrlKey;
	}
	
	if (isNaN(key)) return true;
	
	keychar = String.fromCharCode(key);
	
	// check for backspace or delete, or if Ctrl was pressed
	if (key == 8 || isCtrl)
	{
		return true;
	}

	reg = /\d/;
	var isFirstN = allowNegative ? keychar == '-' && obj.value.indexOf('-') == -1 : false;
	var isFirstD = allowDecimal ? keychar == '.' && obj.value.indexOf('.') == -1 : false;
	
	return isFirstN || isFirstD || reg.test(keychar);
}
// end of price text-box allow numeric and allow 2 decimal points only


function setServerTimeForClock(){
	var serverCurrentDateTime = document.getElementById("serverDateTime").value;
	var serverCurrentTime= moment(Number(serverCurrentDateTime)).zone('+05:30').format('DD-MMM-YYYY HH:mm:ss');
	var serverDateTime = Number(serverCurrentDateTime)+Number(1000);
	document.getElementById("serverCurrentTime").value = serverCurrentTime;
	document.getElementById("serverDateTime").value = serverDateTime;
	setTimeout("setServerTimeForClock()",1000);
}

function pad(n, width, z) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function getMonthName(month){
	var monthName;
	switch (month) {
		case '01': 
			monthName = 'Jan';
			break;
		case '02': 
			monthName = 'Feb';
			break;
		case '03': 
			monthName = 'Mar';
			break;
		case '04': 
			monthName = 'Apr';
			break;
		case '05': 
			monthName = 'May';
			break;
		case '06': 
			monthName = 'Jun';
			break;
		case '07': 
			monthName = 'Jul';
			break;
		case '08': 
			monthName = 'Aug';
			break;
		case '09': 
			monthName = 'Sep';
			break;
		case '10': 
			monthName = 'Oct';
			break;
		case '11': 
			monthName = 'Nov';
			break;
		case '12': 
			monthName = 'Dec';
			break;
		default:  
			monthName = 'Jan';
			break;
	}
	return monthName;
}

//Each word in Tender tile and tender reference number should not exceed 30 character.
function checkLongWordsPresent(stringToCheck) {
	if(stringToCheck!=null){
		var stringToCheckWords = stringToCheck.split(" ");
		for (num = 0; num < stringToCheckWords.length; num++) {
			if(stringToCheckWords[num].length>30){
				return true;
			}
		}
	}
	return false;
}

/**
* Function to check letters and numbers
*
* @param string val
*/
function isAlphaNumeric(sVal){

	// RegEx pattern
	var sPattern = /^[0-9a-zA-Z]+$/;

	// Check across the reqex pattern
	if(sPattern.test(sVal)){
		return true;
	}

	return false;
}

function isAlphaNumericHyphen(sVal){

	// RegEx pattern
	var sPattern = /^[0-9a-zA-Z\-]+$/;

	// Check across the reqex pattern
	if(sPattern.test(sVal)){
		return true;
	}

	return false;
}

