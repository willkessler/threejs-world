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


var genNoise = (x,z,options) => {
  const noiseDepth = 10;
  const exponent = 2;
  let e = 0,power,nx,ny,depth,totalDepth;
  for (let j = 0; j < noiseDepth; ++j) {
    power = Math.pow(exponent, j);
    totalDepth = (options.depth * options.row) + options.depth;
    nx = x  / options.width;
    nz = z  / totalDepth;
    e += 1/power * simplex.noise2D(power * nx, power * nz);
  }
  return e * options.multiplier;
}

var createWorld2 = (options) => {
  const width = options.width || 200;
  const depth = options.depth || 200;
  const resolution = options.resolution || 125;
  const multiplier = options.multiplier || 25;
  let maxY = -1.0e-5;
  let minY = 1.0e+5;
  let vertex,face;
  let lastWorld, nx, ny, totalDepth;
  geometry = new THREE.PlaneGeometry(width, depth, resolution, 1);
  const vertices = geometry.vertices;
  let halfVerticesCount = vertices.length / 2;
  console.log('building terrain');
  for (let i=0; i < vertices.length; ++i) {
    //console.log('v:', vertices[i]);
    vertices[i].z = vertices[i].y; // flip the planegeometry so it's flat
    vertices[i].y = 0;
    /*
       if (options.row === 0) {
       // first row, all vertices are noisy
       vertices[i].y = genNoise(vertices[i].x, vertices[i].z, options);
       } else {
       if (i < halfVerticesCount) {
       // second row, closer verts match farther verts of first row.
       lastWorld = options.worlds[options.row - 1];
       //console.log(i, lastWorld.ground.geometry.vertices[i + halfVerticesCount - 1].y);
       vertices[i].y = lastWorld.ground.geometry.vertices[i + halfVerticesCount].y;
       } else {
       vertices[i].y = genNoise(vertices[i].x, vertices[i].z, options);
       }
       }
     */
  }

  //console.log('geometry:', geometry.vertices);
  const material = new THREE.MeshPhongMaterial({side: THREE.DoubleSide, wireframe:false, vertexColors: THREE.FaceColors });
  const ground = new THREE.Mesh(geometry, material);
  geometry.computeVertexNormals();
  ground.geometry.colorsNeedUpdate = true;
  ground.position.z = options.zOffset;
  options.group.add(ground);
  //options.scene.add(options.group);
  
  return ({
    width: width,
    depth: depth,
    resolution: resolution,
    ground: ground
  });

}

function render() {
  requestAnimationFrame(render);
  let zMapInc = 0.0009;
  if (camZMap < 1-zMapInc) {
    camZMap += zMapInc;
  } else {
    camZMap = 0;
  }

  //let camPoint = worlds[currentWorld].groundCurve.getPoint(camZMap);
  renderer.render(scene, camera);

};

// Simplex noise:
// https://codepen.io/jwagner/pen/BNmpdm?editors=1011

var simplex = new SimplexNoise();
var scene = new THREE.Scene();
//scene.fog = new THREE.FogExp2( 0xffffff, 0.01 );

var group = new THREE.Group();

var lights = [];
lights[ 0 ] = new THREE.PointLight( 0xffffff, 1, 0 );
lights[ 1 ] = new THREE.PointLight( 0xffffff, 1, 0 );
lights[ 2 ] = new THREE.PointLight( 0xffffff, 1, 0 );

lights[ 0 ].position.set( 0, 200, 0 );
lights[ 1 ].position.set( 100, 200, 100 );
lights[ 2 ].position.set( - 100, - 200, - 100 );

//scene.add( lights[ 0 ] );
//scene.add( lights[ 1 ] );
//scene.add( lights[ 2 ] );

light = new THREE.DirectionalLight( 0xffffff );
light.position.set( 400, 400, 400 );
scene.add( light );

const oceanY = -10;
const flyBuffer = 5;
const oceanFlyBuffer = 1;
const width = 10;
const depth = 10 ;
const resolution = 2;
let centerVertices = [];
let worlds = [];
let currentWorld = 0;

let row = 0;
worlds[row] = 
  createWorld2({
    width: width,
    depth: depth,
    row: row,
    zOffset: -1 * depth * row ,
    multiplier: 45,
    resolution: resolution,
    scene:scene,
    group:group,
    worlds: worlds
  });

row = 1;
worlds[row] = 
  createWorld2({
    width: width,
    depth: depth,
    row: row,
    zOffset: -1 * depth * row ,
    multiplier: 45,
    resolution: resolution,
    scene:scene,
    group:group,
    worlds: worlds
  });

const newGeo = new THREE.Geometry();
newGeo.merge(worlds[0].ground.geometry);
const cloneGeo = worlds[0].ground.geometry.clone();
cloneGeo.translate(0,0,-10);
//cloneGeo.rotateX(Math.PI /2);
newGeo.merge(cloneGeo);
newGeo.computeFaceNormals();
newGeo.computeVertexNormals();
const newMaterial = new THREE.MeshLambertMaterial({side: THREE.DoubleSide,  vertexColors: THREE.FaceColors, flatShading:true, wireframe:true });
//let newGeoMesh = new THREE.Mesh(newGeo, newMaterial);
//scene.add(newGeoMesh);
//newGeo.vertices[9].y = 4;
//newGeoMesh.position.x = 10;

newGeo.vertices[4].y = 15;
newGeo.vertices[7].y = 15;
newGeo.elementsNeedUpdate = true;
newGeo.computeFaceNormals();
newGeo.computeVertexNormals();
newGeoMesh = new THREE.Mesh(newGeo, newMaterial);
scene.add(newGeoMesh);

var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.5, 10000);
var renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1)
document.body.appendChild(renderer.domElement);

const camZOffset = 20;
let camZMap = 0;
camera.position.z = 40;
//camera.position.y = 100;
//camera.rotation.x = -Math.PI/4;
camera.position.y = 35;
camera.rotation.x = -Math.PI/4;

/*
const myCube = new THREE.CubeGeometry(15,15,15);
myCube.computeFaceNormals();
const cubeMesh = new THREE.Mesh(myCube, newMaterial);
scene.add(cubeMesh);

const geo2 = new THREE.PlaneGeometry(100,100,200,200);

let startTime, endTime, mesh2, mesh3;
console.log('building lots of meshes');
startTime = new Date().getTime();
for (let yy = 0; yy < 1000; ++yy) {
  mesh2 = new THREE.Mesh(geo2, newMaterial);
}
endTime = new Date().getTime();
console.log('mesh loop:', endTime - startTime);
*/


render(worlds[currentWorld]);
