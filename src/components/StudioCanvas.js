import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function StudioCanvas({ 
  activeProduct, 
  applyTo = 'floor', 
  roomType = 'bathroom',
  groutWidth = '2',
  groutColor = '#888888',
  lightTemp = 'neutral',
  lightIntensity = 1.0,
  tileRotation = 0,
  layPattern = 'flat',
  timeOfDay = 'day'
}) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);

  // References to lights & meshes
  const floorMeshRef = useRef(null);
  const backWallMeshRef = useRef(null);
  const leftWallMeshRef = useRef(null);
  const furnishingsGroupRef = useRef(null);

  const ambientLightRef = useRef(null);
  const directionalLightRef = useRef(null);
  const pointLightRef = useRef(null);

  // Tracks loading state and type
  const [textureStatus, setTextureStatus] = useState('Procedural (Fallback)');
  const [isSceneReady, setIsSceneReady] = useState(false);

  // Dimensions of room in meters
  const ROOM_WIDTH = 3.6; 
  const ROOM_DEPTH = 3.6;
  const ROOM_HEIGHT = 2.8;

  // Procedural texture generator (returns raw canvas element to draw grout overlay)
  const generateProceduralTexture = (product) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const style = product.style || 'Beton';
    const color = product.color || 'Gri';

    // Draw baseline
    if (style === 'Mermer') {
      const isDark = color.toLowerCase().includes('antrasit') || color.toLowerCase().includes('siyah') || color.toLowerCase().includes('karanlık') || color.toLowerCase().includes('füme');
      
      // Base marble color
      ctx.fillStyle = isDark ? '#1e222b' : '#f0f1f4';
      ctx.fillRect(0, 0, 512, 512);

      // Draw subtle marble clouds
      for (let i = 0; i < 6; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const r = 100 + Math.random() * 150;
        const grad = ctx.createRadialGradient(x, y, 10, x, y, r);
        if (isDark) {
          grad.addColorStop(0, 'rgba(26, 30, 38, 0.4)');
          grad.addColorStop(1, 'rgba(30, 34, 43, 0)');
        } else {
          grad.addColorStop(0, 'rgba(230, 232, 237, 0.5)');
          grad.addColorStop(1, 'rgba(240, 241, 244, 0)');
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw marble veins
      ctx.lineWidth = 2;
      for (let j = 0; j < 6; j++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * 512, 0);
        ctx.bezierCurveTo(
          150 + Math.random() * 200, 100 + Math.random() * 100,
          150 + Math.random() * 200, 250 + Math.random() * 100,
          Math.random() * 512, 512
        );
        
        if (isDark) {
          ctx.strokeStyle = j % 2 === 0 ? 'rgba(220, 225, 230, 0.3)' : 'rgba(100, 110, 120, 0.15)';
        } else {
          ctx.strokeStyle = j % 2 === 0 ? 'rgba(180, 185, 195, 0.4)' : 'rgba(197, 160, 89, 0.35)'; // goldish
        }
        ctx.stroke();
      }
    } 
    else if (style === 'Ahşap') {
      ctx.fillStyle = '#835227';
      ctx.fillRect(0, 0, 512, 512);

      // Wood grain lines
      ctx.strokeStyle = 'rgba(75, 45, 18, 0.3)';
      for (let x = -20; x < 532; x += 15) {
        ctx.beginPath();
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.moveTo(x, 0);
        ctx.bezierCurveTo(
          x + Math.sin(1) * 20, 150,
          x - Math.cos(2) * 20, 350,
          x + Math.sin(3) * 10, 512
        );
        ctx.stroke();
      }

      // Draw plank board lines
      ctx.strokeStyle = 'rgba(50, 30, 10, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(128, 0); ctx.lineTo(128, 512);
      ctx.moveTo(256, 0); ctx.lineTo(256, 512);
      ctx.moveTo(384, 0); ctx.lineTo(384, 512);
      ctx.stroke();
    } 
    else if (style === 'Beton') {
      ctx.fillStyle = color.toLowerCase().includes('bej') ? '#d8cbb8' : '#8e9196';
      ctx.fillRect(0, 0, 512, 512);

      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = color.toLowerCase().includes('bej') ? 'rgba(205, 193, 175, 0.2)' : 'rgba(120, 122, 126, 0.25)';
        ctx.beginPath();
        const rx = 80 + Math.random() * 120;
        const ry = 40 + Math.random() * 60;
        ctx.ellipse(Math.random() * 512, Math.random() * 512, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
      
      for (let k = 0; k < 3000; k++) {
        const nx = Math.floor(Math.random() * 512);
        const ny = Math.floor(Math.random() * 512);
        const ncolor = Math.random() > 0.5 ? 255 : 0;
        ctx.fillStyle = `rgba(${ncolor}, ${ncolor}, ${ncolor}, 0.05)`;
        ctx.fillRect(nx, ny, 1, 1);
      }
    } 
    else {
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(0, 0, 512, 512);
    }

    return canvas;
  };

  // Helper to generate a CanvasTexture dynamically injecting grout border overlays and tiling rotation
  const generateGroutOverlay = (sourceCanvasOrImage, product, gWidth, gColor, rotation, pattern) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Grout line: only 1px on right and bottom edges
    // When tiles repeat, right+left and bottom+top edges combine into a single thin grout line
    const groutMm = parseFloat(gWidth) || 2;
    const borderPx = groutMm > 0 ? Math.max(1, Math.min(2, Math.round(groutMm * 0.5))) : 0;

    // 1. Fill entire canvas with grout color first
    ctx.fillStyle = gColor || '#888888';
    ctx.fillRect(0, 0, 512, 512);

    // 2. Draw tile image to fill almost all of the canvas
    // Leave only a thin line on right and bottom edges for grout
    const tileW = 512 - borderPx;
    const tileH = 512 - borderPx;
    ctx.drawImage(sourceCanvasOrImage, 0, 0, tileW, tileH);

    // 3. Create CanvasTexture
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    // 4. Handle lay patterns (diagonal rotates +45°) and tile rotation (90°)
    let totalRotationRad = 0;
    if (pattern === 'diagonal') {
      totalRotationRad += Math.PI / 4; // 45 deg
    }
    if (rotation === 90) {
      totalRotationRad += Math.PI / 2; // 90 deg
    }

    if (totalRotationRad !== 0) {
      texture.rotation = totalRotationRad;
      texture.center.set(0.5, 0.5);
    }

    return texture;
  };

  // Setup Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#101216'); 
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 100);
    camera.position.set(4, 3.2, 5); 
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    
    // Clear container and append canvas
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.45);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const directionalLight = new THREE.DirectionalLight('#ffffff', 0.65);
    directionalLight.position.set(4, 5, 3);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 15;
    directionalLight.shadow.bias = -0.001;
    scene.add(directionalLight);
    directionalLightRef.current = directionalLight;

    const pointLight = new THREE.PointLight('#ffdf9e', 0.25, 10);
    pointLight.position.set(0, 2.2, 0); 
    scene.add(pointLight);
    pointLightRef.current = pointLight;

    // 5. Room geometry setup
    // Floor
    const floorGeo = new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_DEPTH);
    const floorMat = new THREE.MeshStandardMaterial({ color: '#272b33', roughness: 0.8 });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);
    floorMeshRef.current = floorMesh;

    // Back Wall (facing camera)
    const backWallGeo = new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_HEIGHT);
    const backWallMat = new THREE.MeshStandardMaterial({ color: '#23272f', roughness: 0.9 });
    const backWallMesh = new THREE.Mesh(backWallGeo, backWallMat);
    backWallMesh.position.set(0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2);
    backWallMesh.receiveShadow = true;
    scene.add(backWallMesh);
    backWallMeshRef.current = backWallMesh;

    // Left Wall (side wall)
    const leftWallGeo = new THREE.PlaneGeometry(ROOM_DEPTH, ROOM_HEIGHT);
    const leftWallMat = new THREE.MeshStandardMaterial({ color: '#1f2229', roughness: 0.9 });
    const leftWallMesh = new THREE.Mesh(leftWallGeo, leftWallMat);
    leftWallMesh.rotation.y = Math.PI / 2;
    leftWallMesh.position.set(-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0);
    leftWallMesh.receiveShadow = true;
    scene.add(leftWallMesh);
    leftWallMeshRef.current = leftWallMesh;

    // Hanging Ceiling Light fixture
    const wireGeo = new THREE.CylinderGeometry(0.008, 0.008, 1);
    const wireMat = new THREE.MeshBasicMaterial({ color: '#111111' });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    wire.position.set(0, ROOM_HEIGHT - 0.5, 0);
    scene.add(wire);

    const bulbGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const bulbMat = new THREE.MeshBasicMaterial({ color: '#ffeabf' });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(0, ROOM_HEIGHT - 1, 0);
    scene.add(bulb);

    // 6. Furnishings Group
    const furnishingsGroup = new THREE.Group();
    scene.add(furnishingsGroup);
    furnishingsGroupRef.current = furnishingsGroup;

    // Simple custom orbit drag controls using mouse events
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let theta = Math.PI / 4; 
    let phi = Math.PI / 3;   
    let radius = 6.8;        

    const updateCameraPosition = () => {
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi) + 0.8;
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, ROOM_HEIGHT / 3, 0);
    };
    updateCameraPosition();

    const onMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      theta -= deltaX * 0.005;
      phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, phi - deltaY * 0.005));

      previousMousePosition = { x: e.clientX, y: e.clientY };
      updateCameraPosition();
    };

    const onMouseUp = () => { isDragging = false; };

    const onWheel = (e) => {
      radius = Math.max(3.2, Math.min(12, radius + e.deltaY * 0.004));
      updateCameraPosition();
    };

    const container = containerRef.current;
    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel);

    // Render loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    setIsSceneReady(true);

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      setIsSceneReady(false);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Update furnishings procedurally when roomType changes
  useEffect(() => {
    if (!isSceneReady) return;
    const scene = sceneRef.current;
    const group = furnishingsGroupRef.current;
    if (!scene || !group) return;

    // Clear old furnishings
    while (group.children.length > 0) {
      const child = group.children[0];
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
      group.remove(child);
    }

    // Common standard materials
    const chromeMat = new THREE.MeshStandardMaterial({
      color: '#dddddd',
      metalness: 0.95,
      roughness: 0.05
    });

    const brassMat = new THREE.MeshStandardMaterial({
      color: '#d4af37',
      metalness: 0.85,
      roughness: 0.15
    });

    const porcelainMat = new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      roughness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: '#e2f1f6',
      transparent: true,
      opacity: 0.18,
      roughness: 0.05,
      transmission: 0.95,
      ior: 1.5,
      thickness: 0.02,
      side: THREE.DoubleSide
    });

    const darkCabMat = new THREE.MeshStandardMaterial({
      color: '#1a1c22',
      roughness: 0.85
    });

    const oakWoodMat = new THREE.MeshStandardMaterial({
      color: '#bfa074',
      roughness: 0.55
    });

    // Populate furnishings group depending on selected roomType
    if (roomType === 'bathroom') {
      // --- 1. SINK VANITY UNIT ---
      const cabGeo = new THREE.BoxGeometry(0.7, 0.6, 1.3);
      const cabWoodMat = new THREE.MeshStandardMaterial({ color: '#5c4033', roughness: 0.65 });
      const cabinet = new THREE.Mesh(cabGeo, cabWoodMat);
      cabinet.position.set(-ROOM_WIDTH / 2 + 0.35, 0.3, 0); 
      cabinet.castShadow = true;
      cabinet.receiveShadow = true;
      group.add(cabinet);

      const drawerGeo = new THREE.BoxGeometry(0.02, 0.52, 1.22);
      const drawerPanel = new THREE.Mesh(drawerGeo, darkCabMat);
      drawerPanel.position.set(-ROOM_WIDTH / 2 + 0.36, 0.3, 0);
      drawerPanel.castShadow = true;
      group.add(drawerPanel);

      const basinGeo = new THREE.BoxGeometry(0.5, 0.12, 0.9);
      const basin = new THREE.Mesh(basinGeo, porcelainMat);
      basin.position.set(-ROOM_WIDTH / 2 + 0.35, 0.6 + 0.06, 0);
      basin.castShadow = true;
      group.add(basin);

      const faucetBaseGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.22);
      const faucetBase = new THREE.Mesh(faucetBaseGeo, chromeMat);
      faucetBase.position.set(-ROOM_WIDTH / 2 + 0.16, 0.6 + 0.22, 0);
      faucetBase.castShadow = true;
      group.add(faucetBase);

      const spoutGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.14);
      const spout = new THREE.Mesh(spoutGeo, chromeMat);
      spout.rotation.z = Math.PI / 2.3;
      spout.position.set(-ROOM_WIDTH / 2 + 0.21, 0.6 + 0.31, 0);
      spout.castShadow = true;
      group.add(spout);

      // Backlit LED Mirror
      const mirrorFrameGeo = new THREE.BoxGeometry(0.02, 0.95, 1.15);
      const mirrorFrame = new THREE.Mesh(mirrorFrameGeo, brassMat);
      mirrorFrame.position.set(-ROOM_WIDTH / 2 + 0.01, 1.5, 0);
      group.add(mirrorFrame);

      const mirrorPaneGeo = new THREE.PlaneGeometry(1.1, 0.9);
      const mirrorPaneMat = new THREE.MeshStandardMaterial({ color: '#999999', metalness: 0.98, roughness: 0.02 });
      const mirrorPane = new THREE.Mesh(mirrorPaneGeo, mirrorPaneMat);
      mirrorPane.rotation.y = Math.PI / 2;
      mirrorPane.position.set(-ROOM_WIDTH / 2 + 0.021, 1.5, 0);
      group.add(mirrorPane);

      const mirrorGlow = new THREE.PointLight('#ffe699', 0.8, 3.5);
      mirrorGlow.position.set(-ROOM_WIDTH / 2 + 0.05, 1.5, 0);
      group.add(mirrorGlow);

      // --- 2. GLASS SHOWER CABIN ---
      const glassCabGeo = new THREE.BoxGeometry(0.02, 2.0, 1.15);
      const glassCab1 = new THREE.Mesh(glassCabGeo, glassMat);
      glassCab1.position.set(-ROOM_WIDTH / 2 + 1.15, 1.0, -ROOM_DEPTH / 2 + 0.575);
      group.add(glassCab1);

      const glassCabGeo2 = new THREE.BoxGeometry(1.15, 2.0, 0.02);
      const glassCab2 = new THREE.Mesh(glassCabGeo2, glassMat);
      glassCab2.position.set(-ROOM_WIDTH / 2 + 0.575, 1.0, -ROOM_DEPTH / 2 + 1.15);
      group.add(glassCab2);

      const frameGeo = new THREE.BoxGeometry(0.04, 2.0, 0.04);
      const profileCorner = new THREE.Mesh(frameGeo, chromeMat);
      profileCorner.position.set(-ROOM_WIDTH / 2 + 1.15, 1.0, -ROOM_DEPTH / 2 + 1.15);
      group.add(profileCorner);

      const colGeo = new THREE.CylinderGeometry(0.012, 0.012, 1.7);
      const column = new THREE.Mesh(colGeo, chromeMat);
      column.position.set(-ROOM_WIDTH / 2 + 0.1, 1.25, -ROOM_DEPTH / 2 + 0.1);
      group.add(column);

      const showerHeadGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.015, 16);
      const showerHead = new THREE.Mesh(showerHeadGeo, chromeMat);
      showerHead.rotation.x = Math.PI / 2;
      showerHead.position.set(-ROOM_WIDTH / 2 + 0.28, 2.0, -ROOM_DEPTH / 2 + 0.1);
      showerHead.castShadow = true;
      group.add(showerHead);

      // --- 3. TOILET ---
      const toiletGeo = new THREE.BoxGeometry(0.38, 0.42, 0.55);
      const toilet = new THREE.Mesh(toiletGeo, porcelainMat);
      toilet.position.set(0.9, 0.32, -ROOM_DEPTH / 2 + 0.275);
      toilet.castShadow = true;
      group.add(toilet);

      const buttonPlateGeo = new THREE.BoxGeometry(0.25, 0.16, 0.015);
      const plate = new THREE.Mesh(buttonPlateGeo, chromeMat);
      plate.position.set(0.9, 1.05, -ROOM_DEPTH / 2 + 0.01);
      group.add(plate);

      const vanitySpot = new THREE.SpotLight('#ffffff', 0.65, 6, Math.PI / 4, 0.5, 1);
      vanitySpot.position.set(-ROOM_WIDTH / 2 + 0.6, ROOM_HEIGHT - 0.2, 0);
      vanitySpot.target = cabinet;
      group.add(vanitySpot);

    } else if (roomType === 'livingroom') {
      // --- 1. SECTIONAL COUCH ---
      const sofaBaseGeo = new THREE.BoxGeometry(1.2, 0.12, 2.2);
      const woodBaseMat = new THREE.MeshStandardMaterial({ color: '#402a1b', roughness: 0.75 });
      const sofaBase = new THREE.Mesh(sofaBaseGeo, woodBaseMat);
      sofaBase.position.set(0.4, 0.06, 0.2);
      sofaBase.castShadow = true;
      group.add(sofaBase);

      const sofaSeatGeo = new THREE.BoxGeometry(1.15, 0.28, 2.15);
      const fabricGreyMat = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.9 });
      const sofaSeat = new THREE.Mesh(sofaSeatGeo, fabricGreyMat);
      sofaSeat.position.set(0.38, 0.26, 0.2);
      sofaSeat.castShadow = true;
      sofaSeat.receiveShadow = true;
      group.add(sofaSeat);

      const backrestGeo = new THREE.BoxGeometry(0.26, 0.65, 2.15);
      const backrest = new THREE.Mesh(backrestGeo, fabricGreyMat);
      backrest.position.set(0.83, 0.68, 0.2);
      backrest.castShadow = true;
      group.add(backrest);

      const armrestGeo = new THREE.BoxGeometry(1.15, 0.44, 0.25);
      const armrestL = new THREE.Mesh(armrestGeo, fabricGreyMat);
      armrestL.position.set(0.38, 0.34, 1.15);
      armrestL.castShadow = true;
      group.add(armrestL);

      const armrestR = new THREE.Mesh(armrestGeo, fabricGreyMat);
      armrestR.position.set(0.38, 0.34, -0.75);
      armrestR.castShadow = true;
      group.add(armrestR);

      const legGeo = new THREE.CylinderGeometry(0.025, 0.018, 0.12, 8);
      for (let xOffset of [-0.05, 0.85]) {
        for (let zOffset of [-0.65, 1.05]) {
          const leg = new THREE.Mesh(legGeo, woodBaseMat);
          leg.position.set(xOffset, 0.06, zOffset);
          leg.castShadow = true;
          group.add(leg);
        }
      }

      // --- 2. TV CONSOLE & TV UNIT ---
      const tvConsoleGeo = new THREE.BoxGeometry(0.35, 0.45, 1.9);
      const walnutMat = new THREE.MeshStandardMaterial({ color: '#513726', roughness: 0.55 });
      const tvConsole = new THREE.Mesh(tvConsoleGeo, walnutMat);
      tvConsole.position.set(-ROOM_WIDTH / 2 + 0.175, 0.3, 0);
      tvConsole.castShadow = true;
      tvConsole.receiveShadow = true;
      group.add(tvConsole);

      const consoleDrawerGeo = new THREE.BoxGeometry(0.015, 0.38, 1.82);
      const drawMat = new THREE.MeshStandardMaterial({ color: '#111317', roughness: 0.2 });
      const consoleDrawers = new THREE.Mesh(consoleDrawerGeo, drawMat);
      consoleDrawers.position.set(-ROOM_WIDTH / 2 + 0.355, 0.3, 0);
      consoleDrawers.castShadow = true;
      group.add(consoleDrawers);

      const tvScreenGeo = new THREE.BoxGeometry(0.04, 0.85, 1.45);
      const screenMat = new THREE.MeshStandardMaterial({ color: '#090a0c', metalness: 0.9, roughness: 0.1 });
      const tvScreen = new THREE.Mesh(tvScreenGeo, screenMat);
      tvScreen.position.set(-ROOM_WIDTH / 2 + 0.1, 1.35, 0);
      tvScreen.castShadow = true;
      group.add(tvScreen);

      // --- 3. COFFEE TABLE ---
      const tableTopGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.02, 32);
      const tableTop = new THREE.Mesh(tableTopGeo, glassMat);
      tableTop.position.set(-0.6, 0.38, 0.2);
      tableTop.castShadow = true;
      group.add(tableTop);

      const tableLegGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.37);
      for (let angle of [0, Math.PI * 2 / 3, Math.PI * 4 / 3]) {
        const leg = new THREE.Mesh(tableLegGeo, brassMat);
        leg.position.set(
          -0.6 + Math.cos(angle) * 0.3,
          0.185,
          0.2 + Math.sin(angle) * 0.3
        );
        leg.castShadow = true;
        group.add(leg);
      }

      // --- 4. DESIGNER FLOOR LAMP ---
      const lampBaseGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.02, 16);
      const lampBase = new THREE.Mesh(lampBaseGeo, brassMat);
      lampBase.position.set(0.8, 0.01, 1.4);
      lampBase.castShadow = true;
      group.add(lampBase);

      const lampPoleGeo = new THREE.CylinderGeometry(0.012, 0.012, 1.6);
      const lampPole = new THREE.Mesh(lampPoleGeo, brassMat);
      lampPole.position.set(0.8, 0.8, 1.4);
      lampPole.castShadow = true;
      group.add(lampPole);

      const shadeGeo = new THREE.CylinderGeometry(0.12, 0.22, 0.26, 16);
      const fabricShadeMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.9 });
      const shade = new THREE.Mesh(shadeGeo, fabricShadeMat);
      shade.position.set(0.8, 1.65, 1.4);
      shade.castShadow = true;
      group.add(shade);

      const lampLight = new THREE.PointLight('#ffa62b', 1.4, 4.5);
      lampLight.position.set(0.8, 1.45, 1.4);
      group.add(lampLight);

    } else if (roomType === 'kitchen') {
      // --- 1. CABINETRY & COUNTERTOP ---
      const counterBaseGeo = new THREE.BoxGeometry(2.3, 0.85, 0.6);
      const baseCabinets = new THREE.Mesh(counterBaseGeo, darkCabMat);
      baseCabinets.position.set(-ROOM_WIDTH / 2 + 1.15, 0.425, -ROOM_DEPTH / 2 + 0.3); 
      baseCabinets.castShadow = true;
      baseCabinets.receiveShadow = true;
      group.add(baseCabinets);

      const topOakGeo = new THREE.BoxGeometry(2.32, 0.04, 0.62);
      const countertop = new THREE.Mesh(topOakGeo, oakWoodMat);
      countertop.position.set(-ROOM_WIDTH / 2 + 1.16, 0.85 + 0.02, -ROOM_DEPTH / 2 + 0.31);
      countertop.castShadow = true;
      countertop.receiveShadow = true;
      group.add(countertop);

      const wallCabGeo = new THREE.BoxGeometry(2.3, 0.65, 0.34);
      const wallCabinets = new THREE.Mesh(wallCabGeo, porcelainMat);
      wallCabinets.position.set(-ROOM_WIDTH / 2 + 1.15, 1.8 + 0.325, -ROOM_DEPTH / 2 + 0.17);
      wallCabinets.castShadow = true;
      group.add(wallCabinets);

      // --- 2. SINK & COOKTOP ---
      const sinkGeo = new THREE.BoxGeometry(0.52, 0.01, 0.42);
      const sinkMetalMat = new THREE.MeshStandardMaterial({ color: '#555555', metalness: 0.8, roughness: 0.3 });
      const sinkBox = new THREE.Mesh(sinkGeo, sinkMetalMat);
      sinkBox.position.set(-ROOM_WIDTH / 2 + 0.6, 0.875, -ROOM_DEPTH / 2 + 0.3);
      group.add(sinkBox);

      const tapBaseGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.24);
      const tapBase = new THREE.Mesh(tapBaseGeo, chromeMat);
      tapBase.position.set(-ROOM_WIDTH / 2 + 0.6, 0.875 + 0.12, -ROOM_DEPTH / 2 + 0.16);
      group.add(tapBase);

      const tapArchGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.18);
      const tapArch = new THREE.Mesh(tapArchGeo, chromeMat);
      tapArch.rotation.x = Math.PI / 2;
      tapArch.position.set(-ROOM_WIDTH / 2 + 0.6, 0.875 + 0.24, -ROOM_DEPTH / 2 + 0.23);
      group.add(tapArch);

      const hobGeo = new THREE.BoxGeometry(0.62, 0.01, 0.52);
      const hobMat = new THREE.MeshStandardMaterial({ color: '#111215', roughness: 0.08, metalness: 0.85 });
      const hob = new THREE.Mesh(hobGeo, hobMat);
      hob.position.set(-ROOM_WIDTH / 2 + 1.65, 0.875, -ROOM_DEPTH / 2 + 0.3);
      group.add(hob);

      // --- 3. REFRIGERATOR ---
      const fridgeGeo = new THREE.BoxGeometry(0.68, 1.9, 0.64);
      const steelMat = new THREE.MeshStandardMaterial({ color: '#a2a8b3', metalness: 0.85, roughness: 0.25 });
      const fridge = new THREE.Mesh(fridgeGeo, steelMat);
      fridge.position.set(-ROOM_WIDTH / 2 + 2.3 + 0.34, 0.95, -ROOM_DEPTH / 2 + 0.32);
      fridge.castShadow = true;
      group.add(fridge);

      const doorGapGeo = new THREE.BoxGeometry(0.69, 0.015, 0.015);
      const gapMat = new THREE.MeshBasicMaterial({ color: '#222222' });
      const doorGap = new THREE.Mesh(doorGapGeo, gapMat);
      doorGap.position.set(-ROOM_WIDTH / 2 + 2.3 + 0.34, 1.15, -ROOM_DEPTH / 2 + 0.64);
      group.add(doorGap);

      // --- 4. COZY LED DOWNLIGHTS ---
      const ledLightL = new THREE.PointLight('#ffe8b3', 0.8, 2.2);
      ledLightL.position.set(-ROOM_WIDTH / 2 + 0.6, 1.45, -ROOM_DEPTH / 2 + 0.3);
      group.add(ledLightL);

      const ledLightR = new THREE.PointLight('#ffe8b3', 0.8, 2.2);
      ledLightR.position.set(-ROOM_WIDTH / 2 + 1.65, 1.45, -ROOM_DEPTH / 2 + 0.3);
      group.add(ledLightR);
      
    } else if (roomType === 'hallway') {
      // --- 1. PORTMANTO (COAT WARDROBE) ---
      const wardrobeGeo = new THREE.BoxGeometry(0.35, 2.0, 1.0);
      const wardrobe = new THREE.Mesh(wardrobeGeo, darkCabMat);
      wardrobe.position.set(-ROOM_WIDTH / 2 + 0.175, 1.0, 0.5);
      wardrobe.castShadow = true;
      wardrobe.receiveShadow = true;
      group.add(wardrobe);

      const woodTrimGeo = new THREE.BoxGeometry(0.36, 0.04, 1.02);
      const woodTrim = new THREE.Mesh(woodTrimGeo, oakWoodMat);
      woodTrim.position.set(-ROOM_WIDTH / 2 + 0.18, 2.02, 0.5);
      woodTrim.castShadow = true;
      group.add(woodTrim);

      // --- 2. HANGING MIRROR & BENCH ---
      const benchGeo = new THREE.BoxGeometry(0.4, 0.45, 1.0);
      const bench = new THREE.Mesh(benchGeo, oakWoodMat);
      bench.position.set(0, 0.225, -ROOM_DEPTH / 2 + 0.2);
      bench.castShadow = true;
      bench.receiveShadow = true;
      group.add(bench);

      const benchCushionGeo = new THREE.BoxGeometry(0.38, 0.06, 0.96);
      const leatherMat = new THREE.MeshStandardMaterial({ color: '#543d2b', roughness: 0.7 });
      const cushion = new THREE.Mesh(benchCushionGeo, leatherMat);
      cushion.position.set(0, 0.45 + 0.03, -ROOM_DEPTH / 2 + 0.2);
      cushion.castShadow = true;
      group.add(cushion);

      // Circular wall mirror (back wall)
      const mirrorRingGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.02, 32);
      const ring = new THREE.Mesh(mirrorRingGeo, brassMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, 1.4, -ROOM_DEPTH / 2 + 0.01);
      group.add(ring);

      const mirrorCircleGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.01, 32);
      const mirrorPaneMat = new THREE.MeshStandardMaterial({ color: '#999999', metalness: 0.98, roughness: 0.02 });
      const circleMirror = new THREE.Mesh(mirrorCircleGeo, mirrorPaneMat);
      circleMirror.rotation.x = Math.PI / 2;
      circleMirror.position.set(0, 1.4, -ROOM_DEPTH / 2 + 0.015);
      group.add(circleMirror);

      // --- 3. COAT PEGS (Hangers) ---
      const pegBarGeo = new THREE.BoxGeometry(0.02, 0.08, 0.8);
      const pegBar = new THREE.Mesh(pegBarGeo, darkCabMat);
      pegBar.position.set(0.9, 1.5, -ROOM_DEPTH / 2 + 0.02);
      group.add(pegBar);

      const pegGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.06);
      for (let zOffset of [-0.3, -0.1, 0.1, 0.3]) {
        const peg = new THREE.Mesh(pegGeo, brassMat);
        peg.rotation.x = Math.PI / 2.3;
        peg.position.set(0.9, 1.5, -ROOM_DEPTH / 2 + 0.05 + zOffset);
        group.add(peg);
      }

      // Hallway Spot Light pointing down
      const hallwaySpot = new THREE.SpotLight('#ffffff', 0.85, 5.5, Math.PI / 6, 0.5, 1);
      hallwaySpot.position.set(0, ROOM_HEIGHT - 0.2, -ROOM_DEPTH / 2 + 0.6);
      hallwaySpot.target = bench;
      group.add(hallwaySpot);

    } else if (roomType === 'terrace') {
      // --- 1. BALUSTRADE / METAL RAILING (Open terrace sides) ---
      const railingMat = new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.9, metalness: 0.7 });
      
      // Right handrail
      const rightRailGeo = new THREE.BoxGeometry(0.04, 0.03, ROOM_DEPTH);
      const rightHandrail = new THREE.Mesh(rightRailGeo, railingMat);
      rightHandrail.position.set(ROOM_WIDTH / 2 - 0.02, 1.0, 0);
      group.add(rightHandrail);

      // Front handrail
      const frontRailGeo = new THREE.BoxGeometry(ROOM_WIDTH, 0.03, 0.04);
      const frontHandrail = new THREE.Mesh(frontRailGeo, railingMat);
      frontHandrail.position.set(0, 1.0, ROOM_DEPTH / 2 - 0.02);
      group.add(frontHandrail);

      // Vertical posts
      const postGeo = new THREE.CylinderGeometry(0.008, 0.008, 1.0);
      // Right posts spacing
      for (let z = -ROOM_DEPTH / 2 + 0.2; z <= ROOM_DEPTH / 2 - 0.2; z += 0.3) {
        const post = new THREE.Mesh(postGeo, railingMat);
        post.position.set(ROOM_WIDTH / 2 - 0.02, 0.5, z);
        post.castShadow = true;
        group.add(post);
      }
      // Front posts spacing
      for (let x = -ROOM_WIDTH / 2 + 0.2; x <= ROOM_WIDTH / 2 - 0.2; x += 0.3) {
        const post = new THREE.Mesh(postGeo, railingMat);
        post.position.set(x, 0.5, ROOM_DEPTH / 2 - 0.02);
        post.castShadow = true;
        group.add(post);
      }

      // --- 2. OUTDOOR PATIO TABLE & CHAIRS ---
      // Steel wire frame table
      const pTableTopGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.015, 32);
      const patioTop = new THREE.Mesh(pTableTopGeo, railingMat);
      patioTop.position.set(0.4, 0.7, -0.2);
      patioTop.castShadow = true;
      group.add(patioTop);

      const pTableLegGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.7);
      for (let angle of [0, Math.PI * 2 / 3, Math.PI * 4 / 3]) {
        const leg = new THREE.Mesh(pTableLegGeo, railingMat);
        leg.position.set(
          0.4 + Math.cos(angle) * 0.26,
          0.35,
          -0.2 + Math.sin(angle) * 0.26
        );
        leg.castShadow = true;
        group.add(leg);
      }

      // Patio Chairs (Procedural wire boxes)
      const seatGeo = new THREE.BoxGeometry(0.36, 0.02, 0.36);
      const backGeo = new THREE.BoxGeometry(0.02, 0.38, 0.36);
      const chairLegGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.4);

      // Chair 1
      const seat1 = new THREE.Mesh(seatGeo, railingMat);
      seat1.position.set(0.4, 0.4, -0.75);
      seat1.castShadow = true;
      group.add(seat1);

      const back1 = new THREE.Mesh(backGeo, railingMat);
      back1.position.set(0.4, 0.59, -0.92);
      back1.castShadow = true;
      group.add(back1);

      for (let dx of [-0.15, 0.15]) {
        for (let dz of [-0.15, 0.15]) {
          const leg = new THREE.Mesh(chairLegGeo, railingMat);
          leg.position.set(0.4 + dx, 0.2, -0.75 + dz);
          leg.castShadow = true;
          group.add(leg);
        }
      }

      // Chair 2
      const seat2 = new THREE.Mesh(seatGeo, railingMat);
      seat2.position.set(0.4, 0.4, 0.35);
      seat2.castShadow = true;
      group.add(seat2);

      const back2 = new THREE.Mesh(backGeo, railingMat);
      back2.position.set(0.4, 0.59, 0.52);
      back2.castShadow = true;
      group.add(back2);

      for (let dx of [-0.15, 0.15]) {
        for (let dz of [-0.15, 0.15]) {
          const leg = new THREE.Mesh(chairLegGeo, railingMat);
          leg.position.set(0.4 + dx, 0.2, 0.35 + dz);
          leg.castShadow = true;
          group.add(leg);
        }
      }

      // --- 3. LARGE CERAMIC TERRACOTTA POT & PLANT ---
      const potGeo = new THREE.CylinderGeometry(0.24, 0.16, 0.48, 16);
      const terracottaMat = new THREE.MeshStandardMaterial({ color: '#d35400', roughness: 0.9 });
      const pot = new THREE.Mesh(potGeo, terracottaMat);
      pot.position.set(-1.2, 0.24, -1.2);
      pot.castShadow = true;
      group.add(pot);

      // Leafy shapes
      const leafGeo = new THREE.SphereGeometry(0.18, 8, 8);
      const leafMat = new THREE.MeshStandardMaterial({ color: '#27ae60', roughness: 0.85 });
      for (let leafOffset of [
        { x: 0, y: 0.32, z: 0 },
        { x: -0.1, y: 0.42, z: 0.05 },
        { x: 0.08, y: 0.46, z: -0.08 },
        { x: -0.05, y: 0.55, z: -0.05 }
      ]) {
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.position.set(-1.2 + leafOffset.x, 0.24 + leafOffset.y, -1.2 + leafOffset.z);
        leaf.castShadow = true;
        group.add(leaf);
      }
    }

  }, [roomType, isSceneReady]);

  // Update lighting configurations reactively when controls change
  useEffect(() => {
    if (!isSceneReady) return;

    const ambient = ambientLightRef.current;
    const sunLight = directionalLightRef.current;
    const centerLight = pointLightRef.current;

    if (!ambient || !sunLight || !centerLight) return;

    // 1. Color temperature selection
    let lightColor = '#ffffff';
    let centerColor = '#ffeabf'; // warm bulb
    if (lightTemp === 'warm') {
      lightColor = '#ffb03b';
      centerColor = '#ffaa19';
    } else if (lightTemp === 'cool') {
      lightColor = '#d8ebff';
      centerColor = '#dcf0ff';
    }

    // 2. Time of day base intensities
    let ambientBase = 0.45;
    let sunBase = 0.65;
    let centerBase = 0.25;

    if (timeOfDay === 'night') {
      ambientBase = 0.12;
      sunBase = 0.02; // sun goes down
      centerBase = 0.65; // interior bulb glows stronger
      if (sceneRef.current) {
        sceneRef.current.background = new THREE.Color('#060709');
      }
    } else {
      ambientBase = 0.45;
      sunBase = 0.65;
      centerBase = 0.25;
      if (sceneRef.current) {
        sceneRef.current.background = new THREE.Color('#101216');
      }
    }

    // 3. Apply light values multiplied by the intensity slider
    ambient.color.set(lightColor);
    ambient.intensity = ambientBase * lightIntensity;

    sunLight.color.set(lightColor);
    sunLight.intensity = sunBase * lightIntensity;

    centerLight.color.set(centerColor);
    centerLight.intensity = centerBase * lightIntensity;

    // Adjust child lights inside custom room furnishings
    const group = furnishingsGroupRef.current;
    if (group) {
      group.traverse((child) => {
        if (child.isLight) {
          if (child.isSpotLight) {
            child.color.set(lightColor);
            const baseSpot = timeOfDay === 'night' ? 1.4 : 0.65;
            child.intensity = baseSpot * lightIntensity;
          } else if (child.isPointLight) {
            child.color.set(lightTemp === 'warm' ? '#ffae19' : lightTemp === 'cool' ? '#dcf0ff' : '#ffe8b3');
            const basePoint = timeOfDay === 'night' ? 1.5 : 0.8;
            child.intensity = basePoint * lightIntensity;
          }
        }
      });
    }

  }, [lightTemp, lightIntensity, timeOfDay, isSceneReady]);

  // Regenerate tile textures and repeat maps reactively
  useEffect(() => {
    if (!isSceneReady || !activeProduct || !sceneRef.current) return;

    const loader = new THREE.TextureLoader();
    
    const w_m = activeProduct.width / 100;
    const h_m = activeProduct.height / 100;
    const repeatX = ROOM_WIDTH / w_m;
    const repeatY = ROOM_DEPTH / h_m;

    const applyTexture = (sourceImageOrCanvas, isImage = true) => {
      // 1. Generate grout overlay and apply pattern/rotation
      const texture = generateGroutOverlay(sourceImageOrCanvas, activeProduct, groutWidth, groutColor, tileRotation, layPattern);

      texture.repeat.set(repeatX, repeatY);
      texture.colorSpace = THREE.SRGBColorSpace;

      // 2. Materials properties mapping
      let roughness = 0.5;
      let metalness = 0.1;
      let clearcoat = 0.0;
      let clearcoatRoughness = 0.0;

      if (activeProduct.finish === 'Parlak') {
        roughness = 0.08;
        metalness = 0.15;
        clearcoat = 1.0;
        clearcoatRoughness = 0.05;
      } else if (activeProduct.finish === 'Mat') {
        roughness = 0.85;
        metalness = 0.05;
      } else if (activeProduct.finish === 'Lapatto') {
        roughness = 0.35;
        metalness = 0.1;
        clearcoat = 0.4;
        clearcoatRoughness = 0.2;
      }

      const newMaterial = new THREE.MeshPhysicalMaterial({
        map: texture,
        roughness: roughness,
        metalness: metalness,
        clearcoat: clearcoat,
        clearcoatRoughness: clearcoatRoughness,
        clearcoatNormalScale: new THREE.Vector2(0.2, 0.2)
      });

      // 3. Bind to zemin or duvarlar target
      if (applyTo === 'floor' && floorMeshRef.current) {
        if (floorMeshRef.current.material.map) floorMeshRef.current.material.map.dispose();
        floorMeshRef.current.material.dispose();
        floorMeshRef.current.material = newMaterial;
      } 
      else if (applyTo === 'walls') {
        const wallRepeatY = ROOM_HEIGHT / h_m;
        
        // Back Wall
        const backTexture = texture.clone();
        backTexture.repeat.set(repeatX, wallRepeatY);
        const backWallMat = new THREE.MeshPhysicalMaterial({
          map: backTexture,
          roughness: roughness,
          metalness: metalness,
          clearcoat: clearcoat,
          clearcoatRoughness: clearcoatRoughness
        });
        if (backWallMeshRef.current.material.map) backWallMeshRef.current.material.map.dispose();
        backWallMeshRef.current.material.dispose();
        backWallMeshRef.current.material = backWallMat;

        // Left Wall
        const leftTexture = texture.clone();
        leftTexture.repeat.set(repeatY, wallRepeatY); 
        const leftWallMat = new THREE.MeshPhysicalMaterial({
          map: leftTexture,
          roughness: roughness,
          metalness: metalness,
          clearcoat: clearcoat,
          clearcoatRoughness: clearcoatRoughness
        });
        if (leftWallMeshRef.current.material.map) leftWallMeshRef.current.material.map.dispose();
        leftWallMeshRef.current.material.dispose();
        leftWallMeshRef.current.material = leftWallMat;
      }

      setTextureStatus(isImage ? 'Real JPG Image Loaded' : 'Procedural Fallback Generated');
    };

    // Load from URL or generate procedural canvas
    const realTextureUrl = activeProduct.textureUrl || activeProduct.imageUrl;
    if (realTextureUrl) {
      const isAbsolute = realTextureUrl.startsWith('http://') || realTextureUrl.startsWith('https://') || realTextureUrl.startsWith('//');
      const finalUrl = isAbsolute ? `/api/proxy?url=${encodeURIComponent(realTextureUrl)}` : realTextureUrl;
      loader.load(
        finalUrl,
        (loadedTexture) => {
          applyTexture(loadedTexture.image, true);
        },
        undefined,
        () => {
          console.warn(`Could not load image ${realTextureUrl}. Using procedural generator.`);
          const proceduralCanvas = generateProceduralTexture(activeProduct);
          applyTexture(proceduralCanvas, false);
        }
      );
    } else {
      const proceduralCanvas = generateProceduralTexture(activeProduct);
      applyTexture(proceduralCanvas, false);
    }

  }, [activeProduct, applyTo, groutWidth, groutColor, tileRotation, layPattern, isSceneReady]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div 
        ref={containerRef} 
        style={{ width: '100%', height: '100%', cursor: 'grab' }} 
      />
      {/* Information Overlay */}
      <div className="canvas-overlay">
        <div className="overlay-badge">
          <span>Doku Modu: </span>
          <strong style={{ color: textureStatus.includes('Real') ? 'var(--accent-green)' : 'var(--accent-gold)' }}>
            {textureStatus}
          </strong>
        </div>
        <div className="overlay-badge">
          <span>Sahne: </span>
          <strong style={{ textTransform: 'capitalize', color: 'var(--accent-gold)' }}>
            {roomType === 'bathroom' ? 'Lüks Banyo' : 
             roomType === 'livingroom' ? 'Modern Salon' : 
             roomType === 'kitchen' ? 'İndüstriyel Mutfak' :
             roomType === 'hallway' ? 'Modern Antre' : 'Açık Teras'}
          </strong>
        </div>
        <div className="overlay-badge">
          <span>Döşeme Hedefi: </span>
          <strong style={{ textTransform: 'capitalize', color: 'var(--accent-blue)' }}>
            {applyTo === 'floor' ? 'Zemin' : 'Duvarlar'}
          </strong>
        </div>
        <div className="overlay-instructions">
          Sürükleyip Döndür • Kaydırıp Yakınlaş
        </div>
      </div>
      <style jsx>{`
        .canvas-overlay {
          position: absolute;
          bottom: 16px;
          left: 16px;
          right: 16px;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          pointer-events: none;
          gap: 8px;
        }
        .overlay-badge {
          background: rgba(20, 22, 28, 0.85);
          border: 1px solid var(--border-color);
          color: #fff;
          padding: 6px 12px;
          border-radius: var(--border-radius-sm);
          font-size: 0.75rem;
          font-family: var(--font-body);
          backdrop-filter: blur(4px);
        }
        .overlay-instructions {
          background: rgba(197, 160, 89, 0.1);
          border: 1px solid var(--border-gold);
          color: var(--accent-gold);
          padding: 6px 12px;
          border-radius: var(--border-radius-sm);
          font-size: 0.75rem;
          font-weight: 500;
          font-family: var(--font-title);
          backdrop-filter: blur(4px);
        }
      `}</style>
    </div>
  );
}
