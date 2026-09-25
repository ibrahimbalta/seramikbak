import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { cropWhiteBorders } from '../utils/imageTextureUtils';

export default function StudioCanvas({ 
  activeProduct, 
  floorProduct,
  wallProduct,
  accentProduct,
  showerProduct,
  showerFloorProduct,
  toiletWallProduct,
  leftWallAccentProduct,
  stripeWallProduct,
  comparisonProduct,
  applyFloor = true, 
  applyWalls = true, 
  applyAccent = false,
  applyShower = false,
  applyShowerFloor = false,
  applyToiletWall = false,
  applyLeftWallAccent = false,
  applyStripeWall = false,
  comparisonMode = false,
  comparisonSplit = 50,
  walkthroughMode = false,
  onToggleTarget,
  roomType = 'bathroom',
  groutWidth = '2',
  groutColor = '#888888',
  lightTemp = 'neutral',
  lightIntensity = 1.0,
  tileRotation = 0,
  layPattern = 'flat',
  timeOfDay = 'day',
  cabinetColor = '#5c4033',
  faucetColor = 'chrome',
  showerGlass = 'clear',
  onShowerGlassChange
}) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const accentWallMeshRef = useRef(null);
  const showerBackWallMeshRef = useRef(null);
  const showerSideWallMeshRef = useRef(null);
  const showerFloorMeshRef = useRef(null);
  const toiletWallMeshRef = useRef(null);
  const leftWallAccentMeshRef = useRef(null);
  const stripeWallMeshRef = useRef(null);
  const leftStripeWallMeshRef = useRef(null);

  // References to lights & meshes
  const floorMeshRef = useRef(null);
  const backWallMeshRef = useRef(null);
  const leftWallMeshRef = useRef(null);
  const furnishingsGroupRef = useRef(null);
  const onToggleTargetRef = useRef(onToggleTarget);

  useEffect(() => {
    onToggleTargetRef.current = onToggleTarget;
  }, [onToggleTarget]);

  const ambientLightRef = useRef(null);
  const directionalLightRef = useRef(null);
  const pointLightRef = useRef(null);
  const imageCacheRef = useRef(new Map());

  // Tracks loading state and type
  const [textureStatus, setTextureStatus] = useState('Procedural (Fallback)');
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [activeCameraPreset, setActiveCameraPreset] = useState('perspective');
  const [activeGlass, setActiveGlass] = useState(showerGlass || 'clear');

  useEffect(() => {
    if (showerGlass) setActiveGlass(showerGlass);
  }, [showerGlass]);

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
      
      for (let k = 0; k < 300; k++) {
        const nx = Math.floor(Math.random() * 512);
        const ny = Math.floor(Math.random() * 512);
        const ncolor = Math.random() > 0.5 ? 255 : 0;
        ctx.fillStyle = `rgba(${ncolor}, ${ncolor}, ${ncolor}, 0.05)`;
        ctx.fillRect(nx, ny, 2, 2);
      }
    } 
    else {
      ctx.fillStyle = '#f1f3f7';
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = 'rgba(180, 185, 195, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(100, 0); ctx.lineTo(400, 512);
      ctx.moveTo(300, 0); ctx.lineTo(100, 512);
      ctx.stroke();
    }

    return canvas;
  };

  // Helper to generate a CanvasTexture dynamically injecting grout border overlays, tile patterns (Herringbone, Staggered) and rotation
  const generateGroutOverlay = (sourceCanvasOrImage, product, gWidth, gColor, rotation, pattern) => {
    const cleanSource = cropWhiteBorders(sourceCanvasOrImage);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const groutMm = parseFloat(gWidth) || 2;
    const borderPx = groutMm > 0 ? Math.max(1, Math.min(3, Math.round(groutMm * 0.6))) : 0;

    // Fill entire canvas with grout color first
    ctx.fillStyle = gColor || '#888888';
    ctx.fillRect(0, 0, 512, 512);

    if (pattern === 'herringbone') {
      const pw = 250 - borderPx;
      const ph = 120 - borderPx;

      ctx.drawImage(cleanSource, 10, 10, pw, ph);
      ctx.drawImage(cleanSource, 260, 10, pw, ph);
      
      ctx.save();
      ctx.translate(135, 380);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(cleanSource, -ph/2, -pw/2, ph, pw);
      ctx.restore();

      ctx.save();
      ctx.translate(385, 380);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(cleanSource, -ph/2, -pw/2, ph, pw);
      ctx.restore();
    } 
    else if (pattern === 'staggered_50' || pattern === 'staggered_33') {
      const rowH = 256 - borderPx;
      const offsetRatio = pattern === 'staggered_50' ? 0.5 : 0.33;

      ctx.drawImage(cleanSource, 0, 0, 512 - borderPx, rowH);
      const offsetPx = 512 * offsetRatio;
      ctx.drawImage(cleanSource, offsetPx, 256, 512 - borderPx, rowH);
      ctx.drawImage(cleanSource, offsetPx - 512, 256, 512 - borderPx, rowH);
    } 
    else {
      const tileW = 512 - borderPx;
      const tileH = 512 - borderPx;
      ctx.drawImage(cleanSource, 0, 0, tileW, tileH);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

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
    scene.background = new THREE.Color('#1c202a'); 
    scene.fog = new THREE.FogExp2('#1c202a', 0.035);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 100);
    camera.position.set(4, 3.2, 5); 
    cameraRef.current = camera;

    const isMobileDevice = typeof window !== 'undefined' && window.innerWidth <= 768;

    // 3. Renderer with high performance & mobile optimizations
    const renderer = new THREE.WebGLRenderer({ 
      antialias: !isMobileDevice, 
      alpha: false, 
      preserveDrawingBuffer: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobileDevice ? 1.5 : 2.0));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = isMobileDevice ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    
    // Clear container and append canvas
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.48);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    // Ceiling & floor bounce light for natural architectural GI look
    const hemiLight = new THREE.HemisphereLight(0xfff6ea, 0x1f2430, 0.65);
    hemiLight.position.set(0, ROOM_HEIGHT, 0);
    scene.add(hemiLight);

    const directionalLight = new THREE.DirectionalLight('#fffaf0', 0.95);
    directionalLight.position.set(4, 5.2, 3.2);
    directionalLight.castShadow = true;
    const shadowMapRes = isMobileDevice ? 1024 : 2048;
    directionalLight.shadow.mapSize.width = shadowMapRes;
    directionalLight.shadow.mapSize.height = shadowMapRes;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 16;
    directionalLight.shadow.bias = -0.0005;
    directionalLight.shadow.normalBias = 0.02;
    scene.add(directionalLight);
    directionalLightRef.current = directionalLight;

    const pointLight = new THREE.PointLight('#ffdf9e', 0.35, 10);
    pointLight.position.set(0, 2.2, 0); 
    scene.add(pointLight);
    pointLightRef.current = pointLight;

    // 4 Architectural Recessed Ceiling Downlights (Spotlights)
    // 1. Vanity / Sink Spotlight
    const vanityDownlight = new THREE.SpotLight('#fff4e0', 1.25, 6.5, Math.PI / 4, 0.6, 1);
    vanityDownlight.position.set(-ROOM_WIDTH / 2 + 0.65, ROOM_HEIGHT - 0.05, 0);
    vanityDownlight.target.position.set(-ROOM_WIDTH / 2 + 0.35, 0.6, 0);
    scene.add(vanityDownlight);
    scene.add(vanityDownlight.target);

    // 2. Shower Spotlight
    const showerDownlight = new THREE.SpotLight('#f2f7ff', 1.15, 6.5, Math.PI / 4, 0.6, 1);
    showerDownlight.position.set(-ROOM_WIDTH / 2 + 0.58, ROOM_HEIGHT - 0.05, -ROOM_DEPTH / 2 + 0.58);
    showerDownlight.target.position.set(-ROOM_WIDTH / 2 + 0.58, 0, -ROOM_DEPTH / 2 + 0.58);
    scene.add(showerDownlight);
    scene.add(showerDownlight.target);

    // 3. Toilet Area Spotlight
    const toiletDownlight = new THREE.SpotLight('#fff3df', 0.95, 6.0, Math.PI / 4, 0.6, 1);
    toiletDownlight.position.set(0.9, ROOM_HEIGHT - 0.05, -ROOM_DEPTH / 2 + 0.3);
    toiletDownlight.target.position.set(0.9, 0, -ROOM_DEPTH / 2 + 0.3);
    scene.add(toiletDownlight);
    scene.add(toiletDownlight.target);

    // 4. Center / Floor Specular Accent Spotlight
    const floorDownlight = new THREE.SpotLight('#fff9ee', 1.05, 7.0, Math.PI / 3.5, 0.75, 1);
    floorDownlight.position.set(0.5, ROOM_HEIGHT - 0.05, 0.5);
    floorDownlight.target.position.set(0, 0, 0);
    scene.add(floorDownlight);
    scene.add(floorDownlight.target);

    // 5. Room geometry setup
    // Floor
    const floorGeo = new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_DEPTH);
    const floorMat = new THREE.MeshStandardMaterial({ color: '#272b33', roughness: 0.8 });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);
    floorMeshRef.current = floorMesh;

    // Shower Floor / Tray Panel (Duşakabin Tabanı)
    const showerFloorGeo = new THREE.PlaneGeometry(1.15, 1.15);
    const showerFloorMat = new THREE.MeshStandardMaterial({ color: '#181b22', roughness: 0.85 });
    const showerFloorMesh = new THREE.Mesh(showerFloorGeo, showerFloorMat);
    showerFloorMesh.rotation.x = -Math.PI / 2;
    showerFloorMesh.position.set(-ROOM_WIDTH / 2 + 0.575, 0.004, -ROOM_DEPTH / 2 + 0.575);
    showerFloorMesh.receiveShadow = true;
    scene.add(showerFloorMesh);
    showerFloorMeshRef.current = showerFloorMesh;

    // Back Wall (facing camera)
    const backWallGeo = new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_HEIGHT);
    const backWallMat = new THREE.MeshStandardMaterial({ color: '#23272f', roughness: 0.9 });
    const backWallMesh = new THREE.Mesh(backWallGeo, backWallMat);
    backWallMesh.position.set(0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2);
    backWallMesh.receiveShadow = true;
    scene.add(backWallMesh);
    backWallMeshRef.current = backWallMesh;

    // Accent Wall Panel (Lavabo & Banyo Dolabı Arkası Vurgu Duvarı)
    const accentWallGeo = new THREE.PlaneGeometry(1.3, ROOM_HEIGHT);
    const accentWallMat = new THREE.MeshStandardMaterial({ color: '#1a1e26', roughness: 0.85 });
    const accentWallMesh = new THREE.Mesh(accentWallGeo, accentWallMat);
    accentWallMesh.rotation.y = Math.PI / 2;
    accentWallMesh.position.set(-ROOM_WIDTH / 2 + 0.008, ROOM_HEIGHT / 2, 0);
    accentWallMesh.receiveShadow = true;
    scene.add(accentWallMesh);
    accentWallMeshRef.current = accentWallMesh;

    // Shower Cabin Back Wall Panel (Duşakabin Arka Duvarı)
    const showerBackGeo = new THREE.PlaneGeometry(1.15, ROOM_HEIGHT);
    const showerBackMat = new THREE.MeshStandardMaterial({ color: '#181b22', roughness: 0.85 });
    const showerBackWallMesh = new THREE.Mesh(showerBackGeo, showerBackMat);
    showerBackWallMesh.position.set(-ROOM_WIDTH / 2 + 0.575, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2 + 0.008);
    showerBackWallMesh.receiveShadow = true;
    scene.add(showerBackWallMesh);
    showerBackWallMeshRef.current = showerBackWallMesh;

    // Shower Cabin Side Wall Panel (Duşakabin Yan Duvarı)
    const showerSideGeo = new THREE.PlaneGeometry(1.15, ROOM_HEIGHT);
    const showerSideMat = new THREE.MeshStandardMaterial({ color: '#181b22', roughness: 0.85 });
    const showerSideWallMesh = new THREE.Mesh(showerSideGeo, showerSideMat);
    showerSideWallMesh.rotation.y = Math.PI / 2;
    showerSideWallMesh.position.set(-ROOM_WIDTH / 2 + 0.008, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2 + 0.575);
    showerSideWallMesh.receiveShadow = true;
    scene.add(showerSideWallMesh);
    showerSideWallMeshRef.current = showerSideWallMesh;

    // Toilet Back Wall Panel (Klozet Arkası Vurgu Duvarı)
    const toiletWallGeo = new THREE.PlaneGeometry(1.0, ROOM_HEIGHT);
    const toiletWallMat = new THREE.MeshStandardMaterial({ color: '#181b22', roughness: 0.85 });
    const toiletWallMesh = new THREE.Mesh(toiletWallGeo, toiletWallMat);
    toiletWallMesh.position.set(0.9, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2 + 0.008);
    toiletWallMesh.receiveShadow = true;
    scene.add(toiletWallMesh);
    toiletWallMeshRef.current = toiletWallMesh;

    // Left Wall Accent Panel (Sol Yan Duvar Ön Bölge Özel Ara Seramik Bölgesi)
    const leftWallAccentGeo = new THREE.PlaneGeometry(1.1, ROOM_HEIGHT);
    const leftWallAccentMat = new THREE.MeshStandardMaterial({ color: '#181b22', roughness: 0.85 });
    const leftWallAccentMesh = new THREE.Mesh(leftWallAccentGeo, leftWallAccentMat);
    leftWallAccentMesh.rotation.y = Math.PI / 2;
    leftWallAccentMesh.position.set(-ROOM_WIDTH / 2 + 0.006, ROOM_HEIGHT / 2, 1.2);
    leftWallAccentMesh.receiveShadow = true;
    scene.add(leftWallAccentMesh);
    leftWallAccentMeshRef.current = leftWallAccentMesh;

    // Horizontal Accent Stripe Band (Ana Duvar Yatay Bordür / Şerit Kuşağı)
    const stripeWallGeo = new THREE.PlaneGeometry(ROOM_WIDTH, 0.6);
    const stripeWallMat = new THREE.MeshStandardMaterial({ color: '#181b22', roughness: 0.85 });
    const stripeWallMesh = new THREE.Mesh(stripeWallGeo, stripeWallMat);
    stripeWallMesh.position.set(0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2 + 0.004);
    stripeWallMesh.receiveShadow = true;
    scene.add(stripeWallMesh);
    stripeWallMeshRef.current = stripeWallMesh;

    // Horizontal Accent Stripe Band - Left Wall Continuation (Sol Duvar Yatay Bordür Kuşağı)
    const leftStripeWallGeo = new THREE.PlaneGeometry(ROOM_DEPTH, 0.6);
    const leftStripeWallMat = new THREE.MeshStandardMaterial({ color: '#181b22', roughness: 0.85 });
    const leftStripeWallMesh = new THREE.Mesh(leftStripeWallGeo, leftStripeWallMat);
    leftStripeWallMesh.rotation.y = Math.PI / 2;
    leftStripeWallMesh.position.set(-ROOM_WIDTH / 2 + 0.004, ROOM_HEIGHT / 2, 0);
    leftStripeWallMesh.receiveShadow = true;
    scene.add(leftStripeWallMesh);
    leftStripeWallMeshRef.current = leftStripeWallMesh;

    // Left Wall (side wall)
    const leftWallGeo = new THREE.PlaneGeometry(ROOM_DEPTH, ROOM_HEIGHT);
    const leftWallMat = new THREE.MeshStandardMaterial({ color: '#1f2229', roughness: 0.9 });
    const leftWallMesh = new THREE.Mesh(leftWallGeo, leftWallMat);
    leftWallMesh.rotation.y = Math.PI / 2;
    leftWallMesh.position.set(-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0);
    leftWallMesh.receiveShadow = true;
    scene.add(leftWallMesh);
    leftWallMeshRef.current = leftWallMesh;

    // Architectural Perimeter Ceiling Cove LED Light Profiles
    const coveMat = new THREE.MeshBasicMaterial({ color: '#ffeab8' });
    const coveBack = new THREE.Mesh(new THREE.BoxGeometry(ROOM_WIDTH, 0.02, 0.025), coveMat);
    coveBack.position.set(0, ROOM_HEIGHT - 0.02, -ROOM_DEPTH / 2 + 0.025);
    scene.add(coveBack);

    const coveLeft = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.02, ROOM_DEPTH), coveMat);
    coveLeft.position.set(-ROOM_WIDTH / 2 + 0.025, ROOM_HEIGHT - 0.02, 0);
    scene.add(coveLeft);

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
    let startX = 0;
    let startY = 0;
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

    // Setup Raycasting for interactive surface selection (floor & walls)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onContainerClick = (e) => {
      if (!containerRef.current) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const targets = [];
      if (floorMeshRef.current) targets.push(floorMeshRef.current);
      if (showerFloorMeshRef.current) targets.push(showerFloorMeshRef.current);
      if (showerBackWallMeshRef.current) targets.push(showerBackWallMeshRef.current);
      if (showerSideWallMeshRef.current) targets.push(showerSideWallMeshRef.current);
      if (toiletWallMeshRef.current) targets.push(toiletWallMeshRef.current);
      if (accentWallMeshRef.current) targets.push(accentWallMeshRef.current);
      if (leftWallAccentMeshRef.current) targets.push(leftWallAccentMeshRef.current);
      if (stripeWallMeshRef.current) targets.push(stripeWallMeshRef.current);
      if (leftStripeWallMeshRef.current) targets.push(leftStripeWallMeshRef.current);
      if (backWallMeshRef.current) targets.push(backWallMeshRef.current);
      if (leftWallMeshRef.current) targets.push(leftWallMeshRef.current);

      const intersects = raycaster.intersectObjects(targets);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit === showerFloorMeshRef.current) {
          if (onToggleTargetRef.current) onToggleTargetRef.current('showerFloor');
        } else if (hit === floorMeshRef.current) {
          if (onToggleTargetRef.current) onToggleTargetRef.current('floor');
        } else if (hit === showerBackWallMeshRef.current || hit === showerSideWallMeshRef.current) {
          if (onToggleTargetRef.current) onToggleTargetRef.current('shower');
        } else if (hit === toiletWallMeshRef.current) {
          if (onToggleTargetRef.current) onToggleTargetRef.current('toilet');
        } else if (hit === accentWallMeshRef.current) {
          if (onToggleTargetRef.current) onToggleTargetRef.current('accent');
        } else if (hit === leftWallAccentMeshRef.current) {
          if (onToggleTargetRef.current) onToggleTargetRef.current('leftWallAccent');
        } else if (hit === stripeWallMeshRef.current || hit === leftStripeWallMeshRef.current) {
          if (onToggleTargetRef.current) onToggleTargetRef.current('stripe');
        } else {
          if (onToggleTargetRef.current) onToggleTargetRef.current('walls');
        }
      }
    };

    const onMouseDown = (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      const container = containerRef.current;
      if (!container) return;

      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        theta -= deltaX * 0.005;
        phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, phi - deltaY * 0.005));

        previousMousePosition = { x: e.clientX, y: e.clientY };
        updateCameraPosition();
        return;
      }

      // Hover pointer cursor change
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const targets = [];
      if (floorMeshRef.current) targets.push(floorMeshRef.current);
      if (backWallMeshRef.current) targets.push(backWallMeshRef.current);
      if (leftWallMeshRef.current) targets.push(leftWallMeshRef.current);

      const intersects = raycaster.intersectObjects(targets);
      if (intersects.length > 0) {
        container.style.cursor = 'pointer';
      } else {
        container.style.cursor = 'grab';
      }
    };

    const onMouseUp = (e) => {
      isDragging = false;
      const dragDistance = Math.sqrt(
        Math.pow(e.clientX - startX, 2) + Math.pow(e.clientY - startY, 2)
      );
      if (dragDistance < 5) {
        onContainerClick(e);
      }
    };

    const onWheel = (e) => {
      radius = Math.max(3.2, Math.min(12, radius + e.deltaY * 0.004));
      updateCameraPosition();
    };

    // Mobile touch interaction listeners (pinch zoom, orbit rotate, tap target)
    let initialPinchDistance = null;
    let initialPinchRadius = radius;

    const getTouchDistance = (t1, t2) => {
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        previousMousePosition = { x: touch.clientX, y: touch.clientY };
      } else if (e.touches.length === 2) {
        isDragging = false;
        initialPinchDistance = getTouchDistance(e.touches[0], e.touches[1]);
        initialPinchRadius = radius;
      }
    };

    const onTouchMove = (e) => {
      if (e.touches.length === 1 && isDragging) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - previousMousePosition.x;
        const deltaY = touch.clientY - previousMousePosition.y;

        theta -= deltaX * 0.006;
        phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, phi - deltaY * 0.006));

        previousMousePosition = { x: touch.clientX, y: touch.clientY };
        updateCameraPosition();
      } else if (e.touches.length === 2 && initialPinchDistance) {
        const currentDist = getTouchDistance(e.touches[0], e.touches[1]);
        const scale = initialPinchDistance / Math.max(currentDist, 1);
        radius = Math.max(3.2, Math.min(12, initialPinchRadius * scale));
        updateCameraPosition();
      }
    };

    const onTouchEnd = (e) => {
      if (isDragging) {
        isDragging = false;
        const touch = e.changedTouches[0];
        if (touch) {
          const dragDistance = Math.sqrt(
            Math.pow(touch.clientX - startX, 2) + Math.pow(touch.clientY - startY, 2)
          );
          if (dragDistance < 10) {
            onContainerClick(touch);
          }
        }
      }
      if (e.touches.length < 2) {
        initialPinchDistance = null;
      }
    };

    const container = containerRef.current;
    container.style.touchAction = 'none';
    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel);

    // Touch event listeners
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchend', onTouchEnd);

    // Render loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    setIsSceneReady(true);

    // Robust Resize handler & ResizeObserver
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth || containerRef.current.parentElement?.clientWidth || window.innerWidth;
      const h = containerRef.current.clientHeight || containerRef.current.parentElement?.clientHeight || 450;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined' && container) {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(container);
    }

    // Delayed double check for mobile layout stability
    const timer1 = setTimeout(handleResize, 100);
    const timer2 = setTimeout(handleResize, 400);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsSceneReady(false);
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (container) {
        container.removeEventListener('mousedown', onMouseDown);
        container.removeEventListener('mousemove', onMouseMove);
        container.removeEventListener('wheel', onWheel);
        container.removeEventListener('touchstart', onTouchStart);
        container.removeEventListener('touchmove', onTouchMove);
        container.removeEventListener('touchend', onTouchEnd);
      }
      window.removeEventListener('mouseup', onMouseUp);
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

    const resolveShowerGlassMat = (type) => {
      if (type === 'smoke') {
        // Füme / Duman Gri
        return new THREE.MeshPhysicalMaterial({
          color: '#28303a',
          transparent: true,
          opacity: 0.65,
          roughness: 0.06,
          metalness: 0.12,
          clearcoat: 1.0,
          clearcoatRoughness: 0.02,
          side: THREE.DoubleSide
        });
      } else if (type === 'bronze') {
        // Lüks Sıcak Bronz
        return new THREE.MeshPhysicalMaterial({
          color: '#6e4c2f',
          transparent: true,
          opacity: 0.60,
          roughness: 0.06,
          metalness: 0.18,
          clearcoat: 1.0,
          clearcoatRoughness: 0.02,
          side: THREE.DoubleSide
        });
      } else if (type === 'frosted') {
        // Buzlu / Asitli Mat
        return new THREE.MeshStandardMaterial({
          color: '#e8edf3',
          transparent: true,
          opacity: 0.85,
          roughness: 0.65,
          metalness: 0.02,
          side: THREE.DoubleSide
        });
      } else if (type === 'grid') {
        // Siyah Çıtalı / Crittall Glass
        return new THREE.MeshPhysicalMaterial({
          color: '#e2f0f8',
          transparent: true,
          opacity: 0.38,
          roughness: 0.04,
          metalness: 0.1,
          clearcoat: 1.0,
          clearcoatRoughness: 0.02,
          side: THREE.DoubleSide
        });
      }
      // Varsayılan: Şeffaf Kristal (Clear)
      return new THREE.MeshPhysicalMaterial({
        color: '#d6ecf7',
        transparent: true,
        opacity: 0.40,
        roughness: 0.04,
        metalness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        side: THREE.DoubleSide
      });
    };

    const activeShowerGlassMat = resolveShowerGlassMat(activeGlass);
    const glassMat = activeShowerGlassMat;

    const darkCabMat = new THREE.MeshStandardMaterial({
      color: '#1a1c22',
      roughness: 0.85
    });

    const oakWoodMat = new THREE.MeshStandardMaterial({
      color: '#bfa074',
      roughness: 0.55
    });

    const resolveCabinetHex = (col) => {
      if (!col) return '#8b5a2b';
      if (col === 'oak') return '#8b5a2b';
      if (col === 'white') return '#f8fafc';
      if (col === 'anthracite') return '#272b33';
      if (col === 'walnut') return '#4a2e1b';
      if (col.startsWith('#')) return col;
      return '#8b5a2b';
    };

    let activeFaucetMat = chromeMat;
    if (faucetColor === 'gold') {
      activeFaucetMat = brassMat;
    } else if (faucetColor === 'black') {
      activeFaucetMat = new THREE.MeshStandardMaterial({ color: '#181b20', metalness: 0.2, roughness: 0.8 });
    } else if (faucetColor === 'rosegold') {
      activeFaucetMat = new THREE.MeshStandardMaterial({ color: '#b76e79', metalness: 0.85, roughness: 0.2 });
    }

    const cabHex = resolveCabinetHex(cabinetColor);
    const cabWoodMat = new THREE.MeshStandardMaterial({ color: cabHex, roughness: cabinetColor === 'white' ? 0.25 : 0.6 });
    // Populate furnishings group depending on selected roomType
    if (roomType === 'bathroom') {
      // --- 1. LUXURY FLOATING WALL-HUNG VANITY UNIT (ASMA BANYO DOLABI) ---
      const vanityGroup = new THREE.Group();
      group.add(vanityGroup);

      // Main suspended cabinet body (elevated 35cm off the floor)
      const cabBodyGeo = new THREE.BoxGeometry(0.52, 0.46, 1.35);
      const cabinetBody = new THREE.Mesh(cabBodyGeo, cabWoodMat);
      cabinetBody.position.set(-ROOM_WIDTH / 2 + 0.26, 0.58, 0);
      cabinetBody.castShadow = true;
      cabinetBody.receiveShadow = true;
      vanityGroup.add(cabinetBody);

      // Under-cabinet warm architectural LED floating glow
      const underCabLight = new THREE.PointLight('#ffe8bf', 0.8, 1.8);
      underCabLight.position.set(-ROOM_WIDTH / 2 + 0.26, 0.32, 0);
      vanityGroup.add(underCabLight);

      // Handleless Drawer Front Panels with Modern Shadow Line
      const drawerUpperGeo = new THREE.BoxGeometry(0.015, 0.21, 1.33);
      const drawerUpper = new THREE.Mesh(drawerUpperGeo, cabWoodMat);
      drawerUpper.position.set(-ROOM_WIDTH / 2 + 0.525, 0.69, 0);
      drawerUpper.castShadow = true;
      vanityGroup.add(drawerUpper);

      const drawerLowerGeo = new THREE.BoxGeometry(0.015, 0.21, 1.33);
      const drawerLower = new THREE.Mesh(drawerLowerGeo, cabWoodMat);
      drawerLower.position.set(-ROOM_WIDTH / 2 + 0.525, 0.46, 0);
      drawerLower.castShadow = true;
      vanityGroup.add(drawerLower);

      // Recessed Shadow Line / Gola profile (Dark bronze/matte finish)
      const golaGeo = new THREE.BoxGeometry(0.01, 0.025, 1.33);
      const golaMat = new THREE.MeshStandardMaterial({ color: '#15171c', roughness: 0.8 });
      const golaProfile = new THREE.Mesh(golaGeo, golaMat);
      golaProfile.position.set(-ROOM_WIDTH / 2 + 0.522, 0.575, 0);
      vanityGroup.add(golaProfile);

      // Solid Surface Quartz / Marble Countertop Slab
      const counterSlabGeo = new THREE.BoxGeometry(0.55, 0.035, 1.38);
      const counterSlabMat = new THREE.MeshPhysicalMaterial({
        color: '#f8fafc',
        roughness: 0.12,
        clearcoat: 0.8,
        clearcoatRoughness: 0.05
      });
      const countertop = new THREE.Mesh(counterSlabGeo, counterSlabMat);
      countertop.position.set(-ROOM_WIDTH / 2 + 0.275, 0.81 + 0.0175, 0);
      countertop.castShadow = true;
      countertop.receiveShadow = true;
      vanityGroup.add(countertop);

      // --- COUNTERTOP CURVED VESSEL SINK (ÇANAK LAVABO) ---
      const vesselGeo = new THREE.CylinderGeometry(0.24, 0.19, 0.15, 36);
      const vesselSink = new THREE.Mesh(vesselGeo, porcelainMat);
      vesselSink.position.set(-ROOM_WIDTH / 2 + 0.30, 0.83 + 0.075, 0);
      vesselSink.castShadow = true;
      vesselSink.receiveShadow = true;
      vanityGroup.add(vesselSink);

      // Pop-up drain valve in sink
      const drainGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.005, 16);
      const drainMesh = new THREE.Mesh(drainGeo, activeFaucetMat);
      drainMesh.position.set(-ROOM_WIDTH / 2 + 0.30, 0.83 + 0.145, 0);
      vanityGroup.add(drainMesh);

      // --- DESIGNER TALL GOOSENECK WATERFALL MIXER (LÜKS LAVABO BATARYASI) ---
      const faucetBaseGeo = new THREE.CylinderGeometry(0.020, 0.020, 0.28, 20);
      const faucetBase = new THREE.Mesh(faucetBaseGeo, activeFaucetMat);
      faucetBase.position.set(-ROOM_WIDTH / 2 + 0.12, 0.83 + 0.14, 0);
      faucetBase.castShadow = true;
      vanityGroup.add(faucetBase);

      const faucetSpoutGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.19, 16);
      const faucetSpout = new THREE.Mesh(faucetSpoutGeo, activeFaucetMat);
      faucetSpout.rotation.z = Math.PI / 2.35;
      faucetSpout.position.set(-ROOM_WIDTH / 2 + 0.19, 0.83 + 0.26, 0);
      faucetSpout.castShadow = true;
      vanityGroup.add(faucetSpout);

      const mixerLeverGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.07, 12);
      const mixerLever = new THREE.Mesh(mixerLeverGeo, activeFaucetMat);
      mixerLever.rotation.x = Math.PI / 4;
      mixerLever.position.set(-ROOM_WIDTH / 2 + 0.12, 0.83 + 0.28, 0.02);
      mixerLever.castShadow = true;
      vanityGroup.add(mixerLever);

      // --- SMART BACKLIT ROUND LED MIRROR (HALO GLOW AKILLI AYNA) ---
      const mirrorGroup = new THREE.Group();
      group.add(mirrorGroup);

      // Mirror Bevel & Frame Rim
      const mirrorRimGeo = new THREE.CylinderGeometry(0.53, 0.53, 0.018, 48);
      const mirrorRim = new THREE.Mesh(mirrorRimGeo, brassMat);
      mirrorRim.rotation.z = Math.PI / 2;
      mirrorRim.position.set(-ROOM_WIDTH / 2 + 0.018, 1.62, 0);
      mirrorGroup.add(mirrorRim);

      // Mirror Reflective Glass Front (Bright luxury silvered mirror surface)
      const mirrorFrontGeo = new THREE.CylinderGeometry(0.51, 0.51, 0.008, 48);
      const mirrorGlassMat = new THREE.MeshPhysicalMaterial({
        color: '#f0f4f8',
        roughness: 0.05,
        metalness: 0.20,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        reflectivity: 0.95
      });
      const mirrorGlass = new THREE.Mesh(mirrorFrontGeo, mirrorGlassMat);
      mirrorGlass.rotation.z = Math.PI / 2;
      mirrorGlass.position.set(-ROOM_WIDTH / 2 + 0.024, 1.62, 0);
      mirrorGroup.add(mirrorGlass);

      // Halo Backlit Glow Ring behind mirror
      const haloRingGeo = new THREE.RingGeometry(0.48, 0.56, 48);
      const haloMat = new THREE.MeshBasicMaterial({
        color: '#ffeab0',
        side: THREE.DoubleSide
      });
      const haloMesh = new THREE.Mesh(haloRingGeo, haloMat);
      haloMesh.rotation.y = Math.PI / 2;
      haloMesh.position.set(-ROOM_WIDTH / 2 + 0.012, 1.62, 0);
      mirrorGroup.add(haloMesh);

      // Warm ambient halo point light bathing the back wall
      const mirrorHaloLight = new THREE.PointLight('#ffe39c', 1.2, 2.8);
      mirrorHaloLight.position.set(-ROOM_WIDTH / 2 + 0.06, 1.62, 0);
      mirrorGroup.add(mirrorHaloLight);

      // --- LUXURY ACCESSORIES ON VANITY COUNTERTOP ---
      // Amber Glass Soap Dispenser
      const dispenserGeo = new THREE.CylinderGeometry(0.034, 0.034, 0.12, 16);
      const amberGlassMat = new THREE.MeshPhysicalMaterial({
        color: '#8b4513',
        roughness: 0.15,
        transmission: 0.75,
        thickness: 0.04
      });
      const dispenser = new THREE.Mesh(dispenserGeo, amberGlassMat);
      dispenser.position.set(-ROOM_WIDTH / 2 + 0.38, 0.83 + 0.06, -0.42);
      dispenser.castShadow = true;
      group.add(dispenser);

      const pumpGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.04, 10);
      const pump = new THREE.Mesh(pumpGeo, activeFaucetMat);
      pump.position.set(-ROOM_WIDTH / 2 + 0.38, 0.83 + 0.13, -0.42);
      group.add(pump);

      // Potted Mini Succulent / Plant
      const potGeo = new THREE.CylinderGeometry(0.045, 0.035, 0.07, 16);
      const potMat = new THREE.MeshStandardMaterial({ color: '#2b2d33', roughness: 0.9 });
      const pot = new THREE.Mesh(potGeo, potMat);
      pot.position.set(-ROOM_WIDTH / 2 + 0.38, 0.83 + 0.035, 0.44);
      pot.castShadow = true;
      group.add(pot);

      const plantGeo = new THREE.DodecahedronGeometry(0.045, 1);
      const plantMat = new THREE.MeshStandardMaterial({ color: '#3f6212', roughness: 0.8 });
      const plant = new THREE.Mesh(plantGeo, plantMat);
      plant.position.set(-ROOM_WIDTH / 2 + 0.38, 0.83 + 0.09, 0.44);
      group.add(plant);

      // --- 2. LUXURY WALK-IN FRAMELESS GLASS SHOWER ---
      const showerGroup = new THREE.Group();
      group.add(showerGroup);

      // Frameless Luxury Glass Screen (Color & Style customizable)
      const glassCabGeo = new THREE.BoxGeometry(0.015, 2.15, 1.25);
      const glassCab1 = new THREE.Mesh(glassCabGeo, glassMat);
      glassCab1.position.set(-ROOM_WIDTH / 2 + 1.20, 1.075, -ROOM_DEPTH / 2 + 0.625);
      showerGroup.add(glassCab1);

      // Discrete Minimalist Glass Floor Clamps (No heavy floor channel!)
      const clampGeo = new THREE.BoxGeometry(0.02, 0.025, 0.04);
      const clamp1 = new THREE.Mesh(clampGeo, activeFaucetMat);
      clamp1.position.set(-ROOM_WIDTH / 2 + 1.20, 0.0125, -ROOM_DEPTH / 2 + 0.25);
      showerGroup.add(clamp1);

      const clamp2 = new THREE.Mesh(clampGeo, activeFaucetMat);
      clamp2.position.set(-ROOM_WIDTH / 2 + 1.20, 0.0125, -ROOM_DEPTH / 2 + 1.10);
      showerGroup.add(clamp2);

      // Optional Crittall Black Grid Bars for 'grid' style
      if (activeGlass === 'grid') {
        const gridMat = new THREE.MeshStandardMaterial({ color: '#1a1d24', roughness: 0.8 });
        // Frame Top & Edge
        const frameTop = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 1.25), gridMat);
        frameTop.position.set(-ROOM_WIDTH / 2 + 1.20, 2.15, -ROOM_DEPTH / 2 + 0.625);
        showerGroup.add(frameTop);

        const frameEdge = new THREE.Mesh(new THREE.BoxGeometry(0.02, 2.15, 0.02), gridMat);
        frameEdge.position.set(-ROOM_WIDTH / 2 + 1.20, 1.075, -ROOM_DEPTH / 2 + 1.24);
        showerGroup.add(frameEdge);

        // Horizontal grid bars
        for (let yPos of [0.55, 1.10, 1.65]) {
          const barH = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.015, 1.23), gridMat);
          barH.position.set(-ROOM_WIDTH / 2 + 1.20, yPos, -ROOM_DEPTH / 2 + 0.625);
          showerGroup.add(barH);
        }
        // Vertical grid bar
        const barV = new THREE.Mesh(new THREE.BoxGeometry(0.018, 2.13, 0.015), gridMat);
        barV.position.set(-ROOM_WIDTH / 2 + 1.20, 1.075, -ROOM_DEPTH / 2 + 0.625);
        showerGroup.add(barV);
      }

      // Top Glass Support Brace Rod (Tie Bar)
      const braceGeo = new THREE.CylinderGeometry(0.01, 0.01, 1.20, 12);
      const braceBar = new THREE.Mesh(braceGeo, activeFaucetMat);
      braceBar.rotation.x = Math.PI / 2;
      braceBar.position.set(-ROOM_WIDTH / 2 + 1.20, 2.15, -ROOM_DEPTH / 2 + 0.60);
      showerGroup.add(braceBar);

      // Ceiling Rain Shower Head (Large 25cm Luxury Disc)
      const rainDropGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.25, 12);
      const rainDropArm = new THREE.Mesh(rainDropGeo, activeFaucetMat);
      rainDropArm.position.set(-ROOM_WIDTH / 2 + 0.58, ROOM_HEIGHT - 0.125, -ROOM_DEPTH / 2 + 0.58);
      showerGroup.add(rainDropArm);

      const rainDiscGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.014, 32);
      const rainDisc = new THREE.Mesh(rainDiscGeo, activeFaucetMat);
      rainDisc.position.set(-ROOM_WIDTH / 2 + 0.58, ROOM_HEIGHT - 0.25, -ROOM_DEPTH / 2 + 0.58);
      rainDisc.castShadow = true;
      showerGroup.add(rainDisc);

      // Shower Rail Column with Handheld Wand
      const railGeo = new THREE.CylinderGeometry(0.012, 0.012, 1.1, 14);
      const showerRail = new THREE.Mesh(railGeo, activeFaucetMat);
      showerRail.position.set(-ROOM_WIDTH / 2 + 0.06, 1.35, -ROOM_DEPTH / 2 + 0.45);
      showerRail.castShadow = true;
      showerGroup.add(showerRail);

      const wandGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.18, 12);
      const handWand = new THREE.Mesh(wandGeo, activeFaucetMat);
      handWand.position.set(-ROOM_WIDTH / 2 + 0.09, 1.45, -ROOM_DEPTH / 2 + 0.45);
      handWand.castShadow = true;
      showerGroup.add(handWand);

      // Thermostatic Dual Dial Mixer Controls
      const thermoGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.05, 20);
      const thermoDial1 = new THREE.Mesh(thermoGeo, activeFaucetMat);
      thermoDial1.rotation.z = Math.PI / 2;
      thermoDial1.position.set(-ROOM_WIDTH / 2 + 0.03, 1.05, -ROOM_DEPTH / 2 + 0.45);
      showerGroup.add(thermoDial1);

      // Recessed LED Shower Wall Niche (Şampuan Nişi)
      const nicheFrameGeo = new THREE.BoxGeometry(0.55, 0.32, 0.08);
      const nicheFrameMat = new THREE.MeshStandardMaterial({ color: '#13151a', roughness: 0.9 });
      const nicheFrame = new THREE.Mesh(nicheFrameGeo, nicheFrameMat);
      nicheFrame.position.set(-ROOM_WIDTH / 2 + 0.58, 1.35, -ROOM_DEPTH / 2 + 0.04);
      showerGroup.add(nicheFrame);

      const nicheLight = new THREE.PointLight('#ffe4b5', 0.6, 1.2);
      nicheLight.position.set(-ROOM_WIDTH / 2 + 0.58, 1.45, -ROOM_DEPTH / 2 + 0.08);
      showerGroup.add(nicheLight);

      // Mini luxury toiletries inside niche
      const bottleGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.12, 12);
      const bottle1 = new THREE.Mesh(bottleGeo, amberGlassMat);
      bottle1.position.set(-ROOM_WIDTH / 2 + 0.50, 1.28, -ROOM_DEPTH / 2 + 0.06);
      showerGroup.add(bottle1);

      const bottle2 = new THREE.Mesh(bottleGeo, amberGlassMat);
      bottle2.position.set(-ROOM_WIDTH / 2 + 0.62, 1.28, -ROOM_DEPTH / 2 + 0.06);
      showerGroup.add(bottle2);

      // Sleek Linear Brushed Stainless Steel Shower Drain (Duvar Dibi İnce Doğrusal Süzgeç)
      const drainGrateGeo = new THREE.BoxGeometry(0.80, 0.002, 0.06);
      const drainGrateMat = new THREE.MeshStandardMaterial({
        color: '#d0d5dd',
        metalness: 0.85,
        roughness: 0.25
      });
      const drainGrate = new THREE.Mesh(drainGrateGeo, drainGrateMat);
      drainGrate.position.set(-ROOM_WIDTH / 2 + 0.60, 0.002, -ROOM_DEPTH / 2 + 0.06);
      drainGrate.receiveShadow = true;
      showerGroup.add(drainGrate);

      // --- 3. LUXURY WALL-HUNG RIMLESS TOILET (ASMA KLOZET) ---
      const toiletGroup = new THREE.Group();
      group.add(toiletGroup);

      // Floating Porcelain Bowl (elevated 12cm off floor, cantilevered from wall)
      const toiletBaseGeo = new THREE.BoxGeometry(0.36, 0.32, 0.28);
      const toiletBase = new THREE.Mesh(toiletBaseGeo, porcelainMat);
      toiletBase.position.set(0.9, 0.38, -ROOM_DEPTH / 2 + 0.18);
      toiletBase.castShadow = true;
      toiletGroup.add(toiletBase);

      const toiletFrontGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.32, 28);
      const toiletFront = new THREE.Mesh(toiletFrontGeo, porcelainMat);
      toiletFront.position.set(0.9, 0.38, -ROOM_DEPTH / 2 + 0.34);
      toiletFront.castShadow = true;
      toiletGroup.add(toiletFront);

      // Slim Soft-Close Seat & Lid
      const seatGeo = new THREE.BoxGeometry(0.37, 0.025, 0.46);
      const seatMat = new THREE.MeshPhysicalMaterial({ color: '#fcfcfc', roughness: 0.1, clearcoat: 0.5 });
      const toiletSeat = new THREE.Mesh(seatGeo, seatMat);
      toiletSeat.position.set(0.9, 0.545, -ROOM_DEPTH / 2 + 0.27);
      toiletSeat.castShadow = true;
      toiletGroup.add(toiletSeat);

      // Dual-Flush Actuator Wall Plate (Klozet Kumanda Butonu)
      const plateGeo = new THREE.BoxGeometry(0.24, 0.15, 0.012);
      const plate = new THREE.Mesh(plateGeo, activeFaucetMat);
      plate.position.set(0.9, 1.15, -ROOM_DEPTH / 2 + 0.012);
      plate.castShadow = true;
      toiletGroup.add(plate);

      // Flush Buttons
      const btnGeo1 = new THREE.CylinderGeometry(0.032, 0.032, 0.005, 20);
      const flushBtn1 = new THREE.Mesh(btnGeo1, chromeMat);
      flushBtn1.rotation.x = Math.PI / 2;
      flushBtn1.position.set(0.85, 1.15, -ROOM_DEPTH / 2 + 0.02);
      toiletGroup.add(flushBtn1);

      const btnGeo2 = new THREE.CylinderGeometry(0.022, 0.022, 0.005, 20);
      const flushBtn2 = new THREE.Mesh(btnGeo2, chromeMat);
      flushBtn2.rotation.x = Math.PI / 2;
      flushBtn2.position.set(0.95, 1.15, -ROOM_DEPTH / 2 + 0.02);
      toiletGroup.add(flushBtn2);
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
      const baseCabinets = new THREE.Mesh(counterBaseGeo, cabWoodMat);
      baseCabinets.position.set(-ROOM_WIDTH / 2 + 1.15, 0.425, -ROOM_DEPTH / 2 + 0.3); 
      baseCabinets.castShadow = true;
      baseCabinets.receiveShadow = true;
      group.add(baseCabinets);

      const topOakGeo = new THREE.BoxGeometry(2.32, 0.04, 0.62);
      const countertopMat = (cabinetColor === 'white')
        ? new THREE.MeshStandardMaterial({ color: '#2b2e36', roughness: 0.3 })
        : new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.15 });
      const countertop = new THREE.Mesh(topOakGeo, countertopMat);
      countertop.position.set(-ROOM_WIDTH / 2 + 1.16, 0.85 + 0.02, -ROOM_DEPTH / 2 + 0.31);
      countertop.castShadow = true;
      countertop.receiveShadow = true;
      group.add(countertop);

      const wallCabGeo = new THREE.BoxGeometry(2.3, 0.65, 0.34);
      const wallCabinets = new THREE.Mesh(wallCabGeo, cabWoodMat);
      wallCabinets.position.set(-ROOM_WIDTH / 2 + 1.15, 1.8 + 0.325, -ROOM_DEPTH / 2 + 0.17);
      wallCabinets.castShadow = true;
      group.add(wallCabinets);

      // Cabinet Handles (Mutfak Dolap Kulpları)
      const handleGeo = new THREE.BoxGeometry(0.1, 0.02, 0.02);
      for (let xPos of [-ROOM_WIDTH / 2 + 0.4, -ROOM_WIDTH / 2 + 0.95, -ROOM_WIDTH / 2 + 1.5, -ROOM_WIDTH / 2 + 2.05]) {
        const handleBase = new THREE.Mesh(handleGeo, activeFaucetMat);
        handleBase.position.set(xPos, 0.72, -ROOM_DEPTH / 2 + 0.61);
        group.add(handleBase);

        const handleWall = new THREE.Mesh(handleGeo, activeFaucetMat);
        handleWall.position.set(xPos, 1.9, -ROOM_DEPTH / 2 + 0.35);
        group.add(handleWall);
      }

      // --- 2. SINK & COOKTOP ---
      const sinkGeo = new THREE.BoxGeometry(0.52, 0.01, 0.42);
      const sinkMetalMat = new THREE.MeshStandardMaterial({ color: '#555555', metalness: 0.8, roughness: 0.3 });
      const sinkBox = new THREE.Mesh(sinkGeo, sinkMetalMat);
      sinkBox.position.set(-ROOM_WIDTH / 2 + 0.6, 0.875, -ROOM_DEPTH / 2 + 0.3);
      group.add(sinkBox);

      const tapBaseGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.24);
      const tapBase = new THREE.Mesh(tapBaseGeo, activeFaucetMat);
      tapBase.position.set(-ROOM_WIDTH / 2 + 0.6, 0.875 + 0.12, -ROOM_DEPTH / 2 + 0.16);
      group.add(tapBase);

      const tapArchGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.18);
      const tapArch = new THREE.Mesh(tapArchGeo, activeFaucetMat);
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
    } else if (roomType === 'bedroom') {
      // --- 1. DOUBLE BED ---
      const bedBaseGeo = new THREE.BoxGeometry(1.6, 0.35, 2.0);
      const bedBaseMat = new THREE.MeshStandardMaterial({ color: '#5c4033', roughness: 0.65 });
      const bedBase = new THREE.Mesh(bedBaseGeo, bedBaseMat);
      bedBase.position.set(0, 0.175, -ROOM_DEPTH / 2 + 1.25);
      bedBase.castShadow = true;
      bedBase.receiveShadow = true;
      group.add(bedBase);

      const mattressGeo = new THREE.BoxGeometry(1.56, 0.28, 1.96);
      const mattressMat = new THREE.MeshPhysicalMaterial({ color: '#f8fafc', roughness: 0.9, clearcoat: 0.0 });
      const mattress = new THREE.Mesh(mattressGeo, mattressMat);
      mattress.position.set(0, 0.35 + 0.14, -ROOM_DEPTH / 2 + 1.27);
      mattress.castShadow = true;
      mattress.receiveShadow = true;
      group.add(mattress);

      const headboardGeo = new THREE.BoxGeometry(1.7, 1.0, 0.08);
      const headboard = new THREE.Mesh(headboardGeo, bedBaseMat);
      headboard.position.set(0, 0.5, -ROOM_DEPTH / 2 + 0.04);
      headboard.castShadow = true;
      group.add(headboard);

      const pillowGeo = new THREE.BoxGeometry(0.62, 0.08, 0.38);
      const pillowMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.95 });
      
      const pillowL = new THREE.Mesh(pillowGeo, pillowMat);
      pillowL.position.set(-0.35, 0.49 + 0.04, -ROOM_DEPTH / 2 + 0.3);
      pillowL.rotation.x = -Math.PI / 15;
      pillowL.castShadow = true;
      group.add(pillowL);

      const pillowR = new THREE.Mesh(pillowGeo, pillowMat);
      pillowR.position.set(0.35, 0.49 + 0.04, -ROOM_DEPTH / 2 + 0.3);
      pillowR.rotation.x = -Math.PI / 15;
      pillowR.castShadow = true;
      group.add(pillowR);

      // --- 2. BEDSIDE NIGHTSTANDS ---
      const nightstandGeo = new THREE.BoxGeometry(0.4, 0.45, 0.4);
      const darkNightstandMat = new THREE.MeshStandardMaterial({ color: '#1a1c22', roughness: 0.8 });
      
      const nightstandL = new THREE.Mesh(nightstandGeo, darkNightstandMat);
      nightstandL.position.set(-1.08, 0.225, -ROOM_DEPTH / 2 + 0.24);
      nightstandL.castShadow = true;
      nightstandL.receiveShadow = true;
      group.add(nightstandL);

      const nightstandR = new THREE.Mesh(nightstandGeo, darkNightstandMat);
      nightstandR.position.set(1.08, 0.225, -ROOM_DEPTH / 2 + 0.24);
      nightstandR.castShadow = true;
      nightstandR.receiveShadow = true;
      group.add(nightstandR);

      // --- 3. BEDSIDE LAMPS ---
      const lampBaseGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.015, 12);
      const brassMat = new THREE.MeshStandardMaterial({ color: '#d4af37', metalness: 0.85, roughness: 0.15 });
      const lampPoleGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.24);
      const shadeGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.14, 12);
      const shadeMat = new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.9 });

      // Left Lamp
      const lampBaseL = new THREE.Mesh(lampBaseGeo, brassMat);
      lampBaseL.position.set(-1.08, 0.45 + 0.008, -ROOM_DEPTH / 2 + 0.24);
      group.add(lampBaseL);

      const lampPoleL = new THREE.Mesh(lampPoleGeo, brassMat);
      lampPoleL.position.set(-1.08, 0.45 + 0.12, -ROOM_DEPTH / 2 + 0.24);
      group.add(lampPoleL);

      const lampShadeL = new THREE.Mesh(shadeGeo, shadeMat);
      lampShadeL.position.set(-1.08, 0.45 + 0.31, -ROOM_DEPTH / 2 + 0.24);
      lampShadeL.castShadow = true;
      group.add(lampShadeL);

      const bedsideLightL = new THREE.PointLight('#ffa62b', 0.85, 3.5);
      bedsideLightL.position.set(-1.08, 0.45 + 0.22, -ROOM_DEPTH / 2 + 0.24);
      group.add(bedsideLightL);

      // Right Lamp
      const lampBaseR = new THREE.Mesh(lampBaseGeo, brassMat);
      lampBaseR.position.set(1.08, 0.45 + 0.008, -ROOM_DEPTH / 2 + 0.24);
      group.add(lampBaseR);

      const lampPoleR = new THREE.Mesh(lampPoleGeo, brassMat);
      lampPoleR.position.set(1.08, 0.45 + 0.12, -ROOM_DEPTH / 2 + 0.24);
      group.add(lampPoleR);

      const lampShadeR = new THREE.Mesh(shadeGeo, shadeMat);
      lampShadeR.position.set(1.08, 0.45 + 0.31, -ROOM_DEPTH / 2 + 0.24);
      lampShadeR.castShadow = true;
      group.add(lampShadeR);

      const bedsideLightR = new THREE.PointLight('#ffa62b', 0.85, 3.5);
      bedsideLightR.position.set(1.08, 0.45 + 0.22, -ROOM_DEPTH / 2 + 0.24);
      group.add(bedsideLightR);

      // --- 4. TALL WARDROBE ---
      const wardrobeGeo = new THREE.BoxGeometry(0.55, 2.1, 1.15);
      const wardrobeMat = new THREE.MeshStandardMaterial({ color: '#1a1c22', roughness: 0.85 });
      const wardrobe = new THREE.Mesh(wardrobeGeo, wardrobeMat);
      wardrobe.position.set(-ROOM_WIDTH / 2 + 0.275, 1.05, 0.8);
      wardrobe.castShadow = true;
      wardrobe.receiveShadow = true;
      group.add(wardrobe);

      const doorTrimGeo = new THREE.BoxGeometry(0.56, 2.11, 0.02);
      const doorTrim = new THREE.Mesh(doorTrimGeo, bedBaseMat);
      doorTrim.position.set(-ROOM_WIDTH / 2 + 0.28, 1.055, 1.38);
      doorTrim.castShadow = true;
      group.add(doorTrim);
    }

  }, [roomType, isSceneReady, cabinetColor, faucetColor, activeGlass]);

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
    let ambientBase = 0.50;
    let sunBase = 0.95;
    let centerBase = 0.35;

    if (timeOfDay === 'night') {
      ambientBase = 0.15;
      sunBase = 0.05; // sun goes down
      centerBase = 0.85; // interior bulb glows stronger
      if (sceneRef.current) {
        sceneRef.current.background = new THREE.Color('#0b0d12');
        if (sceneRef.current.fog) sceneRef.current.fog.color.set('#0b0d12');
      }
    } else {
      ambientBase = 0.50;
      sunBase = 0.95;
      centerBase = 0.35;
      if (sceneRef.current) {
        sceneRef.current.background = new THREE.Color('#1c202a');
        if (sceneRef.current.fog) sceneRef.current.fog.color.set('#1c202a');
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

  // Regenerate tile textures and repeat maps reactively with instant 0-ms visual tiling & RAM caching
  useEffect(() => {
    if (!isSceneReady || !sceneRef.current) return;

    const loader = new THREE.TextureLoader();

    // Helper for realistic architectural PBR reflections responding to scene spotlights & cove lights
    const getPBRProps = (prod) => {
      const finish = (prod?.finish || '').toLowerCase();
      const isParlak = finish.includes('parlak');
      const isLappato = finish.includes('lapatto') || finish.includes('lappato') || finish.includes('yarı');
      return {
        roughness: isParlak ? 0.09 : (isLappato ? 0.28 : 0.82),
        metalness: isParlak ? 0.08 : (isLappato ? 0.04 : 0.0),
        clearcoat: isParlak ? 1.0 : (isLappato ? 0.55 : 0.0),
        clearcoatRoughness: isParlak ? 0.03 : 0.16
      };
    };

    // Instant (0-ms) procedural preview + RAM cached high-res JPG loader helper
    const loadAndApplyTexture = (product, applyCallback) => {
      if (!product) return;

      // 1. INSTANT 0-MS PROCEDURAL TILE RENDER (Zero lag, zero delay)
      const proceduralCanvas = generateProceduralTexture(product);
      applyCallback(proceduralCanvas, false);

      // 2. ASYNC HIGH-RES JPG PHOTO UPGRADE WITH RAM CACHING
      const realTextureUrl = product.textureUrl || product.imageUrl;
      if (realTextureUrl) {
        const isAbsolute = realTextureUrl.startsWith('http://') || realTextureUrl.startsWith('https://') || realTextureUrl.startsWith('//');
        const finalUrl = isAbsolute ? `/api/proxy?url=${encodeURIComponent(realTextureUrl)}` : realTextureUrl;

        if (imageCacheRef.current.has(finalUrl)) {
          // Direct 0ms RAM retrieval from cache!
          const cachedImg = imageCacheRef.current.get(finalUrl);
          applyCallback(cachedImg, true);
        } else {
          loader.load(
            finalUrl,
            (loadedTexture) => {
              if (loadedTexture && loadedTexture.image) {
                imageCacheRef.current.set(finalUrl, loadedTexture.image);
                applyCallback(loadedTexture.image, true);
              }
            },
            undefined,
            () => {
              // Keep procedural preview if load fails
            }
          );
        }
      }
    };

    // 1. FLOOR TILING LOGIC
    if (applyFloor && floorProduct) {
      const w_m = floorProduct.width / 100;
      const h_m = floorProduct.height / 100;
      const repeatX = ROOM_WIDTH / w_m;
      const repeatY = ROOM_DEPTH / h_m;

      const applyFloorTexture = (sourceImageOrCanvas, isImage = true) => {
        const texture = generateGroutOverlay(sourceImageOrCanvas, floorProduct, groutWidth, groutColor, tileRotation, layPattern);
        texture.repeat.set(repeatX, repeatY);
        texture.colorSpace = THREE.SRGBColorSpace;

        const pbr = getPBRProps(floorProduct);

        const newMaterial = new THREE.MeshPhysicalMaterial({
          map: texture,
          roughness: pbr.roughness,
          metalness: pbr.metalness,
          clearcoat: pbr.clearcoat,
          clearcoatRoughness: pbr.clearcoatRoughness
        });

        if (floorMeshRef.current) {
          if (floorMeshRef.current.material.map) floorMeshRef.current.material.map.dispose();
          floorMeshRef.current.material.dispose();
          floorMeshRef.current.material = newMaterial;
        }
        setTextureStatus(isImage ? 'Real JPG Image Loaded' : 'Procedural Fallback Generated');
      };

      loadAndApplyTexture(floorProduct, applyFloorTexture);
    } else {
      if (floorMeshRef.current) {
        if (floorMeshRef.current.material.map) floorMeshRef.current.material.map.dispose();
        floorMeshRef.current.material.dispose();
        floorMeshRef.current.material = new THREE.MeshStandardMaterial({ color: '#272b33', roughness: 0.8 });
      }
    }

    // 2. WALLS TILING LOGIC
    if (applyWalls && wallProduct) {
      const w_m = wallProduct.width / 100;
      const h_m = wallProduct.height / 100;
      const repeatX = ROOM_WIDTH / w_m;
      const wallRepeatY = ROOM_HEIGHT / h_m;

      const applyWallsTexture = (sourceImageOrCanvas, isImage = true) => {
        const texture = generateGroutOverlay(sourceImageOrCanvas, wallProduct, groutWidth, groutColor, tileRotation, layPattern);
        texture.colorSpace = THREE.SRGBColorSpace;

        const pbr = getPBRProps(wallProduct);

        // Back Wall
        const backTexture = texture.clone();
        backTexture.repeat.set(repeatX, wallRepeatY);
        const backWallMat = new THREE.MeshPhysicalMaterial({
          map: backTexture,
          roughness: pbr.roughness,
          metalness: pbr.metalness,
          clearcoat: pbr.clearcoat,
          clearcoatRoughness: pbr.clearcoatRoughness
        });
        if (backWallMeshRef.current) {
          if (backWallMeshRef.current.material.map) backWallMeshRef.current.material.map.dispose();
          backWallMeshRef.current.material.dispose();
          backWallMeshRef.current.material = backWallMat;
        }

        // Left Wall: If comparisonMode is active and comparisonProduct exists, apply comparisonProduct to Left Wall!
        const compTargetProduct = (comparisonMode && comparisonProduct) ? comparisonProduct : wallProduct;

        const applyLeftWallMat = (leftSource) => {
          const compTex = generateGroutOverlay(leftSource, compTargetProduct, groutWidth, groutColor, tileRotation, layPattern);
          const compW_m = (compTargetProduct.width || 60) / 100;
          const compH_m = (compTargetProduct.height || 120) / 100;
          compTex.repeat.set(ROOM_DEPTH / compW_m, ROOM_HEIGHT / compH_m);
          compTex.colorSpace = THREE.SRGBColorSpace;

          const pbrComp = getPBRProps(compTargetProduct);

          const leftWallMat = new THREE.MeshPhysicalMaterial({
            map: compTex,
            roughness: pbrComp.roughness,
            metalness: pbrComp.metalness,
            clearcoat: pbrComp.clearcoat,
            clearcoatRoughness: pbrComp.clearcoatRoughness
          });
          if (leftWallMeshRef.current) {
            if (leftWallMeshRef.current.material.map) leftWallMeshRef.current.material.map.dispose();
            leftWallMeshRef.current.material.dispose();
            leftWallMeshRef.current.material = leftWallMat;
          }
        };

        if (comparisonMode && comparisonProduct) {
          loadAndApplyTexture(comparisonProduct, applyLeftWallMat);
        } else {
          applyLeftWallMat(sourceImageOrCanvas);
        }
      };

      loadAndApplyTexture(wallProduct, applyWallsTexture);
    } else {
      if (backWallMeshRef.current) {
        if (backWallMeshRef.current.material.map) backWallMeshRef.current.material.map.dispose();
        backWallMeshRef.current.material.dispose();
        backWallMeshRef.current.material = new THREE.MeshStandardMaterial({ color: '#23272f', roughness: 0.9 });
      }
      if (leftWallMeshRef.current) {
        if (leftWallMeshRef.current.material.map) leftWallMeshRef.current.material.map.dispose();
        leftWallMeshRef.current.material.dispose();
        leftWallMeshRef.current.material = new THREE.MeshStandardMaterial({ color: '#1f2229', roughness: 0.9 });
      }
    }

    // 3. ACCENT WALL TILING LOGIC (LAVABO & BANYO DOLABI ARKASI)
    if (accentWallMeshRef.current) {
      accentWallMeshRef.current.visible = !!applyAccent;
    }
    if (applyAccent && accentWallMeshRef.current && accentProduct) {
      const w_m = accentProduct.width / 100;
      const h_m = accentProduct.height / 100;

      const applyAccentTexture = (sourceImageOrCanvas) => {
        const texture = generateGroutOverlay(sourceImageOrCanvas, accentProduct, groutWidth, groutColor, tileRotation, layPattern);
        texture.repeat.set(1.3 / w_m, ROOM_HEIGHT / h_m);
        texture.colorSpace = THREE.SRGBColorSpace;
        if (accentWallMeshRef.current) {
          if (accentWallMeshRef.current.material.map) accentWallMeshRef.current.material.map.dispose();
          accentWallMeshRef.current.material.dispose();
          const pbrAccent = getPBRProps(accentProduct);
          accentWallMeshRef.current.material = new THREE.MeshPhysicalMaterial({
            map: texture,
            roughness: pbrAccent.roughness,
            metalness: pbrAccent.metalness,
            clearcoat: pbrAccent.clearcoat,
            clearcoatRoughness: pbrAccent.clearcoatRoughness
          });
        }
      };

      loadAndApplyTexture(accentProduct, applyAccentTexture);
    } else if (accentWallMeshRef.current && !accentProduct) {
      accentWallMeshRef.current.material = new THREE.MeshStandardMaterial({ color: '#181b22', roughness: 0.85 });
    }

    // 4. SHOWER CABIN WALLS (DUŞAKABİN İKİ TARAF) LOGIC
    if (showerBackWallMeshRef.current) showerBackWallMeshRef.current.visible = !!applyShower;
    if (showerSideWallMeshRef.current) showerSideWallMeshRef.current.visible = !!applyShower;
    if (applyShower && showerProduct && (showerBackWallMeshRef.current || showerSideWallMeshRef.current)) {
      const w_m = showerProduct.width / 100;
      const h_m = showerProduct.height / 100;

      const applyShowerTexture = (sourceImageOrCanvas) => {
        const texture = generateGroutOverlay(sourceImageOrCanvas, showerProduct, groutWidth, groutColor, tileRotation, layPattern);
        texture.colorSpace = THREE.SRGBColorSpace;
        const pbrShower = getPBRProps(showerProduct);

        const backTex = texture.clone();
        backTex.repeat.set(1.15 / w_m, ROOM_HEIGHT / h_m);
        const showerBackMat = new THREE.MeshPhysicalMaterial({
          map: backTex,
          roughness: pbrShower.roughness,
          metalness: pbrShower.metalness,
          clearcoat: pbrShower.clearcoat,
          clearcoatRoughness: pbrShower.clearcoatRoughness
        });
        if (showerBackWallMeshRef.current) {
          if (showerBackWallMeshRef.current.material.map) showerBackWallMeshRef.current.material.map.dispose();
          showerBackWallMeshRef.current.material.dispose();
          showerBackWallMeshRef.current.material = showerBackMat;
        }

        const sideTex = texture.clone();
        sideTex.repeat.set(1.15 / w_m, ROOM_HEIGHT / h_m);
        const showerSideMat = new THREE.MeshPhysicalMaterial({
          map: sideTex,
          roughness: pbrShower.roughness,
          metalness: pbrShower.metalness,
          clearcoat: pbrShower.clearcoat,
          clearcoatRoughness: pbrShower.clearcoatRoughness
        });
        if (showerSideWallMeshRef.current) {
          if (showerSideWallMeshRef.current.material.map) showerSideWallMeshRef.current.material.map.dispose();
          showerSideWallMeshRef.current.material.dispose();
          showerSideWallMeshRef.current.material = showerSideMat;
        }
      };

      loadAndApplyTexture(showerProduct, applyShowerTexture);
    } else if (!showerProduct) {
      if (showerBackWallMeshRef.current) showerBackWallMeshRef.current.material = new THREE.MeshStandardMaterial({ color: '#181b22', roughness: 0.85 });
      if (showerSideWallMeshRef.current) showerSideWallMeshRef.current.material = new THREE.MeshStandardMaterial({ color: '#181b22', roughness: 0.85 });
    }

    // 5. TOILET BACK WALL (KLOZET ARKASI VURGU DUVARI) LOGIC
    if (toiletWallMeshRef.current) toiletWallMeshRef.current.visible = !!applyToiletWall;
    if (applyToiletWall && toiletWallMeshRef.current && toiletWallProduct) {
      const w_m = toiletWallProduct.width / 100;
      const h_m = toiletWallProduct.height / 100;

      const applyToiletTexture = (sourceImageOrCanvas) => {
        const texture = generateGroutOverlay(sourceImageOrCanvas, toiletWallProduct, groutWidth, groutColor, tileRotation, layPattern);
        texture.repeat.set(1.0 / w_m, ROOM_HEIGHT / h_m);
        texture.colorSpace = THREE.SRGBColorSpace;
        if (toiletWallMeshRef.current) {
          if (toiletWallMeshRef.current.material.map) toiletWallMeshRef.current.material.map.dispose();
          toiletWallMeshRef.current.material.dispose();
          const pbrToilet = getPBRProps(toiletWallProduct);
          toiletWallMeshRef.current.material = new THREE.MeshPhysicalMaterial({
            map: texture,
            roughness: pbrToilet.roughness,
            metalness: pbrToilet.metalness,
            clearcoat: pbrToilet.clearcoat,
            clearcoatRoughness: pbrToilet.clearcoatRoughness
          });
        }
      };

      loadAndApplyTexture(toiletWallProduct, applyToiletTexture);
    } else if (toiletWallMeshRef.current && !toiletWallProduct) {
      toiletWallMeshRef.current.material = new THREE.MeshStandardMaterial({ color: '#181b22', roughness: 0.85 });
    }

    // 6. LEFT WALL ACCENT PANEL (SOL YAN DUVAR VURGU BÖLGESİ) LOGIC
    if (leftWallAccentMeshRef.current) leftWallAccentMeshRef.current.visible = !!applyLeftWallAccent;
    if (applyLeftWallAccent && leftWallAccentMeshRef.current && leftWallAccentProduct) {
      const w_m = leftWallAccentProduct.width / 100;
      const h_m = leftWallAccentProduct.height / 100;

      const applyLeftAccentTexture = (sourceImageOrCanvas) => {
        const texture = generateGroutOverlay(sourceImageOrCanvas, leftWallAccentProduct, groutWidth, groutColor, tileRotation, layPattern);
        texture.repeat.set(1.1 / w_m, ROOM_HEIGHT / h_m);
        texture.colorSpace = THREE.SRGBColorSpace;
        if (leftWallAccentMeshRef.current) {
          if (leftWallAccentMeshRef.current.material.map) leftWallAccentMeshRef.current.material.map.dispose();
          leftWallAccentMeshRef.current.material.dispose();
          const pbrLeftAccent = getPBRProps(leftWallAccentProduct);
          leftWallAccentMeshRef.current.material = new THREE.MeshPhysicalMaterial({
            map: texture,
            roughness: pbrLeftAccent.roughness,
            metalness: pbrLeftAccent.metalness,
            clearcoat: pbrLeftAccent.clearcoat,
            clearcoatRoughness: pbrLeftAccent.clearcoatRoughness
          });
        }
      };

      loadAndApplyTexture(leftWallAccentProduct, applyLeftAccentTexture);
    } else if (leftWallAccentMeshRef.current && !leftWallAccentProduct) {
      leftWallAccentMeshRef.current.material = new THREE.MeshStandardMaterial({ color: '#181b22', roughness: 0.85 });
    }

    // 7. HORIZONTAL STRIPE ACCENT BAND / KITCHEN BACKSPLASH (MUTFAK ALINI / TEZGAH ARASI / YATAY BORDÜR) LOGIC
    const isKitchenMode = roomType === 'kitchen';
    if (stripeWallMeshRef.current) {
      stripeWallMeshRef.current.visible = !!applyStripeWall;
      stripeWallMeshRef.current.geometry.dispose();
      if (isKitchenMode) {
        stripeWallMeshRef.current.geometry = new THREE.PlaneGeometry(2.3, 0.91);
        stripeWallMeshRef.current.position.set(-ROOM_WIDTH / 2 + 1.15, 1.345, -ROOM_DEPTH / 2 + 0.004);
      } else {
        stripeWallMeshRef.current.geometry = new THREE.PlaneGeometry(ROOM_WIDTH, 0.6);
        stripeWallMeshRef.current.position.set(0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2 + 0.004);
      }
    }
    if (leftStripeWallMeshRef.current) {
      leftStripeWallMeshRef.current.visible = !isKitchenMode && !!applyStripeWall;
    }

    if (applyStripeWall && stripeWallProduct && stripeWallMeshRef.current) {
      const w_m = stripeWallProduct.width / 100;
      const h_m = stripeWallProduct.height / 100;

      const applyStripeTexture = (sourceImageOrCanvas) => {
        const texture = generateGroutOverlay(sourceImageOrCanvas, stripeWallProduct, groutWidth, groutColor, tileRotation, layPattern);
        texture.colorSpace = THREE.SRGBColorSpace;
        const pbrStripe = getPBRProps(stripeWallProduct);

        // Back Wall Stripe / Kitchen Backsplash
        if (stripeWallMeshRef.current) {
          const backTex = texture.clone();
          const targetW = isKitchenMode ? 2.3 : ROOM_WIDTH;
          const targetH = isKitchenMode ? 0.91 : 0.6;
          backTex.repeat.set(targetW / w_m, targetH / h_m);
          if (stripeWallMeshRef.current.material.map) stripeWallMeshRef.current.material.map.dispose();
          stripeWallMeshRef.current.material.dispose();
          stripeWallMeshRef.current.material = new THREE.MeshPhysicalMaterial({
            map: backTex,
            roughness: pbrStripe.roughness,
            metalness: pbrStripe.metalness,
            clearcoat: pbrStripe.clearcoat,
            clearcoatRoughness: pbrStripe.clearcoatRoughness
          });
        }

        // Left Wall Stripe (only for non-kitchen)
        if (!isKitchenMode && leftStripeWallMeshRef.current) {
          const leftTex = texture.clone();
          leftTex.repeat.set(ROOM_DEPTH / w_m, 0.6 / h_m);
          if (leftStripeWallMeshRef.current.material.map) leftStripeWallMeshRef.current.material.map.dispose();
          leftStripeWallMeshRef.current.material.dispose();
          leftStripeWallMeshRef.current.material = new THREE.MeshPhysicalMaterial({
            map: leftTex,
            roughness: pbrStripe.roughness,
            metalness: pbrStripe.metalness,
            clearcoat: pbrStripe.clearcoat,
            clearcoatRoughness: pbrStripe.clearcoatRoughness
          });
        }
      };

      loadAndApplyTexture(stripeWallProduct, applyStripeTexture);
    } else if (!stripeWallProduct) {
      if (stripeWallMeshRef.current) stripeWallMeshRef.current.material = new THREE.MeshStandardMaterial({ color: '#181b22', roughness: 0.85 });
      if (leftStripeWallMeshRef.current) leftStripeWallMeshRef.current.material = new THREE.MeshStandardMaterial({ color: '#181b22', roughness: 0.85 });
    }

    // 8. SHOWER FLOOR / TRAY (DUŞ TABANI / DUŞ TEKNESİ ZEMİNİ) LOGIC
    if (showerFloorMeshRef.current) {
      showerFloorMeshRef.current.visible = !!applyShowerFloor;
    }
    if (applyShowerFloor && showerFloorMeshRef.current && showerFloorProduct) {
      const w_m = showerFloorProduct.width / 100;
      const h_m = showerFloorProduct.height / 100;

      const applyShowerFloorTexture = (sourceImageOrCanvas) => {
        const texture = generateGroutOverlay(sourceImageOrCanvas, showerFloorProduct, groutWidth, groutColor, tileRotation, layPattern);
        texture.repeat.set(1.15 / w_m, 1.15 / h_m);
        texture.colorSpace = THREE.SRGBColorSpace;
        if (showerFloorMeshRef.current) {
          if (showerFloorMeshRef.current.material.map) showerFloorMeshRef.current.material.map.dispose();
          showerFloorMeshRef.current.material.dispose();
          const pbrShowerFloor = getPBRProps(showerFloorProduct);
          showerFloorMeshRef.current.material = new THREE.MeshPhysicalMaterial({
            map: texture,
            roughness: pbrShowerFloor.roughness,
            metalness: pbrShowerFloor.metalness,
            clearcoat: pbrShowerFloor.clearcoat,
            clearcoatRoughness: pbrShowerFloor.clearcoatRoughness
          });
        }
      };

      loadAndApplyTexture(showerFloorProduct, applyShowerFloorTexture);
    } else if (showerFloorMeshRef.current && !showerFloorProduct) {
      showerFloorMeshRef.current.material = new THREE.MeshStandardMaterial({ color: '#181b22', roughness: 0.85 });
    }

  }, [floorProduct, wallProduct, accentProduct, showerProduct, showerFloorProduct, toiletWallProduct, leftWallAccentProduct, stripeWallProduct, comparisonProduct, comparisonMode, walkthroughMode, applyFloor, applyWalls, applyAccent, applyShower, applyShowerFloor, applyToiletWall, applyLeftWallAccent, applyStripeWall, groutWidth, groutColor, tileRotation, layPattern, isSceneReady]);

  // Walkthrough Mode Camera Adjustments
  useEffect(() => {
    if (!cameraRef.current || !isSceneReady) return;
    if (walkthroughMode) {
      cameraRef.current.position.set(0, 1.4, 0.2);
      cameraRef.current.lookAt(0, 1.4, -1.8);
    } else {
      cameraRef.current.position.set(4, 3.2, 5);
      cameraRef.current.lookAt(0, ROOM_HEIGHT / 3, 0);
    }
  }, [walkthroughMode, isSceneReady]);

  // Camera preset positions
  const setCameraPreset = (presetName) => {
    if (!cameraRef.current) return;
    setActiveCameraPreset(presetName);
    const cam = cameraRef.current;
    if (presetName === 'perspective') {
      cam.position.set(4, 3.2, 5);
      cam.lookAt(0, ROOM_HEIGHT / 3, 0);
    } else if (presetName === 'vanity') {
      cam.position.set(-0.25, 1.45, 2.3);
      cam.lookAt(-ROOM_WIDTH / 2 + 0.35, 1.35, 0);
    } else if (presetName === 'shower') {
      cam.position.set(2.2, 2.1, 1.8);
      cam.lookAt(-ROOM_WIDTH / 2 + 0.58, 0.9, -ROOM_DEPTH / 2 + 0.58);
    } else if (presetName === 'topdown') {
      cam.position.set(0.01, 6.2, 0.01);
      cam.lookAt(0, 0, 0);
    }
  };

  const downloadSnapshot = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;

    // Save previous pixel ratio & size
    const currentPixelRatio = renderer.getPixelRatio();
    const currentSize = new THREE.Vector2();
    renderer.getSize(currentSize);

    // Upscale for ultra-crisp super-sampled architectural render
    const superRatio = Math.max(2.4, currentPixelRatio * 1.5);
    renderer.setPixelRatio(superRatio);
    renderer.render(scene, camera);

    const dataUrl = renderer.domElement.toDataURL('image/jpeg', 0.98);

    // Restore standard viewport pixel ratio
    renderer.setPixelRatio(currentPixelRatio);
    renderer.setSize(currentSize.x, currentSize.y);
    renderer.render(scene, camera);

    const link = document.createElement('a');
    const prodSlug = (activeProduct?.name || 'sanal-studyo').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `seramikbak-3d-${prodSlug}-hd.jpg`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div 
        ref={containerRef} 
        style={{ width: '100%', height: '100%', cursor: walkthroughMode ? 'crosshair' : 'grab' }} 
      />

      {/* 3D Split-Screen Comparison Slider Line */}
      {comparisonMode && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${comparisonSplit}%`,
            width: '3px',
            background: 'var(--accent-gold)',
            boxShadow: '0 0 12px rgba(212, 175, 55, 0.8)',
            zIndex: 10,
            pointerEvents: 'none'
          }}
        >
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'var(--accent-gold)',
            color: '#0f172a',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.7rem',
            fontWeight: '800',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 14px rgba(0,0,0,0.4)'
          }}>
            ◀ Kıyasla ▶
          </div>
        </div>
      )}

      {/* 3D Viewport Overlays (Top & Bottom Symmetrical Edges) */}
      <div className="canvas-overlay-top">
        <div className="overlay-top-left-badges">
          <div className="overlay-badge">
            <span>Oda Türü: </span>
            <strong style={{ textTransform: 'capitalize', color: 'var(--accent-gold)' }}>
              {roomType === 'bathroom' ? 'Lüks Banyo' : 
               roomType === 'livingroom' ? 'Modern Salon' : 
               roomType === 'kitchen' ? 'İndüstriyel Mutfak' :
               roomType === 'hallway' ? 'Modern Antre' : 
               roomType === 'bedroom' ? 'Yatak Odası' : 'Açık Teras'}
            </strong>
          </div>
          <div className="overlay-badge">
            <span>Kaplama: </span>
            <strong style={{ textTransform: 'capitalize', color: '#38bdf8' }}>
              {applyAccent ? 'Zemin, Duvar & Vurgu' : applyFloor && applyWalls ? 'Zemin & Duvar' : applyFloor ? 'Sadece Zemin' : 'Döşenmemiş'}
            </strong>
          </div>
          <div className="overlay-badge">
            <span>Doku: </span>
            <strong style={{ color: textureStatus.includes('Real') ? 'var(--accent-green)' : 'var(--accent-gold)' }}>
              {textureStatus}
            </strong>
          </div>
          {layPattern !== 'flat' && (
            <div className="overlay-badge" style={{ borderColor: 'var(--accent-gold)' }}>
              <span>Desen: </span>
              <strong style={{ textTransform: 'uppercase', color: 'var(--accent-gold)' }}>
                {layPattern}
              </strong>
            </div>
          )}
          {roomType === 'bathroom' && (
            <div className="overlay-badge" style={{ borderColor: 'rgba(56, 189, 248, 0.4)' }}>
              <span>Cam: </span>
              <strong style={{ color: '#38bdf8' }}>
                {activeGlass === 'clear' ? 'Şeffaf Kristal' :
                 activeGlass === 'smoke' ? 'Füme Duman' :
                 activeGlass === 'bronze' ? 'Lüks Bronz' :
                 activeGlass === 'frosted' ? 'Buzlu Opak' : 'Siyah Grid'}
              </strong>
            </div>
          )}
        </div>
        
        {/* Camera Quick Presets Center Bar */}
        <div className="overlay-camera-presets">
          <button 
            onClick={() => setCameraPreset('perspective')}
            className={`preset-btn ${activeCameraPreset === 'perspective' ? 'active' : ''}`}
            title="Genel Perspektif Açısı"
          >
            👁️ <span className="btn-label">Perspektif</span>
          </button>
          <button 
            onClick={() => setCameraPreset('vanity')}
            className={`preset-btn ${activeCameraPreset === 'vanity' ? 'active' : ''}`}
            title="Lavabo ve Ayna Odaklı Görünüm"
          >
            🪞 <span className="btn-label">Lavabo</span>
          </button>
          <button 
            onClick={() => setCameraPreset('shower')}
            className={`preset-btn ${activeCameraPreset === 'shower' ? 'active' : ''}`}
            title="Duş ve Zemin Odaklı Görünüm"
          >
            🚿 <span className="btn-label">Duş & Zemin</span>
          </button>
          <button 
            onClick={() => setCameraPreset('topdown')}
            className={`preset-btn ${activeCameraPreset === 'topdown' ? 'active' : ''}`}
            title="Plan / Kuşbakışı Görünüm"
          >
            📐 <span className="btn-label">Kuşbakışı</span>
          </button>
        </div>

        <div className="overlay-top-right-actions">
          <button onClick={downloadSnapshot} className="overlay-action-btn" title="Yüksek Çözünürlüklü Görüntüyü İndir">
            📷 HD Fotoğraf İndir
          </button>
        </div>
      </div>

      <div className="canvas-overlay-bottom">
        <div className="overlay-bottom-left">
          <div className="overlay-instructions">
            <span className="instruction-desktop">{walkthroughMode ? '🚶 360° Oda İçinde Gezintidesiniz' : '👆 Zemine/Duvara Tıklayarak Kapla'}</span>
            <span className="instruction-mobile">{walkthroughMode ? '🚶 360° Gezinti' : '👆 Tıklayarak Kapla'}</span>
          </div>
        </div>
        <div className="overlay-bottom-right">
          <div className="overlay-gesture-hint">
            <span className="gesture-hint-desktop">🔄 360° döndürmek için sürükleyin</span>
            <span className="gesture-hint-mobile">👆 Sürükle • Yakınlaştır</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Top Overlay (Badges at Left, Download Button at Right) */
        .canvas-overlay-top {
          position: absolute;
          top: 14px;
          left: 14px;
          right: 14px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          pointer-events: none;
          gap: 12px;
          z-index: 25;
        }
        .overlay-top-left-badges {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          pointer-events: auto;
          max-width: 75%;
        }
        .overlay-top-right-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          pointer-events: auto;
          flex-shrink: 0;
        }
        .overlay-badge {
          background: rgba(15, 23, 42, 0.88);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #fff;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.72rem;
          font-family: var(--font-body);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .overlay-action-btn {
          background: linear-gradient(135deg, var(--accent-gold) 0%, #d4af37 100%);
          color: #0f172a;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.72rem;
          font-family: var(--font-title);
          font-weight: 700;
          cursor: pointer;
          pointer-events: auto;
          box-shadow: 0 4px 12px rgba(179, 142, 71, 0.35);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .overlay-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(179, 142, 71, 0.45);
        }

        /* Camera Quick Presets Toolbar */
        .overlay-camera-presets {
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(15, 23, 42, 0.88);
          border: 1px solid rgba(255, 255, 255, 0.14);
          padding: 4px;
          border-radius: 10px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
          pointer-events: auto;
        }
        .preset-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.8);
          padding: 6px 12px;
          border-radius: 7px;
          font-size: 0.70rem;
          font-family: var(--font-body);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .preset-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.1);
        }
        .preset-btn.active {
          background: linear-gradient(135deg, var(--accent-gold) 0%, #d4af37 100%);
          color: #0f172a;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(179, 142, 71, 0.4);
        }

        /* Bottom Overlay (Click Guide at Left, Gesture Hint at Right) */
        .canvas-overlay-bottom {
          position: absolute;
          bottom: 14px;
          left: 14px;
          right: 14px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          pointer-events: none;
          gap: 12px;
          z-index: 25;
        }
        .overlay-bottom-left,
        .overlay-bottom-right {
          pointer-events: auto;
          display: flex;
          align-items: center;
        }
        .overlay-instructions {
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(179, 142, 71, 0.35);
          color: var(--accent-gold);
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.70rem;
          font-weight: 600;
          font-family: var(--font-title);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          white-space: nowrap;
        }
        .overlay-gesture-hint {
          background: rgba(15, 23, 42, 0.88);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.85);
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.70rem;
          font-weight: 600;
          font-family: var(--font-body);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          white-space: nowrap;
        }
        .instruction-mobile,
        .gesture-hint-mobile {
          display: none;
        }
        .instruction-desktop,
        .gesture-hint-desktop {
          display: inline;
        }

        @media (max-width: 768px) {
          /* Top Overlay Mobile */
          .canvas-overlay-top {
            top: 8px;
            left: 8px;
            right: 8px;
            gap: 6px;
            align-items: flex-start;
            flex-wrap: wrap;
          }
          .overlay-top-left-badges {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 3px;
            max-width: 50%;
            pointer-events: none;
          }
          .overlay-top-right-actions {
            max-width: 48%;
            pointer-events: auto;
          }
          .overlay-camera-presets {
            order: 3;
            width: 100%;
            display: flex;
            justify-content: space-around;
            gap: 3px;
            padding: 3px;
            border-radius: 8px;
            background: rgba(15, 23, 42, 0.94);
          }
          .preset-btn {
            font-size: 0.58rem;
            padding: 4px 6px;
            gap: 3px;
          }
          .overlay-badge {
            font-size: 0.58rem;
            padding: 3px 6px;
            border-radius: 5px;
            background: rgba(15, 23, 42, 0.92);
            border: 1px solid rgba(245, 158, 11, 0.3);
            color: #ffffff;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
          }
          .overlay-action-btn {
            padding: 5px 8px;
            font-size: 0.60rem;
            font-weight: 800;
            border-radius: 6px;
            white-space: nowrap;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: #0f172a;
            box-shadow: 0 3px 10px rgba(245, 158, 11, 0.4);
            cursor: pointer;
            pointer-events: auto;
          }

          /* Bottom Overlay Mobile */
          .canvas-overlay-bottom {
            bottom: 8px;
            left: 8px;
            right: 8px;
            gap: 6px;
            justify-content: space-between;
            align-items: flex-end;
          }
          .overlay-bottom-left {
            max-width: 48%;
          }
          .overlay-bottom-right {
            max-width: 48%;
          }
          .overlay-instructions {
            font-size: 0.58rem;
            padding: 3px 6px;
            border-radius: 5px;
            background: rgba(15, 23, 42, 0.92);
            border: 1px solid rgba(245, 158, 11, 0.35);
            color: #fbbf24;
            font-weight: 700;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
          }
          .overlay-gesture-hint {
            font-size: 0.58rem;
            padding: 3px 6px;
            border-radius: 5px;
            background: rgba(15, 23, 42, 0.92);
            border: 1px solid rgba(255, 255, 255, 0.12);
            color: rgba(255, 255, 255, 0.9);
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
          }
          .instruction-desktop,
          .gesture-hint-desktop {
            display: none !important;
          }
          .instruction-mobile,
          .gesture-hint-mobile {
            display: inline !important;
          }
        }
      `}</style>
    </div>
  );
}
