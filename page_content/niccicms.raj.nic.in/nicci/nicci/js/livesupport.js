// ================= GLOBAL VARIABLES =================
var clientId = _uniqueclientID;
var expertId = "";
var portalId = _portalName;
var chat;
var connection;
let chatAcceptanceTimeout;

// ================= SIGNALR BASE URL =================
var signalRBaseUrl = "https://niccicms.raj.nic.in/nicci/signalr";
//var signalRBaseUrl = "http://10.68.13.216/signalr";

// ================= START =================
$(function () {

    if (!window.jQuery || !$.hubConnection) {
        console.error("SignalR library not loaded.");
        return;
    }

    connection = $.hubConnection(signalRBaseUrl, {
        useDefaultPath: false
    });

    connection.logging = true;

    chat = connection.createHubProxy("expertChatHub");

    bindClientMethods();

    connection.start()
        .done(function () {
            console.log("SignalR connected successfully.");
            initializeUI();
        })
        .fail(function (err) {
            console.error("SignalR connection failed:", err);
            $('#message-board').html(`<div class="msg" style="color:red;"> Failed to connect to chat service. Please try again.</div>`);
            $('#btnConnect').show();
        });

    connection.disconnected(function () {
        console.warn("Disconnected. Reconnecting...");
        setTimeout(function () {
            connection.start();
        }, 5000);
    });

});


// ================= CLIENT METHODS =================
function bindClientMethods() {

    // RECEIVE MESSAGE (FULL ORIGINAL DESIGN RESTORED)
    chat.on("receiveMessage", function (from, message) {

        const TSValue = newtimeStamp();

        const ts = TSValue.replace('<span class="timestamp">', '')
            .replaceAll('</span>', '')
            .replace('@ATB@', '')
            .replaceAll(':', '')
            .replace('<span class="tsopacity">', '');

        const TimeStamp = TSValue.replace('@ATB@', TranslateBtnHtml);

        const html = `<div style="display:flex;justify-content: flex-end;">
                        <div class="post post-bot" id='${ts}'>
                            <span id='rpd${ts}'>${message}</span>
                            <input type="hidden" id='hdn${ts}' value="${message}" />
                            ${TimeStamp}
                            <div class="tloader"></div>
                        </div>
                        <div>
                            <img alt="" src=${getRootWebSitePath()}nicci/images/userlg.png 
                                 style="width: 30px; border-radius: 25px; max-width: 30px !important;">
                        </div>
                      </div>`;

        $('#message-board').append(html);
        $('#message-board').scrollTop($('#message-board')[0].scrollHeight);
    });


    chat.on("chatAccepted", function (assignedExpertId) {
        clearTimeout(chatAcceptanceTimeout);
        expertId = assignedExpertId;

        $('#chatBox').show();
        $('#ctl01_hdnExpertChat').val('1');
        $('#message-board').html(`<div class="msg" style="color: #979797;padding: 9px;"> You are now connected to Help Desk.</div>`);
        $('#btnConnect').hide();
    });

    chat.on("notifyChatEnded", function (msg) {
        expertId = "";
        $('#chatBox').hide();
        $('#message').html('');
        $('#ctl01_hdnExpertChat').val('0');
        $('#message-board').append(`<div class="msg" style="color:red;"> ${msg || "The Help Desk has ended the chat."}</div>`);
        $('#btnConnect').show();
    });

    chat.on("notifyNoAvailableExperts", function (message) {
        $('#chatBox').hide();
        $('#ctl01_hdnExpertChat').val('0');
        $('#message-board').append(`<div class="msg" style="color:red;"> ${message}</div>`);
        $('#btnConnect').show();
    });

    chat.on("chatRejected", function (msg) {
        clearTimeout(chatAcceptanceTimeout);
        expertId = "";
        $('#chatBox').hide();
        $('#ctl01_hdnExpertChat').val('0');
        $('#message-board').append(`<div class="msg" style="color:red;"> ${msg || "The Help Desk is unavailable. Please try again later."}</div>`);
        $('#btnConnect').show();
    });

    chat.on("notifyInQueue", function (message) {
        clearTimeout(chatAcceptanceTimeout);
        $('#ctl01_hdnExpertChat').val('1');
        $('#message-board').append(`<div class="msg" style="color:orange;"> ${message}</div>`);
        $('#chatBox').show();
        $('#btnConnect').hide();
    });
}


// ================= UI + SERVER CALLS =================
function initializeUI() {

    $("#message").attr("contenteditable", "true");
    $('#btnConnect').show();

    // CONNECT BUTTON
    $('#btnConnect').off("click").on("click", function (e) {

        e.preventDefault();

        var clientName = $('#username').val();
        if (!clientName || clientName.trim() === '') {
            clientName = portalId + "User" + Math.floor(1000 + Math.random() * 9000);
        }

        chat.invoke("IsAnyExpertAvailable", portalId)
            .done(function (isAvailable) {

                if (isAvailable) {

                    $('#message-board').html(`<div class="msg" style="color: #979797;padding: 9px;"> Please wait... connecting you to an available Help Desk.</div>`);
                    $('#chatBox').show();
                    $('#btnConnect').hide();
                    $('#ctl01_hdnExpertChat').val('1');

                    chat.invoke("RequestChat", clientId, portalId, clientName);

                    chatAcceptanceTimeout = setTimeout(function () {
                        $('#chatBox').hide();
                        $('#ctl01_hdnExpertChat').val('0');
                        $('#message-board').append(`<div class="msg" style="color:red;"> No Help Desk responded. Please try again.</div>`);
                        $('#btnConnect').show();
                    }, 300000);

                } else {
                    $('#chatBox').hide();
                    $('#ctl01_hdnExpertChat').val('0');
                    $('#message-board').html(`<div class="msg" style="color:red;"> No Help Desk currently available. Please try again.</div>`);
                    $('#btnConnect').show();
                }

            })
            .fail(function (err) {
                console.error(err);
                $('#ctl01_hdnExpertChat').val('0');
                $('#message-board').html(`<div class="msg" style="color:red;"> Error checking Help Desk availability. Please try again.</div>`);
                $('#btnConnect').show();
            });
    });


    // SEND BUTTON (NO RELOAD)
    $('#send').off("click").on("click", function (e) {
        e.preventDefault();
        sendMessage();
    });

    // ENTER KEY
    $("#message").on("keydown", function (event) {

        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }

    }).on("focus", function () {

        $("#message").addClass("focus");

    }).on("blur", function () {

        $("#message").removeClass("focus");

    });

    $("#send").off("click").on("click", function (event) {

        event.preventDefault();
        sendMessage();

    });
}

    function sendMessage() {

        var message = $("#message").html();
        if (!message.trim() || !expertId) return;

        chat.invoke("SendMessage", clientId, expertId, message);

        var tsValue = newtimeStamp().replace('@ATB@', '');

        const html = `<div style="display:flex;">
                    <div>
                        <img alt="" src=${getRootWebSitePath()}nicci/images/userlg.png 
                             style="width: 30px;border-radius: 25px;max-width: 30px !important;">
                    </div>
                    <div class="post post-user">${message + tsValue}</div>
                  </div>`;

        $('#message-board').append(html);
        $("#message").empty();
        $('#message-board').scrollTop($('#message-board')[0].scrollHeight);
    }


    // ================= TIMESTAMP =================
    function newtimeStamp() {

        var now = new Date();
        var hours = now.getHours().toString().padStart(2, '0');
        var minutes = now.getMinutes().toString().padStart(2, '0');
        var seconds = now.getSeconds().toString().padStart(2, '0');

        return `<span class="timestamp"><span class="tsopacity">${hours}:${minutes}:${seconds}</span></span>`;
    }
