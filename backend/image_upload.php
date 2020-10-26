<?php
/*expo code
imageUploading = () => {
    
    const uri = this.state.uri;
    const id = this.state.sessionid;

    console.log(this.state.sessionid);
    const form = new FormData();

    form.append("test", {
      uri: uri,
      type: "image/jpg",
      name: id, //파일이름 변경할 시 변경 
    });
    console.log(uri);
    fetch("http://172.30.1.35/image_upload.php", {
        method: "POST",
        body: form,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
          "title" : "test",
          "name" : "aaaa",
        },
      })
      .then(response=>response.text())//response중 쓸대없는 값 제거후 php에서 보내준 echo값만 뽑아옴.
      .then(responseJson => {
          //console.log(responseJson);
          this.setState({
            mask_length : responseJson,
          });
          console.log(mask_length);
          // 성공시 카메라로 or 알림 닫기
          Alert.alert(
            "Upload Successful",
            "성공적으로 업로드 되었습니다.",
            [
              { text: "카메라", onPress: this.pressedBack },
              { text: "닫기", onPress: () => console.log("닫기 누름") },
            ],
            { cancelable: false }
          );
        })
        .catch((error) => {
          console.log(error);
          Alert.alert("Upload Failed", "업로드가 실패했습니다.");
          // 실패시 알림 확인만
        });
    };
*/
$target_dir = "./waiting";
$file_name = $_FILES['test']['name']; // fetch data에서 form.appen에 있는 name value가져오기
$ext = $_FILES['test']['ext'];
$loop = false;//업로드 실패했을 때 맨 밑에 while문을 돌게하지 않기 위한 flag
$name = $file_name . ".png"    ; //이미지파일이름.

/*
if(@mkdir($file_name, 0777)) { //테스트 용 디렉토리 생성 python과 연동하면 필요 없어짐.
    if(is_dir($file_name)) {
        @chmod($file_name, 0777);
    }
 }*/

if(move_uploaded_file($_FILES['test']['tmp_name'], $target_dir . "/" .$name)) {
    echo "upload";
    $loop = true;
}else {
    echo "fail";
}

while(!is_dir("./" . $file_name));

while($loop){//python쪽에서 mask이미지 파일을 전부 생성할 때 까지 기다리는 while문.
    if( file_exists("./". $file_name. "/" . $file_name . ".txt" ))
    {
        sleep(2);
        $fh = fopen("./". $file_name. "/" . $file_name . ".txt", 'r');
        $status = fread($fh, 32);
        $json = json_encode($status);
        echo $json;
        fclose($fh);
        break;    
    }
}

?>