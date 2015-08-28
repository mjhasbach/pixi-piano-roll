## Modules
<dl>
<dt><a href="#module_pixiPianoRoll">pixiPianoRoll</a></dt>
<dd><p>JavaScript 2D WebGL / Canvas animated piano roll</p>
</dd>
</dl>
## Typedefs
<dl>
<dt><a href="#transportTime">transportTime</a> : <code>string</code></dt>
<dd><p>Playback position expressed in bars:quarters:sixteenths format (e.g. <code>&quot;1:2:0&quot;</code>)</p>
</dd>
<dt><a href="#note">note</a> : <code>string</code> | <code>number</code></dt>
<dd><p>Musical note expressed in <a href="https://en.wikipedia.org/wiki/Scientific_pitch_notation">Scientific notation</a>, <a href="https://en.wikipedia.org/wiki/Helmholtz_pitch_notation">Helmholtz notation</a>, <a href="https://en.wikipedia.org/wiki/Piano_key_frequencies">piano key number</a>, <a href="https://en.wikipedia.org/wiki/Audio_frequency">audio frequency</a> (the closest note will be used), or <a href="https://en.wikipedia.org/wiki/MIDI">MIDI</a> note number</p>
</dd>
<dt><a href="#noteDuration">noteDuration</a> : <code>string</code> | <code>number</code></dt>
<dd><p>Note duration expressed as a number (e.g. <code>1</code> for a whole note) or string (e.g. <code>&quot;4n&quot;</code> for a quarter note)</p>
</dd>
<dt><a href="#noteData">noteData</a> : <code>Array.&lt;Array.&lt;transportTime, note, noteDuration&gt;&gt;</code></dt>
<dd><p>See the typedefs for <a href="#transportTime">transportTime</a>, <a href="#note">note</a>, and <a href="#noteDuration">noteDuration</a></p>
</dd>
<dt><a href="#pianoRollAPI">pianoRollAPI</a> : <code>Object</code></dt>
<dd><p>The piano roll API</p>
</dd>
</dl>
<a name="module_pixiPianoRoll"></a>
## pixiPianoRoll
JavaScript 2D WebGL / Canvas animated piano roll

**Author:** Matthew Hasbach  
**License**: MIT  
**Copyright**: Matthew Hasbach 2015  
<a name="exp_module_pixiPianoRoll--pixiPianoRoll"></a>
### pixiPianoRoll(opt) ⇒ <code>[pianoRollAPI](#pianoRollAPI)</code> ⏏
Instantiate a pixiPianoRoll

**Kind**: Exported function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| opt | <code>Object</code> |  | Options object |
| [opt.width] | <code>number</code> | <code>900</code> | Width of the piano roll |
| [opt.height] | <code>number</code> | <code>400</code> | Height of the piano roll |
| [opt.pianoKeyWidth] | <code>number</code> | <code>125</code> | Width of the piano keys |
| [opt.noteColor] | <code>number</code> &#124; <code>Object.&lt;number&gt;</code> | <code>musicalScaleColors.dDJameson</code> | Hexadecimal color of every note or object that has pitch class (chroma) property names and hexadecimal color values. See [musical-scale-colors](https://github.com/mjhasbach/musical-scale-colors) for palettes (including the default). |
| [opt.noteColor] | <code>number</code> | <code>0x333333</code> | Hexadecimal color of the grid lines |
| [opt.noteColor] | <code>number</code> | <code>0</code> | Hexadecimal color of the background |
| [opt.bpm] | <code>number</code> | <code>140</code> | Beats per minute |
| [opt.activateKeys] | <code>boolean</code> | <code>true</code> | If true, the color of the piano keys will change to the color of the notes that intersect them |
| [opt.antialias] | <code>boolean</code> | <code>true</code> | Whether or not the renderer will use antialiasing |
| [opt.zoom] | <code>number</code> | <code>4</code> | Amount of visible measures |
| [opt.resolution] | <code>number</code> | <code>2</code> | Amount of vertical grid lines per measure |
| [opt.time] | <code>[transportTime](#transportTime)</code> | <code>0:0:0</code> | The [transportTime](#transportTime) at which playback will begin |
| [opt.renderer] | <code>string</code> | <code>&quot;WebGLRenderer&quot;</code> | Determines the renderer type. Must be `"WebGLRenderer"` or `"CanvasRenderer"`. |
| [opt.noteFormat] | <code>string</code> | <code>&quot;String&quot;</code> | The format of the [notes](#note) in `opt.noteData`. `"String"` for scientific or Helmholtz notation, `"Key"` for piano key numbers, `"Frequency"` for audio frequencies, or `"MIDI"` for MIDI note numbers. |
| [opt.noteData] | <code>[noteData](#noteData)</code> | <code>[]</code> | Note data |

**Example**  
```js
var pianoRoll = pixiPianoRoll({
    width: 900,
    height: 400,
    noteColor: 0xdb000f,
    gridLineColor: 0x333333,
    backgroundColor: 0x1a0002,
    bpm: 140,
    antialias: true,
    zoom: 4,
    resolution: 2,
    time: '0:0:0',
    renderer: 'WebGLRenderer',
    noteFormat: 'String',
    noteData: [
        ['0:0:0', 'C4', '2n'],
        ['0:0:0', 'D4', '2n'],
        ['0:0:0', 'E4', '2n'],
        ['0:2:0', 'B4', '4n'],
        ['0:3:0', 'A#4', '4n']
    ]
});

document.getElementsByTagName('body')[0].appendChild(pianoRoll.view);

pianoRoll.playback.play();
```
<a name="transportTime"></a>
## transportTime : <code>string</code>
Playback position expressed in bars:quarters:sixteenths format (e.g. `"1:2:0"`)

**Kind**: global typedef  
<a name="note"></a>
## note : <code>string</code> &#124; <code>number</code>
Musical note expressed in [Scientific notation](https://en.wikipedia.org/wiki/Scientific_pitch_notation), [Helmholtz notation](https://en.wikipedia.org/wiki/Helmholtz_pitch_notation), [piano key number](https://en.wikipedia.org/wiki/Piano_key_frequencies), [audio frequency](https://en.wikipedia.org/wiki/Audio_frequency) (the closest note will be used), or [MIDI](https://en.wikipedia.org/wiki/MIDI) note number

**Kind**: global typedef  
<a name="noteDuration"></a>
## noteDuration : <code>string</code> &#124; <code>number</code>
Note duration expressed as a number (e.g. `1` for a whole note) or string (e.g. `"4n"` for a quarter note)

**Kind**: global typedef  
<a name="noteData"></a>
## noteData : <code>Array.&lt;Array.&lt;transportTime, note, noteDuration&gt;&gt;</code>
See the typedefs for [transportTime](#transportTime), [note](#note), and [noteDuration](#noteDuration)

**Kind**: global typedef  
<a name="pianoRollAPI"></a>
## pianoRollAPI : <code>Object</code>
The piano roll API

**Kind**: global typedef  

* [pianoRollAPI](#pianoRollAPI) : <code>Object</code>
  * [.playback](#pianoRollAPI.playback) : <code>Object</code>
    * [.toggle([time])](#pianoRollAPI.playback.toggle)
    * [.play([time])](#pianoRollAPI.playback.play)
    * [.pause()](#pianoRollAPI.playback.pause)
    * [.seek(time)](#pianoRollAPI.playback.seek)
  * [.bpm](#pianoRollAPI.bpm) : <code>number</code>
  * [.zoom](#pianoRollAPI.zoom) : <code>number</code>
  * [.resolution](#pianoRollAPI.resolution) : <code>number</code>
  * [.noteData](#pianoRollAPI.noteData) : <code>[noteData](#noteData)</code>
  * [.playing](#pianoRollAPI.playing) : <code>boolean</code>
  * [.view](#pianoRollAPI.view) : <code>HTMLElement</code>

<a name="pianoRollAPI.playback"></a>
### pianoRollAPI.playback : <code>Object</code>
Contains methods that control playback

**Kind**: static property of <code>[pianoRollAPI](#pianoRollAPI)</code>  

* [.playback](#pianoRollAPI.playback) : <code>Object</code>
  * [.toggle([time])](#pianoRollAPI.playback.toggle)
  * [.play([time])](#pianoRollAPI.playback.play)
  * [.pause()](#pianoRollAPI.playback.pause)
  * [.seek(time)](#pianoRollAPI.playback.seek)

<a name="pianoRollAPI.playback.toggle"></a>
#### playback.toggle([time])
Pause if playing or play if paused

**Kind**: static method of <code>[playback](#pianoRollAPI.playback)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [time] | <code>[transportTime](#transportTime)</code> | If paused, the position to begin playing. If omitted, playback will begin at the current position. |

<a name="pianoRollAPI.playback.play"></a>
#### playback.play([time])
Begin playback

**Kind**: static method of <code>[playback](#pianoRollAPI.playback)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [time] | <code>[transportTime](#transportTime)</code> | The position to begin playing. If omitted, playback will begin at the current position. |

<a name="pianoRollAPI.playback.pause"></a>
#### playback.pause()
Pause playback

**Kind**: static method of <code>[playback](#pianoRollAPI.playback)</code>  
<a name="pianoRollAPI.playback.seek"></a>
#### playback.seek(time)
Change the playback position

**Kind**: static method of <code>[playback](#pianoRollAPI.playback)</code>  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>[transportTime](#transportTime)</code> | The new playback position |

<a name="pianoRollAPI.bpm"></a>
### pianoRollAPI.bpm : <code>number</code>
Change the bpm by changing this property

**Kind**: static property of <code>[pianoRollAPI](#pianoRollAPI)</code>  
<a name="pianoRollAPI.zoom"></a>
### pianoRollAPI.zoom : <code>number</code>
Change the zoom by changing this property

**Kind**: static property of <code>[pianoRollAPI](#pianoRollAPI)</code>  
<a name="pianoRollAPI.resolution"></a>
### pianoRollAPI.resolution : <code>number</code>
Change the resolution by changing this property

**Kind**: static property of <code>[pianoRollAPI](#pianoRollAPI)</code>  
<a name="pianoRollAPI.noteData"></a>
### pianoRollAPI.noteData : <code>[noteData](#noteData)</code>
Change the note data by changing this property

**Kind**: static property of <code>[pianoRollAPI](#pianoRollAPI)</code>  
<a name="pianoRollAPI.playing"></a>
### pianoRollAPI.playing : <code>boolean</code>
Whether or not playback is ongoing

**Kind**: static property of <code>[pianoRollAPI](#pianoRollAPI)</code>  
**Read only**: true  
<a name="pianoRollAPI.view"></a>
### pianoRollAPI.view : <code>HTMLElement</code>
The piano roll canvas element

**Kind**: static property of <code>[pianoRollAPI](#pianoRollAPI)</code>  
**Read only**: true  
