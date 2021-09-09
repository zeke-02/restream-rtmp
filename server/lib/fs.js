const fs = require('fs');


let functions = Object.assign({},null);

functions.readdir = function () {
    return new Promise((resolve, reject)=>{
        fs.readdir(...arguments, (err, files)=> {
            if (err){
                reject(err);
            }
            resolve(files);
        })
    })
};

functions.writeFile = function () {
    return new Promise((resolve, reject)=>{
        fs.writeFile(...arguments, (err)=> {
            if (err){
                reject(err);
            }
            resolve();
        })
    })
};

functions.readFile = function () {
    return new Promise((resolve, reject)=>{
        fs.readFile(...arguments, (err,data)=> {
            if (err){
                reject(err);
            }
            resolve(data);
        })
    })
};


functions.createReadStream = function (){
    return fs.createReadStream(...arguments);
};

functions.rename = function () {
    return new Promise((resolve, reject)=>{
        fs.rename(...arguments, (err)=> {
            if (err){
                reject(err);
            }
            resolve();
        })
    })
};



functions.mkdir = function () {
    return new Promise((resolve, reject)=>{
        fs.mkdir(...arguments, (err)=> {
            if (err){
                reject(err);
            }
            resolve();
        })
    })
};

functions.unlink = function () {
    return new Promise((resolve, reject)=>{
        fs.unlink(...arguments, (err)=> {
            if (err){
                reject(err);
            }
            resolve();
        })
    })
};

functions.rmdirSync = function () {
    return fs.rmdirSync(...arguments);
}

functions.exists = (path) => {
    return new Promise((resolve)=>{
        fs.access(path, fs.constants.F_OK, (err)=>{
            resolve(!err);
        });
    })
}
const testing = async () => {
    let result = await functions.writeFile('./hello/hello.txt', 'hello_there');
}
//testing();
module.exports = functions;
