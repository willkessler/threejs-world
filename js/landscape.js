;// TODO:
// X semiopaque water
// X snow and dirt
// generate more landscape
// move landscape, not camera
// make camera track landscape up and down
// make Udacity track landscape up and down
// clouds
// sun set/rise
// bring in some udacity data
// whales
// boats
// trees

// https://www.awwwards.com/creating-3d-cube-a-practical-guide-to-three-js-with-live-demo.html
var bacon = () => {
  url = 'https://baconipsum.com/api/?type=all-meat&paras=1&start-with-lorem=1&format=html';
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

var makeText = (text) => {
  var loader = new THREE.FontLoader();

  loader.load( 'fonts/optimer_bold.typeface.json', function ( font ) {

    var geometry = new THREE.TextGeometry( text, {
      font: font,
      size: 10,
      height: 1,
      curveSegments: 10
    } );
    geometry.computeBoundingBox();
    geometry.computeVertexNormals();

    var material = new THREE.MeshPhongMaterial({color: 0xffffff, flatShading:true});
    var wordMesh = new THREE.Mesh(geometry, material);
    wordMesh.z = 2000;
    wordMesh.y = 40;
    scene.add(wordMesh);

  } );

}

var simplex = new SimplexNoise();
var scene = new THREE.Scene();
scene.fog = new THREE.FogExp2( 0xffffff, 0.0075 );

//var pointLight = new THREE.PointLight( 0xffff00, 1000 );
//pointLight.position.set( 0, 0, 1000 );
//scene.add( pointLight );

var ambientLight = new THREE.AmbientLight(0xffff00,0.25);
//scene.add(ambientLight);
light = new THREE.DirectionalLight( 0xffffff );
light.position.set( 400, 400, 400 );
scene.add( light );


var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 10000);
var renderer = new THREE.WebGLRenderer({alpha:true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1)
document.body.appendChild(renderer.domElement);

//var geometry = new THREE.BoxGeometry(700, 700, 700, 10, 10, 10);
var width = 800;
var height = 800;
var resolution = 250;

var width = 500;
var height = width;
var resolution = 250;
var geometry = new THREE.PlaneGeometry(width, height, resolution, resolution);
var vertices = geometry.vertices;
let e,j,power;
let maxY = -1.0e-5;
let minY = 1.0e+5;
const noiseDepth = 20;
const exponent = 2;
for (let i in vertices) {
  vertices[i].z = vertices[i].y;
  var nx = (vertices[i].x + width/2)  / width ;
  var ny = (vertices[i].z + height/2) / height ;
  //console.log('nx,ny:', nx,ny);
  e = 0;
  for (j = 0; j < noiseDepth; ++j) {
    power = Math.pow(2, j);
    e += 1/power * simplex.noise2D(power * nx, power * ny);
  }
  vertices[i].y = 25 * Math.pow(e, exponent);
  maxY = (maxY < vertices[i].y ? vertices[i].y : maxY);
  minY = (minY > vertices[i].y ? vertices[i].y : minY);
}
const yRange = maxY - minY;
const snowRange = yRange / 8;
const beachRange = yRange / 25;

const snow = 0xeeeeff;
const sienna = 0xA0522D;
const beach = 0xffff00;
const grass = 0x00dd00;

let vertex;
for (let faceId in geometry.faces) {
  vertex = geometry.vertices[geometry.faces[faceId].a];
  if (vertex.y > maxY - snowRange) {
    geometry.faces[faceId].color.setHex(snow);
  } else if (vertex.y < minY + beachRange) {
    geometry.faces[faceId].color.setHex(beach);
  } else {
    geometry.faces[faceId].color.setHex(grass);
  }
}
var material = new THREE.MeshLambertMaterial({side: THREE.DoubleSide, vertexColors: THREE.FaceColors });
var ground = new THREE.Mesh(geometry, material);
ground.material.shading = THREE.SmoothShading;
geometry.computeVertexNormals();

ground.geometry.colorsNeedUpdate = true;

var oceanGeometry = new THREE.PlaneGeometry(width,height,1,1);
var vertices = oceanGeometry.vertices;
for (let i in vertices) {
  vertices[i].z = vertices[i].y;
  vertices[i].y = 1;
}

oceanMaterial = new THREE.MeshBasicMaterial({color: 0x1155dd, side: THREE.DoubleSide, transparent: true, opacity: 0.7});
var ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);

var group = new THREE.Group();
group.add(ground);
group.add(ocean);
scene.add(group);

camera.position.z = 75;
camera.position.y = 10;
var cam_posy = -0.5;
var cam_zrot = -0.0015;
function render() {
  requestAnimationFrame(render);
//  camera.position.y += cam_posy;
  cam_posy = (camera.position.y < 5 ? -cam_posy : cam_posy);
  cam_posy = (camera.position.y > 10 ? -cam_posy : cam_posy);
  cam_posy = (Math.abs(camera.position.y) > 0.2 ? -cam_zrot: cam_zrot);
//  camera.position.z += -0.05;
//  camera.position.y += 0.08;
//  camera.rotation.z += cam_zrot;
//  cam_zrot = (Math.abs(camera.rotation.z) > 0.2 ? -cam_zrot: cam_zrot);
//  if (camera.position.z % 50 === 0) {
//    plane.position.z -= 100;
//  }
  //cube.rotation.x += 0.01;
  //  cube.rotation.y += 0.01;
  //  cube.scale.x += 0.002;
  //  cube.scale.y -= 0.005;
  renderer.render(scene, camera);
};
render();

// bacon();
makeText('Udacity');
