<?php

header('Content-type: image/jpeg;');
$url = $_GET['url'];
$mycontent = file_get_contents($url);
echo $mycontent;
