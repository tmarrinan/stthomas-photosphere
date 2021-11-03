let scene = null;
let xr_control = null;
let selected_photo = 0;
let photospheres = [
    {url: 'images/38-Chicago_AlleyMural&Graffiti.jpg', type: BABYLON.PhotoDome.MODE_MONOSCOPIC},
    {url: 'images/38-Chicago_GeorgeFloydMural.jpg', type: BABYLON.PhotoDome.MODE_MONOSCOPIC}
];
let babylon_domes = [];

function init() {
    // Get the canvas element
    let canvas = document.getElementById('render');
    // Generate the Babylon 3D engine
    let engine = new BABYLON.Engine(canvas, true);

    // Create scene
    createScene(canvas, engine);
}

function createScene(canvas, engine) {
    // Create a basic Babylon Scene object (non-mesh)
    scene = new BABYLON.Scene(engine);
    
    // Add a camera to the scene and attach it to the canvas
    let camera = new BABYLON.ArcRotateCamera('camera', -Math.PI / 2,  Math.PI / 2, 0.001, 
                                             BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.inputs.attached.mousewheel.detachControl(canvas);
    camera.znear = 0.1;
    camera.zfar = 1000.0;
    
    // Add photo domes (equirectangular panoramas)
    let i;
    for (i = 0; i < photospheres.length; i++) {
        let dome = new BABYLON.PhotoDome(
            'photodome',
            photospheres[i].url,
            {
                resolution: 32,
                size: 500
            },
            scene
        );
        dome.imageMode = photospheres[i].type;
        if (i != 0) {
            dome.setEnabled(false);
        }
        babylon_domes.push(dome);
    }
    
    // Set up callback for touch / click events
    scene.onPointerDown = pointerDown;
    
    // Default environment
    const environment = scene.createDefaultEnvironment();
    
    // WebXR
    scene.createDefaultXRExperienceAsync({floorMeshes: [environment.ground]})
    .then((xr_helper) => {
        xr_control = xr_helper;
        xr_control.teleportation.detach();

        startRenderLoop(engine);
    })
    .catch((err) => {
        console.log(err);
    });
}

function startRenderLoop(engine) {
    // Register a render loop to repeatedly render the scene
    engine.runRenderLoop(() => {
        scene.render();
    });

    // Watch for browser/canvas resize events
    window.addEventListener('resize', () => {
        engine.resize();
    });
}

function pointerDown(event, pick_info) {
    // still use left mouse click for panning image
    if ((event.pointerType === 'mouse' && event.button !== 0) || event.pointerType === 'touch'){
        selected_photo = (selected_photo + 1) % babylon_domes.length;
        let i;
        for (i = 0; i < babylon_domes.length; i++) {
            babylon_domes[i].setEnabled(selected_photo === i);
        }
    }
}