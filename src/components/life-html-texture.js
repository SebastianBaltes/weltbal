class Widths {
    constructor() {
        this.top = 0;
        this.right = 0;
        this.bottom = 0;
        this.left = 0;
    }
}

function ps(s) {
    if (s==null) {
        return null;
    }
    const f = parseFloat(s);
    const unit = s.split(/[ 0-9.+-]+/)[1] || 'px';
    return {f,unit};
}

class Box {

    constructor(el) {
        this.el = el;
        this.children = [];
        this.style = getComputedStyle(this.el);
        this.position = { x: null, y: null };
        this.dimensions = { width: null, height: null };
        this.margin = new Widths();
        this.border = new Widths();
        this.padding = new Widths();
    }

    layout(ctx) {
        this.dimensions.width = ps(this.style.width);
        this.dimensions.height = ps(this.style.fontSize);
        let y = 0;
        this.children.forEach(c=>{
            c.position.y = y;
            c.layout(ctx);
            y+=c.dimensions.height;
        });
    }

    draw(ctx) {
        this.children.forEach(c=>c.draw(ctx));
    }

    findElementUnder(point) {
    }

}

class Div extends Box {
    constructor(el) {
        super(el);
    }
}

class Span extends Box {
    constructor(el) {
        super(el);
    }
}

class Text {

    constructor(el,style,words) {
        this.el = el;
        this.style = style;
        this.position = { x: null, y: null };
        this.dimensions = { width: null, height: null };
        this.children = words.map(w=>new Word(el,w));
    }

    layout(ctx) {
        // ctx.font = this.style.font;
        ctx.font = '48px serif';
        ctx.fillStyle = 'white';

        const space = ctx.measureText(' ');
        let x = this.position.x;
        let y = this.position.y + (space.height || 40);

        this.children.forEach(w=>{
            w.layout(ctx);
            w.position.x = x;
            w.position.y = y;
            x+=w.dimensions.width + space.width;
        });
    }

    draw(ctx) {
        // ctx.font = this.style.font;
        ctx.font = '48px serif';
        ctx.fillStyle = 'white';

        this.children.forEach(c=>c.draw(ctx));
    }

}

class Word {

    constructor(el,string) {
        this.position = { x: null, y: null };
        this.dimensions = { width: null, height: null };
        this.string = string;
    }

    layout(ctx) {
        this.dimensions = ctx.measureText(this.string);
    }

    draw(ctx) {
        ctx.fillText(this.string,this.position.x,this.position.y);
    }

}

class Image extends Box {
    constructor(el) {
        super(el);
    }
}

class Anchor extends Box {
    constructor(el) {
        super(el);
    }
}

class Table extends Box {
    constructor(el) {
        super(el);
    }
}

class Tr extends Box {
    constructor(el) {
        super(el);
    }
}

class Td extends Box {
    constructor(el) {
        super(el);
    }
}

class Th extends Td {
    constructor(el) {
        super(el);
    }
}

const dom2box = {
    'DIV': Box,
    'TABLE': Table,
    'TR': Tr,
    'TD': Td,
    'TH': Th,
};

AFRAME.registerComponent('life-html-texture', {

    schema: {
        source: {type: 'selector'},
        width: {type: 'number'},
        height: {type: 'number'},
    },

    init() {
        const data = this.data;
        this.source = data.source;
        this.size = new THREE.Vector2(data.width, data.height);
        this.dirty = true;

        this.checkTextureSize();
        this.initCanvas();
        this.initTexture();
        this.initMaterials();
        this.initMutationObserver();
        this.initEventListeners();

    },

    tick() {
        if (this.dirty) {
            this.dirty = false;
            this.parseHtmlAndDrawCanvas();
        }
    },

    checkTextureSize() {
        const power2 = x => x > 0 && THREE.Math.isPowerOfTwo(x);
        if (!power2(this.size.x) || !power2(this.size.y)) {
            throw `source pixel size must be power of two but is ${this.size.x} x ${this.size.y}`;
        }
    },

    initCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.size.x;
        this.canvas.height = this.size.y;
    },

    initTexture() {
        this.texture = new THREE.Texture(this.canvas);
        this.texture.anisotropy = 4;
        this.texture.needsUpdate = true;
    },

    initMaterials() {
        this.material = new THREE.MeshBasicMaterial({map: this.texture, side: THREE.DoubleSide, transparent: true});
        this.el.object3D.traverse(o => {
            if (o.material) {
                o.material = this.material;
                o.material.needsUpdate = true;
            }
        });
    },

    initEventListeners() {
        this.el.addEventListener('click', e => {
            const uv = e.detail.intersection.uv.clone();
            uv.y = 1 - uv.y;
            const point = uv.multiply(this.size).floor();
            const elementUnderMouse = this.getElementFromPoint(point);
            AFRAME.log(point.x + ' ' + point.y + ' ' + elementUnderMouse);
            if (elementUnderMouse) {
                elementUnderMouse.dispatchEvent(new MouseEvent('click', {
                    'view': window,
                    'bubbles': true,
                    'cancelable': true,
                    'screenX': point.x,
                    'screenY': point.y
                }));
            }
        });
    },

    initMutationObserver() {
        this.observer = new MutationObserver((mutations) => {
            this.dirty = true;
        });
        this.observer.observe(this.source, {attributes: true, childList: true, characterData: true, subtree: true });
    },

    getElementFromPoint(point) {
        if (!this.layout) {
            return null;
        }
        return this.layout.findElementUnder(point);
    },

    parseHtmlAndDrawCanvas() {
        const source = this.source;
        this.layout = this.travelDomAndAssignBoxClasses(null,source);

        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.size.x, this.size.y);

        this.layout.layout(ctx);
        this.layout.draw(ctx);
        console.log(this.layout);

        this.texture.needsUpdate = true;
    },

    travelDomAndAssignBoxClasses(parent,node) {
        if (!node) {
            return;
        }
        if (node.nodeName=='#text') {
            const words = (node.textContent||'').split(/\s+/g).filter(s=>s.length>0);
            if (words.length>0) {
                let text = new Text(node,parent.style,words);
                console.log(text);
                parent.children.push(text);
            }

        } else {
            let boxClass = dom2box[node.nodeName];
            if (boxClass==null && node instanceof Element) {
                boxClass = dom2box.DIV;
            }
            if (boxClass==null) {
                return;
            }
            const box = new boxClass(node);
            console.log(box);
            if (parent) {
                parent.children.push(box);
            }
            for (let child of node.childNodes) {
                this.travelDomAndAssignBoxClasses(box,child);
            }
            return box;
        }
    },

});
