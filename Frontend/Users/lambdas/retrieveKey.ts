import { Handler, Context } from 'aws-lambda';
import { isJson } from './lib/common'
//import { Client } from 'pg';

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

export const handler: Handler = async (event, _context: Context)=> {
    console.log(event);
    const key = event.body.key ? event.body.key : JSON.parse(event.body).key;

    if (!key){
        return {
            statusCode: 400,
            Message: "missing key"
        }
    }
    
    const rsequelize = new Sequelize('Users', process.env.Username, process.env.Password, {
        host: process.env.ReaderEndpoint,
        port: Number(process.env.Port),
        dialect: 'postgres',
        pool: {
            max: 1,
            idle: 1000,
          }
    });

    try {
        await rsequelize.authenticate();
        console.log('Connection has been established successfully to the reader endpoint.');

        const rUser = rsequelize.define('Users', {
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
        console.log('defined rUser...');
        const user = await rUser.findOne({ where: { key } });
        if (user === null) {
            console.log('Not found!');
            return {
                statusCode: 200,
                body: null
            }
        } else {
            return {
                statusCode: 200,
                body: JSON.stringify(user),
                headers: {
                    'Access-Control-Allow-Origin': '*'
                }
            }
        }
        } catch (error) {
            console.log(error);
            return {
                statusCode: 500,
                body: JSON.stringify({
                  error: 'There was an error retrieving the user'
                }),
                headers: {
                  'Access-Control-Allow-Origin': '*'
                }
              }
        }
    }