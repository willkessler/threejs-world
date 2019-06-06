## Flyover Simulator

![demo_movie](./demo.gif)

This Chrome Browser Extension simulates flying over an endless landscape, every time you pop a new browser tab.

### Instant Demo

You can visit [here](https://willkessler.github.io/threejs-world/) to see how it behaves without cloning this repo.

### Installing

Because this extension uses
[`simplex-noise.js`](https://github.com/jwagner/simplex-noise.js.git)
as a submodule, make sure you `git clone` using the `--recursive` flag
to get the submodule.

### Just trying it out to see what it looks like:

You can also just try this out with `python3 -m http.server 50001` and surf to `localhost:50001/landscape5.html` to see the effect without installing as an extension.

### What's interesting

* Inspiration was the [SnowSpeeder rescue scene](https://www.youtube.com/watch?v=3SHp96pOCzA) in _Empire Strikes Back_. Ideally we would do a real snowy landscape with rocks, but this landscape has green parts and some snowy parts. Oh well.
* Camera follows a spline so it's smoother flying over the landscape, much like the land speeders.
* The terrain maps stretch to the horizon more or less, but the far edges are obscured by fog. As you fly forward in space, the code deletes the maps behind you when generating a new map in front of you, so it appears to be "endless" terrain but we don't have to generate too much terrain at any given moment.
* Between sections of terrain, we try to smooth your motion between two splines rather than trying to line them up perfectly. This gives a bit of a "bounce" feeling sometimes, which is a bit like the snowspeeders. See `moveCamera` with an acceleration and dampener for the Y position.

### ToDo

The generation step is too slow. This could be more incremental and fit within 10ms frame rates.

