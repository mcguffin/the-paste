Say Cheese
==========

Take a webcam snapshot or paste image data and upload it to the WordPress Media Library.

 - Developed in WP 3.8 – WP 4.8
 - Should work with WordPress 3.5+
 - German and Dutch localization. 

Browser Support
---------------

 - Chrome 32+
 - Firefox 26+
 - Safari 10+
 - IE11 (not sure about IE10)
 - Edge


Clipboard Pasting Caveats:
--------------------------

### Mac OS 10.11+:

| copy from / paste to  | Firefox  | Chrome   | Safari 10+ |
|-----------------------|----------|----------|------------|
| Mac Finder            |    1)    |    OK    |    -       |
| Mac Finder Screenshot |    OK    |    OK    |    OK      |
| Mac Preview           |    OK    |    OK    |    OK      |
| Mac Photos App        |    1)    |    OK    |    2)      |
| QuickTime Player      |    OK    |    OK    |    OK      |
| Photoshop CS 6        |    OK    |    OK    |    ?       |
| Photoshop CC (2017)   |    OK    |    OK    |    OK      |
| Illustrator CC        |    1)    |    1)    |    1)      |
| A Webpage             |    OK    |    OK    |    -       |
| MS Word Mac           |    1)    |    OK    |    OK      |
| LibreOffice           |    OK    |    OK    |    OK      |
| Gimp                  |    OK    |    OK    |    OK      |

**1)** Nothing happens. As a Workaround paste into Mac Preview first and then copy again.
**2)** The file icon is pasted. Use a workaround.


### Windows 10

| copy from / paste to  | Firefox  | Chrome   |   IE11   | MS Edge  |
|-----------------------|----------|----------|----------|----------|
| Gimp                  |    ?     |    ?     |    1)    |    1)    |
| Pictures App          |    ?     |    ?     |    2)    |    2)    |
| Paint                 |    ?     |    ?     |    OK    |    OK    |

**1)** Alpha channels are discarded
**2)** Alpha channels are discarded and replaced by some weird artifacts.


Filters:
--------
The filters `saycheese_enable_pasteboard` and `saycheese_enable_snapshot` are deprecated.
You can turn snapshot and pasteboard on and off in the media settings now.


ToDo:
-----
 - [ ] Select recording size (QVGA, VGA, SVGA, HD, FullHD)
 	- [ ] Find reliable way to predict supported WebcamSizes
 - [x] use different default file names for paste and snapshot
 - [ ] Add Messages after upload Error
 - [x] Deprecate Flash fallback

