const url = "http://127.0.0.1:5000";
const port = "";
const tag = "funny";
const count = 25;
let index = 0;
let offset = 1;
let urls = [];
let swipeAllowed = true;

const peer = new peerjs.Peer();
peer.on('open', (id) => {
  document.getElementById("cliqueId").innerText = id;
});
let connection;

peer.on('connection', (connection) => {
  connection.on('data', (data) => {
    if (null != data.urls) {
      urls = data.urls;
      index = 0;
    }
    if (null != data.index) {
      index = data.index;
    }
    if (null != data.spin) {
      if (data.spin === "true") {
        setLoading(true);
      } else {
        setLoading(false);
      }
    }
    replaceContent(url + "/videos/" + urls[index]);
  });
});

function replaceContent(newUrl) {
  const video = document.querySelector("video");
  video.pause();
  video.setAttribute('src', newUrl);
  video.play();
}

function setLoading(status) {
  if (status) {
    swipeAllowed = false;
    document.getElementsByClassName("spinner--container")[0].style.display = "inline";
  } else {
    swipeAllowed = true;
    document.getElementsByClassName("spinner--container")[0].style.display = "none";
  }
}

function initialization() {
  offset = 1;
  getVideos();
}

function next() {
  index += 1;
  if (index > 25) {
    index = 0;
    offset += 25;
    deleteVideos().then(() => {
      getVideos();
    }).catch(() => {
      setLoading(false);
      connection?.send({spin: "false"});
    });
  }
  replaceContent(url + "/videos/" + urls[index]);
  if (null != connection) {
    connection?.send({index: index});
  }
}

function previous() {
  index -= 1;
  if (index < 0) {
    offset -= 25;
    index = 24;
    deleteVideos().then(() => {
      getVideos();
    }).catch(() => {
      setLoading(false);
      connection?.send({spin: "false"});
    });
  }
  replaceContent(url + "/videos/" + urls[index]);
  connection?.send({index: index});
}

function deleteVideos() {
  setLoading(true);
  connection?.send({spin: "true"});
  return fetch(url + port + "/api/v1/videos", {
    method: 'DELETE'
  });
}

function getVideos() {
  setLoading(true);
  connection?.send({spin: "true"});
  fetch(url + port + "/api/v1/videos?tag=" + tag + "&count=" + count + "&offset=" + offset)
    .then(res => {
      res.json().then(body => {
        replaceContent(url + "/videos/" + body.urls[0]);
        urls = body.urls;
        setLoading(false);
        connection?.send({urls: body.urls, spin: "false"});
      }).catch(() => {
        setLoading(false);
        connection?.send({spin: "false"});
      });
    }).catch(() => {
    setLoading(false);
    connection?.send({spin: "false"});

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
  if (swipeAllowed) {
    next();
  }
});

document.addEventListener('swiped-down', () => {
  if (swipeAllowed) {
    previous();
  }
});


initialization();
