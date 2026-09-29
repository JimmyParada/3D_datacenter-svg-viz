// =========================================================================
// DC 1-2 PB CTDC - VISOR 3D THREE.JS CON INTEGRACIÓN ZABBIX
// Basado en plano oficial TIA-942 (33 Columnas AA-BG x 21 Filas 01-21)
// =========================================================================

let scene, camera, renderer, controls;
let racks = [];
let cracs = []; // <-- NUEVO: Arreglo para almacenar las unidades CRAC
let perforatedTilesGroup, airflowGroup;
let cachedZabbixData = {};
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// TABLA MAESTRA DE COLUMNAS (33 Columnas de 0.6m = 19.8 metros)
const COLS = [
    "AA","AB","AC","AD","AE","AF","AG","AH","AI","AJ","AK","AL","AM","AN","AO","AP","AQ","AR","AS","AT","AU","AV","AW","AX","AY","AZ",
    "BA","BB","BC","BD","BE","BF","BG"
];

const TOTAL_COLS = 33;
const TOTAL_ROWS = 21;
const TILE_SIZE = 0.6; // 60 cm estándar

// POLÍGONO MAESTRO CORREGIDO DEL PERÍMETRO DE LA SALA DC 1-2
const ROOM_POLYGON = [
    { x: 0.0,  z: 0.0  }, // 0: AA, fila 21 (Esquina superior izquierda)
    { x: 19.8, z: 0.0  }, // 1: BG, fila 21 (Esquina superior derecha)
    { x: 19.8, z: 12.6 }, // 2: BG, fila 01 (Esquina inferior derecha)
    { x: 4.8,  z: 12.6 }, // 3: AI, fila 01 (Muro inferior)
    { x: 4.8,  z: 4.8  }, // 4: AI, fila 14 (Quiebre vertical)
    { x: 3.0,  z: 4.8  }, // 5: AF, fila 14 (Quiebre horizontal)
    { x: 0.0,  z: 4.8  }  // 7: AA, fila 17 (Cierre hacia el borde izquierdo)
];

// Algoritmo matemático para comprobar si un punto (x, z) cae dentro de la sala
function isInsideRoom(x, z) {
    let inside = false;
    for (let i = 0, j = ROOM_POLYGON.length - 1; i < ROOM_POLYGON.length; j = i++) {
        const xi = ROOM_POLYGON[i].x, zi = ROOM_POLYGON[i].z;
        const xj = ROOM_POLYGON[j].x, zj = ROOM_POLYGON[j].z;
        const intersect = ((zi > z) !== (zj > z)) && (x < (xj - xi) * (z - zi) / (zj - zi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

// Convierte código TIA (ej. "AH19" o "BC04") a coordenadas 3D en metros
function getTilePos(colName, rowNum) {
    const colIndex = COLS.indexOf(colName);
    const x = (colIndex + 0.5) * TILE_SIZE;
    const z = (TOTAL_ROWS - rowNum + 0.5) * TILE_SIZE;
    return { x, z, colIndex, rowNum };
}

function getPosFromId(id) {
    const col = id.substring(0, 2);
    const row = parseInt(id.substring(2));
    return getTilePos(col, row);
}

// =========================================================================
// LISTADO MAESTRO DE RACKS EXTRAÍDOS DEL PLANO DC 1-2
// =========================================================================
const racksSala1_2 = [
    { id: "AH19", facing: "+Z" }, { id: "AI19", facing: "+Z" }, { id: "AJ19", facing: "+Z" }, 
    { id: "AK19", facing: "+Z" }, { id: "AL19", facing: "+Z" }, { id: "AM19", facing: "+Z" }, 
    { id: "AN19", facing: "+Z" }, { id: "AO19", facing: "+Z" }, { id: "AP19", facing: "+Z" },
    { id: "AR19", facing: "+Z" }, { id: "AS19", facing: "+Z" }, { id: "AT19", facing: "+Z" },
    { id: "AW19", facing: "+Z" }, { id: "AX19", facing: "+Z" }, { id: "AY19", facing: "+Z" },
    { id: "BA19", facing: "+Z" }, { id: "BB19", facing: "+Z" }, { id: "BC19", facing: "+Z" }, 
    { id: "BD19", facing: "+Z" }, { id: "BE19", facing: "+Z" }, { id: "AW14", facing: "-Z" },
    { id: "AN14", facing: "-Z" }, { id: "AO14", facing: "-Z" }, { id: "AP14", facing: "-Z" },
    { id: "AN10", facing: "+Z" }, { id: "AO10", facing: "+Z" }, { id: "AP10", facing: "+Z" },
    { id: "AN06", facing: "-Z" }, { id: "AO06", facing: "-Z" }, { id: "AP06", facing: "-Z" },
    { id: "AR14", facing: "-Z" }, { id: "AS14", facing: "-Z" }, { id: "AT14", facing: "-Z" },
    { id: "AR10", facing: "+Z" }, { id: "AS10", facing: "+Z" }, { id: "AT10", facing: "+Z" },
    { id: "AR06", facing: "-Z" }, { id: "AS06", facing: "-Z" }, { id: "AT06", facing: "-Z" },
    { id: "BA14", facing: "-Z" }, { id: "BB14", facing: "-Z" }, { id: "BC14", facing: "-Z" },
    { id: "AV10", facing: "+Z" }, { id: "AW10", facing: "+Z" }, { id: "AX10", facing: "+Z" }, { id: "AY10", facing: "+Z" }, 
    { id: "AZ10", facing: "+Z" }, { id: "BA10", facing: "+Z" }, { id: "BB10", facing: "+Z" }, { id: "BC10", facing: "+Z" },
    { id: "AV08", facing: "-Z" }, { id: "AW08", facing: "-Z" }, { id: "AX08", facing: "-Z" }, { id: "AY08", facing: "-Z" }, 
    { id: "AZ08", facing: "-Z" }, { id: "BA08", facing: "-Z" }, { id: "BB08", facing: "-Z" }, { id: "BC08", facing: "-Z" },
    { id: "AV04", facing: "+Z" }, { id: "AW04", facing: "+Z" }, { id: "AX04", facing: "+Z" }, { id: "AY04", facing: "+Z" }, 
    { id: "AZ04", facing: "+Z" }, { id: "BA04", facing: "+Z" }, { id: "BB04", facing: "+Z" }, { id: "BC04", facing: "+Z" }
];

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.015);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 25, 35);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.01;
    controls.zoomSpeed = 0.8;
    controls.minDistance = 0.5;
    controls.maxDistance = 75.0;
    controls.target.set(9.9, 0, 6.3);
    controls.update();

    // Iluminación
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight1.position.set(20, 40, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x00d2ff, 0.8);
    dirLight2.position.set(-20, 25, -20);
    scene.add(dirLight2);

    // Construcción de la sala y elementos
    createDatacenterRoom();
    createRacksLayout();
    createPerforatedTilesLayout();

    // Eventos
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('mousemove', onMouseMove, false);
    // ==========================================
    // NUEVO: EVENTO DE ZOOM AL HACER DOBLE CLIC
    // ==========================================
    // 👉 AGREGA ESTA LÍNEA PARA ACTIVAR EL ZOOM CON DOBLE CLIC:
    window.addEventListener('dblclick', onWindowDoubleClick, false);

    const selectMode = document.getElementById('colorMode');
    if (selectMode) selectMode.addEventListener('change', updateColorsAndLegend);

    const toggleTiles = document.getElementById('toggleVentTiles');
    if (toggleTiles) {
        toggleTiles.addEventListener('change', (e) => {
            if (perforatedTilesGroup) perforatedTilesGroup.visible = e.target.checked;
        });
    }

    const toggleAirflow = document.getElementById('toggleAirflow');
    if (toggleAirflow) {
        toggleAirflow.addEventListener('change', (e) => {
            if (airflowGroup) airflowGroup.visible = e.target.checked;
        });
    }
    
    fetchZabbixData();
    setInterval(fetchZabbixData, 30000);
}

// ==========================================
// CONSTRUCCIÓN DE LA SALA DC 1-2
// ==========================================

function createDatacenterRoom() {
    const floorShape = new THREE.Shape();
    floorShape.moveTo(ROOM_POLYGON[0].x, ROOM_POLYGON[0].z);
    for (let i = 1; i < ROOM_POLYGON.length; i++) {
        floorShape.lineTo(ROOM_POLYGON[i].x, ROOM_POLYGON[i].z);
    }
    floorShape.closePath();

    const extrudeSettings = { depth: 0.15, bevelEnabled: false };
    const floorGeometry = new THREE.ExtrudeGeometry(floorShape, extrudeSettings);
    floorGeometry.rotateX(Math.PI / 2);

    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x95a5a6,
        roughness: 0.4,
        metalness: 0.1
    });

    const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floorMesh.position.set(0, -0.15, 0);
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Cuadrícula de baldosas
    const gridGroup = new THREE.Group();
    const lineMat = new THREE.LineBasicMaterial({ color: 0x5a656d, opacity: 0.85, transparent: true });

    for (let row = 0; row <= TOTAL_ROWS; row++) {
        const z = row * TILE_SIZE;
        for (let col = 0; col < TOTAL_COLS; col++) {
            const x1 = col * TILE_SIZE;
            const x2 = (col + 1) * TILE_SIZE;
            const midX = (x1 + x2) / 2;
            if (isInsideRoom(midX, z)) {
                const pts = [new THREE.Vector3(x1, 0.005, z), new THREE.Vector3(x2, 0.005, z)];
                gridGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
            }
        }
    }

    for (let col = 0; col <= TOTAL_COLS; col++) {
        const x = col * TILE_SIZE;
        for (let row = 0; row < TOTAL_ROWS; row++) {
            const z1 = row * TILE_SIZE;
            const z2 = (row + 1) * TILE_SIZE;
            const midZ = (z1 + z2) / 2;
            if (isInsideRoom(x, midZ)) {
                const pts = [new THREE.Vector3(x, 0.005, z1), new THREE.Vector3(x, 0.005, z2)];
                gridGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
            }
        }
    }
    scene.add(gridGroup);

    // Muros perimetrales
    const wallHeight = 2.2;
    const wallThickness = 0.25;
    const wallMat = new THREE.MeshStandardMaterial({
        color: 0x242a30,
        roughness: 0.6,
        metalness: 0.2
    });

    for (let i = 0; i < ROOM_POLYGON.length - 1; i++) {
        const p1 = ROOM_POLYGON[i];
        const p2 = ROOM_POLYGON[i + 1];

        const dx = p2.x - p1.x;
        const dz = p2.z - p1.z;
        const len = Math.sqrt(dx * dx + dz * dz);
        const angle = Math.atan2(dz, dx);

        const wallGeo = new THREE.BoxGeometry(len, wallHeight, wallThickness);
        const wallMesh = new THREE.Mesh(wallGeo, wallMat);
        wallMesh.position.set((p1.x + p2.x) / 2, wallHeight / 2, (p1.z + p2.z) / 2);
        wallMesh.rotation.y = -angle;
        scene.add(wallMesh);
    }

    createCRACUnit("CRAC12-1", "AA", 16, 21);
    createCRACUnit("CRAC12-2", "AI", 4, 9);
    createCRACUnit("CRAC12-3", "BF", 4, 9);
    

    createCagesLayout();
}
// ==========================================
// CONSTRUCCIÓN DE RACKS (LISTA UNIFICADA Y CORREGIDA)
// ==========================================


// Generador de Unidades CRAC
function createCRACUnit(name, colName, rowStart, rowEnd) {
    const p1 = getTilePos(colName, rowEnd);
    const p2 = getTilePos(colName, rowStart);

    const width = 1.15;
    const length = (rowEnd - rowStart + 1) * TILE_SIZE * 0.95;
    const height = 2.2;

    const cracGroup = new THREE.Group();
    const cracGeo = new THREE.BoxGeometry(width, height, length);
    const cracMat = new THREE.MeshStandardMaterial({
        color: 0x0984e3,
        roughness: 0.35,
        metalness: 0.6
    });

    const body = new THREE.Mesh(cracGeo, cracMat);
    body.position.set(0, height / 2, 0);

    const topGrillGeo = new THREE.PlaneGeometry(width * 0.85, length * 0.85);
    const topGrillMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const topGrill = new THREE.Mesh(topGrillGeo, topGrillMat);
    topGrill.rotation.x = -Math.PI / 2;
    topGrill.position.set(0, height + 0.005, 0);

    cracGroup.add(body, topGrill);
    cracGroup.position.set(p1.x, 0, (p1.z + p2.z) / 2);

    // NUEVO: Asignar userData y registrar la CRAC
    cracGroup.userData = { name: name };
    cracs.push(cracGroup);

    scene.add(cracGroup);
}

// ==========================================
// TEXTURA Y PANELES DE JAULA (MALLA METÁLICA)
// ==========================================

function createMeshTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 64, 64);
    ctx.strokeStyle = '#aaaaaa';
    ctx.lineWidth = 2;

    for (let i = 0; i <= 64; i += 8) {
        ctx.beginPath();
        ctx.moveTo(i, 0); ctx.lineTo(i, 64);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i); ctx.lineTo(64, i);
        ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

function createCagePanel(width, height, position, rotationY = 0) {
    const cageGroup = new THREE.Group();
    const meshTexture = createMeshTexture();

    const panelGeo = new THREE.PlaneGeometry(width, height);
    const textureCloned = meshTexture.clone();
    textureCloned.repeat.set(width * 2, height * 2);

    const panelMat = new THREE.MeshBasicMaterial({
        map: textureCloned,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide
    });

    const panelMesh = new THREE.Mesh(panelGeo, panelMat);
    panelMesh.position.set(0, height / 2, 0);
    cageGroup.add(panelMesh);

    // Postes y marcos negros de la estructura de la jaula
    const frameMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const thickness = 0.08;

    const vGeo = new THREE.BoxGeometry(thickness, height, thickness);
    const leftPost = new THREE.Mesh(vGeo, frameMat);
    leftPost.position.set(-width / 2, height / 2, 0);

    const rightPost = new THREE.Mesh(vGeo, frameMat);
    rightPost.position.set(width / 2, height / 2, 0);
    cageGroup.add(leftPost, rightPost);

    const hGeo = new THREE.BoxGeometry(width, thickness, thickness);
    const topBar = new THREE.Mesh(hGeo, frameMat);
    topBar.position.set(0, height, 0);

    const bottomBar = new THREE.Mesh(hGeo, frameMat);
    bottomBar.position.set(0, 0, 0);
    cageGroup.add(topBar, bottomBar);

    cageGroup.position.set(position.x, position.y, position.z);
    cageGroup.rotation.y = rotationY;

    return cageGroup;
}
// Jaulas del plano
function createCagesLayout() {
    const cageHeight = 2.4;
    
    const j1_left = getTilePos("AH", 20).x;
    const j1_right = getTilePos("BG", 20).x;
    
    // Ejemplo de cerramiento con la nueva malla metálica
    //scene.add(createCagePanel(j1_right - j1_left, cageHeight, { x: (j1_left + j1_right) / 2, y: 0, z: getTilePos("AH", 20).z }, 0));
    //scene.add(createCagePanel(j1_right - j1_left, cageHeight, { x: (j1_left + j1_right) / 2, y: 0, z: getTilePos("AE", 18).z }, 0));
    // --- CERRAMIENTO 2: Panel vertical lateral (usando medidas directas en metros) ---
    scene.add(createCagePanel(3.0, cageHeight, { x: 3.0, y: 0, z: 1.5 }, Math.PI / 2));
    scene.add(createCagePanel(3.0, cageHeight, { x: 9.9, y: 0, z: 1.5 }, Math.PI / 2));
    scene.add(createCagePanel(3.0, cageHeight, { x: 12.6, y: 0, z: 1.5 }, Math.PI / 2));
    scene.add(createCagePanel(3.0, cageHeight, { x: 15.54, y: 0, z: 1.5 }, Math.PI / 2));
    scene.add(createCagePanel(7.8, cageHeight, { x: 7.2 , y: 0, z: 6.9 }, Math.PI / 2));
    scene.add(createCagePanel(7.8, cageHeight, { x: 9.9 , y: 0, z: 6.9 }, Math.PI / 2));
    scene.add(createCagePanel(7.8, cageHeight, { x: 12.6 , y: 0, z: 6.9 }, Math.PI / 2));

    // --- CERRAMIENTO 3: Otro panel horizontal en otra zona de la sala ---
    scene.add(createCagePanel(16.7, cageHeight, { x: 11.3, y: 0, z: 3.0 }, 0));
    scene.add(createCagePanel(5.4, cageHeight, { x: 9.9, y: 0, z: 8.1 }, 0));
    scene.add(createCagePanel(5.4, cageHeight, { x: 9.9, y: 0, z: 10.8 }, 0));
}

// ==========================================
// LOSAS PERFORADAS Y FLUJO DE AIRE
// ==========================================

function createPerforatedTileTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Fondo chapa de acero
    ctx.fillStyle = '#2b3036';
    ctx.fillRect(0, 0, 256, 256);

    // Marco exterior de la baldosa (bisel perimetral)
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#48525b';
    ctx.strokeRect(6, 6, 244, 244);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#181d22';
    ctx.strokeRect(12, 12, 232, 232);

    // Remaches de anclaje en las 4 esquinas
    const rivets = [[20, 20], [236, 20], [20, 236], [236, 236]];
    rivets.forEach(([rx, ry]) => {
        ctx.fillStyle = '#14181c';
        ctx.beginPath();
        ctx.arc(rx, ry, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#6b7987';
        ctx.lineWidth = 1.2;
        ctx.stroke();
    });

    // Rejilla de perforaciones circulares (~56% flujo de aire)
    const margin = 28;
    const spacing = 15;
    const radius = 4.2;

    for (let y = margin; y <= 256 - margin; y += spacing) {
        const isOddRow = Math.round((y - margin) / spacing) % 2 === 1;
        const startX = isOddRow ? margin + spacing / 2 : margin;

        for (let x = startX; x <= 256 - margin; x += spacing) {
            // Fondo oscuro de la perforación (pleno inferior)
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = '#0a0d11';
            ctx.fill();

            // Borde superior iluminado (efecto troquelado 3D)
            ctx.beginPath();
            ctx.arc(x, y, radius, -Math.PI * 0.25, Math.PI * 0.75);
            ctx.strokeStyle = '#5a6673';
            ctx.lineWidth = 1.1;
            ctx.stroke();

            // Núcleo cian sutil de aire frío
            ctx.beginPath();
            ctx.arc(x, y, radius * 0.45, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 210, 255, 0.45)';
            ctx.fill();
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

function createPerforatedTilesLayout() {
    perforatedTilesGroup = new THREE.Group();
    airflowGroup = new THREE.Group();

    const tileTexture = createPerforatedTileTexture();
    const tileMaterial = new THREE.MeshStandardMaterial({
        map: tileTexture,
        roughness: 0.35,
        metalness: 0.7
    });

    const tileGeo = new THREE.PlaneGeometry(0.58, 0.58);
    tileGeo.rotateX(-Math.PI / 2);

    // ----------------------------------------------------
    // GEOMETRÍA Y TEXTURA DE FLUJO DE AIRE MEJORADA
    // ----------------------------------------------------
    const airHeight = 2.1; // Altura aumentada a 2.1 metros (casi la altura del rack)
    const airGeo = new THREE.BoxGeometry(0.56, airHeight, 0.56);
    
    const airCanvas = document.createElement('canvas');
    airCanvas.width = 128;
    airCanvas.height = 256;
    const actx = airCanvas.getContext('2d');
    // Fondo transparente
    actx.clearRect(0, 0, 128, 256);
    // Corrientes / líneas de flujo de aire frío ascendente
    actx.fillStyle = 'rgba(0, 230, 255, 0.4)';
    for (let x = 10; x < 128; x += 14) {
    actx.fillRect(x, 0, 7, 256);
    }
    // Degradado vertical: fuerte en la base (suelo) y difuminado arriba
    const grad = actx.createLinearGradient(0, 256, 0, 0);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.95)');   // Muy brillante y visible en la base
    grad.addColorStop(0.3, 'rgba(0, 210, 255, 0.65)');  // Visible a media altura
    grad.addColorStop(0.7, 'rgba(0, 180, 255, 0.35)');
    grad.addColorStop(1, 'rgba(0, 150, 255, 0.0)');    // Desvanecido suave al llegar al techo
    actx.globalCompositeOperation = 'destination-in';
    actx.fillStyle = grad;
    actx.fillRect(0, 0, 128, 256);
    window.airflowTexture = new THREE.CanvasTexture(airCanvas);
    window.airflowTexture.wrapT = THREE.RepeatWrapping; // Permite desplazamiento continuo hacia arriba
    window.airflowMaterial = new THREE.MeshBasicMaterial({
        map: window.airflowTexture,
        transparent: true,
        opacity: 1,                     // Opacidad base alta
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending   // Modo aditivo: brilla como luz/neón
    });


    const added = new Set();
    racksSala1_2.forEach(data => {
        const col = data.id.substring(0, 2);
        const row = parseInt(data.id.substring(2));
        const cIdx = COLS.indexOf(col);

        let tColIdx = cIdx;
        let tRow = row;

        if (data.facing === "+Z") { tRow = row - 1; 
        } else if (data.facing === "-Z") { tRow = row + 1; 
        } else if (data.facing === "+X") { tColIdx = cIdx - 1; 
        } else if (data.facing === "-X") { tColIdx = cIdx + 1; 
        }

        if (tColIdx >= 0 && tColIdx < TOTAL_COLS && tRow >= 1 && tRow <= TOTAL_ROWS) {
            const key = `${tColIdx}_${tRow}`;
            if (!added.has(key)) {
                added.add(key);
                const tilePos = getTilePos(COLS[tColIdx], tRow);

                const tileMesh = new THREE.Mesh(tileGeo, tileMaterial);
                tileMesh.position.set(tilePos.x, 0.012, tilePos.z);
                perforatedTilesGroup.add(tileMesh);

                const airMesh1 = new THREE.Mesh(airGeo, window.airflowMaterial);
                airMesh1.position.set(tilePos.x, airHeight / 2 + 0.015, tilePos.z);
                const airMesh2 = airMesh1.clone();
                airMesh2.rotation.y = Math.PI / 2;
                
                airflowGroup.add(airMesh1, airMesh2);
            }
        }
    });

    scene.add(perforatedTilesGroup);
    scene.add(airflowGroup);
}
// ==========================================
// CONSTRUCCIÓN DE RACK ABIERTO SIEMON RS-07 + ORGANIZADORES
// ==========================================

function buildSiemonOpenRackMesh(data) {
    const rackGroup = new THREE.Group();

    const totalHeight = 2.13;
    const rackWidth = 0.53;
    const usableWidth = 0.482;
    const channelDepth = 0.15;
    const baseDepth = 0.45;

    const metalMaterial = new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.5, metalness: 0.8 });
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x202020, roughness: 0.4, metalness: 0.7 });
    const fingerMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6, metalness: 0.3 });
    const badgeMaterial = new THREE.MeshBasicMaterial({ color: 0xd63031 });

    const openRackInner = new THREE.Group();

    const postGeo = new THREE.BoxGeometry(0.04, totalHeight, channelDepth);
    const leftPost = new THREE.Mesh(postGeo, metalMaterial);
    leftPost.position.set(-rackWidth / 2, totalHeight / 2, 0);
    openRackInner.add(leftPost);

    const rightPost = new THREE.Mesh(postGeo, metalMaterial);
    rightPost.position.set(rackWidth / 2, totalHeight / 2, 0);
    openRackInner.add(rightPost);

    const headerGeo = new THREE.BoxGeometry(rackWidth, 0.05, channelDepth);
    const topHeader = new THREE.Mesh(headerGeo, metalMaterial);
    topHeader.position.set(0, totalHeight - 0.025, 0);
    openRackInner.add(topHeader);

    const bottomHeader = new THREE.Mesh(headerGeo, metalMaterial);
    bottomHeader.position.set(0, 0.025, 0);
    openRackInner.add(bottomHeader);

    const footGeo = new THREE.BoxGeometry(0.08, 0.015, baseDepth);
    const leftFoot = new THREE.Mesh(footGeo, metalMaterial);
    leftFoot.position.set(-rackWidth / 2, 0.0075, 0);
    openRackInner.add(leftFoot);

    const rightFoot = new THREE.Mesh(footGeo, metalMaterial);
    rightFoot.position.set(rackWidth / 2, 0.0075, 0);
    openRackInner.add(rightFoot);

    const uHeight = (totalHeight - 0.1) / 45;
    const holeGeo = new THREE.BoxGeometry(0.004, 0.008, 0.001);
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x555555 });

    for (let i = 0; i < 45; i++) {
        const yPos = 0.05 + (i * uHeight) + (uHeight / 2);
        const hL = new THREE.Mesh(holeGeo, holeMat);
        hL.position.set((-usableWidth / 2) + 0.005, yPos, (channelDepth / 2) + 0.001);
        openRackInner.add(hL);

        const hR = new THREE.Mesh(holeGeo, holeMat);
        hR.position.set((usableWidth / 2) - 0.005, yPos, (channelDepth / 2) + 0.001);
        openRackInner.add(hR);
    }

    const horizUR = 4;
    const horizHeight = uHeight * horizUR;
    const horizYPos = 0.05 + (20 * uHeight) + (horizHeight / 2);

    const horizGroup = new THREE.Group();

    const horizBackGeo = new THREE.BoxGeometry(usableWidth, horizHeight, 0.003);
    const horizBack = new THREE.Mesh(horizBackGeo, metalMaterial);
    horizGroup.add(horizBack);

    const earsGeo = new THREE.BoxGeometry(0.024, horizHeight, 0.003);
    const leftEar = new THREE.Mesh(earsGeo, metalMaterial);
    leftEar.position.set((-usableWidth / 2) - 0.012, 0, 0);
    horizGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earsGeo, metalMaterial);
    rightEar.position.set((usableWidth / 2) + 0.012, 0, 0);
    horizGroup.add(rightEar);

    const horizCoverGeo = new THREE.BoxGeometry(usableWidth - 0.01, horizHeight - 0.005, 0.006);
    const horizCover = new THREE.Mesh(horizCoverGeo, doorMaterial);
    horizCover.position.set(0, 0, 0.10);
    horizGroup.add(horizCover);

    const handleGeo = new THREE.BoxGeometry(0.12, 0.015, 0.008);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.set(0, 0, 0.105);
    horizGroup.add(handle);

    const hFingerGeo = new THREE.BoxGeometry(0.006, horizHeight - 0.02, 0.09);
    const hFingerLeft = new THREE.Mesh(hFingerGeo, fingerMaterial);
    hFingerLeft.position.set((-usableWidth / 2) + 0.02, 0, 0.05);
    horizGroup.add(hFingerLeft);

    const hFingerRight = new THREE.Mesh(hFingerGeo, fingerMaterial);
    hFingerRight.position.set((usableWidth / 2) - 0.02, 0, 0.05);
    horizGroup.add(hFingerRight);

    horizGroup.position.set(0, horizYPos, (channelDepth / 2) + 0.002);
    openRackInner.add(horizGroup);

    const mgrWidth = 0.18;
    const mgrDepth = 0.22;

    function createSiemonVPC(isRightSide, doorOpenAngle = 0) {
        const vpcGroup = new THREE.Group();

        const backPanelGeo = new THREE.BoxGeometry(mgrWidth, totalHeight, 0.004);
        const backPanel = new THREE.Mesh(backPanelGeo, metalMaterial);
        backPanel.position.set(0, totalHeight / 2, -mgrDepth / 2);
        vpcGroup.add(backPanel);

        const sidePanelGeo = new THREE.BoxGeometry(0.004, totalHeight, mgrDepth);
        const sidePanel = new THREE.Mesh(sidePanelGeo, metalMaterial);
        const sideXPos = isRightSide ? (mgrWidth / 2) : (-mgrWidth / 2);
        sidePanel.position.set(sideXPos, totalHeight / 2, 0);
        vpcGroup.add(sidePanel);

        const passWindowGeo = new THREE.BoxGeometry(0.005, 0.15, 0.08);
        const windowMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });
        for (let w = 0; w < 5; w++) {
            const passWin = new THREE.Mesh(passWindowGeo, windowMat);
            passWin.position.set(sideXPos, 0.25 + (w * 0.38), -mgrDepth / 4);
            vpcGroup.add(passWin);
        }

        const fingerCount = 45;
        const fingerGeo = new THREE.BoxGeometry(0.006, 0.012, mgrDepth - 0.04);

        for (let f = 0; f < fingerCount; f++) {
            const yPos = 0.05 + (f * uHeight) + (uHeight / 2);
            
            const fingerInner = new THREE.Mesh(fingerGeo, fingerMaterial);
            const fingerX = isRightSide ? (-mgrWidth / 2) + 0.01 : (mgrWidth / 2) - 0.01;
            fingerInner.position.set(fingerX, yPos, 0);
            vpcGroup.add(fingerInner);

            const tipGeo = new THREE.BoxGeometry(0.006, 0.02, 0.01);
            const tip = new THREE.Mesh(tipGeo, fingerMaterial);
            tip.position.set(fingerX, yPos, (mgrDepth / 2) - 0.02);
            vpcGroup.add(tip);
        }

        const doorPivot = new THREE.Group();
        const pivotX = isRightSide ? (mgrWidth / 2) : (-mgrWidth / 2);
        doorPivot.position.set(pivotX, totalHeight / 2, (mgrDepth / 2));

        const doorGeo = new THREE.BoxGeometry(mgrWidth, totalHeight - 0.01, 0.008);
        const doorMesh = new THREE.Mesh(doorGeo, doorMaterial);
        doorMesh.position.set(isRightSide ? -mgrWidth / 2 : mgrWidth / 2, 0, 0);

        const insetGeo = new THREE.BoxGeometry(mgrWidth - 0.03, (totalHeight / 2) - 0.05, 0.003);
        const inset1 = new THREE.Mesh(insetGeo, metalMaterial);
        inset1.position.set(0, totalHeight / 4, 0.004);
        doorMesh.add(inset1);

        const inset2 = new THREE.Mesh(insetGeo, metalMaterial);
        inset2.position.set(0, -totalHeight / 4, 0.004);
        doorMesh.add(inset2);

        const badgeGeo = new THREE.BoxGeometry(0.03, 0.015, 0.005);
        const badge = new THREE.Mesh(badgeGeo, badgeMaterial);
        badge.position.set(0, (totalHeight / 2) - 0.1, 0.005);
        doorMesh.add(badge);

        doorPivot.add(doorMesh);
        doorPivot.rotation.y = doorOpenAngle;

        vpcGroup.add(doorPivot);

        return vpcGroup;
    }

    const offsetX = (rackWidth / 2) + (mgrWidth / 2);

    const leftVPC = createSiemonVPC(false, 0);
    leftVPC.position.set(-offsetX, 0, 0);
    openRackInner.add(leftVPC);

    const rightVPC = createSiemonVPC(true, -Math.PI * 0.55);
    rightVPC.position.set(offsetX, 0, 0);
    openRackInner.add(rightVPC);

    const statusLedGeo = new THREE.BoxGeometry(0.03, totalHeight * 0.92, 0.03);
    const statusLedMat = new THREE.MeshBasicMaterial({ color: 0x2ecc71 });
    const statusLed = new THREE.Mesh(statusLedGeo, statusLedMat);
    statusLed.position.set(-rackWidth / 2 - 0.02, totalHeight / 2, channelDepth / 2 + 0.01);
    openRackInner.add(statusLed);

    const displayGeo = new THREE.PlaneGeometry(usableWidth * 0.75, 0.2);
    const initialTexture = createStatusDisplayTexture(22.0, "0.5 kVA", 0x2ecc71);
    const displayMat = new THREE.MeshBasicMaterial({ map: initialTexture });
    const displayMesh = new THREE.Mesh(displayGeo, displayMat);
    displayMesh.position.set(0, totalHeight - 0.18, channelDepth / 2 + 0.01);
    openRackInner.add(displayMesh);

    const isRotatedRow = data.id.startsWith("AW") || data.id.startsWith("VA") || data.id.startsWith("BF");
    openRackInner.rotation.y = isRotatedRow ? -Math.PI / 2 : Math.PI / 2;

    rackGroup.add(openRackInner);
    // CÓDIGO CORREGIDO PARA buildSiemonOpenRackMesh
    const pos = getPosFromId(data.id);
    let rackX = pos.x;
    let rackZ = pos.z;

    // Opcional: Ajustes de desplazamiento según la orientación si lo requiere la grilla
    if (data.facing === "+X") {
        rackX = (pos.colIndex + 1) * TILE_SIZE - channelDepth / 2;
    } else if (data.facing === "-X") {
        rackX = pos.colIndex * TILE_SIZE + channelDepth / 2;
    } else if (data.facing === "-Z") {
        rackZ = (TOTAL_ROWS - pos.rowNum) * TILE_SIZE + channelDepth / 2;
    } else if (data.facing === "+Z") {
        rackZ = (TOTAL_ROWS - pos.rowNum + 1) * TILE_SIZE - channelDepth / 2;
    }

    rackGroup.position.set(rackX, 0 / 2, rackZ);
    // 2. Aplicar la rotación de 90 grados en el eje Y
    rackGroup.rotation.y = -Math.PI / 2;
    return rackGroup;

    rackGroup.userData = { 
        id: data.id, 
        group: "Cargando...", 
        temp: 0.0, 
        power: "0 kVA", 
        power_num: 0.0,
        ledMesh: statusLed,
        displayMesh: displayMesh
    };


    return rackGroup;
}
// ==========================================
// CONSTRUCCIÓN DE RACKS APC AR3100
// ==========================================

function buildAPCRackMesh(data) {
    const rackGroup = new THREE.Group();
    const width = 0.58;
    const height = 1.991;
    const depth = 1.07;

    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5, metalness: 0.8 });
    const serverMaterial = new THREE.MeshStandardMaterial({ color: 0x1f2421, roughness: 0.3 });

    const outerGeo = new THREE.BoxGeometry(width, height, depth);
    const outerMesh = new THREE.Mesh(outerGeo, frameMaterial);

    const innerGeo = new THREE.BoxGeometry(width * 0.85, height * 0.94, depth * 0.88);
    const innerMesh = new THREE.Mesh(innerGeo, serverMaterial);

    const statusLedGeo = new THREE.BoxGeometry(0.03, height * 0.92, 0.03);
    const statusLedMat = new THREE.MeshBasicMaterial({ color: 0x2ecc71 });
    const statusLed = new THREE.Mesh(statusLedGeo, statusLedMat);
    statusLed.position.set(-width / 2 + 0.03, 0, depth / 2 + 0.01);

    const displayGeo = new THREE.PlaneGeometry(width * 0.75, 0.2);
    const initialTexture = createStatusDisplayTexture(22.0, "0.5 kVA", 0x2ecc71);
    const displayMat = new THREE.MeshBasicMaterial({ map: initialTexture });
    const displayMesh = new THREE.Mesh(displayGeo, displayMat);
    displayMesh.position.set(0, height / 2 - 0.18, depth / 2 + 0.01);

    const internalPivot = new THREE.Group();
    internalPivot.add(outerMesh, innerMesh, statusLed, displayMesh);

    if (data.facing === "-X") internalPivot.rotation.y = -Math.PI / 2;
    else if (data.facing === "+X") internalPivot.rotation.y = Math.PI / 2;
    else if (data.facing === "-Z") internalPivot.rotation.y = Math.PI;

    rackGroup.add(internalPivot);

    const pos = getPosFromId(data.id);
    let rackX = pos.x;
    let rackZ = pos.z;
    if (data.facing === "+X") {
        rackX = (pos.colIndex + 1) * TILE_SIZE - depth / 2;
    } else if (data.facing === "-X") {
        rackX = pos.colIndex * TILE_SIZE + depth / 2;
    } else if (data.facing === "-Z") {
        rackZ = (TOTAL_ROWS - pos.rowNum) * TILE_SIZE + depth / 2;
    } else if (data.facing === "+Z") {
        rackZ = (TOTAL_ROWS - pos.rowNum + 1) * TILE_SIZE - depth / 2;
    }
    rackGroup.position.set(rackX, height / 2, rackZ);

    rackGroup.userData = { 
        id: data.id, 
        group: "Cargando...", 
        temp: 0.0, 
        power: "0 kVA", 
        power_num: 0.0,
        ledMesh: statusLed,
        displayMesh: displayMesh
    };

    return rackGroup;
}

function createRacksLayout() {
    racksSala1_2.forEach(data => {
        let rackMesh;
        
        // Si el ID es "AW14", creamos el rack abierto; para el resto, el rack APC
        if (data.id === "AW14") {
            rackMesh = buildSiemonOpenRackMesh(data);
        } else {
            rackMesh = buildAPCRackMesh(data);
        }

        scene.add(rackMesh);
        racks.push(rackMesh);
    });
}    

function createStatusDisplayTexture(tempVal, powerVal, hexColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = '#' + hexColor.toString(16).padStart(6, '0');
    ctx.fillRect(8, 8, 12, 48);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`${tempVal.toFixed(1)}°C`, 30, 32);
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#00d2ff';
    ctx.fillText(`${powerVal}`, 30, 52);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

// ==========================================
// ZABBIX E INTERACCIONES
// ==========================================

async function fetchZabbixData() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/racks-status');
        if (!response.ok) throw new Error("API no disponible");
        cachedZabbixData = await response.json();

        racks.forEach(rack => {
            const info = cachedZabbixData[rack.userData.id];
            if (info) {
                rack.userData.group = info.group;
                rack.userData.temp = info.temp;
                rack.userData.power = info.power;
                rack.userData.power_num = info.power_num !== undefined ? info.power_num : parseFloat(info.power) || 0.0;
            }
        });

        const statusElem = document.getElementById('status');
        if (statusElem) {
            statusElem.innerText = "Conectado a Zabbix (En vivo)";
            statusElem.style.color = "#2ecc71";
        }

    } catch (error) {
        racks.forEach(rack => {
            rack.userData.group = "Modo Demo";
            rack.userData.temp = 21.0 + Math.random() * 8.0;
            rack.userData.power_num = Number((0.4 + Math.random() * 2.3).toFixed(1));
            rack.userData.power = `${rack.userData.power_num} kVA`;
        });

        const statusElem = document.getElementById('status');
        if (statusElem) {
            statusElem.innerText = "Vista Previa (Desconectado)";
            statusElem.style.color = "#e67e22";
        }
    } finally {
        updateColorsAndLegend();
    }
}

function updateColorsAndLegend() {
    const modeSelect = document.getElementById('colorMode');
    const mode = modeSelect ? modeSelect.value : 'temp';

    const titleElem = document.getElementById('legend-title');
    const legNormal = document.getElementById('leg-normal');
    const legAlert = document.getElementById('leg-alert');
    const legCritical = document.getElementById('leg-critical');

    if (mode === 'temp') {
        if (titleElem) titleElem.innerText = "Temperatura (°C)";
        if (legNormal) legNormal.innerText = "Normal (< 24°C)";
        if (legAlert) legAlert.innerText = "Alerta (24°C - 28°C)";
        if (legCritical) legCritical.innerText = "Crítico (> 28°C)";
    } else {
        if (titleElem) titleElem.innerText = "Consumo (kVA)";
        if (legNormal) legNormal.innerText = "Bajo (< 1.0 kVA)";
        if (legAlert) legAlert.innerText = "Medio (1.0 - 2.5 kVA)";
        if (legCritical) legCritical.innerText = "Alto (> 2.5 kVA)";
    }

    racks.forEach(rackGroup => {
        let hexColor = 0x2ecc71;

        if (mode === 'temp') {
            const temp = rackGroup.userData.temp;
            if (temp > 28) hexColor = 0xe74c3c;
            else if (temp >= 24) hexColor = 0xf1c40f;
        } else {
            const powerVal = rackGroup.userData.power_num;
            if (powerVal > 2.5) hexColor = 0xe74c3c;
            else if (powerVal >= 1.0) hexColor = 0xf1c40f;
        }

        if (rackGroup.userData.ledMesh) {
            rackGroup.userData.ledMesh.material.color.setHex(hexColor);
        }

        if (rackGroup.userData.displayMesh) {
            if (rackGroup.userData.displayMesh.material.map) {
                rackGroup.userData.displayMesh.material.map.dispose();
            }
            rackGroup.userData.displayMesh.material.map = createStatusDisplayTexture(
                rackGroup.userData.temp,
                rackGroup.userData.power,
                hexColor
            );
            rackGroup.userData.displayMesh.material.needsUpdate = true;
        }
    });
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    const tooltip = document.getElementById('tooltip');
    let foundElement = null;

    if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj.parent && obj.parent !== scene) {
            if (obj.userData && (obj.userData.id || obj.userData.name)) {
                foundElement = obj;
                break;
            }
            obj = obj.parent;
        }
        if (!foundElement && obj.userData && (obj.userData.id || obj.userData.name)) {
            foundElement = obj;
        }
    }

    if (foundElement && tooltip) {
        const d = foundElement.userData;
        tooltip.style.display = 'block';
        tooltip.style.left = (event.clientX + 15) + 'px';
        tooltip.style.top = (event.clientY + 15) + 'px';

        // Validar si es un Rack o una CRAC según las propiedades de su userData
        if (d.id) {
            tooltip.innerHTML = `
                <strong>Cliente: ${d.group}<br>
                Rack: ${d.id}</strong><br>
                Temp: ${d.temp ? d.temp.toFixed(1) : 'N/A'} °C<br>
                Consumo: ${d.power || 'N/A'}
            `;
        } else if (d.name) {
            tooltip.innerHTML = `
                <strong>Unidad de Precisión (CRAC)</strong><br>
                Equipo: ${d.name}
            `;
        }
    } else if (tooltip) {
        tooltip.style.display = 'none';
    }
}

// ==========================================
// FUNCIÓN DE ZOOM AL HACER DOBLE CLIC (GSAP)
// ==========================================
function onWindowDoubleClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const targetPoint = intersects[0].point; // Punto exacto 3D de impacto

        // Calcular nueva posición para la cámara manteniendo la dirección pero acercándose
        const distanceFactor = 2.5; // Distancia de acercamiento al objeto
        const dirVector = new THREE.Vector3().subVectors(camera.position, targetPoint).normalize();
        const newCameraPosition = new THREE.Vector3().copy(targetPoint).add(dirVector.multiplyScalar(distanceFactor));

        // Animar el centro de los controles hacia el punto seleccionado
        gsap.to(controls.target, {
            x: targetPoint.x,
            y: targetPoint.y,
            z: targetPoint.z,
            duration: 1.2,
            ease: "power2.out"
        });

        // Animar la posición de la cámara de forma fluida
        gsap.to(camera.position, {
            x: newCameraPosition.x,
            y: newCameraPosition.y,
            z: newCameraPosition.z,
            duration: 1.2,
            ease: "power2.out",
            onUpdate: () => controls.update()
        });
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    if (window.airflowTexture) window.airflowTexture.offset.y -= 0.018;
    controls.update();
    renderer.render(scene, camera);
}