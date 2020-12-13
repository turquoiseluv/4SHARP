<?php

    header('Content-Type:application.json; charset=utf-8');

    $jsonData = file_get_contents('php://input');
    $target_dir = $_GET['session'];

    $obj = json_decode($jsonData); 

    $data = implode(" ",$obj);

    
    $fr = fopen( "./" . $target_dir. "/" . $target_dir. ".txt" , 'w+');
    fputs($fr, $data);
    fclose($fr);
    
    while(true){
            sleep(2);
            $fh = fopen("./". $target_dir. "/" . $target_dir . ".txt", 'r');
            $status = fread($fh, 32);
            if(!strcmp("done", $status)){
                fclose($fh); 
                break;
            }
            fclose($fh);    
    }

    //$fh = fopen("./". $target_dir. "/" . $target_dir . ".txt", 'w+');
    //fputs($fh, "thanks");
    //fclose($fh);

    $json = json_encode($status);
    
    echo $json;

?>
