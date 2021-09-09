const AWS = require('aws-sdk');

const lambda = new AWS.Lambda({region: 'us-east-1', secretAccessKey: '6GOyjeuAHgf7cYmlujtMWm8k5y2HxrV3lbRo1YeD', accessKeyId: 'AKIA4GZTQX2WB6R6KLEU'});

const invoke = async (params) => {return new Promise((resolve,reject)=> {
    lambda.invoke(params, function (err, data) {
        if (err){
            reject(err);
        }
        else{
            resolve(data);
        }
    });
}
)};

module.exports =  { invoke };