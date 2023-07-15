The Paste
==========

Official repository for the [The Paste](https://wordpress.org/plugins/the-paste/) WordPress plugin.

Paste image data into the Editor and upload it to the WordPress Media Library.

 - Developed in WP 3.8 – WP 6.2
 - Should work with WordPress 3.5+

Known Browser Support
---------------------

 - Chrome 32+
 - Firefox 26+
 - Safari 10+
 - Edge


Applications tested so far:
---------------------------

### Mac OS 13.4:

#### with data uris disabled

| copy from / paste to         | Firefox 114+   | Chrome 114+    | Safari 16.5+   | Edge 114+      |
|------------------------------|----------------|----------------|----------------|----------------|
| Image from Mac Finder        | OK             | OK             | OK             | OK             |
| File from Mac Finder         | OK             | OK             | OK             | OK             |
| Multiple Files from Finder   | - <sup>1</sup> | OK             | OK             | OK             |
| Mac Finder Screenshot        | OK             | OK             | OK             | OK             |
| Mac Preview (PDF page)       | OK<sup>3</sup> | OK<sup>2</sup> | OK<sup>2</sup> | OK<sup>2</sup> |
| Mac Preview (rect selection) | OK             | OK             | OK             | OK             |
| Mac Photos App               | OK<sup>4</sup> | OK             | OK             | OK             |
| QuickTime Player             | ?              | ?              | ?              | ?              |
| Adobe Photoshop 2023         | OK             | OK             | OK             | OK             |
| Adobe Illustrator 2023       | OK             | ?              | ?              | ?              |
| A Webpage                    | ?              | ?              | ?              | ?              |
| MS Word Mac                  | ?              | ?              | ?              | ?              |
| LibreOffice                  | ?              | ?              | ?              | ?              |
| Gimp                         | ?              | ?              | ?              | ?              |
| Affinity Designer            | ?              | ?              | ?              | ?              |
| Affinity Photo               | ?              | ?              | ?              | ?              |

#### with data uris enabled
| copy from / paste to        | Firefox 114+   | Chrome 114+ | Safari 16.5+    | Edge 114+ |
|-----------------------------|----------------|-------------|-----------------|-----------|
| Small image from Mac Finder | ?              | ?           | ?               | ?         |
| Small screenshot            | ?              | ?           | ?               | ?         |


### Windows 11

| copy from / paste to           | Firefox 114+    | Chrome 114+     | Edge 114+       |
|--------------------------------|-----------------|-----------------|-----------------|
| Image from Filesystem          | ?               | ?               | ?               |
| File from Filesystem           | ?               | ?               | ?               |
| Multiple files from filesystem | ?               | ?               | ?               |
| Screenshot                     | ?               | ?               | ?               |
| A Webpage                      | ?               | ?               | ?               |
| Gimp                           | ?               | ?               | ?               |
| Pictures App                   | ?               | ?               | ?               |
| Paint                          | ?               | ?               | ?               |
| Libre Office                   | ?               | ?               | ?               |
| Adobe Photoshop CC             | ?               | ?               | ?               |
| Adobe Illustrator CC           | ?               | ?               | ?               |

<sup>1</sup> The file names are pasted as text. One of the files is uploaded.
<sup>2</sup> Download link pasted
<sup>3</sup> Download link with generic filename pasted
<sup>4</sup> If using the menu or right-click menu. If pasted using <kbd>command + v</kbd> a blob URI image is pasted.

Plugin API:
-----------
### Filter `the_paste_max_embed_image_size`
Filter the maximum image size (in pixels) being pasted as data-url.

**Default (integer):** `262144` (= 512*215)

### Filter `the_paste_default_filename`

Filter the default filename. You can use internal placeholders a subset of php‘s `strftime()` as date/time placeholders.

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
