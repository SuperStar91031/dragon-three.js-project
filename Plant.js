
import * as THREE from 'three';
import {GUI} from './build/dat.gui.module.js';
import {OrbitControls} from './build/OrbitControls.js';
import {FBXLoader} from './build/FBXLoader.js';
import {NURBSCurve} from './build/NURBSCurve.js';

//==================================
//=======Lindenmayer Plant==========
//==================================

//defaults
let chimneyCanopyBase;
let scene, ratio, camera;
let renderer;

var ambLight, ambLightColour, ambLightInten;
var dirLight, dirLightColour,dirLightInten;
var plantFirstColour, plantSecondColour, plantThirdColour;
var backgroundColour;

let plane;


//const image = new Image();
//image.src = ;

//create the scene
scene = new THREE.Scene();
ratio = window.innerWidth/window.innerHeight;
//create the perspective camera
//for parameters see https://threejs.org/docs/#api/cameras/PerspectiveCamera
camera = new THREE.PerspectiveCamera(45, ratio, 0.1, 1000);
//set the camera position
camera.position.set(0,50,50);
// and the direction
camera.lookAt(0,0,0);

//Create the webgl renderer
renderer = new THREE.WebGLRenderer();
renderer.antialias = true;
renderer.precision = "highp";
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.powerPreference = "high-performance";
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);

//Controls
var controls = new OrbitControls(camera, renderer.domElement );

//========DEBUG===========
initLights();
loadSkybox();
//loadTestSphere();
loadBaseGroundModel();
loadLizard();
renderGui();
animate();
//========================

//Handle window resize
function onWindowResize() 
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    controls.handleResize();
}

window.addEventListener('resize', onWindowResize);

//Lighting
function initLights(){
  ambLight = new THREE.AmbientLight(ambLightColour, ambLightInten);
  scene.add(ambLight);

  dirLight = new THREE.DirectionalLight(dirLightColour, dirLightInten);
  dirLight.position.set(0, 500, 500);
  scene.add(dirLight);
}

function loadSkybox(){
  //adding textures 
  //const texture = new THREE.TextureLoader().load(
  //'../Images/Background3JS.jpeg');

  //background texture 
  //scene.background = texture;
  const cubeTextureLoader = new THREE.CubeTextureLoader();
  scene.background = cubeTextureLoader.load([
    './images/rwcc/right.png',
    './images/rwcc/left.png',
    './images/rwcc/up.png',
    './images/rwcc/bottom.png',
    './images/rwcc/front.png',
    './images/rwcc/back.png',
  ])
}

function loadTestSphere(){
  const planeGeometry = new THREE.PlaneGeometry(32, 32);
  const planeMaterial = new THREE.MeshLambertMaterial({
    color: 0xFFFFF,
    side: THREE.DoubleSide
  });

plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -0.5 * Math.PI;
//Plane.castShadow = true;
plane.recieveShadow = true;
scene.add(plane);

const sphereGeometry = new THREE.SphereGeometry(5, 32, 32);
const sphereMaterial = new THREE.MeshPhongMaterial({color: 0x0000FF, /*texture for sphere */ //map: texture
})
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.castShadow = true;
//Sphere.recieveShadow = true;
sphere.position.set(-4,14,-1);

scene.add(sphere);
}

//adding basic fod effect
//Note: we don't need fog, consider removing it
//scene.fog = new THREE.Fog(0xFFFFFF, 0, 200);

//Lizard decoration
function loadLizard(){
  const fbxLoader = new FBXLoader();
  fbxLoader.setResourcePath("./textures/pink_lizard/");
  fbxLoader.load('./model/pink_lizard.fbx', function(lizard) {

    lizard.traverse(function(child){
      if (child.isMesh) 
      {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    } 
  );

  lizard.userData.name = "Pink Lizard";
  lizard.scale.setScalar(0.12);
  lizard.position.set(-10, 2.2, -10);
  lizard.rotation.set(-190, 0, 90);
  scene.add(lizard);
});
}

//Base Ground Model
function loadBaseGroundModel(){

      const fbxLoader = new FBXLoader();
      fbxLoader.setResourcePath("./textures/base/");
      fbxLoader.load('./model/chimney_canopy_base.fbx', function(chimneyCanopyBase) {

      chimneyCanopyBase.traverse(function(child){
          if (child.isMesh) 
          {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        } 
      );

      chimneyCanopyBase.userData.name = "Chimney Canopy Base";
      chimneyCanopyBase.scale.setScalar(0.04);
      dirLight.target = chimneyCanopyBase;
      scene.add(chimneyCanopyBase);
    });
}

//Dat GUI
function renderGui()
{
  const gui = new GUI();

  //parameters for GUI
  //Test shere
  let options = {
    sphereColor: '#ffea00',
    angle: 0.2,
    penumbra: 0,
    intensity: 1,
  }


//colour variables
  let col = {
    ambLightColour: 0xe52b50,  //dark pink - Amaranth shade
    ambLightInten: 0.05,
    dirLightColour: 0xfd8535, //orange - Coral shade
    dirLightInten: 0.05,
    plantFirstColour: 0xffffff, //white
    plantSecondColour: 0xffffff, //white
    plantThirdColour: 0xffffff //white
  }


  let colourFolder = gui.addFolder("Scene Colour Management");

  let ambLightFolder = colourFolder.addFolder("Ambient Light Control");
  ambLightFolder.addColor(col, "ambLightColour").name("AL Colour").onChange(() => 
  {
      ambLight.color.setHex(col.ambLightColour);
  });
  ambLightFolder.add(col, "ambLightInten", 0, 10, 0.005).name("AL Intensity").onChange(() =>
  {
      ambLight.intensity = col.ambLightInten;
  });

  //scene colour change
  let dirLightFolder = colourFolder.addFolder("Directional Light Control");
  dirLightFolder.addColor(col, "dirLightColour").name("Directional Light").onChange(() => 
  {
    dirLight.color.setHex(col.dirLightColour);
  })
  dirLightFolder.add(col, "dirLightInten", 0, 1, 0.005).name("Dir Light Intensity").onChange(() => 
  {
    dirLight.intensity = col.dirLightInten;
  })
  //colourFolder.addColor(col, "ambLightColour").name("Ambient Light").onChange(() => 
  //{
    //ambLight.color.set(col.ambLightColour);
  //})
  //colourFolder.add(col, "ambLightColour", 0, 1, 0.005).name("AL Intensity");

  //colourFolder.add(mesh.rotation, "y", 0, Math.PI * 2, 0.001).name("Secondary Clour");
  //colourFolder.add(mesh.rotation, "z", 0, Math.PI * 2, 0.001).name("Accent Colour");
  //colourFolder.add(mesh.rotation, "z", 0, Math.PI * 2, 0.001).name("Regenerate");

  //let SphereFolder = gui.addFolder("Sphere Management");
  //SphereFolder.addColor(options, 'sphereColor').onChange(function(e){
    //Sphere.material.color.set(e)
  //});

  //below three gui options are for the light
  let lightFolder = gui.addFolder("Light Attributes Management");
  lightFolder.add(options, 'angle', 0, 1)
  lightFolder.add(options, 'penumbra', 0, 1)
  lightFolder.add(options, 'intensity', 0, 1)
}

function animate(){
  requestAnimationFrame(animate);
  render();
  //mesh.geometry.attributes.position.needsUpdate = true;
  //dirLight.angle = options.angle;
  //dirLight.angle = options.angle;
  //dirLight.intensity = options.intensity;
  let increment = 0.001;
  //scene.rotation.x += increment;
  scene.rotation.y += increment;
  //mesh.rotation.z += increment;
  controls.update();

}

function render() 
{
    //controls.update(clock.getDelta());
    //scene.clear();
    renderer.render(scene,camera);
}

