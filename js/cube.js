// https://www.awwwards.com/creating-3d-cube-a-practical-guide-to-three-js-with-live-demo.html
var bacon = () => {
  url = 'https://baconipsum1.com/api/?type=all-meat&paras=1&start-with-lorem=1&format=html';
  fetch(url, { credentials: 'include' }).then(function(response) {
    if (!response.ok) {
      throw Error(response.statusText);
    } 
    return response.text();
  }).then(function(lorem) {
    headline.innerHTML = lorem;
  }).catch(function(error) {;
    const headline = document.getElementById('headline');
    headline.innerHTML = error;
  });
}


var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 10000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
//var geometry = new THREE.BoxGeometry(700, 700, 700, 10, 10, 10);
var geometry = new THREE.BoxGeometry(1000, 1, 100, 25, 1, 25);
var material = new THREE.MeshBasicMaterial({color: 0xfffff, wireframe: true});
var cube = new THREE.Mesh(geometry, material);
cube.rotation.x = 0.1;
scene.add(cube);
camera.position.z = 75;     
camera.position.y = 15;
function render() {
  requestAnimationFrame(render);
  camera.position.y -= 0.01;
  camera.position.z += -0.1;
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  cube.scale.x += 0.002;
  cube.scale.y -= 0.005;
  renderer.render(scene, camera);
};
render();

bacon();
