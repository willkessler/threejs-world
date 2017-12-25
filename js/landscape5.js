// https://campushippo.com/lessons/how-to-convert-rgb-colors-to-hexadecimal-with-javascript-78219fdb
const startTiming = (msg) => {
  globalTimer = new Date().getTime();
  if (msg) {
    console.log('----------------------------------- start: ', msg, ' --------------------------------------------');
  } else {
    console.log('----------------------------------- start timing --------------------------------------------');
  }
}

const markTime = (msg) => {
  const now = new Date().getTime();
  console.log(msg, ' : ', (now - globalTimer) / 1000, 's');
}

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
  const flyOverResolution = 2;
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
  //const offset = (z * (resolution + 1)) + x;
  const offset = (z * (resolution + 1)) + x;
  //console.log('assign:x,z,offset, val:', x,z,offset,val);
  if (offset < vertices.length) {
    vertices[offset].y = val * multiplier;
  }
}

const updateWorld = () => {
  const theWorld = worlds[worlds.length - 1];
  const width = theWorld.width;
  const depth = theWorld.depth;
  const group = theWorld.group;
  const oceanY = -100;
  const flyBuffer = 9;
  const oceanFlyBuffer = 1;
  let geometry, vertices;
  let maxY = -1.0e-5;
  let minY = 1.0e+5;
  let splineVertices = [];

  startTiming();
  const refreshing = (theWorld.ground.mesh !== undefined);
  console.log('Building terrain.');
  if (refreshing) {
    geometry = theWorld.ground.geometry;
    vertices = geometry.vertices;
  } else {
    geometry = new THREE.PlaneGeometry(width, depth, resolution, resolution);
    vertices = geometry.vertices;
    // Flip the planegeometry so it's flat.
    for (let i=0; i < vertices.length; ++i) {
      vertices[i].z = vertices[i].y;
      vertices[i].y = 0;
    }
  }

  markTime('Initial build');

  let noise, noiseZ;
  for (let z = 0, noiseZ; z <= resolution; ++z) {
    //noiseZ = index * resolution + z + (index > 0 ? -1 : 0);
    noiseZ = maxWorld * resolution + z;
    for (let x = 0; x <= resolution; ++x) {
      noise = genNoise(x + 1,noiseZ, resolution, width, depth, splineVertices);
      //console.log('x, z, noiseZ, noise:', x, z, noiseZ, noise.val);
      if (x === resolution / 2) {
        splineY = Math.max(noise.flyOverVal * multiplier + flyBuffer * (1 + Math.random() / 20), oceanY + oceanFlyBuffer);
        splineVertices.push(new THREE.Vector2(z * depth / resolution, splineY));
        //console.log('pushing onto spline x,flyOverVal:', x, splineY);
      }
      assignValToVertex(vertices, x, z, resolution, noise.val, multiplier);
    }
  }

  markTime('Assigned noise.');

  //geometry.translate(0,(maxWorld === 0 ? 0 : -.1),(maxWorld === 0 ? 0 : -1 * (depth - (depth / resolution))));
  //geometry.translate(0,0,((-1 * depth * maxWorld) + (depth/resolution)));
  let zOffset = 0;
  if ((maxWorld > 0) && (maxWorld < 3)) {
    zOffset = -1 * maxWorld * depth; //  + depth/resolution;
  } else if (maxWorld > 0) {
    zOffset = -3 * depth;
  }
  //console.log('maxWorld, zOffset:', maxWorld, zOffset);
  geometry.translate(0,0,zOffset);
  markTime('Translate');
  geometry.computeFaceNormals();
  markTime('FaceNormals');
  geometry.computeVertexNormals();
  markTime('VertexNormals');
  geometry.elementsNeedUpdate = true;
  const wireColor = (maxWorld === 0 ? '#00ff00' : '#ff0000');
  const material = new THREE.MeshLambertMaterial({side: THREE.DoubleSide, wireframe:false, vertexColors: THREE.FaceColors });
  markTime('Material');
  const groundMesh = new THREE.Mesh(geometry, material);
  markTime('Mesh');

  console.log('Adding spline.');
  const groundSpline = new THREE.SplineCurve(splineVertices);
  markTime('Spline time')

  //console.log(groundSpline.getPoints(10));

  if (theWorld.ground.mesh) {
    group.remove(theWorld.ground.mesh);
  }
  group.add(groundMesh);

  theWorld.ground = {
    geometry: geometry,
    mesh: groundMesh,
    spline: groundSpline
  }

  markTime('Full build time:');

}

const moveCamera = (camZMap) => {
  const camPoint = worlds[0].ground.spline.getPoint(camZMap);
  camera.position.z = cameraStartZ - (((maxWorld - 3) * depth) + camPoint.x);
//  console.log('before jump:', camera.position.y);
  const camDiff = camPoint.y - camera.position.y;
  if (cameraLockedOn) {
    camera.position.y = camPoint.y;
    return;
  } else if (camDiff < 0.001) {
    cameraLockedOn = true;
  }
  camYAccel = camDiff / 10;
  camera.position.y += camYVel;
  camYVel += camYAccel;
  camYVel *= camYDampener;
  console.log('adjusting camera to get on track.');
  //  console.log('after jump, s0, s1, camDiff, y:', worlds[0].ground.spline.getPoint(1),worlds[1].ground.spline.getPoint(0),camDiff, camPoint.y);
}

const advanceWorld = () => {
  if (cameraMotion) {
    if (camZMap < 1 - zMapInc) {
      camZMap += zMapInc;
    } else {
      camZMap = 0;
      cameraLockedOn = false;
      const movedWorld = worlds.shift();
      worlds.push(movedWorld);
      //console.log('geometries:', worlds[0].ground.geometry.vertices,worlds[1].ground.geometry.vertices,worlds[2].ground.geometry.vertices);
      multiplier = Math.max(50, Math.min(10, multiplier * (Math.random() + 0.5)));
      console.log('new multiplier:', multiplier);
      updateWorld();
      //console.log('geometries:', worlds[0].ground.geometry.vertices,worlds[1].ground.geometry.vertices,worlds[2].ground.geometry.vertices);
      maxWorld++;
    }
    moveCamera(camZMap);
  }
}

const render = () => {
  requestAnimationFrame(render);

  advanceWorld();

  renderer.render(scene, camera);
};

const simplex = new SimplexNoise(); // Simplex noise: https://codepen.io/jwagner/pen/BNmpdm?editors=1011
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2( 0xffffff, 0.005 );

const light = new THREE.DirectionalLight( 0xffffff );
light.position.set( 400, 400, 400 );
scene.add( light );

const width = 300;
const depth = width;
const resolution = 100;
const cameraStartZ = 150;

let worlds = [];
let multiplier = 40;
let maxWorld;
let camZMap = 0.5;
let lastYDiff = 0;
let camYVel = 0;
let camYAccel = 0;
let cameraMotion = true;
let cameraLockedOn = false;
const camYDampener = 0.65;
let zMapInc = 0.001;

const group = new THREE.Group();
scene.add(group);

for (maxWorld = 0; maxWorld < 3; ++maxWorld) {
  worlds[maxWorld] = {
    width: width,
    depth: depth,
    scene:scene,
    group:group,
    ground: {}
  }
  updateWorld();
}

var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.5, 10000);
var renderer = new THREE.WebGLRenderer({alpha:true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1)
document.body.appendChild(renderer.domElement);

//camera.position.y = 60;
//camera.position.z = -50;
//camera.rotation.x = -Math.PI / 2;
//camera.position.y = 20;
//camera.position.z = 40;
//camera.rotation.x = -Math.PI /8;

//camera.position.y = worlds[0].ground.spline.getPoint(camZMap).y;
//camera.position.z = cameraStartZ;
moveCamera(camZMap);
//console.log('Initial geometries:', worlds[0].ground.geometry.vertices,worlds[1].ground.geometry.vertices,worlds[2].ground.geometry.vertices);

document.onkeypress = function (e) {
  e = e || window.event;
  // use e.keyCode
  //console.log(e.keyCode);
  if (e.keyCode === 32) {
    cameraMotion = (cameraMotion ? false : true);
  } else if (e.keyCode === 93) {
    camera.position.z -= 5;
  } else if (e.keyCode === 91) {
    camera.position.z += 5;
  };
}

render();
