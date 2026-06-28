var io = require('socket.io-client');
var he = require('he');
var fs = require('fs');
var socket = io('https://v2.windows93.net:8088');
var colors = require('./css-colors/css-color-names');
if(!fs.existsSync('webhook_url.txt')) {
    process.exit(console.log('Could not find webhook_url.txt!'));
}
var webhook = fs.readFileSync('webhook_url.txt', 'utf8').trim();

function hexify(str) {
    var col = str.split(';')[0].replaceAll(' ', '');
    if(col.startsWith('#')) {
        return col.slice(1);
    } else if(col.startsWith('rgb')) {
        return col.slice(4, -1).split(',').map(e => parseInt(e).toString(16).padStart(2, 0)).join('')
    } else if(col.startsWith('rgba')) {
        return col.slice(5, -1).split(',').map(e => {
            var num = parseFloat(e);
            if(num > 0 && num <= 1) {
                num *= 255;
            }
            return num.toString(16).padStart(2, 0);
        }).join('')
    } else if(colors[col]) {
        return colors[col].slice(1);
    } else {
        return 'ffffff';
    }
}

socket.on('user joined', function(data) {
    fetch(webhook, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            username: 'System event',
            embeds: [
                {title: 'User joined', description: '**Nick**: ' + he.decode(data.nick) + '\n**Color**: ' + he.decode(data.color), footer: {text: 'Home: ' + data.home}}
            ],
            avatar_url: 'https://singlecolorimage.com/get/' + hexify('mediumseagreen') + '/500x500'
        })
    }).catch(() => {});
});

socket.on('user left', function(data) {
    fetch(webhook, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            username: 'System event',
            embeds: [
                {title: 'User left', description: '**Nick**: ' + he.decode(data.nick) + '\n**Color**: ' + he.decode(data.color), footer: {text: 'Home: ' + data.home}}
            ],
            avatar_url: 'https://singlecolorimage.com/get/' + hexify('tomato') + '/500x500'
        })
    }).catch(() => {});
});

socket.on('user change nick', function(data) {
    fetch(webhook, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            username: 'System event',
            embeds: [
                {title: 'User changed nick', description: '**Old nick**: ' + he.decode(data[0].nick) + '\n**Old color**: ' + he.decode(data[0].color) + '\n**New nick**:' + he.decode(data[1].nick) + '\n**New color**: ' + he.decode(data[1].color), footer: {text: 'Home: ' + data[0].home}}
            ],
            avatar_url: 'https://singlecolorimage.com/get/' + hexify('gold') + '/500x500'
        })
    }).catch(() => {});
});

socket.on('user change room', function(data) {
    console.log(data)
    fetch(webhook, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            username: 'System event',
            embeds: [
                {title: 'User changed rooms', description: '**Nick**: ' + he.decode(data[0].nick) + '\n**Color**: ' + he.decode(data[0].color) + '\n**Room**: ' + data[1].nick, footer: {text: 'Home: ' + data[0].home}}
            ],
            avatar_url: 'https://singlecolorimage.com/get/' + hexify('gold') + '/500x500'
        })
    }).catch(() => {});
});

socket.on('message', function(data) {
    fetch(webhook, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            username: he.decode(data.nick),
            embeds: [
                {title: 'Message', description: he.decode(data.msg), footer: {text: 'Home: ' + data.home}}
            ],
            avatar_url: 'https://singlecolorimage.com/get/' + hexify(he.decode(data.color)) + '/500x500'
        })
    })
});

socket.on('connect', () => {
    socket.emit('user joined', 'tbdbridge', '#fd9c0b', '', '');
});

socket.on('disconnect', () => {
    socket.connect();
});