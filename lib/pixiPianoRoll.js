function pixiPianoRoll(opt) {
    opt = Object.assign({
        width: 900,
        height: 400,
        noteColor: 0xFF0900,
        gridLineColor: 0x0004FF,
        backgroundColor: 0xF1F1F1,
        bpm: 140,
        antialias: true,
        zoom: 4,
        resolution: 2,
        time: '0:0:0',
        renderer: 'WebGLRenderer',
        noteData: []
    }, opt);

    let lastTime,
        playing = false,
        renderer = new pixi[opt.renderer](opt.width, opt.height, {antialias: opt.antialias}),
        stage = new pixi.Container(),
        noteContainer = new pixi.Container(),
        noteRange = getNoteRange(opt.noteData),
        noteRangeDiff = noteRange.max - noteRange.min,
        barWidth = opt.width / opt.zoom,
        beatWidth = (opt.width / (opt.zoom * 4)),
        sixteenthWidth = beatWidth / 4,
        beatsPerMs = (opt.bpm / 60) / 1000,
        pxMovementPerMs = beatWidth * beatsPerMs,
        gridLineWidth = barWidth / 100,
        halfGridLineWidth = gridLineWidth / 2,
        gridLineSpacing = barWidth / opt.resolution,
        noteHeight = opt.height / noteRangeDiff,
        innerNoteHeight = noteHeight - gridLineWidth,
        noteGrid = {horizontal: [], vertical: []};

    function getNoteRange() {
        var min, max;

        opt.noteData.forEach(function(noteData) {
            var keyNumber = teoria.note(noteData[1]).key();

            if (keyNumber < min || typeof min !== 'number') {
                min = keyNumber;
            }
            if (keyNumber > max || typeof max !== 'number') {
                max = keyNumber;
            }
        });

        return {min: min - 1, max: max};
    }

    function drawBackground() {
        stage.addChild(
            new pixi.Graphics().clear()
                .beginFill(opt.backgroundColor)
                .drawRect(0, 0, opt.width, opt.height)
                .endFill()
        );
    }

    function transportTimeToX(transportTime) {
        var [bar, quarter = 0, sixteenth = 0] = transportTime.split(':');

        return (barWidth * bar) + (beatWidth * quarter) + (sixteenthWidth * sixteenth);
    }

    function drawNotes() {
        for (let [transportTime, note, duration] of opt.noteData) {
            let color = opt.noteColor,
                pixiNote = new pixi.Graphics(),
                teoriaNote = teoria.note(note),
                x = transportTimeToX(transportTime) + halfGridLineWidth,
                y = opt.height - ((teoriaNote.key() - noteRange.min) * noteHeight) + halfGridLineWidth,
                width = barWidth / parseInt(duration);

            if (typeof color === 'object') {
                Object.keys(color).forEach(function(key){
                    if (teoria.note(key).chroma() === teoriaNote.chroma()){
                        color = color[key];
                    }
                });
            }

            noteContainer.addChild(pixiNote);

            pixiNote
                .beginFill(color)
                .drawRect(x, y, width, innerNoteHeight)
                .endFill();
        }

        stage.addChild(noteContainer);
        noteContainer.x = -transportTimeToX(opt.time);
    }

    function drawGridlines(type) {
        if (typeof type !== 'string') {
            drawGridlines('horizontal');
            drawGridlines('vertical');
            return;
        }

        let width = type === 'vertical' ? gridLineWidth : opt.width,
            height = type === 'vertical' ? opt.height : gridLineWidth;

        for (let line of noteGrid[type]) {
            line.graphic
                .clear()
                .beginFill(opt.gridLineColor)
                .drawRect(line.x, line.y, width, height)
                .endFill();
        }
    }

    function moveVerticalGridLines(horizontalMovement) {
        for (let line of noteGrid.vertical) {
            line.x = line.x - horizontalMovement;
        }

        if (noteGrid.vertical[0].x + gridLineWidth < 0) {
            let line = noteGrid.vertical.shift();

            line.x = noteGrid.vertical[noteGrid.vertical.length - 1].x + gridLineSpacing;

            noteGrid.vertical.push(line);
        }
    }

    function initGridlines() {
        let i;

        for (i = 0; i < noteRangeDiff + 1; i++) {
            let line = new pixi.Graphics();

            noteGrid.horizontal.push({
                x: 0,
                y: (i * noteHeight) - halfGridLineWidth,
                graphic: line
            });

            stage.addChild(line);
        }

        for (i = 0; i < (opt.zoom * opt.resolution) + 1; i++) {
            let line = new pixi.Graphics();

            noteGrid.vertical.push({
                x: (i * gridLineSpacing) - halfGridLineWidth,
                y: 0,
                graphic: line
            });

            stage.addChild(line);
        }
    }

    function animate(frameTime) {
        if (!lastTime) {
            lastTime = frameTime;
        }

        let timeDiff = frameTime - lastTime,
            horizontalMovement = timeDiff * pxMovementPerMs;

        noteContainer.x = noteContainer.x - horizontalMovement;

        moveVerticalGridLines(horizontalMovement);
        drawGridlines('vertical');

        lastTime = frameTime;

        renderer.render(stage);

        playing ? requestAnimationFrame(animate) : lastTime = null;
    }

    drawBackground();
    initGridlines();
    drawGridlines();
    drawNotes();

    renderer.render(stage);

    return {
        play() {
            playing = true;
            requestAnimationFrame(animate);
        },
        pause() {
            playing = false;
        },
        get playing() {
            return playing;
        },
        get view() {
            return renderer.view;
        }
    };
}

// http://rhythmiclight.com/archives/ideas/colorscales.html
pixiPianoRoll.colorscales = {
    louisBertrandCastel: {
        'C': 0x1C0D82,  // blue
        'C#': 0x1B9081, // blue-green
        'D': 0x149033,  // green
        'D#': 0x709226, // olive green
        'E': 0xF5F43C,  // yellow
        'F': 0xF5D23B,  // yellow-orange
        'F#': 0xF88010, // orange
        'G': 0xFA0B0C,  // red
        'G#': 0xA00C09, // crimson
        'A': 0xD71386,  // violet
        'A#': 0x4B0E7D, // agate
        'B': 0x7F087C   // indigo
    },
    dDJameson: {
        'C': 0xFA0B0C,  // red
        'C#': 0xF44712, // red-orange
        'D': 0xF88010,  // orange
        'D#': 0xF5D23B, // orange-yellow
        'E': 0xF5F43C,  // yellow
        'F': 0x149033,  // green
        'F#': 0x1B9081, // green-blue
        'G': 0x1C0D82,  // blue
        'G#': 0x4B0E7D, // blue-purple
        'A': 0x7F087C,  // purple
        'A#': 0xA61586, // purple-violet
        'B': 0xD71285   // violet
    },
    theodorSeemann: {
        'C': 0x6A1C1C,  // carmine
        'C#': 0xFA0B0C, // scarlet
        'D': 0xFF7D05,  // orange
        'D#': 0xFCD533, // yellow-orange
        'E': 0xF5F43C,  // yellow
        'F': 0x169034,  // green
        'F#': 0x1B9081, // green blue
        'G': 0x1C0D82,  // blue
        'G#': 0x7F087C, // indigo
        'A': 0xD71386,  // violet
        'A#': 0x6A1C1C, // brown
        'B': 0x070707   // black
    },
    aWallaceRimington: {
        'C': 0xFA0B0C,  // deep red
        'C#': 0xA00C09, // crimson
        'D': 0xF44712,  // orange-crimson
        'D#': 0xF88010, // orange
        'E': 0xF5F43C,  // yellow
        'F': 0x709226,  // yellow-green
        'F#': 0x149033, // green
        'G': 0x26A680,  // blueish green
        'G#': 0x1B9081, // blue-green
        'A': 0x7F087C,  // indigo
        'A#': 0x1C0D82, // deep blue
        'B': 0xD71386   // violet
    },
    hHelmholtz: {
        'C': 0xF5F43C,  // yellow
        'C#': 0x149033, // green
        'D': 0x1B9081,  // greenish blue
        'D#': 0x1C5BA0, // cayan-blue
        'E': 0x7F087C,  // indigo blue
        'F': 0xD71386,  // violet
        'F#': 0x9D0E55, // end of red
        'G': 0xFA0B0C,  // red
        'G#': 0xD32C0A, // red
        'A': 0xD32C0A,  // red
        'A#': 0xD91951, // red orange
        'B': 0xF17A0F   // orange
    },
    aScriabin: {
        'C': 0xFA0B0C,  // red
        'C#': 0xD71386, // violet
        'D': 0xF5F43C,  // yellow
        'D#': 0x5A5685, // steely with the glint of metal
        'E': 0x1C5BA0,  // pearly blue the shimmer of moonshine
        'F': 0xA00C09,  // dark red
        'F#': 0x1C0D82, // bright blue
        'G': 0xF88010,  // rosy orange
        'G#': 0x7F0A7C, // purple
        'A': 0x149033,  // green
        'A#': 0x5A5685, // steely with a glint of metal
        'B': 0x1C5BA0   // pearly blue the shimmer of moonshine
    },
    aBernardKlein: {
        'C': 0xC40A09,  // dark red
        'C#': 0xFA0B0C, // red
        'D': 0xF44712,  // red orange
        'D#': 0xF88010, // orange
        'E': 0xF5F43C,  // yellow
        'F': 0xBCE039,  // yellow green
        'F#': 0x149033, // green
        'G': 0x1B9081,  // blue-green
        'G#': 0x1C0D82, // blue
        'A': 0x781887,  // blue violet
        'A#': 0xD71386, // violet
        'B': 0x9D0E55   // dark violet
    },
    iJBelmont: {
        'C': 0xFA0B0C,  // red
        'C#': 0xF44712, // red-orange
        'D': 0xF88010,  // orange
        'D#': 0xF6D111, // yellow-orange
        'E': 0xF5F43C,  // yellow
        'F': 0xBCE039,  // yellow-green
        'F#': 0x138F32, // green
        'G': 0x1B9081,  // blue-green
        'G#': 0x1C0D82, // blue
        'A': 0xA51585,  // blue-violet
        'A#': 0xD71386, // violet
        'B': 0xAD0E48   // red-violet
    },
    sZieverink: {
        'C': 0xBCE039,  // yellow/green
        'C#': 0x149033, // green
        'D': 0x1B9081,  // blue/green
        'D#': 0x1C0D82, // blue
        'E': 0x7F087C,  // indigo
        'F': 0xD71386,  // violet
        'F#': 0x6F0D45, // ultra violet
        'G': 0xA00C09,  // infra red
        'G#': 0xFA0B0C, // red
        'A': 0xF88010,  // orange
        'A#': 0xEDF087, // yellow/white
        'B': 0xF5F43C   // yellow
    }
};