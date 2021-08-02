//////////////////////////
///////Input Forms///////
////////////////////////

//Relay Form
var Relay_Form = document.getElementById("form_relay");
var Relay_Firstname = document.getElementById("first_name_relay");
var Relay_Password = document.getElementById("password_relay");

//PC Form
var PC_Form = document.getElementById("form_pc");
var PC_Firstname = document.getElementById("first_name_pc");
var PC_Password = document.getElementById("password_pc");

//////////////////////////
///////Current States////
////////////////////////

//PC State
var PC_StateMobile = document.getElementById("relayState_mobile");
var PC_StatePC = document.getElementById("relayState_pc");

//RelayState
var Relay_StateMobile = document.getElementById("pcState_mobile");
var Relay_StatePC = document.getElementById("pcState_pc");

//////////////////////////
///////Events////////////
////////////////////////

//Relay Form Event
Relay_Form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (Relay_Firstname.value && Relay_Password.value) {
        data = {
            username: Relay_Firstname.value,
            password: Relay_Password.value
        };
        socket.emit("relay authentification", data);

        Relay_Firstname.value = "";
        Relay_Password.value = "";
    }
});

//PC Form Event
PC_Form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (PC_Firstname.value && PC_Password.value) {
        data = {
            username: PC_Firstname.value,
            password: PC_Password.value
        };
        socket.emit("pc authentification", data);

        PC_Firstname.value = "";
        PC_Password.value = "";
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
    PC_StateMobile.innerHTML = state;
    PC_StatePC.innerHTML = state;
});

// PC State Update
socket.on("pc_state-update", (pcOn) => {
    state = pcOn
        ? "<span style='color: green;'>Current State: ON</span>"
        : "<span style='color: red;'>Current State: OFF</span>";
    Relay_StateMobile.innerHTML = state;
    Relay_StatePC.innerHTML = state;
});
