const _ = require('lodash');
const NodeMediaServer = require('node-media-server');
//const abr = require('./lib/abr');
const cache = require('./lib/cache');
//const hls = require('./lib/hls');
const ecs = require('./lib/ecs');
const { invoke } = require('./lib/lambda');
const { promisify } = require("util");
const LOGGER = require('./lib/logger');
//const ffmpeg = require('@ffmpeg-installer/ffmpeg');


const timeout = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};


const LOG_TYPE = 3;
const init = async () => {
    try{
        const server_address = '';//process.env.NODE_ENV === 'production' ? await ecs.getServer() : '';
        const ffmpeg_path = process.env.FFMPEG_PATH || '/usr/local/bin/ffmpeg'; //where ffmpeg is.
        const config = {
          logType: LOG_TYPE,
          rtmp: {
            port: 1935,
            chunk_size: 60000,
            gop_cache: true,
            ping: 30,
            ping_timeout: 60
          },
          http: {
            port: 8000,
            mediaroot: process.env.MEDIA_ROOT || 'media', //what is this, says where media root is relative?
            allow_origin: '*',
            api: true
          },
          auth: {
            api: false
          },
        };
        
        //hls start recording HLS files and uploading them to S3.
        

        this.streams = new Map(); //streamkey and stream id
        this.sessions = new Map(); //session id and session

        // hls.recordHLS(config, this.streams);
        // hls.on('NewHlsStream', async (streamKey) => {
        //   await abr.createPlaylist(config.http.mediaroot, streamKey, this.streams);
        // })

        const nms = new NodeMediaServer(config);
        nms.run();

        nms.on('postrequest', async (path, body)=> {

            const streamKey = path.split('/').pop();
            const id = this.streams.get(streamKey);
            if (!id) return;

          if (body.youtube && !this.sessions.has(`youtube-${id}`)){
            const url = `rtmp://a.rtmp.youtube.com/live2/${body.youtube}`;
            const session = nms.nodeRelaySession({ffmpeg: ffmpeg_path,
              inPath: `rtmp://127.0.0.1:${config.rtmp.port}${path}`,
              ouPath: url});
            session.id = `youtube-${id}`;
            this.sessions.set(session.id, session);
            session.on('end', (id) => {
              this.sessions.delete(id);
            });
            session.run();
          } if (body.facebook && !this.sessions.has(`facebook-${id}`)){
              const url = `rtmps://live-api-s.facebook.com:443/rtmp/${body.facebook}`;
              session = nms.nodeRelaySession({
              ffmpeg: ffmpeg_path,
              inPath: `rtmp://127.0.0.1:${config.rtmp.port}${path}`,
              ouPath: url
              });
              session.id = `facebook-${id}`;
              session.on('end', (id) => {
              this.sessions.delete(id);
              });
              this.sessions.set(session.id, session);
              session.run();
          } if (body.twitch && !this.sessions.has(`twitch-${id}`)) {
              const url = `rtmp://live-jfk.twitch.tv/app/${body.twitch}`;
              session = nms.nodeRelaySession({
                ffmpeg: ffmpeg_path,
                inPath: `rtmp://127.0.0.1:${config.rtmp.port}${path}`,
                ouPath: url,
               });
              session.id = `twitch-${id}`;
              session.on('end', (id) => {
                this.sessions.delete(id);
              });
              this.sessions.set(session.id, session);
              session.run();
          }
        });

        nms.on('preConnect', (id, args) => {
          console.log('[NodeEvent on preConnect]', `id=${id} args=${JSON.stringify(args)}`);
          // let session = nms.getSession(id);
          // session.reject();
        });          

        nms.on('postConnect', (id, args) => {
          console.log('[NodeEvent on postConnect]', `id=${id} args=${JSON.stringify(args)}`);
        });          

        nms.on('doneConnect', (id, args) => {
          console.log('[NodeEvent on doneConnect]', `id=${id} args=${JSON.stringify(args)}`);
        });          

        nms.on('prePublish', (id, StreamPath, args) => {
          console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
          // let session = nms.getSession(id);
          // session.reject();
        });          

        nms.on('postPublish',  async (id, StreamPath, args) => {
            console.log('[NodeEvent on postPublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
            if (StreamPath.indexOf('/stream/') != -1){
              try {
                const current_streams = await cache.incr('stream-counter');
                console.log('CURRENT_STREAMS: ', current_streams);
                await cache.xadd('streams', '*', 'number', current_streams.toString());
                await cache.xadd('incoming-streams', '*', 'stream-id', id.toString());
            
                // const statsResponse = await invoke({FunctionName: 'Stats-dev-getStats', Payload: null});
                // LOGGER.log('statsResponse', statsResponse);
                // const regResponse = await invoke({FunctionName: 'regulateCapacity-dev-regulateCapacity'});
                // LOGGER.log('regResponse', regResponse);

              } catch (err){
                console.log(err);
              }
              const key = _.split(StreamPath,'/').pop();
              const paramsStats = {
                FunctionName: 'users-dev-retrieveKey',
                LogType: 'Tail',
                Payload: JSON.stringify({body:{key}})
              };
          
              const lResponse = await invoke(paramsStats);
              let tmp = JSON.parse(lResponse.Payload);
              let User = JSON.parse(tmp.body);
              let preferences = JSON.parse(User.preferences);

              if (preferences.youtube && User.youtube_key && !this.sessions.has(`youtube-${id}`)){
                const url = `rtmp://a.rtmp.youtube.com/live2/${User.youtube_key}`;
                const session = nms.nodeRelaySession({
                  ffmpeg: ffmpeg_path,
                  inPath: `rtmp://127.0.0.1:${config.rtmp.port}${StreamPath}`,
                  ouPath: url
                });
                session.id = `youtube-${id}`;
                session.on('end', (id) => this.sessions.delete(id));
                this.sessions.set(session.id, session);
                session.run();
              }
              if (preferences.facebook && User.facebook_key && !this.sessions.has(`facebook-${id}`)){
                const url = `rtmps://live-api-s.facebook.com:443/rtmp/${User.facebook_key}`;
                const session = nms.nodeRelaySession({
                  ffmpeg: ffmpeg_path,
                  inPath: `rtmp://127.0.0.1:${config.rtmp.port}${StreamPath}`,
                  ouPath: url
                })
                session.id = `facebook-${id}`;
                session.on('end', (id) => this.sessions.delete(id));
                this.sessions.set(session.id, session);
                session.run();
              }
              if (preferences.twitch && User.twitch_key && !this.sessions.has(`twitch-${id}`)){
                const url = `rtmp://live.twitch.tv/app/${User.twitch_key}`;
                const session = nms.nodeRelaySession({
                  ffmpeg: ffmpeg_path,
                  inPath: `rtmp://127.0.0.1:${config.rtmp.port}${StreamPath}`,
                  ouPath: url,
                });
                session.id = `twitch-${id}`;
                session.on('end', (id) => this.sessions.delete(id));
                this.sessions.set(session.id, session);
                session.run();
              }
            }
        });          

        nms.on('donePublish', async (id, StreamPath, args) => {
          console.log('[NodeEvent on donePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
          if (StreamPath.indexOf('/stream/') != -1){
            try {
              const current_streams = await cache.decr('stream-counter');
              console.log('CURRENT_STREAMS: ', current_streams);
              await cache.xadd('streams', '*', 'number', current_streams.toString()); //streams records (number of streams, at time).
              await cache.xadd('outgoing-streams', '*', 'stream-id', id.toString());

              // const statsResponse = await invoke({FunctionName: 'Stats-dev-getStats', Payload: null});
              // LOGGER.log('statsResponse',statsResponse);
              // const regResponse = await invoke({FunctionName: 'regulateCapacity-dev-regulateCapacity', Payload: null});
              // LOGGER.log('regResponse', regResponse);

            } catch (err){
              console.log(err);
            }

            //retrieving user from postgresql
            const paramsStats = {
              FunctionName: 'users-dev-retrieveKey',
              LogType: 'Tail',
              Payload: JSON.stringify({body:{key}})
            };
            const lResponse = await invoke(paramsStats);
            let tmp = JSON.parse(lResponse.Payload);
            let User = JSON.parse(tmp.body);
            let preferences = JSON.parse(User.preferences);

            if (preferences.youtube && User.youtube_key){
              let session = this.sessions.get(`youtube-${id}`);
              if (session){
                session.end();
                this.sessions.delete(`youtube-${id}`);
              }
            }
            if (preferences.twitch && User.twitch_key){
              let session = this.sessions.get(`twitch-${id}`);
              if (session){
                session.end();
                this.sessions.delete(`twitch-${id}`);
              }
            }
            if (preferences.facebook && User.facebook_key){
              let session = this.sessions.get(`facebook-${id}`);
              if (session){
                session.end();
                this.sessions.delete(`facebook-${id}`);
              }
            }
          }
        });          

        nms.on('prePlay', (id, StreamPath, args) => {
          console.log('[NodeEvent on prePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
          // let session = nms.getSession(id);
          // session.reject();
        });          

        nms.on('postPlay', (id, StreamPath, args) => {
          console.log('[NodeEvent on postPlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
        });          

        nms.on('donePlay', (id, StreamPath, args) => {
          console.log('[NodeEvent on donePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
        });
            } catch (err){
                console.log(err);
                process.exit();
            }
        }

init();