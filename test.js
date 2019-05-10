const fs = require('fs').promises;
const path = require('path');

buildTree(path.join(process.env.HOME, '.mdedit'))
    .then((tree) => console.log(JSON.stringify(tree, ' ', 2)));

function buildTree(dir) {
    return new Promise((res, rej) => {
        fs.readdir(dir)
            .then(files => Promise.all(files.map(f => path.join(dir, f)).map(buildTreeP)))
            .then(res);
    });
}

function buildTreeP(dir) {
    return new Promise((res, rej) => {
        fs.stat(dir).then(stats => {
            if (stats.isFile()) {
                res({
                    Name: path.basename(dir),
                    Path: dir
                });
            } else if (stats.isDirectory()) {
                fs.readdir(dir).then(files => {
                    const children = files
                        .map(f => path.join(dir, f))
                        .map(f => buildTreeP(f));

                    Promise.all(children).then(resoloved => {
                        res({
                            Name: path.basename(dir),
                            Path: dir,
                            Children: resoloved
                        });
                    });
                });
            }
        });
    });
}