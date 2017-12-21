// https://campushippo.com/lessons/how-to-convert-rgb-colors-to-hexadecimal-with-javascript-78219fdb
const rgbToHexValue = function (rgb) { 
  var hex = Number(rgb).toString(16);
  if (hex.length < 2) {
    hex = "0" + hex;
  }
  return hex;
};

const genNoise = (x,z, resolution, width, depth, splineVertices) => {
  const noiseDepth = 10;
  const exponent = 2;
  const flyOverResolution = 3;
  let e = 0,power, nx, nz, flyOverVal;
  for (let i = 0; i < noiseDepth; ++i) {
    power = Math.pow(exponent, i);
    nx = ((x * (width / resolution)) + width / 2) / width;
    nz = ((z * (depth / resolution)) + depth / 2) / depth;
    e += 1/power * simplex.noise2D(power * nx, power * nz);
    if (i === flyOverResolution) {
      flyOverVal = e;
    }

  }
  return { 
    val:e, 
    flyOverVal: flyOverVal
  } ;
}

const assignValToVertex = (vertices, x, z, resolution, val, multiplier) => {
  //console.log('x,z,val, multiplier, product:', x, z, val, multiplier, val * multiplier);
  const offset = (z * (resolution + 1)) + x;
  if (offset < vertices.length) {
    vertices[offset].y = val * multiplier;
  }
}

const createWorld = (options) => {
  const width = options.width || 200;
  const depth = options.depth || 200;
  const resolution = options.resolution || 125;
  const oceanY = -10;
  const flyBuffer = 5;
  const oceanFlyBuffer = 1;
  let multiplier = options.multiplier || 25;
  let maxY = -1.0e-5;
  let minY = 1.0e+5;
  let splineVertices = [];

  const veryStartTime = new Date().getTime();
  geometry = new THREE.PlaneGeometry(width, depth, resolution, resolution);
  const vertices = geometry.vertices;
  console.log('Building terrain.');
  const startTime = new Date().getTime();
  // Flip the planegeometry so it's flat.
  for (let i=0; i < vertices.length; ++i) {
    vertices[i].z = vertices[i].y;
  }
  let noise, noiseZ;
  for (let z = 0, noiseZ; z <= resolution; ++z) {
    noiseZ = options.index * resolution + z + (options.index > 0 ? -1 : 0);
    for (let x = 0; x <= resolution; ++x) {
      noise = genNoise(x + 1,noiseZ, resolution, width, depth, splineVertices);
      //console.log('x, z, noiseZ, noiseVal:', x, z, noiseZ, noiseVal);
      if (x === resolution / 2) {
        splineY = Math.max(noise.flyOverVal * multiplier + flyBuffer * (1 + Math.random() / 20), oceanY + oceanFlyBuffer);
        splineVertices.push(new THREE.Vector2(x, splineY));
        console.log('pushing onto spline x,flyOverVal:', x, splineY);
      }
      assignValToVertex(vertices, x, z, resolution, noise.val, multiplier);
    }
  }

  geometry.translate(0,(options.index === 0 ? 0 : -.1),(options.index === 0 ? 0 : -1 * (depth - (depth / resolution))));
  geometry.computeVertexNormals();
  geometry.elementsNeedUpdate = true;
  const wireColor = (options.index === 0 ? '#00ff00' : '#ff0000');
  const material = new THREE.MeshLambertMaterial({side: THREE.DoubleSide, wireframe:false, vertexColors: THREE.FaceColors });
  const ground = new THREE.Mesh(geometry, material);

  let endTime = new Date().getTime();
  let elapsed = (endTime - startTime) / 1000;
  console.log('World tweak time:', elapsed);

  options.group.add(ground);
  options.scene.add(options.group);

  endTime = new Date().getTime();
  elapsed = (endTime - startTime) / 1000;
  elapsed = (endTime - veryStartTime) / 1000;
  console.log('Full build time:', elapsed);
  
  console.log('Adding spline.');
  const groundSpline = new THREE.SplineCurve(splineVertices);
  const curve = groundSpline.getPoints(100);
  console.log('curve:', curve);

  return ({
    width: width,
    depth: depth,
    resolution: resolution,
    ground: ground,
    curve: curve
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

const width = 300;
const depth = 300;
const resolution = 100;
let worlds = [];
let currentWorld = 0;

const group = new THREE.Group();
const multiplier = 50;

worlds[0] = 
  createWorld({
    width: width,
    depth: depth,
    index: 0,
    zOffset: 0,
    multiplier: multiplier,
    resolution: resolution,
    scene:scene,
    group:group
  });


worlds[1] = 
  createWorld({
    width: width,
    depth: depth,
    index: 1,
    zOffset : depth,
    multiplier: multiplier,
    resolution: resolution,
    scene:scene,
    group:group
  });



var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.5, 10000);
var renderer = new THREE.WebGLRenderer({alpha:true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1)
document.body.appendChild(renderer.domElement);

//camera.position.y = 100;
//camera.position.z = 80;
//camera.rotation.x = -Math.PI / 4;

camera.position.y = 20;
camera.position.z = 100;

render(worlds[currentWorld]);
