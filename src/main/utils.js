const fs = require('fs').promises;
const path = require('path');

function buildTree(dir) {
    return new Promise((res, rej) => {
        buildTreeP(dir).then(tree => res(tree.Children));
    });
}

function buildTreeP(dir) {
    return new Promise((res, rej) => {
        fs.stat(dir).then(stats => {
            if (stats.isFile()) {
                res({
                    Name: path.basename(dir, '.md'),
                    Path: dir,
                    IsFile: true
                });
            } else if (stats.isDirectory()) {
                fs.readdir(dir).then(files => {
                    const children = files
                        .map(f => path.join(dir, f))
                        .map(f => buildTreeP(f));

                    Promise.all(children).then(resoloved => {
                        resoloved = resoloved.sort((left, right) => {
                            if (left.IsFile && !right.IsFile) {
                                return 1;
                            } else if (!left.IsFile && right.IsFile) {
                                return -1;
                            }

                            return left.Name > right.Name ? 1 : -1;
                        });

                        res({
                            Name: path.basename(dir),
                            Path: dir,
                            IsFile: false,
                            Children: resoloved
                        });
                    });
                });
            }
        });
    });
}

module.exports = {
    buildTree: buildTree
};