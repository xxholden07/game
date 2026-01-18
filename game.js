// Configuração do jogo
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Carregamento de sprites
const tabernaImg = new Image();
tabernaImg.src = 'sprite/taberna.png';

// Sprites individuais por personagem (com fundo transparente)
const SPRITES = {
    bartender: [],
    elf: [],
    rogue: [],
    dwarves: []
};

// Configuração dos personagens baseada no sprites_meta.json
const SPRITE_CONFIG = {
    bartender: {
        folder: 'barwoman',
        prefix: 'barwoman',
        frames: 10,
        frameSize: { w: 122, h: 181 },
        scale: 0.65,
        animations: {
            idle: [0, 1, 2, 3],       // Idle respirando
            walk: [2, 3],              // Passo lateral
            serve: [4, 5, 6, 7, 8],    // Servir bebida
            celebrate: [8, 9]          // Comemoração
        }
    },
    elf: {
        folder: 'elf',
        prefix: 'elf',
        frames: 10,
        frameSize: { w: 101, h: 151 },
        scale: 0.7,
        animations: {
            idle: [0, 1],
            walk: [2, 3],
            order: [4, 5],
            drink: [6, 7, 8],
            happy: [8, 9]
        }
    },
    rogue: {
        folder: 'rogue',
        prefix: 'rogue',
        frames: 10,
        frameSize: { w: 101, h: 154 },
        scale: 0.7,
        animations: {
            idle: [0, 1],
            walk: [2, 3],
            order: [4, 5],
            drink: [6, 7],
            sneak: [8, 9]
        }
    },
    dwarves: {
        folder: 'dwarves',
        prefix: 'dwarves',
        frames: 3,
        frameSize: { w: 416, h: 247 },
        scale: 0.4,  // Anões têm sprites maiores
        animations: {
            idle: [0],
            drink: [1],
            celebrate: [2]
        }
    }
};

let spritesLoaded = false;
let loadedCount = 0;
let totalSprites = 0;

// Carregar todos os sprites
function loadSprites() {
    // Contar total de sprites
    for (const key in SPRITE_CONFIG) {
        totalSprites += SPRITE_CONFIG[key].frames;
    }
    totalSprites += 1; // +1 para taberna
    
    // Carregar sprites de cada personagem
    for (const key in SPRITE_CONFIG) {
        const config = SPRITE_CONFIG[key];
        SPRITES[key] = [];
        
        for (let i = 0; i < config.frames; i++) {
            const img = new Image();
            const frameNum = i.toString().padStart(2, '0');
            img.src = `sprite/${config.folder}/${config.prefix}_${frameNum}.png`;
            img.onload = onSpriteLoad;
            img.onerror = () => {
                console.error(`Erro ao carregar: sprite/${config.folder}/${config.prefix}_${frameNum}.png`);
                onSpriteLoad();
            };
            SPRITES[key].push(img);
        }
    }
}

function onSpriteLoad() {
    loadedCount++;
    if (loadedCount >= totalSprites) {
        spritesLoaded = true;
        console.log('✅ Todos os sprites carregados!');
    }
}

tabernaImg.onload = onSpriteLoad;

// Iniciar carregamento
loadSprites();

// Estados do jogo
let gameState = 'start'; // start, playing, paused, gameover, powerSelect
let score = 0;
let level = 1;
let lives = 3;
let gameSpeed = 1;
let spawnTimer = 0;
let spawnInterval = 120;
let levelUpAnimation = 0;
let levelUpMessage = '';

// Sistema de poderes
let activePowers = [];
let powerOptions = [];
let selectedPowerIndex = 0;
const POWERS = [
    { id: 'speed', name: 'Velocidade', desc: 'Mova-se 50% mais rápido', icon: '⚡', duration: -1 },
    { id: 'multiServe', name: 'Servir Duplo', desc: 'Serve 2 canecas por vez', icon: '🍺', duration: -1 },
    { id: 'slowTime', name: 'Tempo Lento', desc: 'Clientes 30% mais lentos', icon: '⏰', duration: -1 },
    { id: 'autoCollect', name: 'Coleta Ampla', desc: 'Pega canecas de mais longe', icon: '🎯', duration: -1 },
    { id: 'extraLife', name: 'Vida Extra', desc: 'Ganhe +1 vida', icon: '❤️', duration: 0 },
    { id: 'goldRush', name: 'Pontos Dobrados', desc: 'Dobra pontos por 30s', icon: '💰', duration: 1800 },
    { id: 'shield', name: 'Escudo', desc: 'Próximo erro não tira vida', icon: '🛡️', duration: -1 },
    { id: 'magnetGlass', name: 'Ímã de Canecas', desc: 'Canecas vêm até você', icon: '🧲', duration: -1 }
];

// Sistema de Combo
let comboCount = 0;
let comboTimer = 0;
let comboMultiplier = 1;
const COMBO_TIMEOUT = 180; // 3 segundos

// Sistema de Eventos Aleatórios
let activeEvent = null;
let eventTimer = 0;
const EVENTS = [
    { id: 'rush', name: 'HORA DO RUSH!', desc: 'Dobro de clientes', duration: 600, icon: '🔥' },
    { id: 'happy', name: 'HAPPY HOUR!', desc: 'Pontos triplos', duration: 600, icon: '🎉' },
    { id: 'slow', name: 'Dia Calmo', desc: 'Clientes mais pacientes', duration: 600, icon: '😌' },
    { id: 'chaos', name: 'CAOS!', desc: 'Tudo mais rápido', duration: 450, icon: '⚡' }
];

// Configurações dos balcões - ajustadas para a imagem da taberna
const NUM_BARS = 4;
const BAR_HEIGHT = canvas.height / NUM_BARS;
const BARTENDER_X = 100;

// Posições Y dos balcões na imagem da taberna (ajustadas para os pés dos personagens)
const BAR_POSITIONS = [
    95,   // Balcão 1 (topo) 
    245,  // Balcão 2
    395,  // Balcão 3
    545   // Balcão 4 (baixo)
];

// Classes do jogo
class Bartender {
    constructor(barIndex) {
        this.barIndex = barIndex;
        this.targetBarIndex = barIndex;
        this.x = BARTENDER_X;
        this.y = BAR_POSITIONS[barIndex];
        this.width = 40;
        this.height = 60;
        this.moveSpeed = 5;
        this.armAnimation = 0;
        // Animação de sprite
        this.frameIndex = 0;
        this.frameTimer = 0;
        this.frameDelay = 8; // Frames do jogo entre frames da animação
        this.isServing = false;
        this.serveTimer = 0;
        this.serveAnimIndex = 0;
    }
    
    moveUp() {
        const speed = hasPower('speed') ? this.moveSpeed * 1.5 : this.moveSpeed;
        if (this.targetBarIndex > 0) {
            this.targetBarIndex--;
        }
    }
    
    moveDown() {
        const speed = hasPower('speed') ? this.moveSpeed * 1.5 : this.moveSpeed;
        if (this.targetBarIndex < NUM_BARS - 1) {
            this.targetBarIndex++;
        }
    }
    
    triggerServeAnimation() {
        this.isServing = true;
        this.serveTimer = 40; // Duração da animação de servir
        this.serveAnimIndex = 0;
    }
    
    update() {
        const speed = hasPower('speed') ? this.moveSpeed * 1.5 : this.moveSpeed;
        const targetY = BAR_POSITIONS[this.targetBarIndex];
        if (Math.abs(this.y - targetY) > speed) {
            this.y += (this.y < targetY) ? speed : -speed;
        } else {
            this.y = targetY;
            this.barIndex = this.targetBarIndex;
        }
        this.armAnimation = (this.armAnimation + 0.1) % (Math.PI * 2);
        
        // Atualizar animação de sprite
        const config = SPRITE_CONFIG.bartender;
        this.frameTimer++;
        if (this.frameTimer >= this.frameDelay) {
            this.frameTimer = 0;
            if (this.isServing) {
                // Durante animação de servir
                const serveFrames = config.animations.serve;
                this.serveAnimIndex = (this.serveAnimIndex + 1) % serveFrames.length;
                this.frameIndex = serveFrames[this.serveAnimIndex];
            } else {
                // Animação idle
                const idleFrames = config.animations.idle;
                this.frameIndex = idleFrames[Math.floor(this.armAnimation) % idleFrames.length];
            }
        }
        
        // Contador de animação de servir
        if (this.serveTimer > 0) {
            this.serveTimer--;
            if (this.serveTimer === 0) {
                this.isServing = false;
            }
        }
    }

    draw() {
        // Se sprites carregadas, usar sprites individuais
        if (spritesLoaded && SPRITES.bartender[this.frameIndex]) {
            const config = SPRITE_CONFIG.bartender;
            const sprite = SPRITES.bartender[this.frameIndex];
            
            // Tamanho de exibição
            const drawWidth = config.frameSize.w * config.scale;
            const drawHeight = config.frameSize.h * config.scale;
            
            // Desenhar sprite (já tem fundo transparente)
            ctx.drawImage(
                sprite,
                0, 0,
                sprite.width, sprite.height,
                this.x - drawWidth / 2, this.y - drawHeight + 15,
                drawWidth, drawHeight
            );
            
            // Aura de poder ativo
            if (activePowers.length > 0) {
                ctx.strokeStyle = '#ffd54f';
                ctx.lineWidth = 3;
                ctx.strokeRect(this.x - drawWidth/2 - 5, this.y - drawHeight + 10, drawWidth + 10, drawHeight + 10);
                
                // Partículas douradas
                if (Math.random() < 0.3) {
                    const px = this.x + (Math.random() - 0.5) * 60;
                    const py = this.y + (Math.random() - 0.5) * 80;
                    ctx.fillStyle = '#ffeb3b';
                    ctx.fillRect(px - 2, py - 2, 4, 4);
                }
            }
        } else {
            // Fallback: desenho original
            // Sombra pixelada
            ctx.fillStyle = '#000';
            ctx.fillRect(this.x - 10, this.y + 30, 20, 4);
            
            // Pernas pixeladas
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(this.x - 10, this.y + 12, 6, 18);
            ctx.fillRect(this.x + 4, this.y + 12, 6, 18);
            
            // Botas medievais
            ctx.fillStyle = '#3e2723';
            ctx.fillRect(this.x - 12, this.y + 28, 8, 4);
            ctx.fillRect(this.x + 4, this.y + 28, 8, 4);
            
            // Túnica marrom medieval
            ctx.fillStyle = '#6d4c41';
            ctx.fillRect(this.x - 16, this.y - 20, 32, 36);
            
            // Avental de couro
            ctx.fillStyle = '#8d6e63';
            ctx.fillRect(this.x - 12, this.y - 16, 24, 28);
            
            // Borda preta do avental
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x - 12, this.y - 16, 24, 28);
            
            // Detalhes do couro
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(this.x - 8, this.y - 4, 16, 2);
            ctx.fillRect(this.x - 8, this.y + 2, 16, 2);
            
            // Braços animados
            const armOffset = Math.sin(this.armAnimation) * 3;
            ctx.fillStyle = '#ffb74d';
            ctx.fillRect(this.x - 20, this.y - 10 + armOffset, 6, 18);
            ctx.fillRect(this.x + 14, this.y - 10 - armOffset, 6, 18);
            
            // Cabeça quadrada
            ctx.fillStyle = '#ffb74d';
            ctx.fillRect(this.x - 12, this.y - 40, 24, 24);
            
            // Capuz/touca medieval
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(this.x - 14, this.y - 44, 28, 8);
            ctx.fillRect(this.x - 12, this.y - 48, 24, 4);
            
            // Olhos pixelados
            ctx.fillStyle = '#fff';
            ctx.fillRect(this.x - 10, this.y - 34, 6, 6);
            ctx.fillRect(this.x + 4, this.y - 34, 6, 6);
            
            ctx.fillStyle = '#000';
            ctx.fillRect(this.x - 8, this.y - 32, 3, 3);
            ctx.fillRect(this.x + 6, this.y - 32, 3, 3);
            
            // Barba medieval
            ctx.fillStyle = '#6d4c41';
            ctx.fillRect(this.x - 10, this.y - 22, 20, 6);
            ctx.fillRect(this.x - 8, this.y - 16, 16, 4);
            
            // Bigode
            ctx.fillStyle = '#6d4c41';
            ctx.fillRect(this.x - 10, this.y - 26, 8, 3);
            ctx.fillRect(this.x + 2, this.y - 26, 8, 3);
            
            // Indicador de posição (seta verde)
            ctx.fillStyle = '#4caf50';
            ctx.fillRect(this.x - 6, this.y - 60, 12, 8);
            ctx.fillRect(this.x - 10, this.y - 52, 20, 4);
            ctx.fillRect(this.x - 14, this.y - 48, 28, 4);
            
            // Aura de poder ativo
            if (activePowers.length > 0) {
                ctx.strokeStyle = '#ffd54f';
                ctx.lineWidth = 3;
                ctx.strokeRect(this.x - 18, this.y - 42, 36, 76);
                
                // Partículas douradas
                if (Math.random() < 0.3) {
                    const px = this.x + (Math.random() - 0.5) * 40;
                    const py = this.y + (Math.random() - 0.5) * 60;
                    ctx.fillStyle = '#ffeb3b';
                    ctx.fillRect(px - 2, py - 2, 4, 4);
                }
            }
        }
    }
}

class Customer {
    constructor(barIndex) {
        this.barIndex = barIndex;
        this.x = canvas.width - 80;
        this.y = BAR_POSITIONS[barIndex];
        this.width = 30;
        this.height = 50;
        this.speed = 0.3;
        this.hasReturned = false;
        this.hatStyle = Math.floor(Math.random() * 3);
        this.walkCycle = 0;
        this.happiness = 1;
        this.throwPoint = canvas.width * 0.5;
        
        // Animação de sprite
        this.frameIndex = 0;
        this.frameTimer = 0;
        this.frameDelay = 10;
        
        // Escolher sprite aleatório para o cliente
        const customerTypeKeys = ['elf', 'rogue', 'dwarves'];
        this.spriteKey = customerTypeKeys[Math.floor(Math.random() * customerTypeKeys.length)];
        
        // Tipos especiais de clientes (15% de chance)
        const rand = Math.random();
        if (rand < 0.05) {
            this.type = 'vip';
            this.color = '#ffd700'; // Dourado
            this.speed = 0.2; // Mais lento
            this.pointsMultiplier = 3;
            this.spriteKey = 'dwarves'; // VIP é o anão
        } else if (rand < 0.10) {
            this.type = 'rush';
            this.color = '#ff1744'; // Vermelho intenso
            this.speed = 0.5; // Mais rápido
            this.pointsMultiplier = 1.5;
            this.spriteKey = 'rogue'; // Rush é o ladrão roxo
        } else if (rand < 0.15) {
            this.type = 'drunk';
            this.color = '#9c27b0'; // Roxo
            this.speed = 0.25;
            this.pointsMultiplier = 1;
            this.wobble = 0;
            this.spriteKey = 'elf'; // Drunk é o elfo
        } else {
            this.type = 'normal';
            this.color = ['#3498db', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c'][Math.floor(Math.random() * 5)];
            this.pointsMultiplier = 1;
        }
    }
    
    update() {
        const slowFactor = hasPower('slowTime') ? 0.7 : 1;
        const eventFactor = activeEvent?.id === 'slow' ? 0.7 : (activeEvent?.id === 'chaos' ? 1.5 : 1);
        this.x -= this.speed * gameSpeed * slowFactor * eventFactor;
        this.walkCycle += 0.1;
        
        // Atualizar animação de sprite
        const config = SPRITE_CONFIG[this.spriteKey];
        this.frameTimer++;
        if (this.frameTimer >= this.frameDelay) {
            this.frameTimer = 0;
            // Usar animação walk (frames 2-3) ou idle (0-1) dependendo do personagem
            const walkFrames = config.animations.walk || config.animations.idle;
            const animIndex = Math.floor(this.walkCycle) % walkFrames.length;
            this.frameIndex = walkFrames[animIndex];
        }
        
        // Movimento em zigue-zague para clientes bêbados (limitado)
        if (this.type === 'drunk') {
            this.wobble += 0.1;
            // Manter o Y próximo do balcão original
            const baseY = BAR_POSITIONS[this.barIndex];
            this.y = baseY + Math.sin(this.wobble) * 8;
        }
        
        if (this.x < this.throwPoint && !this.hasReturned) {
            this.hasReturned = true;
            emptyGlasses.push(new EmptyGlass(this.x, this.y, this.barIndex));
        }
        
        this.happiness = Math.max(0, this.happiness - 0.001);
    }

    draw() {
        ctx.save();
        
        // Se sprites carregadas, usar sprites individuais
        const config = SPRITE_CONFIG[this.spriteKey];
        const sprites = SPRITES[this.spriteKey];
        const frameIdx = Math.min(this.frameIndex, sprites.length - 1);
        
        if (spritesLoaded && sprites[frameIdx] && sprites[frameIdx].complete) {
            const sprite = sprites[frameIdx];
            
            // Tamanho de exibição
            const drawWidth = config.frameSize.w * config.scale;
            const drawHeight = config.frameSize.h * config.scale;
            
            ctx.save();
            // Posicionar com os pés no balcão
            ctx.translate(this.x, this.y - drawHeight + 15);
            ctx.scale(-1, 1); // Espelhar horizontalmente (vem da direita)
            
            // Desenhar sprite (já tem fundo transparente)
            ctx.drawImage(
                sprite,
                0, 0,
                sprite.width, sprite.height,
                -drawWidth / 2, 0,
                drawWidth, drawHeight
            );
            
            ctx.restore();
            
            // Barra de felicidade acima do sprite
            const barY = this.y - drawHeight;
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(this.x - 25, barY, 50, 6);
            ctx.fillStyle = this.happiness > 0.5 ? '#4caf50' : '#f44336';
            ctx.fillRect(this.x - 25, barY, 50 * this.happiness, 6);
            
            // Indicadores especiais
            if (this.type === 'vip') {
                // Coroa dourada
                ctx.font = '16px serif';
                ctx.fillText('👑', this.x - 8, barY - 5);
            } else if (this.type === 'rush') {
                // Símbolo de pressa
                ctx.font = '16px serif';
                ctx.fillText('⚡', this.x + 35, barY + 20);
            } else if (this.type === 'drunk') {
                // Estrelinhas girando
                if (Math.floor(this.wobble * 10) % 2 === 0) {
                    ctx.font = '12px serif';
                    ctx.fillText('💫', this.x - 35, barY + 15);
                    ctx.fillText('💫', this.x + 35, barY + 10);
                }
            }
        } else {
            // Fallback: desenho original
            // Pernas pixeladas com animação de caminhada
            const legOffset = Math.sin(this.walkCycle * 3) * 4;
            ctx.fillStyle = '#424242';
            ctx.fillRect(this.x - 8, this.y + 8, 5, 14 + legOffset);
            ctx.fillRect(this.x + 3, this.y + 8, 5, 14 - legOffset);
            
            // Sapatos
            ctx.fillStyle = '#212121';
            ctx.fillRect(this.x - 10, this.y + 20 + legOffset, 7, 4);
            ctx.fillRect(this.x + 1, this.y + 20 - legOffset, 7, 4);
            
            // Túnica medieval colorida
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x - 12, this.y - 18, 24, 26);
            
            // Borda do corpo
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x - 12, this.y - 18, 24, 26);
            
            // Cinto de corda
            ctx.fillStyle = '#8d6e63';
            ctx.fillRect(this.x - 12, this.y + 2, 24, 3);
            
            // Detalhe do cinto
            ctx.fillStyle = '#ffd54f';
            ctx.fillRect(this.x - 2, this.y + 1, 4, 4);
            
            // Braços pixelados
            const armSwing = Math.sin(this.walkCycle * 3) * 6;
            ctx.fillStyle = '#ffb74d';
            ctx.fillRect(this.x - 18, this.y - 10 + armSwing, 5, 14);
            ctx.fillRect(this.x + 13, this.y - 10 - armSwing, 5, 14);
            
            // Cabeça pixelada
            ctx.fillStyle = '#ffb74d';
            ctx.fillRect(this.x - 10, this.y - 38, 20, 20);
            
            // Olhos pixelados grandes
            ctx.fillStyle = '#fff';
            ctx.fillRect(this.x - 8, this.y - 34, 5, 5);
            ctx.fillRect(this.x + 3, this.y - 34, 5, 5);
            
            // Pupilas
            ctx.fillStyle = '#000';
            ctx.fillRect(this.x - 7, this.y - 33, 2, 2);
            ctx.fillRect(this.x + 4, this.y - 33, 2, 2);
            
            // Expressão baseada na felicidade
            ctx.fillStyle = '#000';
            if (this.happiness > 0.7) {
                ctx.fillRect(this.x - 6, this.y - 24, 3, 2);
                ctx.fillRect(this.x, this.y - 24, 3, 2);
                ctx.fillRect(this.x + 3, this.y - 24, 3, 2);
            } else if (this.happiness > 0.4) {
                ctx.fillRect(this.x - 6, this.y - 24, 12, 2);
            } else {
                ctx.fillRect(this.x - 6, this.y - 22, 12, 2);
            }
            
            // Cabelo/Chapéu medieval baseado no estilo
            if (this.hatStyle === 0) {
                // Capuz de camponês
                ctx.fillStyle = '#795548';
                ctx.fillRect(this.x - 12, this.y - 42, 24, 6);
                ctx.fillRect(this.x - 10, this.y - 46, 20, 4);
            } else if (this.hatStyle === 1) {
                // Chapéu pontudo de aldeão
                ctx.fillStyle = '#6d4c41';
                ctx.fillRect(this.x - 8, this.y - 48, 16, 4);
                ctx.fillRect(this.x - 6, this.y - 52, 12, 4);
                ctx.fillRect(this.x - 4, this.y - 56, 8, 4);
            } else {
                // Boina medieval
                ctx.fillStyle = '#4e342e';
                ctx.fillRect(this.x - 12, this.y - 44, 24, 6);
                ctx.fillRect(this.x - 8, this.y - 48, 16, 4);
            }
            
            // Barra de felicidade
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(this.x - 15, this.y - 52, 30, 4);
            ctx.fillStyle = this.happiness > 0.5 ? '#4caf50' : '#f44336';
            ctx.fillRect(this.x - 15, this.y - 52, 30 * this.happiness, 4);
            
            // Indicadores especiais
            if (this.type === 'vip') {
                // Coroa dourada
                ctx.fillStyle = '#ffd700';
                ctx.fillRect(this.x - 8, this.y - 60, 4, 4);
                ctx.fillRect(this.x - 2, this.y - 62, 4, 4);
                ctx.fillRect(this.x + 4, this.y - 60, 4, 4);
            } else if (this.type === 'rush') {
                // Símbolo de pressa
                ctx.fillStyle = '#ff1744';
                ctx.fillRect(this.x + 12, this.y - 40, 6, 2);
                ctx.fillRect(this.x + 14, this.y - 38, 6, 2);
                ctx.fillRect(this.x + 16, this.y - 36, 6, 2);
            } else if (this.type === 'drunk') {
                // Estrelinhas girando
                if (Math.floor(this.wobble * 10) % 2 === 0) {
                    ctx.fillStyle = '#ffeb3b';
                    ctx.fillRect(this.x - 18, this.y - 44, 3, 3);
                    ctx.fillRect(this.x + 15, this.y - 40, 3, 3);
                }
            }
        }
        
        ctx.restore();
    }
}

class Drink {
    constructor(x, y, barIndex) {
        this.x = x;
        this.y = y;
        this.barIndex = barIndex;
        this.width = 20;
        this.height = 30;
        this.speed = 3;
    }
    
    update() {
        const eventFactor = activeEvent?.id === 'chaos' ? 1.5 : 1;
        this.x += this.speed * gameSpeed * eventFactor;
    }

    draw() {
        // Sombra pixelada
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x - 6, this.y + 18, 12, 2);
        
        // Caneca medieval de madeira
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(this.x - 8, this.y - 12, 16, 24);
        
        // Borda da caneca
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - 8, this.y - 12, 16, 24);
        
        // Aro de metal no topo
        ctx.fillStyle = '#9e9e9e';
        ctx.fillRect(this.x - 8, this.y - 12, 16, 2);
        
        // Aro de metal no meio
        ctx.fillRect(this.x - 8, this.y + 2, 16, 2);
        
        // Alça da caneca
        ctx.strokeStyle = '#8d6e63';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x + 8, this.y - 8);
        ctx.lineTo(this.x + 12, this.y - 4);
        ctx.lineTo(this.x + 12, this.y + 4);
        ctx.lineTo(this.x + 8, this.y + 8);
        ctx.stroke();
        
        // Cerveja/hidromel
        ctx.fillStyle = '#ff8f00';
        ctx.fillRect(this.x - 6, this.y - 6, 12, 16);
        
        // Espuma pixelada
        ctx.fillStyle = '#fffde7';
        ctx.fillRect(this.x - 6, this.y - 10, 12, 4);
        
        // Bolhas na espuma (pixels)
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x - 4, this.y - 9, 2, 2);
        ctx.fillRect(this.x, this.y - 10, 2, 2);
        ctx.fillRect(this.x + 3, this.y - 9, 2, 2);
    }
}

class EmptyGlass {
    constructor(x, y, barIndex) {
        this.x = x;
        this.y = y;
        this.barIndex = barIndex;
        this.width = 16;
        this.height = 24;
        this.speed = 2;
    }
    
    update() {
        // Magnetismo de canecas
        if (hasPower('magnetGlass')) {
            const dx = bartender.x - this.x;
            const dy = bartender.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150 && Math.abs(dy) < 30) {
                this.x += (dx / dist) * 2;
                return;
            }
        }
        
        const eventFactor = activeEvent?.id === 'chaos' ? 1.5 : 1;
        this.x -= this.speed * gameSpeed * eventFactor;
    }

    draw() {
        // Sombra pixelada
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x - 5, this.y + 16, 10, 2);
        
        // Caneca vazia medieval
        ctx.fillStyle = 'rgba(141, 110, 99, 0.5)';
        ctx.fillRect(this.x - 6, this.y - 10, 12, 20);
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - 6, this.y - 10, 12, 20);
        
        // Aro de metal
        ctx.fillStyle = '#757575';
        ctx.fillRect(this.x - 6, this.y - 10, 12, 2);
        
        // Alça
        ctx.strokeStyle = '#8d6e63';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x + 6, this.y - 6);
        ctx.lineTo(this.x + 9, this.y);
        ctx.lineTo(this.x + 6, this.y + 6);
        ctx.stroke();
    }
}

// Entidades do jogo
let bartender = new Bartender(1);
let customers = [];
let drinks = [];
let emptyGlasses = [];

// Funções auxiliares de poderes
function hasPower(powerId) {
    return activePowers.some(p => p.id === powerId);
}

function removePower(powerId) {
    activePowers = activePowers.filter(p => p.id !== powerId);
}

function addPower(power) {
    // Efeitos imediatos
    if (power.id === 'extraLife') {
        lives++;
        updateLives();
        return;
    }
    
    // Adicionar poder ativo
    const existingIndex = activePowers.findIndex(p => p.id === power.id);
    if (existingIndex >= 0) {
        // Renovar duração se já existe
        if (power.duration > 0) {
            activePowers[existingIndex].timeLeft = power.duration;
        }
    } else {
        activePowers.push({
            ...power,
            timeLeft: power.duration
        });
    }
}

function updatePowers() {
    for (let i = activePowers.length - 1; i >= 0; i--) {
        const power = activePowers[i];
        if (power.timeLeft > 0) {
            power.timeLeft--;
            if (power.timeLeft <= 0) {
                activePowers.splice(i, 1);
                levelUpAnimation = 60;
                levelUpMessage = `${power.name} expirou!`;
            }
        }
    }
}

function showPowerSelection() {
    gameState = 'powerSelect';
    
    // Selecionar 3 poderes aleatórios
    powerOptions = [];
    const availablePowers = [...POWERS];
    for (let i = 0; i < 3 && availablePowers.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * availablePowers.length);
        powerOptions.push(availablePowers[randomIndex]);
        availablePowers.splice(randomIndex, 1);
    }
    selectedPowerIndex = 0;
}

function selectPower(index) {
    if (index >= 0 && index < powerOptions.length) {
        addPower(powerOptions[index]);
        powerOptions = [];
        gameState = 'playing';
        playSound('hit');
    }
}

// Funções de desenho
function drawBackground() {
    // Se a imagem da taberna foi carregada, usar como fundo
    if (spritesLoaded && tabernaImg.complete) {
        // Desenhar a imagem da taberna escalada para o canvas
        ctx.drawImage(tabernaImg, 0, 0, canvas.width, canvas.height);
    } else {
        // Fallback: fundo de pedra medieval
        ctx.fillStyle = '#616161';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Padrão de pedras da parede
        ctx.fillStyle = '#757575';
        for (let y = 0; y < canvas.height; y += 20) {
            for (let x = (y % 40 === 0 ? 0 : 20); x < canvas.width; x += 40) {
                ctx.fillRect(x, y, 38, 18);
            }
        }
        
        // Linhas entre as pedras
        ctx.strokeStyle = '#424242';
        ctx.lineWidth = 2;
        for (let y = 0; y < canvas.height; y += 20) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        for (let x = 0; x < canvas.width; x += 40) {
            for (let y = 0; y < canvas.height; y += 40) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x, y + 20);
                ctx.stroke();
            }
        }
        
        // Desenhar os balcões de madeira
        for (let i = 0; i < NUM_BARS; i++) {
            const y = i * BAR_HEIGHT + BAR_HEIGHT / 2;
            
            // Balcão principal
            ctx.fillStyle = '#8d6e63';
            ctx.fillRect(0, y - 5, canvas.width, 10);
            
            // Separadores
            ctx.fillStyle = '#000';
            ctx.fillRect(0, y - 6, canvas.width, 2);
            ctx.fillRect(0, y + 4, canvas.width, 2);
            
            // Textura de madeira
            ctx.strokeStyle = '#6d4c41';
            ctx.lineWidth = 1;
            for (let x = 0; x < canvas.width; x += 40) {
                ctx.beginPath();
                ctx.moveTo(x, y - 5);
                ctx.lineTo(x, y + 5);
                ctx.stroke();
            }
        }
        
        // Desenhar prateleiras medievais no fundo
        for (let i = 0; i < NUM_BARS; i++) {
            const y = i * BAR_HEIGHT;
            
            // Prateleira de madeira rústica
            ctx.fillStyle = '#4e342e';
            ctx.fillRect(canvas.width - 140, y + 15, 130, BAR_HEIGHT - 30);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.strokeRect(canvas.width - 140, y + 15, 130, BAR_HEIGHT - 30);
            
            // Textura de madeira
            ctx.strokeStyle = '#3e2723';
            ctx.lineWidth = 1;
            for (let k = 0; k < 5; k++) {
                ctx.beginPath();
                ctx.moveTo(canvas.width - 140, y + 20 + k * 10);
                ctx.lineTo(canvas.width - 10, y + 20 + k * 10);
                ctx.stroke();
            }
            
            // Barris e jarros medievais
            for (let j = 0; j < 3; j++) {
                const itemX = canvas.width - 115 + j * 40;
                const itemY = y + BAR_HEIGHT / 2;
                
                if (j % 2 === 0) {
                    // Barril
                    ctx.fillStyle = '#6d4c41';
                    ctx.fillRect(itemX - 8, itemY - 16, 16, 20);
                    // Aros de metal
                    ctx.fillStyle = '#616161';
                    ctx.fillRect(itemX - 8, itemY - 14, 16, 2);
                    ctx.fillRect(itemX - 8, itemY - 2, 16, 2);
                } else {
                    // Jarro de cerâmica
                    ctx.fillStyle = '#8d6e63';
                    ctx.fillRect(itemX - 5, itemY - 18, 10, 20);
                    ctx.fillRect(itemX - 3, itemY - 20, 6, 2);
                    // Alça
                    ctx.strokeStyle = '#8d6e63';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(itemX + 5, itemY - 10, 4, -Math.PI/2, Math.PI/2);
                    ctx.stroke();
                }
            }
        }
    }
}

// Funções do jogo
function serveDrink() {
    if (gameState !== 'playing') return;
    
    drinks.push(new Drink(bartender.x, bartender.y, bartender.barIndex));
    
    // Ativar animação de servir
    bartender.triggerServeAnimation();
    
    // Multi-serve power
    if (hasPower('multiServe')) {
        setTimeout(() => {
            drinks.push(new Drink(bartender.x, bartender.y, bartender.barIndex));
        }, 150);
    }
    
    playSound('serve');
}

function catchGlass() {
    const catchRange = hasPower('autoCollect') ? 60 : 30;
    
    for (let i = emptyGlasses.length - 1; i >= 0; i--) {
        const glass = emptyGlasses[i];
        
        if (Math.abs(glass.x - bartender.x) < catchRange &&
            Math.abs(glass.y - bartender.y) < 30) {
            emptyGlasses.splice(i, 1);
            const glassPoints = activeEvent?.id === 'happy' ? 150 : 50;
            score += glassPoints;
            playSound('hit');
            return true;
        }
    }
    return false;
}

function loseLife() {
    // Verificar escudo
    if (hasPower('shield')) {
        removePower('shield');
        playSound('hit');
        // Efeito visual de escudo quebrado
        levelUpAnimation = 60;
        levelUpMessage = 'ESCUDO PROTEGEU!';
        return;
    }
    
    lives--;
    updateLives();
    playSound('lose');
    
    // Resetar combo ao perder vida
    comboCount = 0;
    comboTimer = 0;
    comboMultiplier = 1;
    
    if (lives <= 0) {
        gameOver();
    }
}

function updateScore() {
    document.getElementById('score').textContent = score;
    
    // Aumentar nível a cada 1000 pontos
    const newLevel = Math.floor(score / 1000) + 1;
    if (newLevel > level) {
        level = newLevel;
        gameSpeed = 1 + (level - 1) * 0.2; // Aumento mais agressivo
        spawnInterval = Math.max(40, 120 - (level - 1) * 15); // Diminui mais rápido
        updateLevel();
        playSound('hit');
        
        // Ativar animação de level up
        levelUpAnimation = 120;
        levelUpMessage = `NÍVEL ${level}!`;
        
        // Após animação, mostrar seleção de poderes
        setTimeout(() => {
            if (gameState === 'playing') {
                showPowerSelection();
            }
        }, 2000);
    }
}

function updateLevel() {
    document.getElementById('level').textContent = level;
}

function updateLives() {
    document.getElementById('lives').textContent = lives;
}

function update() {
    // Atualizar combo timer
    if (comboTimer > 0) {
        comboTimer--;
        if (comboTimer === 0) {
            comboCount = 0;
            comboMultiplier = 1;
        }
    }
    
    // Atualizar evento ativo
    if (activeEvent) {
        eventTimer--;
        if (eventTimer <= 0) {
            activeEvent = null;
            levelUpAnimation = 60;
            levelUpMessage = 'Evento terminou!';
        }
    }
    
    // Atualizar bartender
    bartender.update();
    
    // Tentar pegar copos vazios
    if (catchGlass()) {
        updateScore();
    }
    
    // Spawn de novos clientes
    spawnTimer++;
    const currentInterval = activeEvent?.id === 'rush' ? spawnInterval / 2 : spawnInterval;
    if (spawnTimer >= currentInterval) {
        spawnTimer = 0;
        const randomBar = Math.floor(Math.random() * NUM_BARS);
        customers.push(new Customer(randomBar));
    }
    
    // Chance de evento aleatório (baixa probabilidade quando não há evento ativo)
    if (!activeEvent && Math.random() < 0.0008 && level > 2) {
        const randomEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
        activeEvent = { ...randomEvent };
        eventTimer = randomEvent.duration;
        levelUpAnimation = 90;
        levelUpMessage = randomEvent.name;
        playSound('hit');
    }
    
    // Atualizar clientes
    for (let i = customers.length - 1; i >= 0; i--) {
        const customer = customers[i];
        customer.update();
        
        // Cliente chegou ao bartender
        if (customer.x < bartender.x + 20) {
            customers.splice(i, 1);
            loseLife();
        }
    }
    
    // Atualizar e verificar colisões com bebidas
    for (let i = drinks.length - 1; i >= 0; i--) {
        const drink = drinks[i];
        drink.update();
        
        // Verificar colisão com clientes
        for (let j = customers.length - 1; j >= 0; j--) {
            const customer = customers[j];
            if (Math.abs(drink.x - customer.x) < 30 && 
                Math.abs(drink.y - customer.y) < 30) {
                // Cliente servido com sucesso
                const customerType = customer.type;
                const customerMultiplier = customer.pointsMultiplier;
                customers.splice(j, 1);
                drinks.splice(i, 1);
                
                // Calcular pontos com todos os multiplicadores
                let basePoints = 100;
                if (hasPower('goldRush')) basePoints *= 2;
                if (activeEvent?.id === 'happy') basePoints *= 3;
                basePoints *= customerMultiplier;
                basePoints *= comboMultiplier;
                
                score += Math.floor(basePoints);
                
                // Incrementar combo
                comboCount++;
                comboTimer = COMBO_TIMEOUT;
                comboMultiplier = 1 + (Math.min(comboCount, 10) * 0.1); // Max 2x no combo 10
                
                updateScore();
                playSound('hit');
                
                // Feedback visual de combo
                if (comboCount > 2) {
                    levelUpAnimation = 30;
                    levelUpMessage = `COMBO x${comboCount}!`;
                }
                break;
            }
        }
        
        // Bebida saiu da tela
        if (drink.x > canvas.width) {
            drinks.splice(i, 1);
            loseLife();
        }
    }
    
    // Atualizar copos vazios
    for (let i = emptyGlasses.length - 1; i >= 0; i--) {
        const glass = emptyGlasses[i];
        glass.update();
        
        // Copo saiu da tela
        if (glass.x < -20) {
            emptyGlasses.splice(i, 1);
            loseLife();
        }
    }
}

function draw() {
    drawBackground();
    
    // Desenhar entidades
    customers.forEach(c => c.draw());
    drinks.forEach(d => d.draw());
    emptyGlasses.forEach(g => g.draw());
    
    // Desenhar bartender por último (na frente)
    bartender.draw();
    
    // Desenhar animação de level up
    if (levelUpAnimation > 0) {
        levelUpAnimation--;
        
        // Fundo semi-transparente
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Caixa de pergaminho medieval
        const boxWidth = 300;
        const boxHeight = 120;
        const boxX = canvas.width / 2 - boxWidth / 2;
        const boxY = canvas.height / 2 - boxHeight / 2;
        
        // Pergaminho
        ctx.fillStyle = '#d7ccc8';
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        
        // Borda do pergaminho
        ctx.strokeStyle = '#6d4c41';
        ctx.lineWidth = 4;
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        
        // Detalhes decorativos
        ctx.strokeStyle = '#8d6e63';
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX + 8, boxY + 8, boxWidth - 16, boxHeight - 16);
        
        // Texto de level up
        const scale = levelUpAnimation > 90 ? 1 + (120 - levelUpAnimation) / 60 : 1;
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(scale, scale);
        
        // Texto principal
        ctx.fillStyle = '#d32f2f';
        ctx.font = 'bold 48px serif';
        ctx.textAlign = 'center';
        ctx.fillText(levelUpMessage, 0, -10);
        
        // Subtexto
        if (levelUpMessage.includes('NÍVEL')) {
            ctx.fillStyle = '#4e342e';
            ctx.font = 'bold 20px serif';
            ctx.fillText('A taberna está mais movimentada!', 0, 25);
        }
        
        ctx.restore();
        
        // Estrelas douradas ao redor
        if (levelUpAnimation % 10 < 5 && levelUpMessage.includes('NÍVEL')) {
            ctx.fillStyle = '#ffd54f';
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2 + levelUpAnimation / 20;
                const x = canvas.width / 2 + Math.cos(angle) * 180;
                const y = canvas.height / 2 + Math.sin(angle) * 100;
                ctx.fillRect(x - 4, y - 4, 8, 8);
            }
        }
    }
    
    // Indicador de combo
    if (gameState === 'playing' && comboCount > 1) {
        const comboX = canvas.width / 2;
        const comboY = 60;
        
        ctx.save();
        ctx.textAlign = 'center';
        
        // Fundo do combo
        const comboWidth = 150;
        const comboHeight = 50;
        ctx.fillStyle = 'rgba(255, 87, 34, 0.9)';
        ctx.fillRect(comboX - comboWidth/2, comboY - comboHeight/2, comboWidth, comboHeight);
        
        ctx.strokeStyle = '#ffd54f';
        ctx.lineWidth = 3;
        ctx.strokeRect(comboX - comboWidth/2, comboY - comboHeight/2, comboWidth, comboHeight);
        
        // Texto do combo
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 28px serif';
        ctx.fillText(`COMBO x${comboCount}`, comboX, comboY - 5);
        
        ctx.font = '14px serif';
        ctx.fillStyle = '#ffeb3b';
        ctx.fillText(`${comboMultiplier.toFixed(1)}x Pontos`, comboX, comboY + 15);
        
        // Barra de tempo do combo
        const timeBarWidth = (comboTimer / COMBO_TIMEOUT) * (comboWidth - 10);
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(comboX - comboWidth/2 + 5, comboY + comboHeight/2 - 8, timeBarWidth, 3);
        
        ctx.restore();
    }
    
    // Indicador de evento ativo
    if (gameState === 'playing' && activeEvent) {
        const eventX = canvas.width / 2;
        const eventY = 120;
        
        ctx.save();
        ctx.textAlign = 'center';
        
        const eventWidth = 250;
        const eventHeight = 60;
        ctx.fillStyle = 'rgba(103, 58, 183, 0.9)';
        ctx.fillRect(eventX - eventWidth/2, eventY - eventHeight/2, eventWidth, eventHeight);
        
        ctx.strokeStyle = '#7c4dff';
        ctx.lineWidth = 3;
        ctx.strokeRect(eventX - eventWidth/2, eventY - eventHeight/2, eventWidth, eventHeight);
        
        // Ícone e nome do evento
        ctx.font = 'bold 24px serif';
        ctx.fillStyle = '#fff';
        ctx.fillText(`${activeEvent.icon} ${activeEvent.name}`, eventX, eventY - 8);
        
        ctx.font = '14px serif';
        ctx.fillStyle = '#e1bee7';
        ctx.fillText(activeEvent.desc, eventX, eventY + 10);
        
        // Barra de tempo do evento
        const eventTimeWidth = (eventTimer / activeEvent.duration) * (eventWidth - 10);
        ctx.fillStyle = '#ff4081';
        ctx.fillRect(eventX - eventWidth/2 + 5, eventY + eventHeight/2 - 8, eventTimeWidth, 4);
        
        ctx.restore();
    }
    
    // UI de seleção de poderes
    if (gameState === 'powerSelect') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Título
        ctx.fillStyle = '#ffd54f';
        ctx.font = 'bold 36px serif';
        ctx.textAlign = 'center';
        ctx.fillText('ESCOLHA SEU PODER!', canvas.width / 2, 80);
        
        // Desenhar opções de poderes
        const cardWidth = 200;
        const cardHeight = 280;
        const spacing = 40;
        const startX = (canvas.width - (cardWidth * 3 + spacing * 2)) / 2;
        
        for (let i = 0; i < powerOptions.length; i++) {
            const power = powerOptions[i];
            const x = startX + i * (cardWidth + spacing);
            const y = 150;
            const isSelected = i === selectedPowerIndex;
            
            // Pergaminho/carta
            ctx.fillStyle = isSelected ? '#fff9c4' : '#d7ccc8';
            ctx.fillRect(x, y, cardWidth, cardHeight);
            
            // Borda
            ctx.strokeStyle = isSelected ? '#ffd54f' : '#6d4c41';
            ctx.lineWidth = isSelected ? 6 : 4;
            ctx.strokeRect(x, y, cardWidth, cardHeight);
            
            // Borda interna decorativa
            ctx.strokeStyle = '#8d6e63';
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 8, y + 8, cardWidth - 16, cardHeight - 16);
            
            // Ícone (emoji grande)
            ctx.font = 'bold 60px serif';
            ctx.fillStyle = '#000';
            ctx.fillText(power.icon, x + cardWidth / 2, y + 90);
            
            // Nome
            ctx.font = 'bold 20px serif';
            ctx.fillStyle = '#4e342e';
            ctx.fillText(power.name, x + cardWidth / 2, y + 140);
            
            // Descrição
            ctx.font = '14px serif';
            ctx.fillStyle = '#5d4037';
            const words = power.desc.split(' ');
            let line = '';
            let lineY = y + 170;
            for (let word of words) {
                const testLine = line + word + ' ';
                const metrics = ctx.measureText(testLine);
                if (metrics.width > cardWidth - 30 && line !== '') {
                    ctx.fillText(line, x + cardWidth / 2, lineY);
                    line = word + ' ';
                    lineY += 18;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, x + cardWidth / 2, lineY);
            
            // Número da tecla
            ctx.font = 'bold 24px serif';
            ctx.fillStyle = isSelected ? '#d32f2f' : '#6d4c41';
            ctx.fillText(`[${i + 1}]`, x + cardWidth / 2, y + cardHeight - 20);
        }
        
        // Instruções
        ctx.font = '18px serif';
        ctx.fillStyle = '#fff';
        ctx.fillText('Use ← → ou A/D para escolher | Enter ou Espaço para confirmar | Teclas 1-3', canvas.width / 2, canvas.height - 40);
        
        ctx.textAlign = 'left';
    }
    
    // Indicadores de poderes ativos
    if (gameState === 'playing' && activePowers.length > 0) {
        let offsetY = 10;
        for (let power of activePowers) {
            const boxWidth = 180;
            const boxHeight = 30;
            
            // Fundo
            ctx.fillStyle = 'rgba(255, 213, 79, 0.9)';
            ctx.fillRect(10, offsetY, boxWidth, boxHeight);
            
            ctx.strokeStyle = '#6d4c41';
            ctx.lineWidth = 2;
            ctx.strokeRect(10, offsetY, boxWidth, boxHeight);
            
            // Ícone e nome
            ctx.font = '18px serif';
            ctx.fillStyle = '#000';
            ctx.textAlign = 'left';
            ctx.fillText(`${power.icon} ${power.name}`, 15, offsetY + 20);
            
            // Barra de tempo se aplicável
            if (power.timeLeft > 0) {
                const timeWidth = (power.timeLeft / power.duration) * (boxWidth - 10);
                ctx.fillStyle = '#4caf50';
                ctx.fillRect(15, offsetY + 24, timeWidth, 3);
            }
            
            offsetY += boxHeight + 5;
        }
    }
    
    // Desenhar pausa
    if (gameState === 'paused') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#d7ccc8';
        ctx.font = 'bold 48px serif';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText('PAUSADO', canvas.width / 2, canvas.height / 2);
        ctx.fillText('PAUSADO', canvas.width / 2, canvas.height / 2);
        ctx.textAlign = 'left';
    }
}

function gameLoop() {
    if (gameState === 'playing') {
        update();
        updatePowers();
    }
    draw();
    requestAnimationFrame(gameLoop);
}

// Sons do jogo (usando Web Audio API)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
        case 'serve':
            oscillator.frequency.value = 300;
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
        case 'hit':
            oscillator.frequency.value = 500;
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.15);
            break;
        case 'lose':
            oscillator.frequency.value = 150;
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
    }
}

// Controles do teclado
document.addEventListener('keydown', (e) => {
    // Seleção de poderes
    if (gameState === 'powerSelect') {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            selectedPowerIndex = Math.max(0, selectedPowerIndex - 1);
            playSound('hit');
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            selectedPowerIndex = Math.min(powerOptions.length - 1, selectedPowerIndex + 1);
            playSound('hit');
        } else if (e.key === 'Enter' || e.key === ' ') {
            selectPower(selectedPowerIndex);
        } else if (e.key >= '1' && e.key <= '3') {
            selectPower(parseInt(e.key) - 1);
        }
        return;
    }
    
    if (e.key === 'p' || e.key === 'P') {
        if (gameState === 'playing') {
            gameState = 'paused';
        } else if (gameState === 'paused') {
            gameState = 'playing';
        }
    }
    
    if (gameState !== 'playing') return;
    
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        bartender.moveUp();
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        bartender.moveDown();
    } else if (e.key === ' ') {
        serveDrink();
    }
});

function startGame() {
    gameState = 'playing';
    score = 0;
    level = 1;
    lives = 3;
    gameSpeed = 1;
    spawnTimer = 0;
    spawnInterval = 120;
    activePowers = [];
    comboCount = 0;
    comboTimer = 0;
    comboMultiplier = 1;
    activeEvent = null;
    eventTimer = 0;
    
    bartender = new Bartender(1);
    customers = [];
    drinks = [];
    emptyGlasses = [];
    
    updateScore();
    updateLevel();
    updateLives();
    
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';
}

function gameOver() {
    gameState = 'gameover';
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOverScreen').style.display = 'flex';
}

// Event listeners dos botões
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);

// Iniciar o loop do jogo
gameLoop();
