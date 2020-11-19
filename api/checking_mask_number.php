<?php
/* expo code.
 onPicPress = (px) => {
    const { scale } = this.state;
    if (px.pageX != px.locationX || px.pageY != px.locationY) {
      this.setState({
        axisX: px.locationX,
        imageX: px.locationX * scale,
        axisY: px.locationY,
        imageY: px.locationY * scale,
      });
    }
    this.detectImageSelected(this.state.imageX, this.state.imageY);
    let x = Math.round(this.state.imageX); 
    let y = Math.round(this.state.imageY);
    console.log(x, y);
      fetch(`http://172.30.1.35/checking_mask_number.php?x=${x}&y=${y}`)
      .then(response=>response.text())
      .then(responseText=>{
        console.log(responseText);
      })
      .catch(error=>alert(error));
  };
*/ 
$length = $_GET['maskLen']; //mask 길이
$target_dir = $_GET['session']; //임의의 mask 폴더 값.
$x = $_GET['x']; 
$y = $_GET['y'];

for($i=1; $i<$length; $i=$i+1){
    $img = ImageCreateFromPng("./" . $target_dir . "/" . $i .".png");
    $rgb = ImageColorAt($img, $x, $y);
    $r = ($rgb >> 16) & 0xFF;
    $g = ($rgb >> 8) & 0xFF;
    $b = $rgb & 0xFF;

    if(($r==255)&&($g==255)&&($b==255)){
        echo $i;
        break;
    }
   // echo $r, $g, $b, "<br>";
}
return false;
?>