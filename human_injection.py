import html
import importlib.util
import json
import os

import socketio
from aiohttp import web

sio = socketio.AsyncServer()
app = web.Application()
sio.attach(app)


class Plugins(dict):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        plugin_names = os.listdir('plugins')
        for plugin_name in plugin_names:
            if plugin_name.startswith('__'):
                continue
            plugin_path = os.path.join('plugins', plugin_name)
            module_name = os.path.splitext(plugin_name)[0]
            spec = importlib.util.spec_from_file_location(module_name, plugin_path)
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            plugin_name = module.plugin_name
            self[plugin_name] = module.__getattribute__(plugin_name)()


plugins = Plugins()

with open('static/blns.json') as f:
    strings = json.load(f)


async def index(request):
    with open('templates/index.html') as f:
        return web.Response(text=f.read(), content_type='text/html')


@sio.on('get-test-suites')
async def get_test_suites(sid, data):
    await sio.emit('test-suites', data={'testSuites': [html.escape(p) for p in plugins.keys()]})


@sio.on('get-tests')
async def get_tests(sid, data):
    test_suite = data['testSuite']
    await sio.emit('tests', data={'tests': [html.escape(t) for t in plugins[test_suite].tests]})


@sio.on('get-strings')
async def get_strings(sid, data):
    await sio.emit('strings', data={"strings": [html.escape(s) for s in strings]})


@sio.on('start')
async def start(sid, data):
    plugins[data['suite']].start()
    await sio.emit('started', {})


@sio.on('stop')
async def stop(sid, data):
    plugins[data['suite']].stop()
    await sio.emit('stopped', {})


@sio.on('run')
async def run(sid, data):
    plugin = plugins[data['suite']]
    test = plugin.tests[data['test']]
    test(strings[int(data['id'])])


app.router.add_static('/static', 'static')
app.router.add_get('/', index)

if __name__ == '__main__':
    web.run_app(app)
