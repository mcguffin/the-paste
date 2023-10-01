The Paste
==========

Official repository for the [The Paste](https://wordpress.org/plugins/the-paste/) WordPress plugin.

Paste image data into the Editor and upload it to the WordPress Media Library.

 - Developed in WP 3.8 – WP 6.3
 - Should work with WordPress 3.5+

Known Browser Support
---------------------

 - Chrome 32+
 - Firefox 26+
 - Safari 10+
 - Edge

Known Issues
------------
 - *Firefox* does not support pasting multiple files from the OS filesystem.
 - *Safari* lacks the support to convert images to the webP format.
 - *Edge* is working suspiciously well, which is very unusal in the Microsoft world and must be considered a bug.

Applications tested so far:
---------------------------

### Mac OS 13.4:

| Copy from / paste to         | Firefox 117+   | Chrome 114+    | Safari 16.5+   | Edge 114+      |
|------------------------------|----------------|----------------|----------------|----------------|
| Image from Mac Finder        | OK             | OK             | OK             | OK             |
| File from Mac Finder         | OK             | OK             | OK             | OK             |
| Multiple Files from Finder   | -              | OK             | OK             | OK             |
| Mac Finder Screenshot        | OK             | OK             | OK             | OK             |
| Mac Preview (PDF page)       | OK             | OK             | OK             | OK             |
| Mac Preview (selection)      | OK             | OK             | OK             | OK             |
| Mac Photos App (Single)      | OK             | OK             | OK             | OK             |
| Mac Photos App (Mutliple)    | -              | OK             | OK             | OK             |
| QuickTime Player             | OK             | OK             | OK             | OK             |
| Adobe Photoshop 2023         | OK             | OK             | OK             | OK             |
| Adobe Illustrator 2023       | OK             | OK             | OK             | OK             |
| A Webpage                    | -              | OK             | OK             | ?              |
| Singe image from LibreOffice | OK             | OK             | OK             | OK             |
| Affinity Designer 2          | OK             | OK             | OK             | OK             |
| Affinity Photo 2             | OK             | ?              | ?              | ?              |
| Google Docs                  | OK             | OK             | ?              | ?              |

### Windows 10 (Virtual Box)

| copy from / paste to         | Firefox 117+   | Chrome 114+    | Edge 114+      |
|------------------------------|----------------|----------------|----------------|
| Image from Explorer          | OK             | OK             | OK             |
| File from Explorer           | OK             | OK             | OK             |
| Multiple files from Explorer | -              | OK             | OK             |
| Screenshot                   | OK             | OK             | OK             |
| A Webpage                    | -              | OK             | ?              |
| Gimp                         | OK             | OK             | ?              |
| Pictures App                 | OK             | ?              | OK             |
| Paint                        | OK             | OK             | ?              |
| Libre Office                 | OK             | OK             | ?              |
| Adobe Photoshop 2023         | ?              | ?              | ?              |
| Adobe Illustrator 2023       | ?              | ?              | ?              |
| One Note                     | OK             | OK             | ?              |
| Google Docs                  | ?              | ?              | ?              |

### Windows 10 (Real Machine)

| copy from / paste to         | Firefox 117+   | Chrome 114+    | Edge 114+      |
|------------------------------|----------------|----------------|----------------|
| Image from Explorer          | OK             | OK             | OK             |
| File from Explorer           | OK             | OK             | OK             |
| Multiple files from Explorer | -              | OK             | OK             |
| Screenshot                   | OK             | OK             | OK             |
| A Webpage                    | OK             | OK             | OK             |
| Gimp                         | OK             | OK             | ?              |
| Pictures App                 | OK             | ?              | OK             |
| Paint                        | OK             | OK             | ?              |
| Libre Office                 | OK             | OK             | OK             |
| Adobe Photoshop 2023         | OK             | ?              | OK             |
| Adobe Illustrator 2023       | ?              | ?              | ?              |
| One Note                     | OK             | OK             | ?              |
| Google Docs                  | ?              | ?              | ?              |

### Windows 11

**Help wanted:** Being trapped in the realms of macOS, I am lacking some real-world Windows 11 hardware.  
If you think supporting an OpenSource project could be the best thing to do ever, feel free to edit the table below.

| copy from / paste to           | Firefox 117+    | Chrome 114+     | Edge 114+       |
|--------------------------------|-----------------|-----------------|-----------------|
| Image from Filesystem          | OK              | ?               | OK              |
| File from Filesystem           | OK              | ?               | OK              |
| Multiple files from filesystem | -               | ?               | ?               |
| Screenshot                     | OK              | ?               | OK              |
| A Webpage                      | OK              | ?               | OK              |
| Gimp                           | ?               | ?               | ?               |
| Pictures App                   | ?               | ?               | ?               |
| Paint                          | ?               | ?               | ?               |
| Libre Office                   | OK              | ?               | OK              |
| Adobe Photoshop 2023           | OK              | ?               | OK              |
| Adobe Illustrator 2023         | ?               | ?               | ?               |
| One Note                       | ?               | ?               | ?               |
| WeChat                         | OK              | ?               | OK              |

### Android (Tested with EMUI edition)

| copy from / paste to           | Firefox         |
|--------------------------------|-----------------|
| Image from Filesystem          | OK              |
| File from Filesystem           | OK              |
| Multiple files from filesystem | -               |
| Screenshot                     | OK              |
| A Webpage                      | OK              |
| Libre Office                   | OK              |
| WeChat                         | OK              |


Plugin API:
-----------
### Filter `the_paste_max_embed_image_size`
Filter the maximum image size (in pixels) being pasted as data-url.

**Default (integer):** `262144` (= 512*512)

### Filter `the_paste_default_filename`

Filter the default filename. You can use internal placeholders and a subset of php‘s `strftime()` as date/time placeholders.

**Default (string):** `"Pasted"`

**WordPress Placeholders:**
 - `<postname>` Name of current post if present
 - `<username>` Name of current user

**Date and Time placeholders:**
 - `%Y` Four-digit year
 - `%y` Two-digit year
 - `%m` Number of month with leading zero (01 to 12)
 - `%d` Day of month with leading zero (01 to 31)
 - `%e` Day of month (1 to 31)
 - `%H` Two digit hour in 24-hour format
 - `%I` Two digit hour in 12-hour format
 - `%M` Two digit minute
 - `%S` Two digit second
 - `%s` Unix timestamp (seconds since 1970-01-01 00:00:00 UTC)
