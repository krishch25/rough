/**
 * 
 * This class is used for csrf operation , checked wheter customer select the
 * delete operation (checkbox)
 * 
 */
function checkConformDeleteDocuments(f1, cname) {
	var f = document.getElementById(f1); // get form name

	var countf = 0; // count variable for whether checkbox checked or not
	var counti = 0; // count variable for whether have checkbox or not

	for ( var elementId = 0; elementId < f.elements.length; elementId++) { // iterate
	// form
	// elements

		if (f.elements[elementId].type == "checkbox") { // check type
			counti = counti + 1;
			if (f.elements[elementId].checked) { // check for wheter select
			// or not
				countf = countf + 1;
				
			}
		}
	}

	if (countf > 0) { // check wheter records select or not for user
	// conformation
	
		if (confirm("Do you want to delete, the selected " + countf + " " + cname + "(s)?")) {
			return true;
		} else {
			return false;
		}
	}
	if (countf <= 0 && counti > 0) {
		alert("Please select atleast one " + cname);
		return false;
	}
	if (countf <= 0 && counti <= 0) {
		alert("No record available for delete");
		return false;
	}

	return true;
}

/*
 * This function is used for checked whether customer select the Inactive operation (checkbox)
 * 
 */
function checkConfirm(frm, ckname) {
	var ckf = document.getElementById(frm); // get form name

	var countf = 0; // count variable for whether checkbox checked or not
	var counti = 0; // count variable for whether have checkbox or not		
	
	for ( var elementId = 0; elementId < ckf.elements.length; elementId++) { // iterate
	// form
	// elements

		if (ckf.elements[elementId].type == "checkbox") { // check type
			counti = counti + 1;			
			if (ckf.elements[elementId].checked) { // check for whether select
			// or not					
				countf = countf + 1;
			
			}
		}
	}

	if (countf > 0) { // check whether records select or not for user
	// confirmation
	
		if (confirm("Do you want to Inactive, the selected " + countf + " " + ckname + "(s)?")) {
			return true;
		} else {
			return false;
		}
	}
	if (countf <= 0 && counti > 0) {
		alert("Please select atleast one " + ckname + " to Inactive.");
		return false;
	}
	if (countf <= 0 && counti <= 0) {
		alert("No record available for Inactive.");
		return false;
	}

	return true;
}

function checkByAdvanceTender(frm, cname1, cname2, cname3, cname4) {
	
	var tenderId = document.getElementById(cname1).value.trim();
	var tenderRefNo = document.getElementById(cname2).value.trim();
	var workItemTitle = document.getElementById(cname3).value.trim();
	var pinCode = document.getElementById(cname4).value.trim();
	
	
	if(tenderId.length >=1){
		if(checkSplChar(tenderId)){
			alert("TenderId should not contain special character.");
			return false;
		}
		if(tenderId.length < 7){
			alert("Minimum 7 characters are required in Tender ID.");
			return false;
		}
	}
	
	if(tenderRefNo.length >=1){
		if(checkSplChar(tenderRefNo)){
			alert("Tender Reference Number should not contain special character.");
			return false;
		}
		if(tenderRefNo.length < 3){
			alert("Minimum 3 characters are required in Tender Reference Number.");
			return false;
		}
	}
	
	if(workItemTitle.length >= 1){
		if(checkSplChar(workItemTitle)){
			alert("Work/Item Title should not contain special character.");
			return false;
		}
		if(workItemTitle.length < 3){
			alert("Minimum 3 characters are required in Work/Item Title.");
			return false;
		}
	}
	
	if(pinCode.length >=1){
		re1 = /^[0-9]+$/;
		if (!re1.test(pinCode)){
			alert("PinCode can contain only numbers.");
			return false;
		}
		if(checkSplChar(pinCode)){
			alert("PinCode should not contain special character.");
			return false;
		}
	}
	 
	
} 
//--------------------------------------------------------------------------------------------------------------------//		
//---------------Special characters checking of one arguments (TenderId)-------------------------------------//
//--------------------------------------------------------------------------------------------------------------------//		

function checkByTenderId(frm, cname1) {
	var TenderId = document.getElementById(cname1).value.trim();// TenderId

	if (TenderId == "") {
		alert("Please Enter a Valid " + cname1);
		return false;
	}

	if (checkSplChar(TenderId)) {
		alert("Please Enter a Valid " + cname1
				+ " should not contain special character.");
		return false;
	}
}
//--------------------------------------------------------------------------------------------------------------------//		
//---------------Special characters checking of two arguments (TenderRefNo,TenderType)-------------------------//
//--------------------------------------------------------------------------------------------------------------------//		

function checkByTenderRefNoandType(frm, cname1, cname2) {
	var TenderRefNo = document.getElementById(cname1).value.trim();// TenderRefNo
	var TenderType = document.getElementById(cname2).value;// Tender Type

	if (TenderRefNo == "" && TenderType == 0) {
		alert("Please Enter a Valid " + cname1 + " or " + cname2
				+ " to Search.");
		return false;
	}

	if (checkSplChar(TenderRefNo)) {
		alert("Please Enter a Valid " + cname1
				+ " should not contain special character.");
		return false;
	}
}

function check2Values(frm, cname1, cname2) {
	var UserId = document.getElementById(cname1).value.trim();// UserId
	var UserName = document.getElementById(cname2).value.trim();// UserName

	if (UserId == "" && UserName == "") {
		alert("Please Enter a Valid " + cname1 + " or " + cname2
				+ " to Search.");
		return false;
	}
	
	if (checkSplChar(UserName)) {
		alert("Please Enter a Valid " + cname2
				+ " should not contain special character.");
		return false;
	}
}
//---------------------------------------------------------------------------------------------------------------------//		
//---------------Special characters checking of two arguments  (TenderRefNo,Tender Title)-------------------//
//---------------------------------------------------------------------------------------------------------------------//		
function checkByTenderRefandTitle(frm, cname1, cname2) {
	var TenderRefNo = document.getElementById(cname1).value.trim();// TenderRefNo
	var TenderTitle = document.getElementById(cname2).value.trim();// Tender Title

	if (TenderRefNo == "" && TenderTitle == "") {
		alert("Please Enter a Valid " + cname1 + " or " + cname2
				+ " to Search.");
		return false;
	}

	if (checkSplChar(TenderRefNo)) {
		alert("Please Enter a Valid " + cname1
				+ " should not contain special character.");
		return false;
	}
	if (checkSplChar(TenderTitle)) {
		alert("Please Enter a Valid " + cname2
				+ " should not contain special character.");
		return false;
	}
}

//---------------------------------------------------------------------------------------------------------------------//		
//---------------Special characters checking of three arguments (TenderId,Tender Title,Tender Category)-----------//
//---------------------------------------------------------------------------------------------------------------------//		
function CheckByTenderIdCatandTitle(frm, cname1, cname2, cname3) {

	var TenderId = document.getElementById(cname1).value.trim();// TenderId
	var TenderCategory = document.getElementById(cname2).value;// Tender Category
	var TenderTitle = document.getElementById(cname3).value.trim();// Tender Title

	if (TenderId == "" && TenderCategory == 0 && TenderTitle == "") {
		alert("Please Enter a Valid " + cname1 + " or " + cname2 + " or "
				+ cname3 + "");
		return false;
	}
 
	else if (checkSplChar(TenderId)) {
		alert("Please Enter a Valid " + cname1
				+ " should not contain special character.");
		return false;

	}
	else if (checkSplChar(TenderTitle)) {
		alert("Please Enter a Valid " + cname3
				+ " should not contain special character.");
		return false;

	}
}

//---------------------------------------------------------------------------------------------------------------------//		
//---------------Special characters checking More than 3 arguments -----------------------------------------//
//---------------------------------------------------------------------------------------------------------------------//		
function checkMultipleValues(frm, cname1, cname2, cname3, cname4, cname5, cname6, cname7) {
	
	var TenderId 		 = document.getElementById(cname1).value.trim();// TenderRefNo
	var Keyword 		 = document.getElementById(cname2).value.trim();// Tender Title
	var FormofContract   = document.getElementById(cname3).value;
	var TenderCategory	 = document.getElementById(cname4).value;
	var TenderType		 = document.getElementById(cname5).value;
	var ProductCategory	 = document.getElementById(cname6).value;
	var TenderStatus	 = document.getElementById(cname7).value;

	if (TenderId == "" && Keyword == "" && FormofContract == 0 && TenderCategory == 0 && TenderType == 0 && ProductCategory == 0 && TenderStatus == 0) {
		alert("Please Enter a Valid " + cname1 + " or " + cname2
				+ " to Search.");
		return false;
	}
	if (checkSplChar(TenderId)) {
		alert("Please Enter a Valid " + cname1
				+ " should not contain special character.");
		return false;
	}
	if (checkSplChar(Keyword)) {
		alert("Please Enter a Valid " + cname2
				+ " should not contain special character.");
		return false;
	}
	
}

//---------------------------------------------------------------------------------------------------------------------//		
//---------------Check Department Values -------------------------------------------------------------------//
//---------------------------------------------------------------------------------------------------------------------//		

function checkdeptValues(frm, cname1, cname2, cname3, cname4, cname5, cname6) {
	
	var userName = document.getElementById(cname1).value.trim();
	var OrganisationName  = document.getElementById(cname2).value;
	var DepartmentName = document.getElementById(cname3).value;
	var DivisionName = document.getElementById(cname4).value;
	var SubDivisionName = document.getElementById(cname5).value;
	var UserStatus = document.getElementById(cname6).value;
	
	if (userName == "" && OrganisationName == 0 && DepartmentName == 0 && DivisionName == 0 && SubDivisionName == 0 && UserStatus == 0) {
		alert("Please Enter a Valid " + cname1 
				+ " to Search.");
		return false;
	}
	
	if (checkSplChar(userName)) {
		alert("Please Enter a Valid " + cname1
				+ " should not contain special character.");
		return false;
	}
}
//----------------------------------------------------------------------------------------------------------------------------//		
//---------------Check Search Active Tenders Values ---------------------------------------------------------------//
//----------------------------------------------------------------------------------------------------------------------------//		


function checkActiveTendersValues(frm,c1,c2,c3,c4,c5,c6,c7,c8,c9){
	
	var TenderRefNo = document.getElementById(c1).value.trim();
	var TenderTitle = document.getElementById(c2).value.trim();
	var Organization = document.getElementById(c3).value;
	var Department = document.getElementById(c4).value;
	var Division = document.getElementById(c5).value;
	var SubDivision = document.getElementById(c6).value;
	var TenderValueFrom = document.getElementById(c7).value.trim();
	var TenderValueTo = document.getElementById(c8).value.trim();
	var Keyword = document.getElementById(c9).value.trim();
	
	if(Keyword == ""){
		alert("Please enter Keyword to Search.");
		return false;
		
	}else {
		
	if(Keyword.length < 4){
		alert("Keyword should have minimum four characters.");
		return false;
	}
	
	if(TenderRefNo == "" && TenderTitle == "" && Organization == 0 && Department == 0 && Division == 0 && SubDivision == 0 && TenderValueFrom == "" && TenderValueTo == "" && Keyword == ""){
		alert("Please enter Keyword to Search.");
	}
	
	
	if(checkSplChar(TenderRefNo)){
		alert("Please Enter a Valid " + c1
				+ " should not contain special character.");
		return false;
		
	}
	if(checkSplChar(TenderTitle)){
		alert("Please Enter a Valid " + c2
				+ " should not contain special character.");
		return false;
		
	}
	if(checkSplChar(TenderValueFrom)){
		alert("Please Enter a Valid " + c7
				+ " should not contain special character.");
		return false;
		
	}
	if(checkSplChar(TenderValueTo)){
		alert("Please Enter a Valid " + c8
				+ " should not contain special character.");
		return false;
		
	}
	if(checkSplChar(Keyword)){
		alert("Please Enter a Valid " + c9
				+ " should not contain special character.");
		return false;
		
	}
	
	
  re1 = /^[0-9]+$/;
	   var F = TenderValueFrom
	  
	   var sUID = F
	   
	   if(!sUID=="")
	   {
			   var  documentcodelen = sUID.length;
			   
			   
			   if (!re1.test(sUID))
			   {
					   alert("From value can contain only numbers.");
					 
						return false;
			   }
	   
		}

		var T = TenderValueTo
		sUID = T

	   if(!sUID=="")
	   {   
			   var  documentcodelen = T;
			   
			   if (F == "")
					{
		
						alert("Please Enter tender From value.");
						return false;
	
					}
					
			   if (!re1.test(sUID))
			   {
					   alert("To value can contain only numbers.");
					 
					 return false;
			   }
	   
		}
			
	if (Number(F) > Number(T))
	{
		alert('From value cannot be greater than To value.');
		
		document.getElementById(c7).value="";
		document.getElementById(c8).value="";
		
		return false;
	}
			
}
	return true;
}

function validateFieldsIncludingRadios(frm,c1,c2,c3,c4,c5,c6){
	
	var TenderId = document.getElementById(c1).value.trim();// TenderId
	var TenderTitle = document.getElementById(c2).value.trim();// Tender Title
	var PublishedDate = document.getElementById(c3).checked;// Published Date
	var ClosingDate = document.getElementById(c4).checked;// Closing Date
	var Tend_id = document.getElementById(c5).checked;// Tender Id
	var Captcha = document.getElementById(c6).value.trim();
	
	if(Captcha ==""){
	   	alert("Please enter Captcha.");
		return false;
    } 
	   
	 if(Captcha.length != 6) {
		alert("Invalid Captcha! Please Enter Correct Captcha");
		Captcha.value = "";
		return false; 
	 }

	if(Captcha!=""){
		if (checkSplChar(TenderId)) {
			alert("Please Enter a Valid " + c1
					+ " should not contain special character.");
			Captcha.value = "";
			return false;

		}else if (checkSplChar(TenderTitle)) {
			alert("Please Enter a Valid " + c2
					+ " should not contain special character.");
			Captcha.value = "";
			return false;
		}
	}
	
  /*	else{
		alert("Please enter Captcha.");
		return false;
	} */
	/*if (TenderId == "" && TenderTitle == "" && PublishedDate == false && ClosingDate == false && Tend_id == false) {
		alert("Please Enter a valid " + c1 + " or " + c2 + " to search.");
		return false;
	}*/
 
	/*else if (checkSplChar(TenderId)) {
		alert("Please Enter a Valid " + c1
				+ " should not contain special character.");
		return false;

	}*/
	/*else if (checkSplChar(TenderTitle)) {
		alert("Please Enter a Valid " + c2
				+ " should not contain special character.");
		return false;

	}*/
	/*else if(Captcha == ""){
		alert("Please enter Captcha.");
		return false;
	}*/
	
}
//---------------------------------------------------------------------------------------------------------------------//		
//---------------Special characters checking -----------------------------------------------------------------//
//---------------------------------------------------------------------------------------------------------------------//

function checkSplChar(s) {
	var iChars = "@!$%^&*+=[]\{}|\":<>'?`~;";
	var i;
	if (s != "") {
		for (i = 0; i < s.length; i++) {
			if (iChars.indexOf(s.charAt(i)) != -1) {
				return true;
			}
		}
	}
	return false;
}


//Added to check only numeric values to be typed in text field

function numbersonly(myfield, e, dec){
	var key;
	var keychar;
	
	if (window.event)
	   key = window.event.keyCode;
	else if (e)
	   key = e.which;
	else
	   return true;
	keychar = String.fromCharCode(key);
	
	// control keys
	if ((key==null) || (key==0) || (key==8) || 
	    (key==9) || (key==13) || (key==27) )
	   return true;
	
	// numbers
	else if ((("0123456789").indexOf(keychar) > -1))
	   return true;
	
	// decimal point jump
	else if (dec && (keychar == "."))
	   {
	   myfield.form.elements[dec].focus();
	   return false;
	   }
	else
	   return false;
}

function populatewebsite() {
	var contactDiv = document.getElementById("ContactUsDetails");
	var seletedObj = contactDiv.selectContactUsCategory;
	var v1 = seletedObj.options[seletedObj.selectedIndex].text;
	if(v1!="-Select-" && v1=="DSC Address") {
			webAddrLable.style.display = "";
			webAddrView.style.display = "";
	} else {
			webAddrLable.style.display = "none";
			webAddrView.style.display = "none";
	}
	
}

function isRequiredBoxSelected(formname,attributes) {
	var f = document.getElementById(formname);
	var selectedCount = 0;
	
	for ( var elementId = 0; elementId < f.elements.length; elementId++) {
		if (f.elements[elementId].type == "checkbox") {
			if (f.elements[elementId].checked) {
				selectedCount = selectedCount + 1;
			}
		}
	}
	if(selectedCount == 0) {
		alert("Please select required "+attributes);
		return false;
	}
}

/**
 * Change the given string into Upper Case
 * @param string value
 * **/
function uppercase(sVal) {
	var questCode = document.getElementById(sVal).value.trim();   
	document.getElementById(sVal).value = questCode.toUpperCase();
}

/**
* @method	isNumeric
*
* It checks the fields is numeric
* @param string value
*
*/
function isNumeric(sVal){
	var sPattern = /^\d+$/;

	if(sPattern.test(sVal)){
		return true;
	}
	
	return false;
}

document.getElementById("captcha").onclick = function(){ document.getElementById("captchaText").value = "";}

