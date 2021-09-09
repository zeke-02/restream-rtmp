const AWS = require('aws-sdk');
const axios = require('axios');
const ecs = new AWS.ECS();

const cluster = 'video-streaming';
const containerPort = 8000;

const getTaskMetaData = async () => {
    const response = await axios.get(`${process.env.ECS_CONTAINER_METADATA_URI}/task`);
    return response.data;
}

const fetchIp = async (taskARN) => {
    const tasks = [taskARN];
    const data = await ecs.describeTasks({cluster , tasks}).promise();
    return data.tasks[0].containers[0].networkInterfaces[0].privateIpv4Address;
}

const getServer = async () => {
    const { TaskARN }= await getTaskMetaData();
    const ip = await fetchIp(TaskARN);
    return `${ip}:${containerPort}`;
}

module.exports = {
    getServer
}