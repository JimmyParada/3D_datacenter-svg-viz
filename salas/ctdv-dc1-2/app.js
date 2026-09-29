// ==========================================
// CONFIGURACIÓN GLOBAL Y ESCENA THREE.JS
// ==========================================
let scene, camera, renderer, controls;
let racks = [];
let crahs = []; // Almacenar las unidades CRAH
let perforatedTilesGroup, airflowGroup;
let cachedZabbixData = {};
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// =========================================================================
// LISTADO DE RACKS - SALA DC 1-2
// (Para otra sala, solo cambia esta lista de coordenadas)
// =========================================================================
const rackList = [
    
        { id: "AD03", x: 0.75, z: 14.4 },
        { id: "AD04", x: 0.75, z: 13.8 },
        { id: "AD05", x: 0.75, z: 13.2 },
        { id: "AD06", x: 0.75, z: 12.6 },
        { id: "AD07", x: 0.75, z: 12.0 },
        
        { id: "AD09", x: 0.75, z: 10.8 },
        
        { id: "AD11", x: 1.2, z: 10.2 },
        { id: "AD12", x: 0.75, z: 9.0 },
        
        { id: "AD25", x: 0.75, z: 2.35 },

        { id: "AJ03", x: 5.4, z: 14.52 },
        { id: "AJ04", x: 5.4, z: 13.92 },
        { id: "AJ05", x: 5.4, z: 13.32 },
        { id: "AJ06", x: 5.4, z: 12.72 },
        { id: "AJ07", x: 5.4, z: 12.12 },
        { id: "AJ08", x: 5.4, z: 11.52 },
        
        { id: "AJ12", x: 5.4, z: 9.6 },
        { id: "AJ13", x: 5.4, z: 9.0 },
        { id: "AJ14", x: 5.4, z: 8.4 },
        { id: "AJ15", x: 5.4, z: 7.8 },
        { id: "AJ16", x: 5.4, z: 7.2 },
        { id: "AJ19", x: 5.4, z: 4.8 },
        { id: "AJ20", x: 5.4, z: 4.2 },
        { id: "AJ21", x: 5.4, z: 3.6 },
        { id: "AJ22", x: 5.4, z: 3.0 },
        { id: "AJ23", x: 5.4, z: 2.4 },

        { id: "AP04", x: 7.95, z: 13.8 },
        { id: "AP05", x: 7.95, z: 13.2 },
        { id: "AP06", x: 7.95, z: 12.6 },
        { id: "AP07", x: 7.95, z: 12.0 },
        { id: "AP08", x: 7.95, z: 11.4 },
        { id: "AP09", x: 7.95, z: 10.8 },
        { id: "AP16", x: 7.95, z: 7.2 },
        { id: "AP18", x: 7.95, z: 6.0 },
        { id: "AP19", x: 7.95, z: 5.4 },
        { id: "AP20", x: 7.95, z: 4.8 },
        { id: "AP24", x: 7.95, z: 2.4 },

        { id: "AT03", x: 11.4, z: 14.4 },
        { id: "AT04", x: 11.4, z: 13.8 },
        { id: "AT05", x: 11.4, z: 13.2 },
        { id: "AT06", x: 11.4, z: 12.6 },
        { id: "AT07", x: 11.4, z: 12.0 },
        { id: "AT08", x: 11.4, z: 11.4 },
        { id: "AT11", x: 11.4, z: 10.2 },
        { id: "AT12", x: 11.4, z: 9.6 },
        { id: "AT13", x: 11.4, z: 9.0 },
        { id: "AT14", x: 11.4, z: 8.4 },
        { id: "AT15", x: 11.4, z: 7.8 },
        { id: "AT16", x: 11.4, z: 7.2 },
        { id: "AT17", x: 11.4, z: 6.6 },
        { id: "AT19", x: 11.4, z: 4.8 },
        { id: "AT20", x: 11.4, z: 4.2 },
        { id: "AT21", x: 11.4, z: 3.6 },
        { id: "AT22", x: 11.4, z: 3.0 },
        { id: "AT23", x: 11.4, z: 2.4 },
        { id: "AT24", x: 11.4, z: 1.8 },


        { id: "AZ07", x: 13.95, z: 12.0 },
        { id: "AZ08", x: 13.95, z: 11.4 },
        { id: "AZ09", x: 13.95, z: 10.8 },
        { id: "AZ10", x: 13.95, z: 10.2 },
        { id: "AZ11", x: 13.95, z: 9.6 },
        { id: "AZ12", x: 13.95, z: 9.0 },
        { id: "AZ13", x: 13.95, z: 8.4 },
        { id: "AZ14", x: 13.95, z: 7.8 },
        { id: "AZ15", x: 13.95, z: 7.2 },
        { id: "AZ16", x: 13.95, z: 6.6 },
        { id: "AZ17", x: 13.95, z: 6.0 },
        { id: "AZ18", x: 13.95, z: 5.4 },
        { id: "AZ19", x: 13.95, z: 4.8 },
        { id: "AZ20", x: 13.95, z: 4.2 },
        { id: "AZ21", x: 13.95, z: 3.6 },
        { id: "AZ22", x: 13.95, z: 3.0 },
        { id: "AZ23", x: 13.95, z: 2.4 },
        { id: "AZ24", x: 13.95, z: 1.8 },

        { id: "BB09", x: 16.20, z: 10.8 },
        { id: "BB10", x: 16.20, z: 10.2 },
        { id: "BB11", x: 16.20, z: 9.6 },
        { id: "BB12", x: 16.20, z: 9.0 },
        { id: "BB13", x: 16.20, z: 8.4 },
        { id: "BB14", x: 16.20, z: 7.8 },
        { id: "BB15", x: 16.20, z: 7.2 },
        { id: "BB16", x: 16.20, z: 6.6 },
        { id: "BB17", x: 16.20, z: 6.0 },
        { id: "BB18", x: 16.20, z: 5.4 },
        { id: "BB19", x: 16.20, z: 4.8 },
        { id: "BB20", x: 16.20, z: 4.2 },
        { id: "BB21", x: 16.20, z: 3.6 },
        { id: "BB22", x: 16.20, z: 3.0 },
        { id: "BB23", x: 16.20, z: 2.4 },
        { id: "BB24", x: 16.20, z: 1.8 },

        { id: "BG09", x: 18.15, z: 10.8 },
        { id: "BG10", x: 18.15, z: 10.2 },
        { id: "BG11", x: 18.15, z: 9.6},
        { id: "BG12", x: 18.15, z: 9.0 },
        { id: "BG13", x: 18.15, z: 8.4 },
        { id: "BG14", x: 18.15, z: 7.8 },
        { id: "BG15", x: 18.15, z: 7.2 },
        { id: "BG16", x: 18.15, z: 6.6 },
        { id: "BG17", x: 18.15, z: 6.0 },
        { id: "BG18", x: 18.15, z: 5.4 },
        { id: "BG19", x: 18.15, z: 4.8 },
        { id: "BG20", x: 18.15, z: 4.2 },
        { id: "BG21", x: 18.15, z: 3.6 },
        { id: "BG22", x: 18.15, z: 3.0 },
        { id: "BG23", x: 18.15, z: 2.4 },
        { id: "BG24", x: 18.15, z: 1.8 }
    ];

init();
animate();

function init() {
    // 1. Crear Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.015);

    // 2. Crear Cámara
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 25, 35);

    // 3. Crear Renderizador
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // 4. Controles de Órbita con mejoras de Zoom
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.01;

    controls.zoomSpeed = 0.8;
    controls.minDistance = 0.5;
    controls.maxDistance = 60.0;
    controls.enableZoom = true;

    controls.target.set(10.5, 0, 8.1);
    controls.update();

    // 5. Iluminación
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight1.position.set(20, 40, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x00d2ff, 0.35);
    dirLight2.position.set(-20, 20, -20);
    scene.add(dirLight2);

    // 6. Construcción del Entorno
    createDatacenterRoom();
    createRacksLayout();
    createPerforatedTilesLayout(); // <--- GENERA LAS BALDOSAS AUTOMÁTICAMENTE

    // 7. Eventos
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('mousemove', onMouseMove, false);

    // ==========================================
    // NUEVO: EVENTO DE ZOOM AL HACER DOBLE CLIC
    // ==========================================
    window.addEventListener('dblclick', onWindowDoubleClick, false);    

    const selectMode = document.getElementById('colorMode');
    if (selectMode) {
        selectMode.addEventListener('change', updateColorsAndLegend);
    }

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

    // 8. Carga inicial de datos Zabbix
    fetchZabbixData();
    setInterval(fetchZabbixData, 30000);
}

// ==========================================
// LOSAS PERFORADAS Y FLUJO DE AIRE VISIBLE
// ==========================================

function createPerforatedTileTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Chapa de acero
    ctx.fillStyle = '#2b3036';
    ctx.fillRect(0, 0, 256, 256);

    // Bisel perimetral
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#48525b';
    ctx.strokeRect(6, 6, 244, 244);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#181d22';
    ctx.strokeRect(12, 12, 232, 232);

    // Remaches
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

    // Rejilla de agujeros troquelados
    const margin = 28;
    const spacing = 15;
    const radius = 4.2;

    for (let y = margin; y <= 256 - margin; y += spacing) {
        const isOddRow = Math.round((y - margin) / spacing) % 2 === 1;
        const startX = isOddRow ? margin + spacing / 2 : margin;

        for (let x = startX; x <= 256 - margin; x += spacing) {
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = '#0a0d11';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, y, radius, -Math.PI * 0.25, Math.PI * 0.75);
            ctx.strokeStyle = '#5a6673';
            ctx.lineWidth = 1.1;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(x, y, radius * 0.45, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 210, 255, 0.45)';
            ctx.fill();
        }
    }

    return new THREE.CanvasTexture(canvas);
}

//##################################################
//CONSTRUCCION DE CRAH
//##################################################
function createCRACUnit(name, xPos, zPos, width = 3.66, depth = 1.06, height = 3.9) {
    const cracGroup = new THREE.Group();
    
    // Cuerpo principal de la unidad CRAC (color azul industrial o gris oscuro)
    const bodyGeo = new THREE.BoxGeometry(width, height, depth);
    const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x0984e3,
        roughness: 0.35,
        metalness: 0.6
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(0, height / 2, 0);
    body.castShadow = true;
    body.receiveShadow = true;

    // Rejilla superior o frontal característica de los equipos de precisión
    const grillGeo = new THREE.PlaneGeometry(width * 0.85, 0.4);
    const grillMat = new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.DoubleSide });
    const grill = new THREE.Mesh(grillGeo, grillMat);
    grill.position.set(0, height - 0.4, depth / 2 + 0.005);

    cracGroup.add(body, grill);
    cracGroup.position.set(xPos, 0, zPos);

    // Datos para interactuar o mostrar en tooltips
    cracGroup.userData = { name: name };
    crahs.push(cracGroup);

    scene.add(cracGroup);
}
function createPerforatedTilesLayout() {
    perforatedTilesGroup = new THREE.Group();
    airflowGroup = new THREE.Group();

    const tileTexture = createPerforatedTileTexture();
    const tileMaterial = new THREE.MeshStandardMaterial({
        map: tileTexture,
        bumpMap: tileTexture,
        bumpScale: 0.003,
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

    const openRackTargets = ["AD11"];
    const addedTileKeys = new Set();

    rackList.forEach(data => {
        const isSiemon = openRackTargets.includes(data.id);
        const isRotatedRow = data.id.startsWith("AJ") || data.id.startsWith("AT") || data.id.startsWith("BB");

        let rackFrontX, rackCenterZ, facingDir;

        if (isSiemon) {
            rackFrontX = data.x;
            rackCenterZ = data.z;
            facingDir = 1; // Hacia +X
        } else {
            const depth = 1.07;
            const width = 0.58;
            rackCenterZ = data.z + width / 2;
            if (isRotatedRow) {
                rackFrontX = data.x;
                facingDir = -1; // Hacia -X
            } else {
                rackFrontX = data.x + depth;
                facingDir = 1; // Hacia +X
            }
        }

        let tileX;
        if (facingDir === 1) {
            tileX = (Math.floor(rackFrontX / 0.6) + 0.5) * 0.6;
            if (tileX <= rackFrontX) tileX += 0.6;
        } else {
            tileX = (Math.floor(rackFrontX / 0.6) - 0.5) * 0.6;
            if (tileX >= rackFrontX) tileX -= 0.6;
        }

        const tileZ = (Math.floor(rackCenterZ / 0.6) + 0.5) * 0.6;
        const tileKey = `${tileX.toFixed(2)}_${tileZ.toFixed(2)}`;

        if (!addedTileKeys.has(tileKey)) {
            addedTileKeys.add(tileKey);

            const tileMesh = new THREE.Mesh(tileGeo, tileMaterial);
            tileMesh.position.set(tileX, 0.012, tileZ);
            perforatedTilesGroup.add(tileMesh);

            const airMesh1 = new THREE.Mesh(airGeo, window.airflowMaterial);
            airMesh1.position.set(tileX, airHeight / 2 + 0.015, tileZ);
            const airMesh2 = airMesh1.clone();
            airMesh2.rotation.y = Math.PI / 2;

            airflowGroup.add(airMesh1, airMesh2);
        }
    });

    scene.add(perforatedTilesGroup);
    scene.add(airflowGroup);
}

// ==========================================
// CONSTRUCCIÓN DE COLUMNA DOBLE T
// ==========================================

function createColumnMesh(position = { x: 10.5, y: 0, z: 8.1 }, rotationY = 0) {
    const W = 0.36;
    const D = 0.70;
    const H = 3.50;
    const t_f = 0.02;
    const t_w = 0.015;

    const shape = new THREE.Shape();
    shape.moveTo(-W / 2, -D / 2);
    shape.lineTo( W / 2, -D / 2);
    shape.lineTo( W / 2, -D / 2 + t_f);
    shape.lineTo( t_w / 2, -D / 2 + t_f);
    shape.lineTo( t_w / 2,  D / 2 - t_f);
    shape.lineTo( W / 2,  D / 2 - t_f);
    shape.lineTo( W / 2,  D / 2);
    shape.lineTo(-W / 2,  D / 2);
    shape.lineTo(-W / 2,  D / 2 - t_f);
    shape.lineTo(-t_w / 2,  D / 2 - t_f);
    shape.lineTo(-t_w / 2, -D / 2 + t_f);
    shape.lineTo(-W / 2, -D / 2 + t_f);
    shape.closePath();

    const extrudeSettings = { depth: H, bevelEnabled: false };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.rotateX(-Math.PI / 2);

    const material = new THREE.MeshStandardMaterial({
        color: 0xEAE6DF,
        metalness: 0.2,
        roughness: 0.4
    });

    const beam = new THREE.Mesh(geometry, material);
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x999999 }));
    beam.add(line);

    beam.position.set(position.x, position.y, position.z);
    beam.rotation.y = rotationY;

    return beam;
}

// ==========================================
// COMPONENTES RACK APC Y SIEMON
// ==========================================

function createAPCMeshTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#333333';
    const radius = 3;
    const gap = 12;

    for (let y = 0; y < canvas.height; y += gap) {
        for (let x = 0; x < canvas.width; x += gap) {
            ctx.beginPath();
            ctx.arc(x + (y % (gap * 2) === 0 ? 0 : gap / 2), y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 6);
    return texture;
}

function createServerStackTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 256, 512);

    const uHeight = 512 / 42;
    for (let i = 0; i < 42; i++) {
        const y = i * uHeight;
        ctx.fillStyle = (i % 3 === 0) ? '#1f2421' : '#151817';
        ctx.fillRect(2, y + 1, 252, uHeight - 2);
        ctx.fillStyle = '#444444';
        ctx.fillRect(2, y, 10, uHeight);
        ctx.fillRect(244, y, 10, uHeight);

        if (Math.random() > 0.3) {
            ctx.fillStyle = Math.random() > 0.1 ? '#00ffcc' : '#ff9900';
            ctx.fillRect(18, y + uHeight / 2 - 1, 3, 3);
            ctx.fillRect(24, y + uHeight / 2 - 1, 3, 3);
        }
    }
    return new THREE.CanvasTexture(canvas);
}

function createStatusDisplayTexture(tempVal, powerVal, hexColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, 256, 64);
    ctx.strokeStyle = '#333333';
    ctx.strokeRect(2, 2, 252, 60);

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

    const frameMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const thickness = 0.08;

    const vGeo = new THREE.BoxGeometry(thickness, height, thickness);
    const leftPost = new THREE.Mesh(vGeo, frameMat);
    leftPost.position.set(-width / 2, height / 2, 0);
    const rightPost = new THREE.Mesh(vGeo, frameMat);
    rightPost.position.set(width / 2, height / 2, 0);

    const hGeo = new THREE.BoxGeometry(width, thickness, thickness);
    const topBar = new THREE.Mesh(hGeo, frameMat);
    topBar.position.set(0, height, 0);
    const bottomBar = new THREE.Mesh(hGeo, frameMat);
    bottomBar.position.set(0, 0, 0);

    cageGroup.add(leftPost, rightPost, topBar, bottomBar);
    cageGroup.position.set(position.x, position.y, position.z);
    cageGroup.rotation.y = rotationY;

    return cageGroup;
}

// ==========================================
// JAULAS DE LA SALA DC 1-2
// ==========================================
function createCagesLayout() {
    const cageHeight = 2.4;

    // 1. Delimitadores Perimetrales Izquierda (V11JAF27 / V11JAF13)
    scene.add(createCagePanel(8.4, cageHeight, { x: 3, y: 0, z: 4.2 }, Math.PI / 2));
    scene.add(createCagePanel(3.0, cageHeight, { x: 1.5, y: 0, z: 3.0 }, 0));
    scene.add(createCagePanel(3.0, cageHeight, { x: 1.5, y: 0, z: 6.6 }, 0));
    scene.add(createCagePanel(7.8, cageHeight, { x: 3, y: 0, z: 12.4 }, Math.PI / 2));

    // 2. Bloque Central Izquierdo (V11JAH25 / V11JAR25)
    scene.add(createCagePanel(6.0, cageHeight, { x: 7.2, y: 0, z: 1.8 }, 0));
    scene.add(createCagePanel(3.0, cageHeight, { x: 4.2, y: 0, z: 3.3 }, Math.PI / 2));
    scene.add(createCagePanel(13.2, cageHeight, { x: 10.2, y: 0, z: 8.4 }, Math.PI / 2));
    scene.add(createCagePanel(13.2, cageHeight, { x: 7.2, y: 0, z: 8.4 }, Math.PI / 2));
    scene.add(createCagePanel(3.0, cageHeight, { x: 8.7, y: 0, z: 4.2 }, 0));
    scene.add(createCagePanel(3.0, cageHeight, { x: 5.7, y: 0, z: 4.8 }, 0));
    
    scene.add(createCagePanel(3.0, cageHeight, { x: 8.7, y: 0, z: 8.4 }, 0));
    scene.add(createCagePanel(3.0, cageHeight, { x: 8.7, y: 0, z: 15.0 }, 0));
}

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

    const isRotatedRow = data.id.startsWith("AJ") || data.id.startsWith("AT") || data.id.startsWith("BB");
    openRackInner.rotation.y = isRotatedRow ? -Math.PI / 2 : Math.PI / 2;

    rackGroup.add(openRackInner);
    rackGroup.position.set(data.x, 0, data.z);

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

function buildAPCRackMesh(data) {
    const rackGroup = new THREE.Group();
    const width = 0.58;
    const height = 1.991;
    const depth = 1.07;

    const frameMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a1a, 
        roughness: 0.5, 
        metalness: 0.8 
    });

    const meshDoorMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        map: createAPCMeshTexture(),
        transparent: true,
        opacity: 0.85,
        roughness: 0.4
    });

    const serverMaterial = new THREE.MeshStandardMaterial({
        map: createServerStackTexture(),
        roughness: 0.3
    });

    const outerGeo = new THREE.BoxGeometry(width, height, depth);
    const outerMesh = new THREE.Mesh(outerGeo, frameMaterial);

    const innerGeo = new THREE.BoxGeometry(width * 0.85, height * 0.94, depth * 0.88);
    const innerMesh = new THREE.Mesh(innerGeo, serverMaterial);

    const doorGeo = new THREE.PlaneGeometry(width * 0.9, height * 0.92);
    const frontDoor = new THREE.Mesh(doorGeo, meshDoorMaterial);
    frontDoor.position.set(0, 0, depth / 2 + 0.005);

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
    internalPivot.add(outerMesh, innerMesh, frontDoor, statusLed, displayMesh);

    const isRotatedRow = data.id.startsWith("AJ") || data.id.startsWith("AT") || data.id.startsWith("BB");
    internalPivot.rotation.y = isRotatedRow ? -Math.PI / 2 : Math.PI / 2;
    internalPivot.position.set(depth / 2, 0, width / 2);

    rackGroup.add(internalPivot);
    rackGroup.position.set(data.x, height / 2, data.z);

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
// SALA Y SUELO TÉCNICO
// ==========================================

function createDatacenterRoom() {
    const tileWidth = 35;
    const tileHeight = 27;
    const tileSize = 0.6;

    const totalWidth = tileWidth * tileSize;
    const totalLength = tileHeight * tileSize;

    const floorGeo = new THREE.PlaneGeometry(totalWidth, totalLength);
    const floorMat = new THREE.MeshStandardMaterial({ 
        color: 0x8c969e,
        roughness: 0.3,
        metalness: 0.1 
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(totalWidth / 2, -0.01, totalLength / 2);
    scene.add(floor);

    const gridGroup = new THREE.Group();
    for (let i = 0; i <= tileHeight; i++) {
        const points = [new THREE.Vector3(0, 0, i * tileSize), new THREE.Vector3(totalWidth, 0, i * tileSize)];
        gridGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: 0x556068 })));
    }
    for (let j = 0; j <= tileWidth; j++) {
        const points = [new THREE.Vector3(j * tileSize, 0, 0), new THREE.Vector3(j * tileSize, 0, totalLength)];
        gridGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: 0x556068 })));
    }
    gridGroup.position.y = 0.01;
    scene.add(gridGroup);

    createCagesLayout();

    // Columnas de la sala
    scene.add(createColumnMesh({ x: 5.6, y: 0, z: 11.15 }, 0));
    scene.add(createColumnMesh({ x: 12.9, y: 0, z: 11.15 }, 0));
    scene.add(createColumnMesh({ x: 12.9, y: 0, z: 5.7 }, 0));
    scene.add(createColumnMesh({ x: 5.6, y: 0, z: 5.7 }, 0));
    scene.add(createColumnMesh({ x: 5.6, y: 0, z: 0.0 }, Math.PI / 2));
    scene.add(createColumnMesh({ x: 5.6, y: 0, z: 16.2 }, Math.PI / 2));
    scene.add(createColumnMesh({ x: 12.9, y: 0, z: 0.0 }, Math.PI / 2));
    scene.add(createColumnMesh({ x: 12.9, y: 0, z: 16.2 }, Math.PI / 2));
    scene.add(createColumnMesh({ x: 20.4, y: 0, z: 0.0 }, 0));
    scene.add(createColumnMesh({ x: 20.4, y: 0, z: 16.2 }, 0));
    scene.add(createColumnMesh({ x: 20.4, y: 0, z: 5.7 }, Math.PI / 2));
    scene.add(createColumnMesh({ x: 20.4, y: 0, z: 11.15 }, Math.PI / 2));
}
// 👉 INSTANCIAR TUS CRAHs AQUÍ CON COORDENADAS X, Z:
    createCRACUnit("CRAH-12A", 15.3, -0.6);
    createCRACUnit("CRAH-12R", 8.1, -0.6);
    createCRACUnit("CRAH-12B", 2.1, -0.6);

function createRacksLayout() {
    const openRackTargets = ["AD11"];
    rackList.forEach(data => {
        let rackGroup;
        if (openRackTargets.includes(data.id)) {
            rackGroup = buildSiemonOpenRackMesh(data);
        } else {
            rackGroup = buildAPCRackMesh(data);
        }
        scene.add(rackGroup);
        racks.push(rackGroup);
    });
}

// ==========================================
// CONSULTA ZABBIX
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

// ==========================================
// INTERACCIONES Y ANIMACIÓN
// ==========================================

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    const tooltip = document.getElementById('tooltip');
    let foundRack = null;

    if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj.parent && obj.parent !== scene) {
            if (obj.userData && (obj.userData.id || obj.userData.name)) {
                foundRack = obj;
                break;
            }
            obj = obj.parent;
        }
        if (!foundRack && obj.userData && (obj.userData.id || obj.userData.name)) {
            foundRack = obj;
        }
    }

    if (foundRack && tooltip) {
        const d = foundRack.userData;
        tooltip.style.display = 'block';
        tooltip.style.left = (event.clientX + 15) + 'px';
        tooltip.style.top = (event.clientY + 15) + 'px';
        
        if (d.id) {
            tooltip.innerHTML = `
                <strong>Cliente: ${d.group}<br>
                Rack: ${d.id}</strong><br>
                Temp: ${d.temp ? d.temp.toFixed(1) : 'N/A'} °C<br>
                Consumo: ${d.power || 'N/A'}
            `;
        } else if (d.name) {
            tooltip.innerHTML = `
                <strong>Unidad de Precisión (CRAH)</strong><br>
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

    // Animación de subida del flujo de aire frío
    if (window.airflowTexture) {
        window.airflowTexture.offset.y -= 0.016;
    }

    controls.update();
    renderer.render(scene, camera);
}