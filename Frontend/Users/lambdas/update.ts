import { Handler, Context } from 'aws-lambda';
import * as _ from 'lodash';
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
    const body = JSON.parse(event.body);
    console.log(event);
    const UUID = body.UUID;

    if (!UUID){
        return {
            statusCode:400,
            body: "missing UUID"
        }
    }

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
        console.log('Connection has been established successfully to the reader endpoint.');

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

        let result = await wUser.findByPk(UUID);
        console.log(result);
        if ( ! result) {
            return {
                statusCode: 200,
                body: null
            }
        } else {
            //body: {youtube_key: ..., facebook_key: ...}
            _.forEach(body, (value, key) => {
                result[key] = value;
            });

            await result.save();
            
            return {
                statusCode: 200,
                body: JSON.stringify(result),
                headers:{
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