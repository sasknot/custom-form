<?php

$output = array(
	array(
		'error' => false,
		'message' => 'Form was succesfully submitted!'
	),
	array(
		'error' => true,
		'message' => 'There was an error processing your request.'
	)
);

echo json_encode( $output[ mt_rand(0, 1) ] );

?>