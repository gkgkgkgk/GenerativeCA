const decideFate = (map, x, y, z) => {
    getNeighbors(x, y, z)

    let a = 'a';
    if (neighbors['0,1,0'] != undefined) {
        a = neighbors['0,1,0'].type;
    }

    let b = 'a';
    if (neighbors['0,-1,0'] != undefined) {
        b = neighbors['0,-1,0'].type;
    }

    let s = [];

    if (neighbors['1,0,0'] != undefined) {
        s.push(neighbors['1,0,0'].type);
    }
    if (neighbors['0,0,1'] != undefined) {
        s.push(neighbors['0,0,1'].type);
    }
    if (neighbors['-1,0,0'] != undefined) {
        s.push(neighbors['-1,0,0'].type);
    }
    if (neighbors['0,0,-1'] != undefined) {
        s.push(neighbors['0,0,-1'].type);
    }
    if (neighbors['1,0,1'] != undefined) {
        s.push(neighbors['1,0,1'].type);
    }
    if (neighbors['1,0,-1'] != undefined) {
        s.push(neighbors['1,0,-1'].type);
    }
    if (neighbors['-1,0,1'] != undefined) {
        s.push(neighbors['-1,0,1'].type);
    }
    if (neighbors['-1,0,-1'] != undefined) {
        s.push(neighbors['-1,0,-1'].type);
    }

    let types = []

    if (map[x + ',' + y + ',' + z] == undefined) {

        if (b == 'w' || s.includes('f') || b == 'g') {
            if (b == 'g') {
                types.push({ item: 'w', weight: 0.25 })
            } else {
                types.push({ item: 'w', weight: 0.75 })
            }
        }

        if (b == 'w' || b == 'g') {
            if (b == 'w') {
                types.push({ item: 'g', weight: 0.05 });
            } else {
                types.push({ item: 'g', weight: 0.75 });
            }
        }
    }

    if (types.length > 0) {
        let type = weighted_random(types);
        tempMap[x + ',' + y + ',' + z] = { type: type, id: 0, drawn: false };
    }
}

const getNeighbors = (x, y, z) => {
    interpretation = [[], [], []]

    for (let dx = -1; dx < 2; dx++) {
        for (let dy = -1; dy < 2; dy++) {
            for (let dz = -1; dz < 2; dz++) {
                neighbors[dx + ',' + dy + ',' + dz] = map[(x + dx) + ',' + (y + dy) + ',' + (z + dz)];
            }
        }
    }
}

function weighted_random(options) {
    var i;

    var weights = [options[0].weight];

    for (i = 1; i < options.length; i++)
        weights[i] = options[i].weight + weights[i - 1];

    var random = Math.random() * weights[weights.length - 1];

    for (i = 0; i < weights.length; i++)
        if (weights[i] > random)
            break;

    return options[i].item;
}

function count(array, value) {
    let count = 0;
    array.forEach((v) => (v === value && count++));
    return count;
}

onmessage = function (event) {
    let map = event.data.map
    let gridSize = event.data.gridSize
    let tempMap = Object.assign({}, map);
    for (let x = -gridSize / 2; x < gridSize / 2; x++) {
        for (let y = -gridSize / 2; y < gridSize / 2; y++) {
            for (let z = -gridSize / 2; z < gridSize / 2; z++) {
                decideFate(map, x, y, z)
            }
        }
    }

    map = Object.assign({}, tempMap);
    postMessage(map);
}

// worker.js
export default function MyWorker() {
    // ...
}