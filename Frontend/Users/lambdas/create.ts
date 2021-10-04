import { Handler, Context } from 'aws-lambda';
import { Client } from 'pg';
const axios = require('axios').default;
import { v4 as uuidv4 } from 'uuid';
import {
    Sequelize,
    Model,
    ModelDefined,
    DataTypes,
    HasManyGetAssociationsMixin,
    HasManyAddAssociationMixin,
    HasManyHasAssociationMixin,
    Association,
    HasManyCountAssociationsMixin,
    HasManyCreateAssociationMixin,
    Optional,
  } from "sequelize";

import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";


export const handler: Handler = async (event, _context: Context)=> {
    
    // gets the stream keys and preferences, generate unique id. 
    const body = JSON.parse(event.body);
    console.log(event);
    const UUID = body.UUID;
    const youtube_key = body.youtube_key ? body.youtube_key : '';
    const twitch_key = body.twitch_key ? body.twitch_key : ''; 
    const facebook_key = body.facebook_key ? body.facebook_key : ''; 
    const preferences = JSON.stringify(body.preferences) ? JSON.stringify(body.preferences) : JSON.stringify({
        youtube: false,
        facebook: false,
        twitch: false
    });
    
    const paramsStats = {
        FunctionName: 'users-dev-getKey',
        LogType: 'Tail',
        };

    const lResponse = await invoke(paramsStats);
    const json = decodeUtf8(lResponse);
    console.log(json);
    const payload = JSON.parse(json);  //stream/unique key then look up preferences for the stream keys
    console.log(payload);
    const key = event.body.key ? event.body.key : payload.key;

    const wsequelize = new Sequelize('Users', process.env.Username, process.env.Password, {
        host: process.env.WriterEndpoint,
        port: Number(process.env.Port),
        dialect: 'postgres',
        pool: {
            max: 1,
            idle: 1000,
          }
    });
    
    try {
        await wsequelize.authenticate();
        console.log('Connection has been established successfully to the writer endpoint.');
        // await rsequelize.authenticate();
        // console.log('Connection has been established successfully to the reader endpoint.');
        const wUser = await wsequelize.define('Users', {
            UUID: { //sub attribute of cognito id token
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false
            },
            youtube_key: {
                type: DataTypes.STRING,
            },
            facebook_key: {
                type: DataTypes.STRING
            },
            twitch_key: {
                type: DataTypes.STRING
            },
            key: {
                type: DataTypes.STRING
            },
            preferences: {
                type: DataTypes.JSON
            },     
        });


        const queryInterface = wsequelize.getQueryInterface();
        
        await wUser.sync();
        const user = wUser.build({
            UUID,
            youtube_key,
            facebook_key,
            twitch_key,
            preferences,
            key
        });
        await user.save();
        console.log(user);
        return {
            statusCode:200,
            body: JSON.stringify(user)
        }
        } catch (error) {
            console.log(error);
            return {
                statusCode: 500,
                body: JSON.stringify({
                  error: 'There was an error creating the user'
                }),
                headers: {
                  'Access-Control-Allow-Origin': '*'
                }
              }
        }
    }

function decodeUtf8(bytes) {
    var encoded = "";
    for (var i = 0; i < bytes.length; i++) {
        encoded += '%' + bytes[i].toString(16);
    }
    return decodeURIComponent(encoded);
}

const client = new LambdaClient({region: 'us-east-1'});
  const invoke = async (params)=> {
      const command = new InvokeCommand(params);
      const response = await client.send(command);
      return response.Payload;
  }