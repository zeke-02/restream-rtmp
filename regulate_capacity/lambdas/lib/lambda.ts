import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

const client = new LambdaClient({region: 'us-east-1'});
const invoke = async (params)=> {
    const command = new InvokeCommand(params);
    const response = await client.send(command);
    return response.Payload;
}


export default invoke;