import { Handler, Context } from 'aws-lambda';
import { Client } from 'pg';
const crypto = require('crypto'); 

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

        const rUser = await rsequelize.define('Users', {
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

        let key = '';
        let DBResponse;
        do {
            key = crypto.randomBytes(16).toString('hex');
            DBResponse = await rUser.findOne({
            where: {
                key,
              }
            });
        } while ( DBResponse )
        return {
            key
        }
        } catch (error) {
            console.log(error);
        }
    }