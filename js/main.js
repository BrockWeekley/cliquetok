const url = "http://127.0.0.1:5001";
let tag = "funny";
let index = 0;
let urls = [];

const peer = new peerjs.Peer();
peer.on('open', (id) => {
  document.getElementById("cliqueId").innerText = id;
});
let connection;

peer.on('connection', (connection) => {
  connection.on('data', (data) => {
    if (null != data.urls) {
      urls = data.urls;
      replaceContent(urls[index]);
    }
  });
});

function replaceContent(foundUrl) {
  const video = document.querySelector("video");
  video.pause();
  video.setAttribute('src', foundUrl);
  video.play();
}

function initialization() {
  getVideos();
}

function next() {
  index += 1;
  if (index > 5) {
    getVideos();
  }
  replaceContent(urls[index]);
  if (null != connection) {
    connection.send({index: index});
  }
}

function previous() {
  index -= 1;
  if (index < 1) {
    getVideos();
  }
  replaceContent(urls[index]);
  if (null != connection) {
    connection.send({index: index});
  }
}

function getVideos() {
  index = 0;
  fetch(url + "/api/v2/getVideos?tag=" + tag)
    .then(res => {
      res.json().then(body => {
        debugger;
        replaceContent(body.urls[0]);
        urls = body.urls;
        if (null != connection) {
          connection.send({urls: body.urls});
        }
      });
    });
}

function checkSafari() {
  let seemsChrome = navigator.userAgent.indexOf("Chrome") > -1;
  let seemsSafari = navigator.userAgent.indexOf("Safari") > -1;
  return seemsSafari && !seemsChrome;
}

let peerOptions = {};

if (checkSafari()) {
  peerOptions.serialization = "json";
}

function establishPeerConnection(id) {
  connection = peer.connect(id, peerOptions);
  document.getElementById("modal--container").style.display = "none";
}

const peerInput = document.querySelector("input");

peerInput.onblur = () => {
  establishPeerConnection(peerInput.value);
};

peerInput.onkeypress = (input) => {
  if (input.key === "Enter") {
    establishPeerConnection(peerInput.value);
  }
};

document.addEventListener('swiped-up', () => {
  next();
});

document.addEventListener('swiped-down', () => {
  previous();
});


initialization();
