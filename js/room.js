// Simple three.js example

var mesh, renderer, scene, camera, controls;

init();
animate();

function init() {

  // renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setClearColor( 0x889988 );
  document.body.appendChild( renderer.domElement );

  // scene
  scene = new THREE.Scene();
  
  // camera
  camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.set( 20, 20, 20 );
  scene.add( camera ); // required, since adding light as child of camera

  // controls
  controls = new THREE.OrbitControls( camera );
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.maxPolarAngle = Math.PI / 2;
  
  // ambient
  scene.add( new THREE.AmbientLight( 0x444444 ) );
  
  // light
  var light = new THREE.PointLight( 0xffffff, 0.8 );
  camera.add( light );
  
  // axes
  //scene.add( new THREE.AxisHelper( 20 ) );

  // geometry
  var geometry = new THREE.BoxGeometry( 4, 2, 2 );
  
  // material
  var material1 = new THREE.MeshPhongMaterial( {
    color: 'sandybrown'
  } );
  
  // mesh
  mesh = new THREE.Mesh( geometry, material1 );
  mesh.position.set( 2, - 4, 6 );
  scene.add( mesh );

  // geometry
  var geometry = new THREE.BoxGeometry( 2, 2, 2 );
  
  // material
  var material1 = new THREE.MeshPhongMaterial( {
    color: 'gray'
  } );
  
  // mesh
  mesh = new THREE.Mesh( geometry, material1 );
  mesh.position.set( -2 , - 4, - 6 );
  scene.add( mesh );

  // geometry
  var geometry = new THREE.BoxGeometry( 20, 10, 20 );
  
  // material
  var material1 = new THREE.MeshPhongMaterial( {
    color: 0xffffff, 
    transparent: true,
    opacity: 0.1
  } );
  
  // mesh
  mesh = new THREE.Mesh( geometry, material1 );
  scene.add( mesh );
  
  // material
  var material2 = new THREE.MeshPhongMaterial( {
    color: 0xffffff, 
    transparent: false,
    side: THREE.BackSide
  } );
  
  // mesh
  mesh = new THREE.Mesh( geometry, material2 );
  scene.add( mesh );
  
}

function animate() {

  requestAnimationFrame( animate );
  
  //controls.update();

  renderer.render( scene, camera );

}
