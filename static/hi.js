'use strict';

// Websocket

const socket = io.connect('ws://127.0.0.1:8080');

socket.on('connect', () => {
    socket.emit('get-test-suites', {});
    socket.emit('get-strings', {});
});

socket.on('test-suites', json => {
    const {testSuites: suites} = json;
    const html = renderTestSuites(suites);
    const testSuites = $('#test-suites');
    testSuites.html(html);
    let suite = testSuites.val();
    socket.emit('get-tests', {testSuite: suite});
    socket.emit('get-strings', {})
});

socket.on('tests', json => {
    const {tests} = json;
    $('#test-cases').html(renderTests(tests));
    $('#test-cases-row').removeClass('hidden');
    $('#strings-row').removeClass('hidden')
});

socket.on('strings', json => {
    const {strings} = json;
    $('#string-table').html(renderStrings(strings));
    $('[name="srun"]').each(function () {
        $(this).click(() => {
            socket.emit('run', {
                id: $(this).attr('value'),
                test: $('#test-cases').val(),
                suite: $('#test-suites').val()
            });
            $(this).parent().parent().parent().removeClass('list-group-item-success');
            $(this).parent().parent().parent().removeClass('list-group-item-danger')
        });
    });
    $('[name="spass"]').each(function () {
        $(this).click(() => {
            $(this).parent().parent().parent().addClass('list-group-item-success')
        });
    });
    $('[name="sfail"]').each(function () {
        $(this).click(() => {
            $(this).parent().parent().parent().addClass('list-group-item-danger')
        });
    });


});

socket.on('started', () => {
    $('#toggle-test-suite').html('Stop')
});

socket.on('stopped', () => {
    $('#toggle-test-suite').html('Start')
});

// UI

$('#test-suites').change(() => {
    let suite = $('#test-suites').val();
    socket.emit('get-tests', {testSuite: suite});
});

$('#toggle-test-suite').click(() => {
    if ($('#toggle-test-suite').text() === 'Start') {
        socket.emit('start', {suite: $('#test-suites').val()});
    } else {
        socket.emit('stop', {suite: $('#test-suites').val()});
    }
});


// Rendering

function renderTestSuites(testSuites) {
    return `
    ${testSuites.map(testSuite => `<option name="suite" value="${testSuite}">${testSuite}</option>`).join('')}
    `
}

function renderTests(tests) {
    return `
    ${tests.map(test => `<option name="test" value="${test}">${test}</option>`).join('')}
    `
}

function renderStrings(strings) {
    return `
    ${strings.map((string, idx) => `
        <tr name="srow" value="${idx}">
            <th class="min-content">${idx}</th>
            <td class="auto"><p class="text-truncate">${string}</p></td>
            <td class="min-content">
                <div class="btn-group">
                    <button name="srun" value="${idx}" type="button" class="btn btn-primary">Run</button>
                    <button name="spass" value="${idx}" type="button" class="btn btn-success">Pass</button>
                    <button name="sfail" value="${idx}" type="button" class="btn btn-danger">Fail</button>
                </div>
            </td>
        </tr>
    `).join('')}
    `
}