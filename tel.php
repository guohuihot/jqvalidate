<?php 
$tel = !empty($_GET['tel']) ?  $_GET['tel'] : 0;
$regcode = !empty($_GET['regcode']) ?  $_GET['regcode'] : 0;
$username = !empty($_GET['username']) ?  $_GET['username'] : 0;
if(!empty($tel)) {
	if ($tel == '13423045270') {
		echo '{"result":"pass","info": "验证通过"}';
	}else{
		echo '{"result":"error","info": "验证失败"}';
	}
}
elseif (!empty($regcode)) {
	if ($regcode == '1234') {
		echo '{"result":"pass","info": "验证通过"}';
	}else{
		echo '{"result":"error","info": "验证失败"}';
	}
}
else {
	if ($username == 'admin') {
		echo '{"result":"pass","info": "验证通过"}';
	}else{
		echo '{"result":"error","info": "验证失败"}';
	}
}
?>