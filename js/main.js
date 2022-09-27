const url = "http://127.0.0.1:5000";
const tag = "funny";
const count = 1;
let offset = 0;
const peer = new peerjs.Peer();
peer.on('open', (id) => {
  document.getElementById("cliqueId").innerText = "Your Clique ID is: " + id;
});
let connection;

peer.on('connection', (connection) => {
  connection.on('data', (data) => {
    replaceContent(data.url);
  });
});

function replaceContent(url) {
  const video = document.querySelector("video");
  video.pause();
  video.setAttribute('src', url);
  video.play();
}

function initialization() {
  offset = 0;
  getVideos();
}

function next() {
  offset += 1;
  deleteVideos().then(() => {
    getVideos();
  });
}

function previous() {
  offset -= 1;
  deleteVideos().then(() => {
    getVideos();
  });
}

function deleteVideos() {
  return fetch("http://127.0.0.1:5000/api/v1/videos?tag=" + tag + "&count=" + count + "&offset=" + offset, {
    method: 'DELETE'
  });
}

function getVideos() {
  fetch(url + "/api/v1/videos?tag=" + tag + "&count=" + count + "&offset=" + offset)
    .then(res => {
      res.json().then(body => {
        replaceContent(url + "/videos/" + body.urls[0]);
        if (null != connection) {
          connection.send({url: url + "/videos/" + body.urls[0]});
        }
      });
    });
}

function establishPeerConnection(id) {
  connection = peer.connect(id);
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


initialization();
