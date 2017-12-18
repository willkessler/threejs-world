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

var createWorld = (options) => {
  const width = options.width || 200;
  const depth = options.depth || 200;
  const resolution = options.resolution || 125;
  const multiplier = options.multiplier || 25;
  let maxY = -1.0e-5;
  let minY = 1.0e+5;
  let vertex,face;
  let nx, ny;


  /*
  let world = {};
  const numPoints = resolution * resolution;
  geometry = new THREE.BufferGeometry();
  const positions = new Float32Array( numPoints * 3 * 3 );
  const normals = new Float32Array( numPoints * 3 * 3 );
  const colors = new Float32Array( numPoints * 3 * 3 );
  const color = new THREE.Color();
  const pA = new THREE.Vector3();
  const pB = new THREE.Vector3();
  const pC = new THREE.Vector3();
  const cb = new THREE.Vector3();
  const ab = new THREE.Vector3();
  let pointOffset;
  const tileSize = width / resolution;
  // positions
  for ( let i = 0; i < resolution; i++ ) {
    for (let j = 0; j < resolution; ++j) {
      var ax = tileSize * j;
      var ay = 0;
      var az = tileSize * i;

      pointOffset = (i * resolution + j) * 3;
      positions[ pointOffset ]     = ax;
      positions[ pointOffset + 1 ] = ay;
      positions[ pointOffset + 2 ] = az;
    }
  }

  let squarePoints = [];
  for ( let i = 0; i < resolution - 1; i++ ) {
    for (let j = 0; j < resolution - 1; ++j) {
      squarePoints[0] = (i * resolution + j) * 3; // lower left corner of tile
      squarePoints[1] = (i * resolution + j + 1) * 3; // lower right corner of tile
      squarePoints[2] = ((i + 1) * resolution + j) * 3; // upper left corner of tile
      squarePoints[3] = ((i + 1) * resolution + j + 1) * 3; // upper right corner of tile
      // flat face normals
      pA.set( positions[squarePoints[0]], positions[squarePoints[0] + 1], positions[squarePoints[0] + 2]);
      pB.set( positions[squarePoints[1]], positions[squarePoints[1] + 1], positions[squarePoints[1] + 2]);
      pC.set( positions[squarePoints[2]], positions[squarePoints[2] + 1], positions[squarePoints[2] + 2]);
      cb.subVectors( pC, pB );
      ab.subVectors( pA, pB );
      cb.cross( ab );
      cb.normalize();
      var nx = cb.x;
      var ny = cb.y;
      var nz = cb.z;
      normals[ i ]     = nx;
      normals[ i + 1 ] = ny;
      normals[ i + 2 ] = nz;
      normals[ i + 3 ] = nx;
      normals[ i + 4 ] = ny;
      normals[ i + 5 ] = nz;
      normals[ i + 6 ] = nx;
      normals[ i + 7 ] = ny;
      normals[ i + 8 ] = nz;
      // colors
      var vx = ( x / n ) + 0.5;
      var vy = ( y / n ) + 0.5;
      var vz = ( z / n ) + 0.5;
      color.setRGB( vx, vy, vz );
      colors[ i ]     = color.r;
      colors[ i + 1 ] = color.g;
      colors[ i + 2 ] = color.b;
      colors[ i + 3 ] = color.r;
      colors[ i + 4 ] = color.g;
      colors[ i + 5 ] = color.b;
      colors[ i + 6 ] = color.r;
      colors[ i + 7 ] = color.g;
      colors[ i + 8 ] = color.b;
    }
  }
  geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
  geometry.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
  geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

*/

  geometry = new THREE.PlaneGeometry(width, depth, resolution, resolution);
  const vertices = geometry.vertices;
  let halfVerticesCount = vertices.length / 2;
  console.log('building terrain');
  for (let i=0; i < vertices.length; ++i) {
    //console.log('v:', vertices[i]);
    vertices[i].z = vertices[i].y; // flip the planegeometry so it's flat
    vertices[i].y = 0;
  }

  //console.log('geometry:', geometry.vertices);
  //geometry.computeVertexNormals();
  geometryBuffer = new THREE.BufferGeometry().fromGeometry(geometry);


  const material = new THREE.MeshPhongMaterial({side: THREE.DoubleSide, wireframe:false, vertexColors: THREE.FaceColors });
  const ground = new THREE.Mesh(geometryBuffer, material);
  //ground.geometry.colorsNeedUpdate = true;
  ground.rotation.y = Math.PI;
  ground.position.z = options.zOffset;

  options.group.add(ground);
  options.scene.add(options.group);
  
  return ({
    width: width,
    depth: depth,
    resolution: resolution,
    ground: ground
  });

}

function getVertices(row,col) {
  
}


function moveTile(row,amt) {
  const rowOffset = resolution / 2 * 6 - 6;
  for (let i = resolution * row * 6 + rowOffset; i < resolution * row * 6 + rowOffset + 6; ++i) {
    geometryBuffer.attributes.position.array[i * 3 + 1] = amt;
  }
}

function liftTile(row) {
  const lastRow = row + 1 % resolution;
  moveTile(lastRow,0);
  moveTile(row, 25);
}

function modifyFirstRow() {
  let base, bottomLeft, bottomRight, bottomUpperTriangle;
  let offsetn
  for (let i = 0; i < resolution; ++i) {
    base = i * 6;
    bottomLeft = base * 3;
    bottomRight = (base + 2) * 3;
    bottomUpperTriangle = (base + 5) * 3;
    offset = Math.floor(Math.random() * 20);
    geometryBuffer.attributes.position.array[bottomLeft + 1] = offset;
    geometryBuffer.attributes.position.array[bottomRight + 1] = offset;
    geometryBuffer.attributes.position.array[bottomUpperTriangle + 1] = offset;
  }
  geometryBuffer.attributes.position.needsUpdate = true;
}

function shiftBuffer() {
  const rowSize = resolution * 6 * 3;
  const verticesPerSquare = 6;
  const floatsPerVertex = 3;
  const floatYOffset = 1;
  let row = 1, base, previousBase, currentTriangle = [], previousTriangle = [];
  for (let i = resolution - 1; i > 0; --i) {
    for (let j = 0; j < resolution; ++j) {
      previousBase = (((i - 1) * resolution) + j) * verticesPerSquare;
      previousTriangle[0] = previousBase * floatsPerVertex;
      previousTriangle[1] = (previousBase + 2) * floatsPerVertex;
      previousTriangle[2] = (previousBase + 5) * floatsPerVertex;
      previousTriangle[3] = (previousBase + 1) * floatsPerVertex;
      previousTriangle[4] = (previousBase + 3) * floatsPerVertex;
      previousTriangle[5] = (previousBase + 4) * floatsPerVertex;
      base = ((i * resolution) + j) * verticesPerSquare;
      currentTriangle[0] = base * floatsPerVertex;
      currentTriangle[1] = (base + 2) * floatsPerVertex;
      currentTriangle[2] = (base + 5) * floatsPerVertex;
      geometryBuffer.attributes.position.array[currentTriangle[0]  + floatYOffset] = geometryBuffer.attributes.position.array[previousTriangle[0] + floatYOffset];
      geometryBuffer.attributes.position.array[currentTriangle[1]  + floatYOffset] = geometryBuffer.attributes.position.array[previousTriangle[1] + floatYOffset];
      geometryBuffer.attributes.position.array[currentTriangle[2]  + floatYOffset] = geometryBuffer.attributes.position.array[previousTriangle[2] + floatYOffset];
      geometryBuffer.attributes.position.array[previousTriangle[3] + floatYOffset] = geometryBuffer.attributes.position.array[previousTriangle[0] + floatYOffset];
      geometryBuffer.attributes.position.array[previousTriangle[4] + floatYOffset] = geometryBuffer.attributes.position.array[previousTriangle[1] + floatYOffset];
      geometryBuffer.attributes.position.array[previousTriangle[5] + floatYOffset] = geometryBuffer.attributes.position.array[previousTriangle[2] + floatYOffset];
      geometryBuffer.attributes.position.array[previousTriangle[0] + floatYOffset] = 0;
      geometryBuffer.attributes.position.array[previousTriangle[1] + floatYOffset] = 0;
      geometryBuffer.attributes.position.array[previousTriangle[2] + floatYOffset] = 0;
    }
  }
  geometryBuffer.attributes.position.needsUpdate = true;
}

function render() {
  requestAnimationFrame(render);
  if (row % resolution === 0) {
    modifyFirstRow();
  } else {
    shiftBuffer();
  }
  row++;

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

const width = 200;
const depth = 200 ;
const resolution = 50;
let centerVertices = [];
let worlds = [];
let currentWorld = 0;
const oceanY = -10;
const flyBuffer = 5;
const oceanFlyBuffer = 1;

let geometry, geometryBuffer;
let worldCount = 0;
let row = 0;
worlds[worldCount] = 
  createWorld({
    width: width,
    depth: depth,
    zOffset: -1 * depth * worldCount ,
    multiplier: 45,
    resolution: resolution,
    scene:scene,
    group:group,
    worlds: worlds
  });
//liftTile(row);


var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.5, 10000);
var renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1)
document.body.appendChild(renderer.domElement);

const camZOffset = 20;
let camZMap = 0;
camera.position.y = 20;
camera.position.z = 130;
//camera.position.y = 100;
//camera.rotation.x = -Math.PI/4;
//camera.position.y = 35;
//camera.rotation.x = -Math.PI/4;


render(worlds[currentWorld]);
