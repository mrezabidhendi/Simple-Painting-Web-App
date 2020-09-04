<?php 
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: http://seemystories.ir");
header("Access-Control-Allow-Methods: PUT, GET, POST");



$response = array();
$upload_dir = '/home/seemyst1/public_html/project/upload/';
$server_url = 'http://seemystories.ir';

if($_FILES['myimg'])
{
    $myimg_name = $_FILES["myimg"]["name"];
    $myimg_tmp_name = $_FILES["myimg"]["tmp_name"];
    $error = $_FILES["myimg"]["error"];

    if($error > 0){
        $response = array(
            "status" => "error",
            "error" => true,
            "message" => "Error uploading the file!"
        );
    }else 
    {
        $random_name = $myimg_name;
        $upload_name = $upload_dir.strtolower($random_name);
        $upload_name = preg_replace('/\s+/', '-', $upload_name);
    
        if(move_uploaded_file($myimg_tmp_name , $upload_name)) {
            $response = array(
                "status" => "success",
                "error" => false,
                "message" => "File uploaded successfully",
                "url" => $server_url."/".$upload_name
              );
        }else
        {
            $response = array(
                "status" => "error",
                "error" => true,
                "message" => "Error uploading the file!"
            );
        }
    }



    

}else{
    $response = array(
        "status" => "error",
        "error" => true,
        "message" => "No file was sent!"
    );
}

echo json_encode($response);
?>