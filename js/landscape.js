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

// https://campushippo.com/lessons/how-to-convert-rgb-colors-to-hexadecimal-with-javascript-78219fdb
var rgbToHexValue = function (rgb) { 
  var hex = Number(rgb).toString(16);
  if (hex.length < 2) {
    hex = "0" + hex;
  }
  return hex;
};

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
  const startTime = new Date().getTime();
  console.log('Beginning world build at:', startTime/1000);

  const width = options.width || 200;
  const height = options.height || 200;
  const resolution = options.resolution || 125;
  let nowTime;
  let e,j,power;
  let maxY = -1.0e-5;
  let minY = 1.0e+5;
  const noiseDepth = 7;
  const exponent = 2;
  let balloonPositions = {};
  let vertex,face, balloonGeometry, balloonMaterial, balloon;
  geometry = new THREE.PlaneGeometry(width, height, resolution, resolution);
  var vertices = geometry.vertices;
  balloonMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  let splineVertices = [];
  const multiplier = options.multiplier || 25;
  const flyOverCutoff = 3;

  console.log('building terrain');
  const startInnerTime = new Date().getTime();
  for (let i in vertices) {

    vertices[i].z = vertices[i].y; // flip the planegeometry so it's flat

    var nx = (vertices[i].x + width /  2)  / options.width ;
    var ny = (vertices[i].z + height / 2)  / options.height ;
    //console.log('nx,ny:', nx,ny);
    e = 0;
    for (j = 0; j < noiseDepth; ++j) {
      power = Math.pow(2, j);
      e += 1/power * simplex.noise2D(power * nx, power * ny);
      if ((j === flyOverCutoff) && (vertices[i].x === 0)) {
        centerVertices.push(vertices[i]);
        splineVertices.push(new THREE.Vector2(vertices[i].z, Math.max(e * multiplier + flyBuffer * (1 + Math.random() / 20), oceanY + oceanFlyBuffer)));
      }
    }

    //    vertices[i].y = 25 * Math.pow(e, exponent);
    //console.log(vertices[i].x, vertices[i].z);
    
    vertices[i].y = e * multiplier;
    //vertices[i].y = vertices[i].z;
    //vertices[i].y = 0;

    //    if (vertices[i].x === 0) {
    //      let zSpot =  (height /2) - vertices[i].z;
    //      balloonPositions[zSpot] = vertices[i].y;
    //    }
    maxY = (maxY < vertices[i].y ? vertices[i].y : maxY);
    minY = (minY > vertices[i].y ? vertices[i].y : minY);
  }
  const endInnerTime = new Date().getTime();
  console.log('done (inner) building terrain at:', (endInnerTime - startTime)/ 1000, 'seconds, time:', (endInnerTime - startInnerTime)/1000, 'seconds');

  //  const descendingSortedKeys = Object.keys(balloonPositions).sort(function(a,b){return a-b});
  //  console.log(descendingSortedKeys);
  //  let camPositions = [];

/*
  console.log('adding balloons');
  for (let v of centerVertices) {
    balloonGeometry = new THREE.BoxGeometry(0.1,.1,.1);
    balloon = new THREE.Mesh(balloonGeometry, balloonMaterial);
    balloon.position.x = 0;
    balloon.position.y = v.y ;
    //console.log('h',bk, balloonPositions[bk]);
    //balloon.position.z =  cp * (height / resolution) - (height / 2);
    balloon.position.z = v.z;
    options.group.add(balloon);
  }
  nowTime = new Date().getTime();
  console.log('done adding balloons at:', (nowTime - startTime) / 1000);
  */

  console.log('adding spline.');
  const groundCurve = new THREE.SplineCurve(splineVertices);
  const curvePoints = groundCurve.getPoints(100);
  console.log('curvePoints:', curvePoints);
  const curveGeo = new THREE.BufferGeometry().setFromPoints( curvePoints );
  var curveMaterial = new THREE.LineBasicMaterial( { color : 0xff00ff, linewidth: 40 } );
  // Create the final object to add to the scene
  var splineObject = new THREE.Line( curveGeo, curveMaterial );
  nowTime = new Date().getTime();
  console.log('done adding spline at:', (nowTime - startTime) / 1000);


  splineObject.rotation.y = Math.PI / -2;
  group.add(splineObject);

  const yRange = maxY - minY;
  const snowRange = yRange / 8;
  const beachRange = yRange / 25;

  const snow = 0xeeeeff;
  const sienna = 0xA0522D;
  const beach = 0xffff00;
  const grass = 0x00dd00;
  
  // See: http://blog.mastermaps.com/2012/06/creating-color-relief-and-slope-shading.html
  const colorRanges = 
    {
      'r': [ new THREE.Vector2(0,165), new THREE.Vector2(5,90),  new THREE.Vector2(60,150),  new THREE.Vector2(90,255) ],
      'g': [ new THREE.Vector2(0,175), new THREE.Vector2(5,255), new THREE.Vector2(60,240),  new THREE.Vector2(90,255)],
      'b': [ new THREE.Vector2(0,42),  new THREE.Vector2(5,90),  new THREE.Vector2(60,150),  new THREE.Vector2(90,255)]
    };
  const colorCurves = 
    {
      'r': new THREE.SplineCurve(colorRanges.r),
      'g': new THREE.SplineCurve(colorRanges.g),
      'b': new THREE.SplineCurve(colorRanges.b)
    };

  console.log('adding centroids.');
  let faceCtr = 0;
  //let colorRange = maxY - minY;
  let colorRange = maxY - oceanY;
  let t, hexColor,hexColorStr;
  let rVal, gVal, bVal;
  for (let faceId in geometry.faces) {
    face = geometry.faces[faceId];
    vertex = geometry.vertices[face.a];
    t = (Math.max(oceanY,vertex.y) - oceanY) / colorRange;
    rVal = parseInt(Math.max(0, Math.min(255, colorCurves.r.getPoint(t).y)));
    gVal = parseInt(Math.max(0, Math.min(255, colorCurves.g.getPoint(t).y)));
    bVal = parseInt(Math.max(0, Math.min(255,colorCurves.b.getPoint(t).y)));
    hexColorStr = rgbToHexValue(rVal) + rgbToHexValue(gVal) + rgbToHexValue(bVal);
    hexColor = parseInt(hexColorStr, 16);
    geometry.faces[faceId].color.setHex(hexColor);
    /*
    if (vertex.y > maxY - snowRange) {
      geometry.faces[faceId].color.setHex(snow);
    } else if (vertex.y < minY + beachRange) {
      geometry.faces[faceId].color.setHex(beach);
    } else {
      geometry.faces[faceId].color.setHex(grass);
    }
    */

    /*
    face.centroid = new THREE.Vector3( 0, 0, 0 );
    face.centroid.add( geometry.vertices[ face.a ] );
    face.centroid.add( geometry.vertices[ face.b ] );
    face.centroid.add( geometry.vertices[ face.c ] );
    face.centroid.divideScalar( 3 );
    faceCtr = (faceCtr == resolution ? 0 : faceCtr + 1);
    */
  }
  nowTime = new Date().getTime();
  console.log('done adding centroids at:', (nowTime - startTime) / 1000);

  //const material = new THREE.MeshLambertMaterial({side: THREE.DoubleSide, /*wireframe:true,*/ vertexColors: THREE.FaceColors, flatShading: false });
  const material = new THREE.MeshPhongMaterial({side: THREE.DoubleSide, /*wireframe:true,*/ vertexColors: THREE.FaceColors, flatShading: false });
  const ground = new THREE.Mesh(geometry, material);

  geometry.computeFaceNormals()
  geometry.computeVertexNormals();
  ground.geometry.colorsNeedUpdate = true;

  nowTime = new Date().getTime();
  console.log('done recalc normals at:', (nowTime - startTime) / 1000);

  //ground.position.z = -50;

  const oceanGeometry = new THREE.PlaneGeometry(width,height,1,1);
  const oceanVertices = oceanGeometry.vertices;
  for (let i in oceanVertices) {
    oceanVertices[i].z = oceanVertices[i].y;
    oceanVertices[i].y = oceanY;
  }

  // https://stackoverflow.com/questions/44749446/enable-smooth-shading-with-three-js
  // https://stackoverflow.com/questions/15994944/transparent-objects-in-threejs
  oceanMaterial = new THREE.MeshBasicMaterial({color: 0x1155dd, side: THREE.DoubleSide, transparent: true, opacity: 0.88});
  const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);

  nowTime = new Date().getTime();
  console.log('done ocean build at:', (nowTime - startTime) / 1000);

  ground.position.z = options.zOffset;
  ocean.position.z = options.zOffset;
  options.group.add(ground);
  options.group.add(ocean);

  makeText('Udacity', options.group);

  nowTime = new Date().getTime();
  console.log('done text build at:', (nowTime - startTime) / 1000);

  options.scene.add(options.group);


  const endTime = new Date().getTime();
  console.log('World built in:', (endTime - startTime)/1000, 'seconds');

  return ({
    width: width,
    height: height,
    resolution: resolution,
    ground: ground,
    ocean: ocean,
    centerVertices: centerVertices,
    groundCurve : groundCurve,
    splineObject: splineObject
  });
  
};

function generateNoiseBatch() {
  noiseX = (noiseX + 1 > width / resolution ? 0 : noiseX + 1);
  noiseY = (noiseY + 1 > height / resolution ? 0 : noiseY + 1);

  let power;
  const noiseDepth = 10;
  const batchSize = 20;
  let e;
  for (let i = 0; i < batchSize; ++i) {
    e = 0;
    for (let j = 0; j < noiseDepth; ++j) {
      power = Math.pow(2, j);
      e += 1/power * simplex.noise2D(power * noiseX, power * noiseY);
    }
    noiseValues.push(e);
  }
  // console.log('noiseValues size:', noiseValues.length);
}

function render() {
  requestAnimationFrame(render);
  //  camera.position.y += cam_posy;
  /*
     cam_posy = (camera.position.y < 5 ? -cam_posy : cam_posy);
     cam_posy = (camera.position.y > 10 ? -cam_posy : cam_posy);
     cam_posy = (Math.abs(camera.position.y) > 0.2 ? -cam_zrot: cam_zrot);
     
     //camera.position.z += 0.005;
     let squareJump = 3;
     let oneSquare = worlds[currentWorld].height / worlds[currentWorld].resolution;
     let index = Math.floor((group.position.z + squareJump * oneSquare) / worlds[currentWorld].height * worlds[currentWorld].resolution) + squareJump;
     let percentage = (group.position.z - (oneSquare * index)) / oneSquare;
     let start = worlds[currentWorld].centerVertices[index].y;
     let end = worlds[currentWorld].centerVertices[index + 1].y;
     let camY = ((end - start) * percentage) + start;
     //  if (index < 5) {
     //    console.log('z:',group.position.z, 'index:', index, 'range:', start,end, 'percentage:', percentage,  'camY:', camY);
     //  }
     
     let t = group.position.z / worlds[currentWorld].height;
   */
  // let camPoint = worlds[currentWorld].groundCurve.getPoint(t);
  //worlds[currentWorld].splineObject.rotation.y += 0.005;
  //camera.position.y = camPoint.y;
  let zMapInc = 0.0009;
  if (camZMap < 1-zMapInc) {
    camZMap += zMapInc;
  } else {
    camZMap = 0;
  }

  let camPoint = worlds[currentWorld].groundCurve.getPoint(camZMap);
  camera.position.z = camPoint.x ;
  camera.position.y = camPoint.y;
  //console.log('zmap:', camZMap, 'camPoint:', camPoint);
  //generateNoiseBatch();


  if ((worlds[1] === undefined) && (Math.abs(1-camera.position.z) < 2)) {
    console.log('Creating second world, cam pos:', camera.position.z);
    worlds[1] = 
      createWorld({
        width: width,
        height: height,
        zOffset : -1 * height,
        multiplier:25,
        resolution: resolution,
        scene:scene,
        group:group
      });
  }


  //group.position.z += 0.02;
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
// scene.fog = new THREE.FogExp2( 0xffffff, 0.01 );

var group = new THREE.Group();

//var pointLight = new THREE.PointLight( 0xffff00, 1000 );
//pointLight.position.set( 0, 0, 1000 );
//scene.add( pointLight );

var ambientLight = new THREE.AmbientLight(0xffff00,0.25);
//scene.add(ambientLight);
light = new THREE.DirectionalLight( 0xffffff );
light.position.set( 400, 400, 400 );
scene.add( light );

//const width = 200;
const oceanY = -10;
const flyBuffer = 5;
const oceanFlyBuffer = 1;
const width = 300;
const height = width ;
const resolution = 120;
let centerVertices = [];
let worlds = [];
let currentWorld = 0;
let noiseValues = [];
let noiseX = 0;
let noiseY = 0;
worlds[0] = 
  createWorld({
    width: width,
    height: height,
    zOffset: 0,
    multiplier: 25,
    resolution: resolution,
    scene:scene,
    group:group
  });

var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.5, 10000);
var renderer = new THREE.WebGLRenderer({alpha:true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1)
document.body.appendChild(renderer.domElement);

const camZOffset = 70;
let camZMap = 0;
camera.position.z = camZOffset;
camera.position.y = 20;
let cam_posy = -0.5;
const cam_zrot = -0.0015;
const squareSize = width / resolution;
const numSquares = width / squareSize;
midSquare = Math.floor(resolution / 2);
console.log('numSquares:', numSquares, 'midSquare:', midSquare);
let camYMax = worlds[currentWorld].ground.geometry.vertices[midSquare].y;
console.log('yMax:', camYMax);

render(worlds[currentWorld]);
//getLorem();
