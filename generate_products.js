const fs = require('fs');

const data = JSON.parse(fs.readFileSync('parsed-data.json', 'utf-8'));

function sluggify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function generateDesc(p) {
    const priceText = p.priceMenudeo ? " con un excelente precio de menudeo de $" + p.priceMenudeo : "";
    let desc = "Descubre " + p.name + ", un producto destacado dentro de la categoria " + p.category + priceText + ". Ideal para tus necesidades y con la mayor calidad.";
    if (p.notes && p.notes.trim()) {
        desc += " " + p.notes + ".";
    }
    return desc;
}

const products = data.map((p, idx) => {
    return {
        id: sluggify(p.name) + '-' + idx,
        name: p.name,
        price: p.priceMenudeo || p.priceMayoreo || p.costMenudeo,
        category: p.category,
        img: "https://placehold.co/400x400/151515/FFF?text=" + encodeURIComponent(p.name),
        badge: p.notes && p.notes.toLowerCase().includes('promo') ? 'PROMO' : (p.notes && p.notes.toLowerCase().includes('best seller') ? 'TOP' : ''),
        desc: generateDesc(p)
    };
});

const jsString = "        const products = [\n" + products.map(p => {
    return "            { id: '" + p.id + "', name: '" + p.name + "', price: " + p.price + ", category: '" + p.category + "', img: '" + p.img + "', badge: '" + p.badge + "', desc: '" + p.desc + "' }";
}).join(',\n') + "\n        ];";

fs.writeFileSync('new_products.txt', jsString);
console.log('Done');
