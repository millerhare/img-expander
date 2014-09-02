# img-expander
Expand an image to some other container or coords, with:

 * Only scale/transform (so hardware accelerated)
 * Read/write methods for [fastdom](https://github.com/wilsonpage/fastdom)
 * No big animation library deps


## Demo
You can see a demo over [here](github.io/orangemug/img-expander)


## API
Expand an image where `container` is the reference to area to expand into. Note if you call expand twice it won't to anything unless you define a new container or the container has changed size.

    imgEx.expand(el, container, opts);
    // => Element of expanded image

Collapse back to the element

    imgEx.collapse(el);

Toggle between `expand`/`collapse`

    imgEx.toggle(el, container, opts);

Check if an element has been expanded

    imgEx.isExpand(el);
    // => Boolean

The available options are as follows (defaults in line)

    var opts = {
      animation: true,
      pos: ["center", "center"],
      appendTo: document.body
    };

Each method also has a `read`/`write` method attached to it which you can hook up to [fastdom](https://github.com/wilsonpage/fastdom). The following methods are defined

    imgEx.expand.read
    imgEx.expand.write
    imgEx.collapse.read
    imgEx.collapse.write
    imgEx.toggle.read
    imgEx.toggle.write


## License
MIT
