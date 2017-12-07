;// TODO:
// X semiopaque water
// X snow and dirt
// generate more landscape. generate a really huge noise array but not giant geography. add new geography as you move through the noise array. 
// alternatively, generate a floodplain between geographies somehow by stitching the landscape down to zero between them. then the new geo has to grow from zero as well.
// can we tamp down the front part of any landscape somehow?
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
var getLorem = () => {
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

var makeText = (text, group) => {
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

    var material = new THREE.MeshPhongMaterial({color: 0xfff800, flatShading:true});
    var wordMesh = new THREE.Mesh(geometry, material);
    wordMesh.z = 2000;
    wordMesh.y = 40;
    group.add(wordMesh);

  } );

}

var createWorld = (options) => {
  const width = options.width || 200;
  const height = options.height || 200;
  const resolution = options.resolution || 125;
  geometry = new THREE.PlaneGeometry(width, height, resolution, resolution);
  var vertices = geometry.vertices;
  let e,j,power;
  let maxY = -1.0e-5;
  let minY = 1.0e+5;
  const noiseDepth = 20;
  const exponent = 2;
  for (let i in vertices) {
    vertices[i].z = vertices[i].y;
    var nx = (vertices[i].x + width/2)  / options.width ;
    var ny = (vertices[i].z + height/2) / options.height ;
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
  const material = new THREE.MeshLambertMaterial({side: THREE.DoubleSide, vertexColors: THREE.FaceColors });
  const ground = new THREE.Mesh(geometry, material);
  geometry.computeVertexNormals();
  ground.geometry.colorsNeedUpdate = true;

  const oceanGeometry = new THREE.PlaneGeometry(width,height,1,1);
  const oceanVertices = oceanGeometry.vertices;
  for (let i in oceanVertices) {
    oceanVertices[i].z = oceanVertices[i].y;
    oceanVertices[i].y = 1;
  }

  // https://stackoverflow.com/questions/44749446/enable-smooth-shading-with-three-js
  // https://stackoverflow.com/questions/15994944/transparent-objects-in-threejs
  oceanMaterial = new THREE.MeshBasicMaterial({color: 0x1155dd, side: THREE.DoubleSide, transparent: true, opacity: 0.7});
  const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);

  options.group.add(ground);
  options.group.add(ocean);
  makeText('Udacity', options.group);
  options.scene.add(options.group);

  return ({
    ground: ground,
    ocean: ocean
  });
    
};

function render() {
  requestAnimationFrame(render);
  //  camera.position.y += cam_posy;
  cam_posy = (camera.position.y < 5 ? -cam_posy : cam_posy);
  cam_posy = (camera.position.y > 10 ? -cam_posy : cam_posy);
  cam_posy = (Math.abs(camera.position.y) > 0.2 ? -cam_zrot: cam_zrot);

  group.position.z += 0.05;
  //  console.log('Group Z:', group.position.z);
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

// Simplex noise:
// https://codepen.io/jwagner/pen/BNmpdm?editors=1011

var simplex = new SimplexNoise();
var scene = new THREE.Scene();
scene.fog = new THREE.FogExp2( 0xffffff, 0.0075 );

var group = new THREE.Group();

//var pointLight = new THREE.PointLight( 0xffff00, 1000 );
//pointLight.position.set( 0, 0, 1000 );
//scene.add( pointLight );

var ambientLight = new THREE.AmbientLight(0xffff00,0.25);
//scene.add(ambientLight);
light = new THREE.DirectionalLight( 0xffffff );
light.position.set( 400, 400, 400 );
scene.add( light );

console.log('Beginning world build.');
const startTime = new Date().getTime();
const width = 200;
const height = width;
const resolution = 125;
const scenery = 
  createWorld({
    width: width,
    height: height,
    resolution: resolution,
    scene:scene,
    group:group
  });
const endTime = new Date().getTime();
console.log('World built in:', (endTime - startTime)/1000, 'seconds');


var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 10000);
var renderer = new THREE.WebGLRenderer({alpha:true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1)
document.body.appendChild(renderer.domElement);


camera.position.z = height/4;
camera.position.y = 10;
let cam_posy = -0.5;
const cam_zrot = -0.0015;
const squareSize = width / resolution;
const numSquares = width / squareSize;
midSquare = Math.floor(resolution / 2);
console.log('numSquares:', numSquares, 'midSquare:', midSquare);
let camYMax = scenery.ground.geometry.vertices[midSquare].y;
console.log('yMax:', camYMax);

render();
getLorem();
