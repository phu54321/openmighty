/**
 * Created by whyask37 on 2017. 1. 11..
 */


module.exports = function(io) {
    io.on('connection', function(socket){
        console.log('a user connected');
    });
};
