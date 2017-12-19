// https://campushippo.com/lessons/how-to-convert-rgb-colors-to-hexadecimal-with-javascript-78219fdb
const rgbToHexValue = function (rgb) { 
  var hex = Number(rgb).toString(16);
  if (hex.length < 2) {
    hex = "0" + hex;
  }
  return hex;
};

const genNoise = (x,z) => {
  const noiseDepth = 10;
  const exponent = 2;
  let e = 0,power;
  for (let i = 0; i < noiseDepth; ++i) {
    power = Math.pow(exponent, i);
    e += 1/power * simplex.noise2D(power * x, power * z);
  }
  return e;
}

const assignValToVertex = (vertices, x, z, resolution, val, multiplier) => {
  console.log('x,z,val, multiplier, product:', x, z, val, multiplier, val * multiplier);
  const offset = z * resolution + x;
  if (offset < vertices.length) {
    vertices[offset].y = val * multiplier;
  }
}

const createWorld = (options) => {
  const width = options.width || 200;
  const depth = options.depth || 200;
  const resolution = options.resolution || 125;
  let multiplier = options.multiplier || 25;
  let maxY = -1.0e-5;
  let minY = 1.0e+5;

  geometry = new THREE.PlaneGeometry(width, depth, resolution, resolution);
  const vertices = geometry.vertices;
  let halfVerticesCount = vertices.length / 2;
  console.log('building terrain');
  // Flip the planegeometry so it's flat.
  for (let i=0; i < vertices.length; ++i) {
    vertices[i].z = vertices[i].y + options.zOffset;
    vertices[i].y = 0;
  }
  let noiseZ;
  for (let z = 0; z <= resolution + 1; ++z) {
    noiseZ = options.index * resolution + z;
    for (let x = 0; x <= resolution + 1; ++x) {
      noiseVal = genNoise(x + 1,noiseZ);
      assignValToVertex(vertices, x, z, resolution, noiseVal, multiplier);
    }
  }

  geometry.elementsNeedUpdate = true;
  const material = new THREE.MeshPhongMaterial({side: THREE.DoubleSide, wireframe:true, vertexColors: THREE.FaceColors });
  const ground = new THREE.Mesh(geometry, material);

  options.group.add(ground);
  options.scene.add(options.group);
  
  return ({
    width: width,
    depth: depth,
    resolution: resolution,
    ground: ground
  });

}

const render = () => {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
};

const simplex = new SimplexNoise(); // Simplex noise: https://codepen.io/jwagner/pen/BNmpdm?editors=1011
const scene = new THREE.Scene();
// scene.fog = new THREE.FogExp2( 0xffffff, 0.01 );

const light = new THREE.DirectionalLight( 0xffffff );
light.position.set( 400, 400, 400 );
scene.add( light );

const width = 200;
const depth = 100 ;
const resolution = 2;
let worlds = [];
let currentWorld = 0;

const group = new THREE.Group();

worlds[0] = 
  createWorld({
    width: width,
    depth: depth,
    index: 0,
    zOffset: 0,
    multiplier: 25,
    resolution: resolution,
    scene:scene,
    group:group
  });


worlds[1] = 
  createWorld({
    width: width,
    depth: depth,
    index: 1,
    zOffset : -1.5 * depth,
    multiplier:25,
    resolution: resolution,
    scene:scene,
    group:group
  });


var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.5, 10000);
var renderer = new THREE.WebGLRenderer({alpha:true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1)
document.body.appendChild(renderer.domElement);

camera.position.y = 40;
camera.position.z = 120;

render(worlds[currentWorld]);
