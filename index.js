var sipStack;
var registerSession;
var sipStack;
var registerSession;

function callEvent() {
  callSession = sipStack.newSession("call-audiovideo", {
    audio_remote: document.getElementById("audio-remote"),
    events_listener: { events: "*", listener: eventsListener }
  });
  callSession.call(document.getElementById("extension").value);

  document.getElementById("call").disabled = true;
  document.getElementById("hangup").disabled = false;
}

function hangupEvent() {
  document.getElementById("hangup").disabled = true;
  document.getElementById("call").disabled = false;
}

var acceptCall = function(e) {
  e.newSession.accept(); // e.newSession.reject() to reject the call
};

var eventsListener = function(e) {
  console.info("session event = " + e.type);
  if (e.type == "started") {
    login();
  } else if (e.type == "i_new_call") {
    // incoming audio/video call
    acceptCall(e);
  } else if (e.type == "connected" && e.session == registerSession) {
    callEvent();
  }
};

function connect() {
  sipStack = new SIPml.Stack({
    realm: "172.16.16.45", // mandatory: domain name
    impi: "sipML5", // mandatory: authorization name (IMS Private Identity)
    impu: "sip:sipML5@172.16.16.45:8089", // mandatory: valid SIP Uri (IMS Public Identity)
    password: "test123", // optional
    display_name: "sk", // optional
    events_listener: { events: "*", listener: eventsListener },
    sip_headers: [
      { name: "User-Agent", value: "IM-client/OMA1.0 sipML5-v1.0.0.0" },
      { name: "Organization", value: "Doubango Telecom" }
    ]
  });
  sipStack.start();
}

var login = function() {
  registerSession = sipStack.newSession("register", {
    events_listener: { events: "*", listener: eventsListener }
  });
  registerSession.register();
};
