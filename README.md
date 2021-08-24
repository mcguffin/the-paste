The Paste
==========

Official repository for the [The Paste](https://wordpress.org/plugins/the-paste/) WordPress plugin.

Paste image data into the Editor and upload it to the WordPress Media Library.

 - Developed in WP 3.8 – WP 4.8
 - Should work with WordPress 3.5+
 - German and Dutch localization.

Known Browser Support
---------------------

 - Chrome 32+
 - Firefox 26+
 - Safari 10+
 - IE11
 - Edge


Applications tested so far:
---------------------------

### Mac OS 10.15:

| copy from / paste to  | Firefox 91+    | Chrome 92+ | Safari 14+      |
|-----------------------|----------------|------------|-----------------|
| Mac Finder            | OK             | OK         | OK              |
| Mac Finder Screenshot | OK             | OK         | OK              |
| Mac Preview           | OK             | OK         | OK              |
| Mac Photos App        | OK             | OK         | OK              |
| QuickTime Player      | OK             | OK         | OK              |
| Photoshop CC (2017)   | OK             | OK         | OK              |
| Illustrator CC (2021) | -              | OK         | - <sup>1)</sup> |
| A Webpage             | OK             | OK         | -               |
| MS Word Mac           | -              | OK         | OK              |
| LibreOffice           | OK             | OK         | OK              |
| Gimp                  | OK             | OK         | OK              |
| Affinity Designer     | -              | OK         | - <sup>1)</sup> |
| Affinity Photo        | OK             | OK         | OK              |

### Windows 10

| copy from / paste to  | Firefox 55+     | Chrome 60+      | Edge 14+        | IE11              |
|-----------------------|-----------------|-----------------|-----------------|-------------------|
| Screenshot            | OK              | OK              | OK              | OK                |
| A Webpage             | OK<sup>4)</sup> | OK<sup>4)</sup> | -               | -                 |
| Gimp                  | OK              | OK              | OK              | OK                |
| Pictures App          | OK              | OK              | OK              | OK                |
| Paint                 | OK              | OK              | OK              | OK                |
| Libre Office          | OK              | OK              | OK              | OK                |
| Adobe Photoshop CC    | OK              | OK              | OK              | (OK)<sup>5)</sup> |
| Adobe Illustrator CC  | OK<sup>2)</sup> | OK<sup>2)</sup> | OK<sup>2)</sup> | -                 |
<!--
| MS Word               | ?               | ?               | ?               | ?                 |
| Corel Draw            | ?               | ?               | ?               | ?                 |
| Corel PhotoPaint      | ?               | ?               | ?               | ?                 |
 -->


<sup>1)</sup> A PDF version of the image is pasted
<sup>2)</sup> A png version of the image data is pasted.  
<sup>3)</sup> The pasted image has only half the size than in the other browsers.  
<sup>4)</sup> The original image HTML gets pasted too.  
<sup>5)</sup> If you have to confirm clipboard access—the first time you paste something — the image gets removed after being pasted.

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
