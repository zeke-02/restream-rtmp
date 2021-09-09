const AWS = require('aws-sdk');

const lambda = new AWS.Lambda({region: 'us-east-1'});

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