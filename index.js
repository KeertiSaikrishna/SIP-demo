var sipStack;
var registerSession, callSession;
var oConfigCall;

function callEvent() {
  oConfigCall = {
    audio_remote: document.getElementById("audio-remote"),
    screencast_window_id: 0x00000000,
    bandwidth: { audio: undefined, video: undefined },
    events_listener: { events: "*", listener: eventSession },
    sip_caps: [
      { name: "+g.oma.sip-im" },
      { name: "language", value: '"en,fr"' }
    ]
  };
  if (
    sipStack &&
    !callSession && 
    !tsk_string_is_null_or_empty(document.getElementById("extension").value)
  ) {
    document.getElementById("call").disabled = true;
    document.getElementById("hangup").disabled = false;
    callSession = sipStack.newSession("call-audio", oConfigCall);
    // make call
    if (callSession.call(document.getElementById("extension").value) != 0) {
      callSession = null;
      document.getElementById("showCallStatus") = "Failed to make call";
      document.getElementById("call").disabled = false;
      document.getElementById("hangup").disabled = true;
      return;
    }
    document.getElementById("showCallStatus").innerHTML = "In Call";
  } else if (callSession) {
    document.getElementById("showCallStatus").innerHTML = "In Call";
    document.getElementById("call").disabled = true;
    callSession.accept(oConfigCall);
  }
}

function hangUpEvent() {
  try {
  if (callSession) {
    callSession.hangup({
      events_listener: { events: "*", listener: eventSession }
    });
  }
  document.getElementById("hangup").disabled = true;
  document.getElementById("call").disabled = false;
  }
  catch(e){
    console.log("call cancelled");
    window.location.reload();
  }
}

var eventsListener = function(e) {
  console.info("stack event = " + e.type);
  console.info("stack description = " + e.description);

  if (e.type == "started") {
    login();
  } else if (e.type == "i_new_call") {
    // incoming audio call
    if (callSession) {
      // do not accept the incoming call if we're already 'in call'
      e.newSession.hangup(); 
    }
    else {
      callSession = e.newSession;
      // start listening for events
      callSession.setConfiguration(
      audio_remote = document.getElementById("audio-remote"),
      screencast_window_id =  0x00000000,
      bandwidth = { audio: undefined, video: undefined },
      events_listener = { events: "*", listener: eventSession },
      sip_caps = [
        { name: "+g.oma.sip-im" },
        { name: "language", value: '"en,fr"' }
      ]);
      document.getElementById("call").innerHTML = "Answer";
      document.getElementById("hangup").disabled = false;
      document.getElementById("showCallStatus").innerHTML = "Incoming Call";
    }
  } else if(e.description == "Failed to connet to the server") {
    document.getElementById("showConnectionStatus").innerHTML = e.description;
  }
};

var eventSession = function(e) {
  console.info("session event = " + e.type);
  console.log("session description = " + e.description);
  if(e.description == "Forbidden") {
    document.getElementById("showConnectionStatus").innerHTML =
      "Forbidden (Incorrect password)";
  } else if (
    e.description == "Call terminated" ||
    e.description == "Request Terminated" ||
    e.description == "Call Rejected"
  ) {
    callSession = null;
    registerSession = null;
    document.getElementById("showCallStatus").innerHTML = "";
    document.getElementById("hangup").disabled = true;
    document.getElementById("call").disabled = false;
    document.getElementById("call").innerHTML = "Call";

  } else if (e.description == "Busy Here" ){
    document.getElementById("showCallStatus").innerHTML = "User Busy";
    callSession = null;
    registerSession = null;
    document.getElementById("hangup").disabled = true;
    document.getElementById("call").disabled = false;
    document.getElementById("call").innerHTML = "Call";
  }
}

function connect() {
  sipStack = new SIPml.Stack({
    realm: "172.16.16.000", // mandatory: domain name
    impi: "sipML5", // mandatory: authorization name (IMS Private Identity)
    impu: "sip:sipML5@172.16.16.45:8089", // mandatory: valid SIP Uri (IMS Public Identity)
    password: "test123", // optional
    display_name: "sk", // optional
    websocket_proxy_url: "wss://172.16.16.45:8089/ws",
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
    events_listener: { events: "*", listener: eventSession }
  });
  registerSession.register();
};
