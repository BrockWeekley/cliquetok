const url = "http://127.0.0.1:5001";
const port = "";
let tag = "comedy";
let index = 0;
let urls = [];
let swipeAllowed = true;

let existingId = localStorage.getItem('peerjs-id');
if (existingId === "") {
  existingId = null;
}

let connection;
let peer = createNewPeerInstance();

peer.on('open', (id) => {
  document.getElementById("cliqueId").value = id;
  if (id !== existingId) {
    localStorage.setItem('peerjs-id', id);
    existingId = id;
  }
});

peer.on('error', () => {
  setLoading(true);
  setConnection(false);
  peer = createNewPeerInstance();
  peer.on('open', (id) => {
    document.getElementById("cliqueId").value = id;
    setLoading(false);
  });
});

peer.on('connection', (connection) => {
  connection.on('data', (data) => {
    if (null != data.index) {
      index = data.index;
    }
    if (null != data.urls) {
      urls = data.urls;
      replaceContent(urls[index]);
    }
    if (null != data.user) {
      setConnection(true, data.user);
    }
    if (null != data.spin) {
      if (data.spin === "true") {
        setLoading(true);
      } else {
        setLoading(false);
      }
    }
    replaceContent(urls[index]);
  });
});

function createNewPeerInstance() {
  return new peerjs.Peer(existingId, {
    debug: 3,
    config: { 'iceServers': [
        { 'url': 'stun:stun.l.google.com:19302' }
      ] }
  });
}

function replaceContent(newUrl) {
  const video = document.querySelector("video");
  video.pause();
  video.setAttribute('src', newUrl);
  video.play();
}

function setLoading(status) {
  const spinner = document.getElementsByClassName("spinner--container")[0];
  if (status) {
    swipeAllowed = false;
    spinner.style.display = "inline";
  } else {
    swipeAllowed = true;
    spinner.style.display = "none";
  }
}

function next() {
  index += 1;
  if (index > 5) {
    getVideos();
  }
  replaceContent(urls[index]);
  connection?.send({index: index});
}

function previous() {
  index -= 1;
  if (index < 1) {
    getVideos();
  }
  replaceContent(urls[index]);
  connection?.send({index: index});
}

function getVideos() {
  setLoading(true);
  connection?.send({spin: "true"});
  index = 0;
  fetch(url + port + "/api/v2/getVideos?tag=" + tag)
    .then(res => res.json())
      .then(body => {
        replaceContent(body.urls[0]);
        urls = body.urls;
        setLoading(false);
        connection?.send({urls: body.urls, spin: "false"});
      })
      .catch(() => {
        setLoading(false);
        connection?.send({spin: "false"});
      });
}

function copyId() {
  const copyText = document.getElementById("cliqueId");
  copyText.select();
  copyText.setSelectionRange(0, 99999); // For mobile devices

  navigator.clipboard.writeText(copyText.value);
}

function setModal(open) {
  if (open) {
    document.getElementById("modal--container").style.display = "flex";
    document.getElementById("modalOpener").style.display = "none";
  } else {
    document.getElementById("modal--container").style.display = "none";
    document.getElementById("modalOpener").style.display = "flex";
  }
}

function setConnection(status, user) {
  const connected = document.getElementById("connected");
  const disconnected = document.getElementById("disconnected");
  const userFound = document.getElementById("connectedUser");
  if (status) {
    connected.style.display = "inline";
    disconnected.style.display = "none";
    if (user != null && user !== "") {
      userFound.innerText = user;
    } else {
      userFound.innerText = "Connected";
    }
  } else {
    connected.style.display = "none";
    disconnected.style.display = "inline";
    userFound.innerText = "No Connection";
  }
}

let peerOptions = {};

peerOptions.serialization = "json";

function establishPeerConnection() {
  const id = document.getElementById("idInput").value;
  connection = peer.connect(id, peerOptions);
  setModal(false);
  connection?.on("open", () => {
    connection.send({urls: urls, user: document.getElementById("userInput").value, index: index});
  });
}

function disablePeerConnection() {
  connection?.close();
  localStorage.setItem("peerjs-id", null);
  peer = createNewPeerInstance();
  setConnection(false);
}

const peerInput = document.getElementById("idInput");
peerInput.onkeypress = (input) => {
  if (input.key === "Enter") {
    establishPeerConnection();
  }
};

document.addEventListener('swiped-up', () => {
  if (swipeAllowed) {
    next();
  }
});

document.addEventListener('swiped-down', () => {
  if (swipeAllowed) {
    previous();
  }
});


function initialization() {
  getVideos();
}

initialization();
