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
            let pixiNote = new pixi.Graphics(),
                x = transportTimeToX(transportTime) + halfGridLineWidth,
                y = opt.height - ((teoria.note(note).key() - noteRange.min) * noteHeight) + halfGridLineWidth,
                width = barWidth / parseInt(duration);

            noteContainer.addChild(pixiNote);

            pixiNote
                .beginFill(opt.noteColor)
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