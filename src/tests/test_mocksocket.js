/**
 * Created by whyask37 on 2017. 2. 10..
 */

const MockSocket = require('./mocksocket');
const assert = require('assert');

describe('MockSocket', function() {
    describe('#disconnect()', function() {
        it('should cut down any transmission', function(done) {
            const socket = new MockSocket();
            socket.disconnect();
            assert.throws(function() {
                socket.inMsg('async', 'test');
            }, Error, 'Connection not cut down');
            assert.throws(function() {
                socket.emit('cmd', 'out');
            }, Error, 'Connection not cut down');
            done();
        });
    });

    describe('#on()', function() {
        it('should register hander', function (done) {
            const socket = new MockSocket();
            socket.on('async', (data) => {
                assert(data == 'test');
                done();
            });
            socket.inMsg('async', 'test');
        });
        it('should handle multiple handlers', function (done) {
            const socket = new MockSocket();
            let flag = false;
            socket.on('async', (data) => {
                assert(!flag && data == 'test');
                flag = true;
            });
            socket.on('async', (data) => {
                assert(flag && data == 'test');
                done();
            });
            socket.inMsg('async', 'test');
        })
    });
});

