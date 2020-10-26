<?php 

$img = ImageCreateFromPng("0.png");
$rgb = ImageColorAt($img, 250, 200);
$r = ($rgb >> 16) & 0xFF;
$g = ($rgb >> 8) & 0xFF;
$b = $rgb & 0xFF;

?>