/**
 * Parks images that nothing references into public/unused/ (structure mirrored,
 * so /iq-test/66.png and /driving-license/66.png can't collide), and puts them
 * back on demand. public/unused/manifest.json is the record of what moved.
 *
 *   node scripts/unused-images.js move     # reads unused-images.txt
 *   node scripts/unused-images.js restore  # reads the manifest
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const parked = path.join(root, "public/unused");
const manifestPath = path.join(parked, "manifest.json");

const move = (from, to) => {
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.renameSync(from, to);
};

// Drop directories that went empty, so restoring leaves no litter behind.
const prune = (dir) => {
    while (dir.startsWith(parked) && dir !== parked) {
        if (fs.readdirSync(dir).length) return;
        fs.rmdirSync(dir);
        dir = path.dirname(dir);
    }
};

const cmd = process.argv[2];

if (cmd === "move") {
    const list = fs
        .readFileSync(path.join(root, "unused-images.txt"), "utf8")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

    const files = [];
    const missing = [];
    for (const rel of list) {
        const from = path.join(root, rel);
        if (!fs.existsSync(from)) {
            missing.push(rel);
            continue;
        }
        const to = path.join(parked, rel.replace(/^public\//, ""));
        move(from, to);
        files.push({
            name: path.basename(rel),
            originalPath: rel,
            parkedPath: path.relative(root, to),
            url: rel.replace(/^public/, ""),
            bytes: fs.statSync(to).size,
        });
    }

    fs.writeFileSync(
        manifestPath,
        JSON.stringify({ movedAt: new Date().toISOString(), files }, null, 2),
    );
    console.log(`parked ${files.length} files -> public/unused/`);
    if (missing.length) console.log(`skipped (not found): ${missing.join(", ")}`);
} else if (cmd === "restore") {
    const { files } = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    let n = 0;
    for (const f of files) {
        const from = path.join(root, f.parkedPath);
        if (!fs.existsSync(from)) continue;
        move(from, path.join(root, f.originalPath));
        prune(path.dirname(from));
        n++;
    }
    fs.unlinkSync(manifestPath);
    prune(parked);
    if (fs.existsSync(parked) && !fs.readdirSync(parked).length) fs.rmdirSync(parked);
    console.log(`restored ${n} files`);
} else {
    console.error("usage: node scripts/unused-images.js move|restore");
    process.exit(1);
}
