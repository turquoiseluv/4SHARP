<?php
/*expo code
  uploadImageAsync = async (uri) => {
    // let uriParts = uri.split(".");
    // let fileType = uriParts[uriParts.length - 1];

    const form = new FormData();
    form.append("mask", {
      uri: uri,
      name: "0", //파일이름 변경할 시 변경
    });
    await fetch("http://zpunsss.dothome.co.kr/image_upload_user.php", {
      method: "POST",
      body: form,
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    })
      .then((response) => response.text()) //response중 쓸대없는 값 제거후 php에서 보내준 echo값만 뽑아옴.
      .then((responseJson) => {
        console.log(responseJson);
      })
      .catch((error) => {
        console.log(error);
      });
  };
*/
$target_dir = "./" . $_GET['session'];
$file_name = $_FILES['mask']['name']; // fetch data에서 form.appen에 있는 name value가져오기
//$dd = $_FILES['test']['ext'];
$loop = false;//업로드 실패했을 때 맨 밑에 while문을 돌게하지 않기 위한 flag
$name = $file_name . ".png"  ; //이미지파일이름.

if(move_uploaded_file($_FILES['mask']['tmp_name'], $target_dir . "/" .$name)) {
    echo "upload";
}else {
    echo "fail";
}
?>