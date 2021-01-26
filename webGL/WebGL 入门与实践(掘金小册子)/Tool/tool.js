
function randomColor() {
    return {
        r: Math.random() * 255,
        g: Math.random() * 255,
        b: Math.random() * 255,
        a: Math.random() * 1
    };
}
//正方体 8 个顶点的坐标信息
let zeroX = 0.5;
let zeroY = 0.5;
let zeroZ = 0.5;
let positions = [
    [-zeroX, -zeroY, zeroZ],  //V0
    [zeroX, -zeroY, zeroZ],  //V1
    [zeroX, zeroY, zeroZ],   //V2
    [-zeroX, zeroY, zeroZ],  //V3
    [-zeroX, -zeroY, -zeroZ],//V4
    [-zeroX, zeroY, -zeroZ], //V5
    [zeroX, zeroY, -zeroZ],  //V6
    [zeroX, -zeroY, -zeroZ]  //V7
]
const CUBE_FACE_INDICES = [
    [0, 1, 2, 3], //前面
    [4, 5, 6, 7], //后面
    [0, 3, 5, 4], //左面
    [1, 7, 6, 2], //右面
    [3, 2, 6, 5], //上面
    [0, 4, 7, 1] // 下面
];
const FACE_COLORS = [
    [1, 0, 0, 1], // 前面，红色
    [0, 1, 0, 1], // 后面，绿色
    [0, 0, 1, 1], // 左面，蓝色
    [1, 1, 0, 1], // 右面，黄色
    [1, 0, 1, 1], // 上面，品色
    [0, 1, 1, 1]  // 下面，青色
]


function createCube(width, height, depth) {
    let zeroX = width / 2;
    let zeroY = height / 2;
    let zeroZ = depth / 2;

    let cornerPositions = [
        [-zeroX, -zeroY, -zeroZ],
        [zeroX, -zeroY, -zeroZ],
        [zeroX, zeroY, -zeroZ],
        [-zeroX, zeroY, -zeroZ],
        [-zeroX, -zeroY, zeroZ],
        [-zeroX, zeroY, zeroZ],
        [zeroX, zeroY, zeroZ],
        [zeroX, -zeroY, zeroZ]
    ];
    let colorInput = [
        [255, 0, 0, 1],
        [0, 255, 0, 1],
        [0, 0, 255, 1],
        [255, 255, 0, 1],
        [0, 255, 255, 1],
        [255, 0, 255, 1]
    ];

    let colors = [];
    let positions = [];
    var indices = [];

    for (let f = 0; f < 6; ++f) {
        let faceIndices = CUBE_FACE_INDICES[f];
        let color = colorInput[f];
        for (let v = 0; v < 4; ++v) {
            let position = cornerPositions[faceIndices[v]];
            positions = positions.concat(position);
            colors = colors.concat(color);
        }
        let offset = 4 * f;
        indices.push(offset + 0, offset + 1, offset + 2);
        indices.push(offset + 0, offset + 2, offset + 3);
    }
    indices = new Uint16Array(indices);
    positions = new Float32Array(positions);
    colors = new Float32Array(colors);
    return {
        positions: positions,
        indices: indices,
        colors: colors
    };
}