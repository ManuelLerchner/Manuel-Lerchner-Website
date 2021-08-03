//////////////////////////
///////Input Forms///////
////////////////////////

//Relay Form
var Register_Form = document.getElementById("register_contact");
var Register_Name = document.getElementById("name_register");
var Register_Email = document.getElementById("email_register");
var Register_Password1 = document.getElementById("password_register1");
var Register_Password2 = document.getElementById("password_register2");

//////////////////////////
///////Resonses//////////
////////////////////////

var Register_ResponseMobile = document.getElementById(
    "registerResponse_mobile"
);
var Register_ResponsePC = document.getElementById("registerResponse_pc");

//////////////////////////
///////Events////////////
////////////////////////

//Form Event
Register_Form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (
        Register_Name.value &&
        Register_Email.value &&
        Register_Password1.value &&
        Register_Password2.value
    ) {
        data = {
            username: Register_Name.value,
            email: Register_Email.value,
            password1: Register_Password1.value,
            password2: Register_Password2.value
        };

        socket.emit("register form", data);

        Register_Name.value = "";
        Register_Email.value = "";
        Register_Password1.value = "";
        Register_Password2.value = "";

        document
            .querySelector("label[for=" + Register_Name.id + "]")
            .classList.remove("active");
        document
            .querySelector("label[for=" + Register_Email.id + "]")
            .classList.remove("active");
        document
            .querySelector("label[for=" + Register_Password1.id + "]")
            .classList.remove("active");
        document
            .querySelector("label[for=" + Register_Password2.id + "]")
            .classList.remove("active");

        Register_Name.classList.remove("valid");
        Register_Email.classList.remove("valid");
        Register_Password1.classList.remove("valid");
        Register_Password2.classList.remove("valid");
    }
});

//////////////////////////
///////Updates///////////
////////////////////////

// Registration Event Response
socket.on("registration-event-response", (response) => {
    console.log(response);
    Register_ResponsePC.innerHTML = response;
    Register_ResponsePC.classList.remove("hidden");

    Register_ResponseMobile.innerHTML = response;
    Register_ResponseMobile.classList.remove("hidden");
});
