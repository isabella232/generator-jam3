<!doctype html>
<html>
<head>
  <?php
    require('./lib/Meta.php');
    $meta = new Meta('json/share.json',isset($_GET['u'])?$_GET['u']:'');
    $meta->write();
  ?>
  <meta charset="utf-8">
  <base href="\{{BASENAME}}">
  <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0, shrink-to-fit=no">
  <?php if (@$warning) { ?><script type="text/javascript">window._browserWarning=true;</script><?php } ?>
  <link rel="stylesheet" type="text/css" href="\{{stylesheet}}">
</head>
  <body>\{{#if vendor}}
  <script type="text/javascript" src="\{{vendor}}"></script>\{{/if}}
  <script type="text/javascript" src="\{{bundle}}"></script>
  </body>
</html>
