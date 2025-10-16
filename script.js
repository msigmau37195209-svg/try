//import * as THREE from "three";
//import { DeviceOrientationControls } from "three/examples/jsm/controls/DeviceOrientationControls";

let w;
let h;
let canvas;
let scene;
let camera;
let renderer;
let object;
let controls;

let deviceOrienModal = null;
let deviceOrienModalButton = null;

let video = null;
let videoStream = null;

const initVideo = () => {
  video = document.getElementById("camera");
  video.addEventListener("loadedmetadata", adjustVideo);
  getVideo();
};

const setVideo = () => {
  return {
    audio: false,
    video: {
      facingMode: "environment",
      width: { min: 1280, max: 1920 },
      height: { min: 720, max: 1080 },
    },
  };
};

const getVideo = () => {
  if (videoStream) {
    videoStream.getTracks().forEach((track) => track.stop());
  }
  navigator.mediaDevices
    .getUserMedia(setVideo())
    .then(function (stream) {
      video.srcObject = stream;
      video.play();
      videoStream = stream;
    })
    .catch(function (error) {
      console.log(error);
      alert(
        "カメラの使用が拒否されています。\nページを再読み込みして使用を許可するか、ブラウザの設定をご確認ください。"
      );
    });
};

const adjustVideo = () => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;

  // 修正箇所：型アノテーションを削除
  let videoAspect = videoWidth / videoHeight;
  let windowAspect = windowWidth / windowHeight;

  if (windowAspect < videoAspect) {
    let newWidth = videoAspect * windowHeight;
    video.style.width = newWidth + "px";
    video.style.marginLeft = -(newWidth - windowWidth) / 2 + "px";
    video.style.height = windowHeight + "px";
    video.style.marginTop = "0px";
  } else {
    let newHeight = 1 / (videoAspect / windowWidth);
    video.style.height = newHeight + "px";
    video.style.marginTop = -(newHeight - windowHeight) / 2 + "px";
    video.style.width = windowWidth + "px";
    video.style.marginLeft = "0px";
  }
};

const isIos = () => {
  const ua = navigator.userAgent.toLowerCase();
  return (
    ua.indexOf("iphone") >= 0 ||
    ua.indexOf("ipad") >= 0 ||
    ua.indexOf("ipod") >= 0
  );
};

const checkDeviceOrien = () => {
  return new Promise((resolve, reject) => {
    if (!isIos()) resolve("resolve");

    const deviceOrienEvent = () => {
      hideDeviceOrienModal();
      window.removeEventListener("deviceorientation", deviceOrienEvent, false);
      resolve("resolve");
    };
    window.addEventListener("deviceorientation", deviceOrienEvent, false);

    deviceOrienModal = document.getElementById("device-orien-modal");
    deviceOrienModalButton = document.getElementById(
      "device-orien-modal-button"
    );
    const alertMessage =
      "モーションセンサーの使用が拒否されました。\nこのページを楽しむには、デバイスモーションセンサーの使用を許可する必要があります。\nSafariのアプリを再起動して、モーションセンサーの使用（「動作と方向」へのアクセス）を許可をしてください。";
    deviceOrienModal.classList.remove("is-hidden");

    deviceOrienModalButton.addEventListener("click", () => {
      // 修正箇所：`as any`を削除し、純粋なJavaScript構文に修正
      if (
        DeviceMotionEvent &&
        DeviceMotionEvent.requestPermission &&
        typeof DeviceMotionEvent.requestPermission === "function"
      ) {
        DeviceMotionEvent.requestPermission().then((res) => {});
      }
      if (
        DeviceOrientationEvent &&
        DeviceOrientationEvent.requestPermission &&
        typeof DeviceOrientationEvent.requestPermission === "function"
      ) {
        DeviceOrientationEvent.requestPermission().then((res) => {
          console.log(res);
          if (res === "granted") {
            hideDeviceOrienModal();
            resolve("resolve");
          } else {
            alert(alertMessage);
            reject("resolve");
          }
        });
      } else {
        alert(alertMessage);
        reject("resolve");
      }
    });
  });
};

const hideDeviceOrienModal = () => {
  deviceOrienModal.classList.add("is-hidden");
};

const initThree = () => {
  w = window.innerWidth;
  h = window.innerHeight;
  canvas = document.getElementById("canvas");
  setScene();
  setCamera();
  setObject();
  setRenderer();
  controls = new DeviceOrientationControls(camera, true);
};

const setScene = () => {
  scene = new THREE.Scene();
};

const setCamera = () => {
  camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 30);
  camera.position.set(0, 0, 5);
  camera.lookAt(0, 0, 0);
  scene.add(camera);
};

const setObject = () => {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshNormalMaterial();
  object = new THREE.Mesh(geometry, material);
  object.position.set(0, 0, 0);
  scene.add(object);
};

const setRenderer = () => {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    canvas: canvas,
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(w, h);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setAnimationLoop(() => {
    render();
  });
};

const render = () => {
  object.rotation.x += 0.01;
  object.rotation.y += 0.01;
  controls.update();
  renderer.render(scene, camera);
};

window.onload = () => {
  checkDeviceOrien()
    .then(() => {
      initThree();
      initVideo();
    })
    .catch((error) => {
      console.log(error);
    });
};
