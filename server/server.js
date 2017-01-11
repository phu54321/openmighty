/**
 * Created by whyask37 on 2017. 1. 11..
 */


module.exports = function(io) {
    io.on('connection', function(socket){
        console.log('user connected : ' + socket.useridf);
        socket.emit('msg', 'Welcome to openMighty server');

        socket.on('msg', function(msg) {
            console.log(msg);
        });
        socket.on('disconnect', function(){
            console.log('user disconnected');
        });
    });
};
