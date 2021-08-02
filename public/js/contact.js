//////////////////////////
///////Input Forms///////
////////////////////////

//Relay Form
var Contact_Form = document.getElementById("form_contact");
var Contact_Name = document.getElementById("name_contact");
var Contact_Email = document.getElementById("email_contact");
var Contact_Message = document.getElementById("message_contact");

//////////////////////////
///////Current States////
////////////////////////

//////////////////////////
///////Events////////////
////////////////////////

//Form Event
Contact_Form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (Contact_Name.value && Contact_Email.value && Contact_Message.value) {
        data = {
            username: Contact_Name.value,
            email: Contact_Email.value,
            message: Contact_Message.value
        };

        socket.emit("contact form", data);

        Contact_Name.value = "";
        Contact_Email.value = "";
        Contact_Message.value = "";
    }
});

//////////////////////////
///////Updates///////////
////////////////////////

// Relay State Update
socket.on("relay_state-update", (relayOn) => {
    state = relayOn
        ? "<span style='color: green;'>Current State: ON</span>"
        : "<span style='color: red;'>Current State: OFF</span>";
});

// PC State Update
socket.on("pc_state-update", (pcOn) => {
    state = pcOn
        ? "<span style='color: green;'>Current State: ON</span>"
        : "<span style='color: red;'>Current State: OFF</span>";
});
